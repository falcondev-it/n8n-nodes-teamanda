import type { INodeProperties } from 'n8n-workflow';
import {
	employeesFilter,
	filterProperties,
	resourceProperties,
	sortFilter,
	updatedSinceFilter,
	windowFilters,
} from '../shared/properties';

export const dailyReportDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'dailyReport',
		path: '/daily-reports',
		nounPlural: 'Tagesberichte',
	}),
	...windowFilters<'listDailyReports'>('date', {
		required: true,
		displayOptions: { show: { operation: ['getAll'], resource: ['dailyReport'] } },
	}),
	filterProperties('dailyReport', [
		employeesFilter<'listDailyReports'>(),
		updatedSinceFilter<'listDailyReports'>(),
		sortFilter<'listDailyReports'>(['date', '-date']),
	]),
];
