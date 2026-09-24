import type { INodeProperties } from 'n8n-workflow';
import {
	archivedFilter,
	employeesFilter,
	filterProperties,
	resourceProperties,
	sortFilter,
	windowFilters,
} from '../shared/properties';

export const specialPaymentDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'specialPayment',
		path: '/special-payments',
		nounPlural: 'special payments',
	}),
	filterProperties('specialPayment', [
		archivedFilter<'listSpecialPayments'>(),
		...windowFilters<'listSpecialPayments'>('date'),
		employeesFilter<'listSpecialPayments'>(),
		sortFilter<'listSpecialPayments'>(['-date', 'date']),
	]),
];

export const overtimePayoutDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'overtimePayout',
		path: '/overtime-payouts',
		nounPlural: 'overtime payouts',
	}),
	filterProperties('overtimePayout', [
		archivedFilter<'listOvertimePayouts'>(),
		...windowFilters<'listOvertimePayouts'>('date'),
		employeesFilter<'listOvertimePayouts'>(),
		sortFilter<'listOvertimePayouts'>(['-date', 'date']),
	]),
];
