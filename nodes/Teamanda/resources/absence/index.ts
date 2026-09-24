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
	approved: 'Approved',
	booked: 'Booked',
	canceled: 'Canceled',
	opened: 'Open',
	rejected: 'Rejected',
});

export const absenceDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'absence',
		path: '/absences/requests',
		nounPlural: 'absence requests',
		get: {
			noun: 'absence request',
			idParameter: 'absenceRequestId',
			idDisplayName: 'Absence Request ID',
			idDescription: 'UUID of the absence request',
		},
		extraOperations: [
			{
				name: 'Get Absent Employees',
				value: 'getAbsentUsers',
				action: 'Get absent employees',
				description: 'Get the days of approved or booked absence for each employee',
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
		employeesFilter<'listAbsenceRequests'>(),
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
