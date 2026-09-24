import type { IDataObject, INodeProperties, PreSendAction } from 'n8n-workflow';
import { queryRouting, toUtc, type Body } from '../../api';
import {
	archivedFilter,
	dropdown,
	employeesFilter,
	filterProperties,
	multiDropdown,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
	windowFilters,
} from '../shared/properties';

type CreateTimeEntryBody = Body<'createTimeEntry'>;

// The API requires costCenterId/projectId/tagId/description to be present, so the whole body is
// assembled here with explicit nulls instead of per-field send routings.
const sendCreateBody: PreSendAction = async function (requestOptions) {
	const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;
	const body: CreateTimeEntryBody = {
		userId: this.getNodeParameter('employeeId') as string,
		type: this.getNodeParameter('type') as CreateTimeEntryBody['type'],
		startDate: toUtc(this.getNodeParameter('startDate'), this.getTimezone()),
		endDate: toUtc(this.getNodeParameter('endDate'), this.getTimezone()),
		costCenterId: (additionalFields.costCenterId as string) || null,
		projectId: (additionalFields.projectId as string) || null,
		tagId: (additionalFields.tagId as string) || null,
		description: (additionalFields.description as string) || null,
	};
	requestOptions.body = body;
	return requestOptions;
};

const showOnlyForCreate = { operation: ['create'], resource: ['timeEntry'] };

export const timeEntryDescription: INodeProperties[] = [
	...resourceProperties({
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
		extraOperations: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create time entry',
				description: 'Create a new completed time entry',
				routing: {
					request: { method: 'POST', url: '/time-entries' },
					send: { preSend: [sendCreateBody] },
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete time entry',
				description: 'Delete a time entry. Teamanda keeps it as archived.',
				routing: {
					request: { method: 'DELETE', url: '=/time-entries/{{$parameter.timeEntryId}}' },
				},
			},
		],
	}),
	{
		displayName: 'Employee Name or ID',
		name: 'employeeId',
		...dropdown('getEmployees'),
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
			{ displayName: 'Description', name: 'description', type: 'string', default: '' },
			{ displayName: 'NFC Tag ID', name: 'tagId', type: 'string', default: '' },
			{
				displayName: 'Cost Center Name or ID',
				name: 'costCenterId',
				...dropdown('getCostCenters'),
			},
			{
				displayName: 'Project Name or ID',
				name: 'projectId',
				...dropdown('getProjects'),
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
