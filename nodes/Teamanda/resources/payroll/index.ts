import type { INodeProperties } from 'n8n-workflow';
import { CALENDAR_DATE, queryRouting } from '../../api';
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
		path: '/wage/special-payments',
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
		path: '/wage/overtime-payouts',
		nounPlural: 'overtime payouts',
	}),
	filterProperties('overtimePayout', [
		archivedFilter<'listOvertimePayouts'>(),
		...windowFilters<'listOvertimePayouts'>('date'),
		employeesFilter<'listOvertimePayouts'>(),
	]),
	sortProperty<'listOvertimePayouts'>('overtimePayout', ['-date', 'date']),
];

export const payRateDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'payRate',
		path: '/wage/pay-rates',
		nounPlural: 'pay rates',
	}),
	filterProperties('payRate', [
		{
			displayName: 'Reference Date',
			name: 'date',
			type: 'dateTime',
			default: '',
			description:
				'Day whose employment contract applies. Defaults to today. Employees without a contract or pay settings on that day are left out.',
			routing: queryRouting<'listPayRates'>('date', CALENDAR_DATE),
		},
		employeesFilter<'listPayRates'>(),
	]),
];
