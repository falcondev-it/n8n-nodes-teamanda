import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { queryRouting, toUtc, type Body } from '../../api';
import {
	archivedFilter,
	dropdown,
	employeesFilter,
	filterProperties,
	locator,
	multiDropdown,
	optionalId,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
	windowFilters,
} from '../shared/properties';

const showOnlyForCreate = { operation: ['create'], resource: ['timeEntry'] };

export const timeEntryDescription: INodeProperties[] = [
	...resourceProperties<'createTimeEntry'>({
		resource: 'timeEntry',
		path: '/time-entries',
		nounPlural: 'time entries',
		get: {
			noun: 'time entry',
			idParameter: 'timeEntryId',
			idDisplayName: 'Time Entry ID',
			idDescription: 'ID of the time entry',
			idOperations: ['delete', 'get'],
		},
		simplifiedFields: [
			'id',
			'userId',
			'type',
			'startDate',
			'endDate',
			'projectId',
			'costCenterId',
			'description',
			'archivedAt',
			'updatedAt',
		],
		extraOperations: [
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete time entry',
				description: 'Delete a time entry. Teamanda keeps it as archived.',
				routing: {
					request: { method: 'DELETE', url: '=/time-entries/{{$parameter.timeEntryId}}' },
					// The API answers 204 without a body.
					output: {
						postReceive: [{ type: 'set', properties: { value: '={{ { "deleted": true } }}' } }],
					},
				},
			},
		],
		create: {
			description: 'Create a new completed time entry',
			body() {
				const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;
				const timeZone = this.getTimezone();
				return {
					userId: this.getNodeParameter('employeeId', undefined, {
						extractValue: true,
					}) as string,
					type: this.getNodeParameter('type') as Body<'createTimeEntry'>['type'],
					startDate: toUtc(this.getNodeParameter('startDate'), timeZone),
					endDate: toUtc(this.getNodeParameter('endDate'), timeZone),
					costCenterId: optionalId.call(this, 'costCenterId'),
					projectId: optionalId.call(this, 'projectId'),
					tagId: optionalId.call(this, 'tagId'),
					description: (additionalFields.description as string) || null,
				};
			},
		},
	}),
	{
		displayName: 'Employee',
		name: 'employeeId',
		...locator('searchEmployees'),
		required: true,
		displayOptions: { show: showOnlyForCreate },
	},
	{
		displayName: 'Type Name or ID',
		name: 'type',
		...dropdown('getWorkTypes'),
		required: true,
		displayOptions: { show: showOnlyForCreate },
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
		description: 'Start of the recorded time',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
		description: 'End of the recorded time',
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
			{ displayName: 'Description', name: 'description', type: 'string', default: '' },
			{
				displayName: 'Project',
				name: 'projectId',
				...locator('searchProjects'),
			},
			{
				displayName: 'Tag',
				name: 'tagId',
				...locator('searchTags'),
				description:
					'With a project, the tag must be available everywhere or assigned to that project. Without one, it must be available everywhere or assigned to no project.',
			},
		],
	},
	filterProperties('timeEntry', [
		archivedFilter<'listTimeEntries'>(),
		...windowFilters<'listTimeEntries'>('dateTime'),
		employeesFilter<'listTimeEntries'>(),
		{
			displayName: 'Type Names or IDs',
			name: 'types',
			...multiDropdown('getWorkTypes'),
			routing: queryRouting<'listTimeEntries'>('type'),
		},
		updatedSinceFilter<'listTimeEntries'>(),
	]),
	sortProperty<'listTimeEntries'>('timeEntry', [
		'startDate',
		'-startDate',
		'updatedAt',
		'-updatedAt',
	]),
];
