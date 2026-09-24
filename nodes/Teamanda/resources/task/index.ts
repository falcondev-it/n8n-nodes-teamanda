import type { IDataObject, INodeProperties, PreSendAction } from 'n8n-workflow';
import { queryRouting, toOptions, toUtc, UTC_INSTANT, type Body } from '../../api';
import {
	archivedFilter,
	dropdown,
	filterProperties,
	multiDropdown,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
} from '../shared/properties';

type CreateTaskBody = Body<'createTask'>;
type UpdateTaskBody = Body<'updateTask'>;

const statusOptions = toOptions<NonNullable<UpdateTaskBody['status']>>({
	blocked: 'Blocked',
	completed: 'Completed',
	in_progress: 'In Progress',
	open: 'Open',
	review: 'In Review',
});

// The API requires description/plannedAt to be present, so the body is assembled here with
// explicit nulls instead of per-field send routings.
const sendCreateBody: PreSendAction = async function (requestOptions) {
	const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;
	const plannedAt = additionalFields.plannedAt as string | undefined;
	const body: CreateTaskBody = {
		title: this.getNodeParameter('title') as string,
		categoryId: this.getNodeParameter('categoryId') as string,
		assignedUserId: this.getNodeParameter('assignedUserId') as string,
		description: (additionalFields.description as string) || null,
		plannedAt: plannedAt ? toUtc(plannedAt, this.getTimezone()) : null,
	};
	requestOptions.body = body;
	return requestOptions;
};

const showOnlyForCreate = { operation: ['create'], resource: ['task'] };

const categoryField: INodeProperties = {
	displayName: 'Category Name or ID',
	name: 'categoryId',
	...dropdown('getTaskCategories'),
};

const assigneeField: INodeProperties = {
	displayName: 'Assignee Name or ID',
	name: 'assignedUserId',
	...dropdown('getEmployees'),
};

export const taskDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'task',
		path: '/tasks',
		nounPlural: 'tasks',
		get: {
			noun: 'task',
			idParameter: 'taskId',
			idDisplayName: 'Task ID',
			idDescription: 'ID of the task',
			idOperations: ['get', 'update'],
		},
		simplifiedFields: [
			'id',
			'taskNumber',
			'title',
			'status',
			'assignedUserId',
			'categoryId',
			'plannedAt',
			'description',
			'archivedAt',
			'updatedAt',
		],
		extraOperations: [
			{
				name: 'Update',
				value: 'update',
				action: 'Update task',
				description: 'Change only the given fields of a task',
				routing: { request: { method: 'PATCH', url: '=/tasks/{{$parameter.taskId}}' } },
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create task',
				description: 'Create a new task. Not idempotent.',
				routing: {
					request: { method: 'POST', url: '/tasks' },
					send: { preSend: [sendCreateBody] },
				},
			},
		],
	}),
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
	},
	{ ...categoryField, required: true, displayOptions: { show: showOnlyForCreate } },
	{ ...assigneeField, required: true, displayOptions: { show: showOnlyForCreate } },
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showOnlyForCreate },
		options: [
			{ displayName: 'Description', name: 'description', type: 'string', default: '' },
			{ displayName: 'Planned For', name: 'plannedAt', type: 'dateTime', default: '' },
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { operation: ['update'], resource: ['task'] } },
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Leave empty to remove the description',
				routing: {
					send: { type: 'body', property: 'description', value: '={{ $value || null }}' },
				},
			},
			{
				displayName: 'Planned For',
				name: 'plannedAt',
				type: 'dateTime',
				default: '',
				routing: {
					send: { type: 'body', property: 'plannedAt', value: UTC_INSTANT },
				},
			},
			{ ...categoryField, routing: { send: { type: 'body', property: 'categoryId' } } },
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: statusOptions,
				default: 'open',
				description: 'Changing the status creates a status comment',
				routing: { send: { type: 'body', property: 'status' } },
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'title' } },
			},
			{ ...assigneeField, routing: { send: { type: 'body', property: 'assignedUserId' } } },
		],
	},
	filterProperties('task', [
		archivedFilter<'listTasks'>(),
		{
			displayName: 'Assignee Names or IDs',
			name: 'assignedUserId',
			...multiDropdown('getEmployees'),
			routing: queryRouting<'listTasks'>('assignedUserId'),
		},
		{
			displayName: 'Category Names or IDs',
			name: 'categoryId',
			...multiDropdown('getTaskCategories'),
			routing: queryRouting<'listTasks'>('categoryId'),
		},
		{
			displayName: 'Status',
			name: 'status',
			type: 'multiOptions',
			options: statusOptions,
			default: [],
			routing: queryRouting<'listTasks'>('status'),
		},
		updatedSinceFilter<'listTasks'>(),
	]),
	sortProperty<'listTasks'>('task', ['-taskNumber', 'taskNumber', 'updatedAt', '-updatedAt']),
];
