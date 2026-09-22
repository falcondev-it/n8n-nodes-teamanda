import type { IDataObject, INodeProperties, PreSendAction } from 'n8n-workflow';
import { queryRouting, toOptions, type Body, type Query } from '../../api';
import { filterProperties, resourceProperties, startDateSortLabels } from '../shared/properties';

type CreateTimeEntryBody = Body<'createTimeEntry'>;

const typeOptions = toOptions<CreateTimeEntryBody['type']>({
	bad_weather: 'Schlechtwetter',
	breaktime: 'Pausenzeit',
	community_service: 'Sozialstunden',
	home_office: 'Mobile Arbeit',
	off_time: 'Außerhalb der Arbeitszeit',
	travel_time: 'Reisezeit',
	worktime: 'Arbeitszeit',
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
		noun: 'Zeiteintrag',
		nounPlural: 'Zeiteinträge',
		idParameter: 'timeEntryId',
		idDisplayName: 'Zeiteintrags-ID',
		idDescription: 'UUID des Zeiteintrags',
		idOperations: ['delete', 'get'],
		extraOperations: [
			{
				name: 'Erstellen',
				value: 'create',
				action: 'Zeiteintrag erstellen',
				description: 'Abgeschlossenen Zeiteintrag erstellen',
				routing: {
					request: { method: 'POST', url: '/time-entries' },
					send: { preSend: [sendCreateBody] },
				},
			},
			{
				name: 'Löschen',
				value: 'delete',
				action: 'Zeiteintrag löschen',
				description: 'Zeiteintrag archivieren',
				routing: {
					request: { method: 'DELETE', url: '=/time-entries/{{$parameter.timeEntryId}}' },
				},
			},
		],
	}),
	{
		displayName: 'Mitarbeiter-ID',
		name: 'employeeId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
		description: 'UUID des Mitarbeiters, zu dem der Eintrag gehört',
	},
	{
		displayName: 'Typ',
		name: 'type',
		type: 'options',
		required: true,
		default: 'worktime',
		options: typeOptions,
		displayOptions: { show: showOnlyForCreate },
		description: 'Art der Zeit, die der Eintrag erfasst',
	},
	{
		displayName: 'Startdatum',
		name: 'startDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
		description: 'Beginn der erfassten Zeit',
	},
	{
		displayName: 'Enddatum',
		name: 'endDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
		description: 'Ende der erfassten Zeit',
	},
	{
		displayName: 'Zusätzliche Felder',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Feld hinzufügen',
		default: {},
		displayOptions: { show: showOnlyForCreate },
		options: [
			{ displayName: 'Beschreibung', name: 'description', type: 'string', default: '' },
			{ displayName: 'Kostenstellen-ID', name: 'costCenterId', type: 'string', default: '' },
			{ displayName: 'NFC-Tag-ID', name: 'tagId', type: 'string', default: '' },
			{ displayName: 'Projekt-ID', name: 'projectId', type: 'string', default: '' },
		],
	},
	filterProperties('timeEntry', [
		{
			displayName: 'Archiviert',
			name: 'archived',
			type: 'boolean',
			default: false,
			routing: queryRouting<'listTimeEntries'>('archived'),
		},
		{
			displayName: 'Bis',
			name: 'to',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listTimeEntries'>('to'),
		},
		{
			displayName: 'Mitarbeiter-IDs',
			name: 'userId',
			type: 'string',
			typeOptions: { multipleValues: true },
			default: [],
			description: 'UUIDs der Mitarbeiter, die einbezogen werden',
			routing: queryRouting<'listTimeEntries'>('userId'),
		},
		{
			displayName: 'Sortierung',
			name: 'sort',
			type: 'options',
			options: sortOptions,
			default: 'startDate',
			routing: queryRouting<'listTimeEntries'>('sort'),
		},
		{
			displayName: 'Typen',
			name: 'types',
			type: 'multiOptions',
			default: [],
			options: typeOptions,
			routing: queryRouting<'listTimeEntries'>('type'),
		},
		{
			displayName: 'Von',
			name: 'from',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listTimeEntries'>('from'),
		},
	]),
];
