import type { IDataObject, INodeProperties } from 'n8n-workflow';
import {
	archivedFilter,
	createOption,
	filterProperties,
	resourceProperties,
	sortProperty,
} from '../shared/properties';

const showOnlyForCreate = { operation: ['create'], resource: ['costCenter'] };

export const costCenterDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'costCenter',
		path: '/cost-centers',
		nounPlural: 'cost centers',
		get: {
			noun: 'cost center',
			idParameter: 'costCenterId',
			idDisplayName: 'Cost Center',
			idListSearchMethod: 'searchCostCenters',
		},
		extraOperations: [
			createOption<'createCostCenter'>({
				path: '/cost-centers',
				noun: 'cost center',
				description: 'Create a new cost center. Not idempotent without a number.',
				body() {
					const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;
					return {
						name: this.getNodeParameter('name') as string,
						billable: this.getNodeParameter('billable') as boolean,
						customId: (additionalFields.customId as string) || null,
					};
				},
			}),
		],
	}),
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
	},
	{
		displayName: 'Billable',
		name: 'billable',
		type: 'boolean',
		default: false,
		displayOptions: { show: showOnlyForCreate },
		description: 'Whether time booked on the cost center is billable',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showOnlyForCreate },
		options: [
			{
				displayName: 'Number',
				name: 'customId',
				type: 'string',
				default: '',
				description:
					'Number shown in Teamanda and in exports. Must be unique. Leave empty to generate a six-digit number.',
			},
		],
	},
	filterProperties('costCenter', [archivedFilter<'listCostCenters'>()]),
	sortProperty<'listCostCenters'>('costCenter', ['name', '-name']),
];
