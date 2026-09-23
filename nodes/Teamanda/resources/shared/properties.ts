import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
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
	/** Plural display noun, e.g. `Mitarbeiter`. */
	nounPlural: string;
	/** Adds a Get operation and the record ID field. Omit for list-only resources. */
	get?: {
		/** Singular display noun, e.g. `Mitarbeiter`. */
		noun: string;
		/** Parameter holding the record's UUID, e.g. `employeeId`. */
		idParameter: string;
		idDisplayName: string;
		/** Description of the ID field, e.g. `UUID des Mitarbeiters`. Ignored for a dropdown. */
		idDescription?: string;
		/** Offers the IDs as a dropdown instead of a text field. */
		idLoadOptionsMethod?: LoadOptionsMethod;
		/** Operations the ID field is shown for. Defaults to Get alone. */
		idOperations?: string[];
	};
	/** Operations on top of Get and Get Many. */
	extraOperations?: INodePropertyOptions[];
};

/** Get, Get Many, the record ID, and the Return All / Limit pair. */
export function resourceProperties(spec: ResourceSpec): INodeProperties[] {
	const { resource, path, nounPlural, get } = spec;
	const forGetMany = { operation: ['getAll'], resource: [resource] };

	const operations: INodePropertyOptions[] = [
		{
			// eslint-disable-next-line n8n-nodes-base/node-param-option-name-wrong-for-get-many -- labels are German
			name: 'Mehrere Abrufen',
			value: 'getAll',
			action: `Mehrere ${nounPlural} abrufen`,
			description: `Mehrere ${nounPlural} abrufen`,
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
		operations.push({
			name: 'Abrufen',
			value: 'get',
			action: `${get.noun} abrufen`,
			description: `${get.noun} abrufen`,
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
			displayName: 'Alle Zurückgeben',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: { show: forGetMany },
			default: false,
			/* eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether,
			   n8n-nodes-base/node-param-description-wrong-for-return-all -- labels are German */
			description: 'Ob alle Ergebnisse zurückgegeben werden oder nur bis zu einem Limit',
			routing: { send: { paginate: '={{ $value }}' } },
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: { show: { ...forGetMany, returnAll: [false] } },
			typeOptions: { minValue: 1, maxValue: PAGE_SIZE },
			default: 50,
			// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-limit -- labels are German
			description: 'Maximale Anzahl der zurückzugebenden Ergebnisse',
			routing: { send: { type: 'query', property: 'limit' } },
		},
	];
}

/** The Filters collection every Get Many offers. */
export function filterProperties(
	resource: ResourceName,
	options: INodeProperties[],
): INodeProperties {
	return {
		displayName: 'Filter',
		name: 'filters',
		type: 'collection',
		placeholder: 'Filter hinzufügen',
		default: {},
		displayOptions: { show: { operation: ['getAll'], resource: [resource] } },
		options: options.sort((a, b) => a.displayName.localeCompare(b.displayName)),
	};
}

const expressionLink = '<a href="https://docs.n8n.io/code/expressions/">Ausdruck</a>';

/** A dropdown fed by `method`; the description is n8n's standard "Name or ID" hint in German. */
export function dropdown(method: LoadOptionsMethod) {
	return {
		type: 'options' as const,
		typeOptions: { loadOptionsMethod: method },
		default: '',
		description: `Aus der Liste wählen oder eine ID per ${expressionLink} angeben`,
	};
}

export function multiDropdown(method: LoadOptionsMethod) {
	return {
		type: 'multiOptions' as const,
		typeOptions: { loadOptionsMethod: method },
		default: [],
		description: `Aus der Liste wählen oder IDs per ${expressionLink} angeben`,
	};
}

type OperationWith<K extends string> = {
	[Id in OperationId]: K extends keyof Query<Id> ? Id : never;
}[OperationId];

/** The `userId` filter most list endpoints share, offered as an employee dropdown. */
export function employeesFilter<Id extends OperationWith<'userId'>>(): INodeProperties {
	return {
		displayName: 'Mitarbeiter',
		name: 'userId',
		...multiDropdown('getEmployees'),
		routing: queryRouting<Id>('userId'),
	};
}

type Sort<Id extends OperationId> = Query<Id> extends { sort?: infer S extends string } ? S : never;
type AnySort = { [Id in OperationId]: Sort<Id> }[OperationId];
type SortField = AnySort extends infer S ? (S extends `-${infer F}` ? F : S) : never;

const sortFieldLabels: Record<SortField, string> = {
	createdAt: 'Erstellt am',
	date: 'Datum',
	displayName: 'Anzeigename',
	id: 'ID',
	name: 'Name',
	startDate: 'Startdatum',
	taskNumber: 'Aufgabennummer',
	updatedAt: 'Geändert am',
};

/** The Sort filter; the first value is the API default. */
export function sortFilter<Id extends OperationWith<'sort'>>(
	values: [Sort<Id>, ...Array<Sort<Id>>],
): INodeProperties {
	const options = values.map((value: string) => {
		const descending = value.startsWith('-');
		const field = (descending ? value.slice(1) : value) as SortField;
		return {
			name: `${sortFieldLabels[field]} (${descending ? 'Absteigend' : 'Aufsteigend'})`,
			value,
		};
	});
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing -- default is values[0]
	return {
		displayName: 'Sortierung',
		name: 'sort',
		type: 'options',
		options: options.sort((a, b) => a.name.localeCompare(b.name)),
		default: values[0],
		routing: queryRouting<Id>('sort'),
	};
}

export function archivedFilter<Id extends OperationWith<'archived'>>(): INodeProperties {
	return {
		displayName: 'Archiviert',
		name: 'archived',
		type: 'boolean',
		default: false,
		routing: queryRouting<Id>('archived'),
	};
}

export function updatedSinceFilter<Id extends OperationWith<'updatedSince'>>(): INodeProperties {
	return {
		displayName: 'Geändert Seit',
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
		{ displayName: 'Von', name: 'from' },
		{ displayName: 'Bis', name: 'to' },
	].map(({ displayName, name }) => ({
		displayName,
		name,
		type: 'dateTime',
		default: '',
		...options,
		routing: queryRouting<Id>(name as 'from' | 'to', value),
	}));
}
