import type { INodeProperties } from 'n8n-workflow';
import { CALENDAR_DATE, queryRouting, toOptions, type Query } from '../../api';
import {
	archivedFilter,
	employeesFilter,
	filterProperties,
	resourceProperties,
	sortProperty,
	multiDropdown,
	updatedSinceFilter,
	windowFilters,
} from '../shared/properties';

const showOnlyForVacationBalances = {
	displayOptions: { show: { operation: ['getVacationBalances'], resource: ['absence'] } },
};

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
			idDescription: 'ID of the absence request',
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
			{
				name: 'Get Vacation Balances',
				value: 'getVacationBalances',
				action: 'Get vacation balances',
				description: 'Get the remaining vacation days of each employee on a day',
				routing: {
					request: { method: 'GET', url: '/absences/vacation-balances' },
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'items' } }],
					},
				},
			},
		],
	}),
	{
		displayName: 'Date',
		name: 'balanceDate',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Day the balances are calculated for',
		...showOnlyForVacationBalances,
		routing: queryRouting<'listVacationBalances'>('date', CALENDAR_DATE),
	},
	{
		displayName: 'Employee Names or IDs',
		name: 'balanceUserIds',
		...multiDropdown('getEmployees'),
		description:
			'Only these employees. Defaults to all active employees the API key may see. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		...showOnlyForVacationBalances,
		routing: queryRouting<'listVacationBalances'>('userId'),
	},
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
	]),
	sortProperty<'listAbsenceRequests'>('absence', ['startDate', '-startDate']),
];
