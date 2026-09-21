import type { IDataObject, INodeProperties, PreSendAction } from 'n8n-workflow';
import { queryRouting, toOptions, type Body, type Query } from '../../api';
import { filterProperties, resourceProperties, startDateSortLabels } from '../shared/properties';

type CreateTimeEntryBody = Body<'createTimeEntry'>;

const typeOptions = toOptions<CreateTimeEntryBody['type']>({
	bad_weather: 'Bad Weather',
	breaktime: 'Break Time',
	community_service: 'Community Service',
	home_office: 'Home Office',
	off_time: 'Off Time',
	travel_time: 'Travel Time',
	worktime: 'Work Time',
});

const sortOptions = toOptions<NonNullable<Query<'listTimeEntries'>['sort']>>(startDateSortLabels);

// The API requires costCenterId/projectId/tagId/description to be present, so the whole body is
// assembled here with explicit nulls instead of per-field send routings.
const sendCreateBody: PreSendAction = async function (requestOptions) {
	const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;
	const body: CreateTimeEntryBody = {
		userId: this.getNodeParameter('employeeId') as string,
		type: this.getNodeParameter('type') as CreateTimeEntryBody['type'],
		startDate: this.getNodeParameter('startDate') as string,
		endDate: this.getNodeParameter('endDate') as string,
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
		noun: 'time entry',
		nounPlural: 'time entries',
		idParameter: 'timeEntryId',
		idDisplayName: 'Time Entry ID',
		idOperations: ['delete', 'get'],
		extraOperations: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a time entry',
				description: 'Create a completed time entry',
				routing: {
					request: { method: 'POST', url: '/time-entries' },
					send: { preSend: [sendCreateBody] },
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a time entry',
				description: 'Archive a time entry',
				routing: {
					request: { method: 'DELETE', url: '=/time-entries/{{$parameter.timeEntryId}}' },
				},
			},
		],
	}),
	{
		displayName: 'Employee ID',
		name: 'employeeId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
		description: 'UUID of the employee the entry belongs to',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		default: 'worktime',
		options: typeOptions,
		displayOptions: { show: showOnlyForCreate },
		description: 'Kind of time the entry records',
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
		description: 'When the recorded time starts',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
		description: 'When the recorded time ends',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showOnlyForCreate },
		options: [
			{ displayName: 'Cost Center ID', name: 'costCenterId', type: 'string', default: '' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '' },
			{ displayName: 'Project ID', name: 'projectId', type: 'string', default: '' },
			{ displayName: 'Tag ID', name: 'tagId', type: 'string', default: '' },
		],
	},
	filterProperties('timeEntry', [
		{
			displayName: 'Archived',
			name: 'archived',
			type: 'boolean',
			default: false,
			routing: queryRouting<'listTimeEntries'>('archived'),
		},
		{
			displayName: 'Employee IDs',
			name: 'userId',
			type: 'string',
			typeOptions: { multipleValues: true },
			default: [],
			description: 'Employee UUIDs to include',
			routing: queryRouting<'listTimeEntries'>('userId'),
		},
		{
			displayName: 'From',
			name: 'from',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listTimeEntries'>('from'),
		},
		{
			displayName: 'Sort',
			name: 'sort',
			type: 'options',
			options: sortOptions,
			default: 'startDate',
			routing: queryRouting<'listTimeEntries'>('sort'),
		},
		{
			displayName: 'To',
			name: 'to',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listTimeEntries'>('to'),
		},
		{
			displayName: 'Types',
			name: 'types',
			type: 'multiOptions',
			default: [],
			options: typeOptions,
			routing: queryRouting<'listTimeEntries'>('type'),
		},
	]),
];
