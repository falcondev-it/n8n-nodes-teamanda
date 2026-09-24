import type { INodeProperties } from 'n8n-workflow';
import {
	employeesFilter,
	filterProperties,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
	windowFilters,
} from '../shared/properties';

export const dailyReportDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'dailyReport',
		path: '/daily-reports',
		nounPlural: 'daily reports',
		simplifiedFields: [
			'userId',
			'date',
			'totalWorkMinutes',
			'targetWorkMinutes',
			'balanceMinutes',
			'flexBalanceMinutes',
			'regularWorkMinutes',
			'breakMinutes',
			'startWorkTime',
			'endWorkTime',
		],
	}),
	...windowFilters<'listDailyReports'>('date', {
		required: true,
		displayOptions: { show: { operation: ['getAll'], resource: ['dailyReport'] } },
	}),
	filterProperties('dailyReport', [
		employeesFilter<'listDailyReports'>(),
		updatedSinceFilter<'listDailyReports'>(),
	]),
	sortProperty<'listDailyReports'>('dailyReport', ['date', '-date']),
];
