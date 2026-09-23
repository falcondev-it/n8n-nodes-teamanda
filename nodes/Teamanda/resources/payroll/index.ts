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
		nounPlural: 'Sonderzahlungen',
	}),
	filterProperties('specialPayment', [
		archivedFilter<'listSpecialPayments'>(),
		...windowFilters<'listSpecialPayments'>('date'),
		employeesFilter<'listSpecialPayments'>('userId'),
		sortFilter<'listSpecialPayments'>(['-date', 'date']),
	]),
];

export const overtimePayoutDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'overtimePayout',
		path: '/overtime-payouts',
		nounPlural: 'Überstundenauszahlungen',
	}),
	filterProperties('overtimePayout', [
		archivedFilter<'listOvertimePayouts'>(),
		...windowFilters<'listOvertimePayouts'>('date'),
		employeesFilter<'listOvertimePayouts'>('userId'),
		sortFilter<'listOvertimePayouts'>(['-date', 'date']),
	]),
];
