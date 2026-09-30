import type { IDataObject, INodeProperties } from 'n8n-workflow';
import {
	archivedFilter,
	filterProperties,
	locator,
	multiDropdown,
	optionalId,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
} from '../shared/properties';

const showOnlyForCreate = { operation: ['create'], resource: ['tag'] };

export const tagDescription: INodeProperties[] = [
	...resourceProperties<'createTag'>({
		resource: 'tag',
		path: '/tags',
		nounPlural: 'tags',
		get: {
			noun: 'tag',
			idParameter: 'tagId',
			idDisplayName: 'Tag',
			idListSearchMethod: 'searchTags',
		},
		create: {
			description: 'Create a new activity that time entries can be booked on. Not idempotent.',
			body() {
				const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;
				return {
					name: this.getNodeParameter('name') as string,
					color: this.getNodeParameter('color') as string,
					isGlobal: this.getNodeParameter('isGlobal') as boolean,
					costCenterId: optionalId.call(this, 'costCenterId'),
					projectIds: (additionalFields.projectIds as string[] | undefined) ?? [],
				};
			},
		},
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
		displayName: 'Color',
		name: 'color',
		type: 'color',
		required: true,
		default: '#3b82f6',
		displayOptions: { show: showOnlyForCreate },
	},
	{
		displayName: 'Available Everywhere',
		name: 'isGlobal',
		type: 'boolean',
		default: false,
		displayOptions: { show: showOnlyForCreate },
		description: 'Whether the tag can be picked on every time entry, with or without a project',
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
				displayName: 'Cost Center',
				name: 'costCenterId',
				...locator('searchCostCenters'),
			},
			{
				displayName: 'Project Names or IDs',
				name: 'projectIds',
				...multiDropdown('getProjects'),
				hint: 'Without projects, a tag that is not available everywhere is offered only on time entries without a project',
			},
		],
	},
	filterProperties('tag', [archivedFilter<'listTags'>(), updatedSinceFilter<'listTags'>()]),
	sortProperty<'listTags'>('tag', ['name', '-name']),
];
