import type { INodeProperties } from 'n8n-workflow';
import { queryRouting, toOptions, type Query } from '../../api';
import {
	archivedFilter,
	employeesFilter,
	filterProperties,
	resourceProperties,
	sortFilter,
	updatedSinceFilter,
	windowFilters,
} from '../shared/properties';

const statusOptions = toOptions<NonNullable<Query<'listAbsenceRequests'>['status']>[number]>({
	approved: 'Genehmigt',
	booked: 'Gebucht',
	canceled: 'Storniert',
	opened: 'Offen',
	rejected: 'Abgelehnt',
});

export const absenceDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'absence',
		path: '/absences/requests',
		nounPlural: 'Abwesenheitsanträge',
		get: {
			noun: 'Abwesenheitsantrag',
			idParameter: 'absenceRequestId',
			idDisplayName: 'Antrags-ID',
			idDescription: 'UUID des Abwesenheitsantrags',
		},
		extraOperations: [
			{
				name: 'Abwesende Abrufen',
				value: 'getAbsentUsers',
				action: 'Abwesende Mitarbeiter abrufen',
				description: 'Je Mitarbeiter die Tage mit genehmigter oder gebuchter Abwesenheit abrufen',
				routing: {
					request: { method: 'GET', url: '/absences/absent-users' },
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'items' } }],
					},
				},
			},
		],
	}),
	...windowFilters<'listAbsentUsers'>('date', {
		required: true,
		displayOptions: { show: { operation: ['getAbsentUsers'], resource: ['absence'] } },
	}),
	filterProperties('absence', [
		archivedFilter<'listAbsenceRequests'>(),
		...windowFilters<'listAbsenceRequests'>('date'),
		employeesFilter<'listAbsenceRequests'>('userId'),
		{
			displayName: 'Status',
			name: 'status',
			type: 'multiOptions',
			options: statusOptions,
			default: [],
			routing: queryRouting<'listAbsenceRequests'>('status'),
		},
		updatedSinceFilter<'listAbsenceRequests'>(),
		sortFilter<'listAbsenceRequests'>(['startDate', '-startDate']),
	]),
];
