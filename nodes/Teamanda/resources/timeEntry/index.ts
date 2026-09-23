import type { IDataObject, INodeProperties, PreSendAction } from 'n8n-workflow';
import { queryRouting, toUtc, type Body } from '../../api';
import {
	archivedFilter,
	dropdown,
	employeesFilter,
	filterProperties,
	multiDropdown,
	resourceProperties,
	sortFilter,
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
		nounPlural: 'Zeiteinträge',
		get: {
			noun: 'Zeiteintrag',
			idParameter: 'timeEntryId',
			idDisplayName: 'Zeiteintrags-ID',
			idDescription: 'UUID des Zeiteintrags',
			idOperations: ['delete', 'get'],
		},
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
		displayName: 'Mitarbeiter',
		name: 'employeeId',
		...dropdown('getEmployees'),
		required: true,
		displayOptions: { show: showOnlyForCreate },
	},
	{
		displayName: 'Typ',
		name: 'type',
		...dropdown('getWorkTypes'),
		required: true,
		displayOptions: { show: showOnlyForCreate },
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
			{ displayName: 'NFC-Tag-ID', name: 'tagId', type: 'string', default: '' },
			{
				displayName: 'Kostenstelle',
				name: 'costCenterId',
				...dropdown('getCostCenters'),
			},
			{
				displayName: 'Projekt',
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
			displayName: 'Typen',
			name: 'types',
			...multiDropdown('getWorkTypes'),
			routing: queryRouting<'listTimeEntries'>('type'),
		},
		updatedSinceFilter<'listTimeEntries'>(),
		sortFilter<'listTimeEntries'>(['startDate', '-startDate', 'updatedAt', '-updatedAt']),
	]),
];
