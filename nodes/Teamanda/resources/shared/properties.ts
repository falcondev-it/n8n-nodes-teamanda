import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

/** The API caps `limit` at 100, so a page can never be larger. */
const PAGE_SIZE = 100;

export type ResourceName = 'employee' | 'resource' | 'resourceBooking' | 'timeEntry';

export type ResourceSpec = {
	resource: ResourceName;
	/** Collection path, e.g. `/employees`. */
	path: string;
	/** Singular display noun, e.g. `Mitarbeiter`. */
	noun: string;
	/** Plural display noun, e.g. `Mitarbeiter`. */
	nounPlural: string;
	/** Parameter holding the record's UUID, e.g. `employeeId`. */
	idParameter: string;
	idDisplayName: string;
	/** Description of the ID field, e.g. `UUID des Mitarbeiters`. */
	idDescription: string;
	/** Operations on top of Get and Get Many. */
	extraOperations?: INodePropertyOptions[];
	/** Operations the ID field is shown for. Defaults to Get alone. */
	idOperations?: string[];
};

/** Both list endpoints that can be sorted by start date share these labels. */
export const startDateSortLabels = {
	startDate: 'Startdatum (Aufsteigend)',
	'-startDate': 'Startdatum (Absteigend)',
};

/** Get, Get Many, the record ID, and the Return All / Limit pair. */
export function resourceProperties(spec: ResourceSpec): INodeProperties[] {
	const { resource, path, noun, nounPlural, idParameter } = spec;
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
						name: 'Abrufen',
						value: 'get',
						action: `${noun} abrufen`,
						description: `${noun} abrufen`,
						routing: { request: { method: 'GET', url: `=${path}/{{$parameter.${idParameter}}}` } },
					},
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
			description: spec.idDescription,
		},
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
		options,
	};
}
