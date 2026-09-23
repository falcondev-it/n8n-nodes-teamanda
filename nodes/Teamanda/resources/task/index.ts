import type { IDataObject, INodeProperties, PreSendAction } from 'n8n-workflow';
import { queryRouting, toOptions, toUtc, UTC_INSTANT, type Body } from '../../api';
import {
	archivedFilter,
	dropdown,
	filterProperties,
	multiDropdown,
	resourceProperties,
	sortFilter,
	updatedSinceFilter,
} from '../shared/properties';

type CreateTaskBody = Body<'createTask'>;
type UpdateTaskBody = Body<'updateTask'>;

const statusOptions = toOptions<NonNullable<UpdateTaskBody['status']>>({
	blocked: 'Blockiert',
	completed: 'Abgeschlossen',
	in_progress: 'In Bearbeitung',
	open: 'Offen',
	review: 'In Prüfung',
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
	displayName: 'Kategorie',
	name: 'categoryId',
	...dropdown('getTaskCategories'),
};

const assigneeField: INodeProperties = {
	displayName: 'Zugewiesener Mitarbeiter',
	name: 'assignedUserId',
	...dropdown('getEmployees'),
};

export const taskDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'task',
		path: '/tasks',
		nounPlural: 'Aufgaben',
		get: {
			noun: 'Aufgabe',
			idParameter: 'taskId',
			idDisplayName: 'Aufgaben-ID',
			idDescription: 'UUID der Aufgabe',
			idOperations: ['get', 'update'],
		},
		extraOperations: [
			{
				name: 'Aktualisieren',
				value: 'update',
				action: 'Aufgabe aktualisieren',
				description: 'Nur die angegebenen Felder einer Aufgabe ändern',
				routing: { request: { method: 'PATCH', url: '=/tasks/{{$parameter.taskId}}' } },
			},
			{
				name: 'Erstellen',
				value: 'create',
				action: 'Aufgabe erstellen',
				description: 'Aufgabe erstellen; nicht idempotent',
				routing: {
					request: { method: 'POST', url: '/tasks' },
					send: { preSend: [sendCreateBody] },
				},
			},
		],
	}),
	{
		displayName: 'Titel',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
	},
	{ ...categoryField, required: true, displayOptions: { show: showOnlyForCreate } },
	{ ...assigneeField, required: true, displayOptions: { show: showOnlyForCreate } },
	{
		displayName: 'Zusätzliche Felder',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Feld hinzufügen',
		default: {},
		displayOptions: { show: showOnlyForCreate },
		options: [
			{ displayName: 'Beschreibung', name: 'description', type: 'string', default: '' },
			{ displayName: 'Geplant Für', name: 'plannedAt', type: 'dateTime', default: '' },
		],
	},
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-update-fields -- labels are German
		displayName: 'Zu Ändernde Felder',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Feld hinzufügen',
		default: {},
		displayOptions: { show: { operation: ['update'], resource: ['task'] } },
		options: [
			{
				displayName: 'Beschreibung',
				name: 'description',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'description' } },
			},
			{
				displayName: 'Geplant Für',
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
				description: 'Ein Statuswechsel erzeugt einen Statuskommentar',
				routing: { send: { type: 'body', property: 'status' } },
			},
			{
				displayName: 'Titel',
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
			displayName: 'Zugewiesene Mitarbeiter',
			name: 'assignedUserId',
			...multiDropdown('getEmployees'),
			routing: queryRouting<'listTasks'>('assignedUserId'),
		},
		{
			displayName: 'Kategorien',
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
		sortFilter<'listTasks'>(['-taskNumber', 'taskNumber', 'updatedAt', '-updatedAt']),
	]),
];
