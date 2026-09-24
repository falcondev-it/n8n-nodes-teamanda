import type { INodeProperties } from 'n8n-workflow';
import {
	archivedFilter,
	employeesFilter,
	filterProperties,
	resourceProperties,
	sortProperty,
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
	]),
	sortProperty<'listSpecialPayments'>('specialPayment', ['-date', 'date']),
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
	]),
	sortProperty<'listOvertimePayouts'>('overtimePayout', ['-date', 'date']),
];
