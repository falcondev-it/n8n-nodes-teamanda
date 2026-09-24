import type {
	IDataObject,
	INodeProperties,
	INodePropertyOptions,
	PostReceiveAction,
} from 'n8n-workflow';
import {
	CALENDAR_DATE,
	PAGE_SIZE,
	queryRouting,
	UTC_INSTANT,
	type OperationId,
	type Query,
} from '../../api';
import type { LoadOptionsMethod } from '../../loadOptions';

export type ResourceName =
	| 'absence'
	| 'attendance'
	| 'dailyReport'
	| 'employee'
	| 'employeeField'
	| 'formSubmission'
	| 'overtimePayout'
	| 'resource'
	| 'resourceBooking'
	| 'specialPayment'
	| 'task'
	| 'timeEntry'
	| 'workspaceEntry';

export type ResourceSpec = {
	resource: ResourceName;
	/** Collection path, e.g. `/employees`. */
	path: string;
	/** Plural lowercase noun, e.g. `employees`. */
	nounPlural: string;
	/** Adds a Get operation and the record ID field. Omit for list-only resources. */
	get?: {
		/** Singular lowercase noun, e.g. `employee`. */
		noun: string;
		/** Parameter holding the record's ID, e.g. `employeeId`. */
		idParameter: string;
		idDisplayName: string;
		/** Description of the ID field, e.g. `ID of the employee`. Ignored for a dropdown. */
		idDescription?: string;
		/** Offers the IDs as a dropdown instead of a text field. */
		idLoadOptionsMethod?: LoadOptionsMethod;
		/** Operations the ID field is shown for. Defaults to Get alone. */
		idOperations?: string[];
	};
	/** Operations on top of Get and Get Many. */
	extraOperations?: INodePropertyOptions[];
	/**
	 * Adds a Simplify toggle that keeps only these fields. n8n asks for one when a response has
	 * more than 10 fields.
	 */
	simplifiedFields?: readonly string[];
};

/** Get, Get Many, the record ID, and the Return All / Limit pair. */
export function resourceProperties(spec: ResourceSpec): INodeProperties[] {
	const { resource, path, nounPlural, get } = spec;
	const forGetMany = { operation: ['getAll'], resource: [resource] };

	const operations: INodePropertyOptions[] = [
		{
			name: 'Get Many',
			value: 'getAll',
			action: `Get many ${nounPlural}`,
			description: `Retrieve a list of ${nounPlural}`,
			routing: {
				request: { method: 'GET', url: path },
				// Lists answer `{ items, hasMore }`; emit one n8n item per record instead.
				output: {
					postReceive: [{ type: 'rootProperty', properties: { property: 'items' } }],
				},
				operations: {
					pagination: {
						// `rootProperty` is deliberately absent: the unwrap above already ran, so the
						// loop counts records and stops on the first short page.
						type: 'offset',
						properties: {
							limitParameter: 'limit',
							offsetParameter: 'offset',
							pageSize: PAGE_SIZE,
							type: 'query',
						},
					},
				},
			},
		},
		...(spec.extraOperations ?? []),
	];
	if (get) {
		const article = /^[aeiou]/.test(get.noun) ? 'an' : 'a';
		operations.push({
			name: 'Get',
			value: 'get',
			action: `Get ${get.noun}`,
			description: `Retrieve ${article} ${get.noun}`,
			routing: { request: { method: 'GET', url: `=${path}/{{$parameter.${get.idParameter}}}` } },
		});
	}

	return [
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: { show: { resource: [resource] } },
			options: operations.sort((a, b) => a.name.localeCompare(b.name)),
			default: 'getAll',
		},
		...(get
			? [
					{
						displayName: get.idDisplayName,
						name: get.idParameter,
						type: 'string' as const,
						default: '',
						description: get.idDescription,
						...(get.idLoadOptionsMethod && dropdown(get.idLoadOptionsMethod)),
						required: true,
						displayOptions: {
							show: { operation: get.idOperations ?? ['get'], resource: [resource] },
						},
					},
				]
			: []),
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: { show: forGetMany },
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			routing: { send: { paginate: '={{ $value }}' } },
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: { show: { ...forGetMany, returnAll: [false] } },
			typeOptions: { minValue: 1, maxValue: PAGE_SIZE },
			default: 50,
			description: 'Max number of results to return',
			routing: { send: { type: 'query', property: 'limit' } },
		},
		...(spec.simplifiedFields
			? [simplifyProperty(resource, operations, spec.simplifiedFields)]
			: []),
	];
}

function simplifyProperty(
	resource: ResourceName,
	operations: INodePropertyOptions[],
	fields: readonly string[],
): INodeProperties {
	const simplify: PostReceiveAction = async function (items) {
		if (!this.getNodeParameter('simplify', true)) return items;
		return items.map(({ json }) => ({
			json: Object.fromEntries(fields.map((field) => [field, json[field]])) as IDataObject,
		}));
	};
	return {
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response instead of the raw data',
		displayOptions: {
			show: {
				operation: operations.map(({ value }) => value as string).filter((op) => op !== 'delete'),
				resource: [resource],
			},
		},
		routing: { output: { postReceive: [simplify] } },
	};
}

/** The Filters collection every Get Many offers. */
export function filterProperties(
	resource: ResourceName,
	options: INodeProperties[],
): INodeProperties {
	return {
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { operation: ['getAll'], resource: [resource] } },
		options: options.sort((a, b) => a.displayName.localeCompare(b.displayName)),
	};
}

const expressionLink = '<a href="https://docs.n8n.io/code/expressions/">expression</a>';

/** A dropdown fed by `method`; the description is n8n's standard "Name or ID" hint. */
export function dropdown(method: LoadOptionsMethod) {
	return {
		type: 'options' as const,
		typeOptions: { loadOptionsMethod: method },
		default: '',
		description: `Choose from the list, or specify an ID using an ${expressionLink}`,
	};
}

export function multiDropdown(method: LoadOptionsMethod) {
	return {
		type: 'multiOptions' as const,
		typeOptions: { loadOptionsMethod: method },
		default: [],
		description: `Choose from the list, or specify IDs using an ${expressionLink}`,
	};
}

type OperationWith<K extends string> = {
	[Id in OperationId]: K extends keyof Query<Id> ? Id : never;
}[OperationId];

/** The `userId` filter most list endpoints share, offered as an employee dropdown. */
export function employeesFilter<Id extends OperationWith<'userId'>>(): INodeProperties {
	return {
		displayName: 'Employee Names or IDs',
		name: 'userId',
		...multiDropdown('getEmployees'),
		routing: queryRouting<Id>('userId'),
	};
}

type Sort<Id extends OperationId> = Query<Id> extends { sort?: infer S extends string } ? S : never;
type AnySort = { [Id in OperationId]: Sort<Id> }[OperationId];
type SortField = AnySort extends infer S ? (S extends `-${infer F}` ? F : S) : never;

const sortFieldLabels: Record<SortField, string> = {
	createdAt: 'Created At',
	date: 'Date',
	displayName: 'Display Name',
	id: 'ID',
	name: 'Name',
	startDate: 'Start Date',
	taskNumber: 'Task Number',
	updatedAt: 'Updated At',
};

/**
 * The Sort collection below the filters, as n8n's UX guidelines place it. The first value is the
 * API default.
 */
export function sortProperty<Id extends OperationWith<'sort'>>(
	resource: ResourceName,
	values: [Sort<Id>, ...Array<Sort<Id>>],
): INodeProperties {
	const options = values.map((value: string) => {
		const descending = value.startsWith('-');
		const field = (descending ? value.slice(1) : value) as SortField;
		return {
			name: `${sortFieldLabels[field]} (${descending ? 'Descending' : 'Ascending'})`,
			value,
		};
	});
	return {
		displayName: 'Sort',
		name: 'sort',
		type: 'collection',
		placeholder: 'Add Sort Order',
		default: {},
		displayOptions: { show: { operation: ['getAll'], resource: [resource] } },
		options: [
			// eslint-disable-next-line n8n-nodes-base/node-param-default-missing -- default is values[0]
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: options.sort((a, b) => a.name.localeCompare(b.name)),
				default: values[0],
				routing: queryRouting<Id>('sort'),
			},
		],
	};
}

export function archivedFilter<Id extends OperationWith<'archived'>>(): INodeProperties {
	return {
		displayName: 'Archived',
		name: 'archived',
		type: 'boolean',
		default: false,
		routing: queryRouting<Id>('archived'),
	};
}

export function updatedSinceFilter<Id extends OperationWith<'updatedSince'>>(): INodeProperties {
	return {
		displayName: 'Updated Since',
		name: 'updatedSince',
		type: 'dateTime',
		default: '',
		routing: queryRouting<Id>('updatedSince', UTC_INSTANT),
	};
}

/**
 * The `from` / `to` window. `date` sends calendar dates (`YYYY-MM-DD`), `dateTime` sends UTC
 * instants.
 */
export function windowFilters<Id extends OperationWith<'from' | 'to'>>(
	kind: 'date' | 'dateTime',
	options: { required?: boolean; displayOptions?: INodeProperties['displayOptions'] } = {},
): INodeProperties[] {
	const value = kind === 'date' ? CALENDAR_DATE : UTC_INSTANT;
	return [
		{ displayName: 'From', name: 'from' },
		{ displayName: 'To', name: 'to' },
	].map(({ displayName, name }) => ({
		displayName,
		name,
		type: 'dateTime',
		default: '',
		...options,
		routing: queryRouting<Id>(name as 'from' | 'to', value),
	}));
}
