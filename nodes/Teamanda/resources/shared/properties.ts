import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

/** The API caps `limit` at 100, so a page can never be larger. */
const PAGE_SIZE = 100;

export type ResourceName = 'employee' | 'resource' | 'resourceBooking' | 'timeEntry';

export type ResourceSpec = {
	resource: ResourceName;
	/** Collection path, e.g. `/employees`. */
	path: string;
	/** Singular display noun, e.g. `employee`. */
	noun: string;
	/** Plural display noun, e.g. `employees`. */
	nounPlural: string;
	/** Parameter holding the record's UUID, e.g. `employeeId`. */
	idParameter: string;
	idDisplayName: string;
	/** Operations on top of Get and Get Many. */
	extraOperations?: INodePropertyOptions[];
	/** Operations the ID field is shown for. Defaults to Get alone. */
	idOperations?: string[];
};

/** Both list endpoints that can be sorted by start date share these labels. */
export const startDateSortLabels = {
	startDate: 'Start Date (Ascending)',
	'-startDate': 'Start Date (Descending)',
};

/** Get, Get Many, the record ID, and the Return All / Limit pair. */
export function resourceProperties(spec: ResourceSpec): INodeProperties[] {
	const { resource, path, noun, nounPlural, idParameter } = spec;
	const article = /^[aeiou]/.test(noun) ? 'an' : 'a';
	const forGetMany = { operation: ['getAll'], resource: [resource] };

	return [
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: { show: { resource: [resource] } },
			options: (
				[
					{
						name: 'Get',
						value: 'get',
						action: `Get ${article} ${noun}`,
						description: `Get a single ${noun}`,
						routing: { request: { method: 'GET', url: `=${path}/{{$parameter.${idParameter}}}` } },
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: `Get many ${nounPlural}`,
						description: `Get many ${nounPlural}`,
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
				] satisfies INodePropertyOptions[]
			).sort((a, b) => a.name.localeCompare(b.name)),
			default: 'getAll',
		},
		{
			displayName: spec.idDisplayName,
			name: idParameter,
			type: 'string',
			required: true,
			default: '',
			displayOptions: { show: { operation: spec.idOperations ?? ['get'], resource: [resource] } },
			description: `UUID of the ${noun}`,
		},
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
	];
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
		options,
	};
}
