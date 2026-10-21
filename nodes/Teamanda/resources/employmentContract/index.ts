import {
	jsonParse,
	type IDataObject,
	type IExecuteSingleFunctions,
	type INodeProperties,
} from 'n8n-workflow';
import { queryRouting, toCalendarDate, toOptions, type Body } from '../../api';
import { filterProperties, locator, resourceProperties } from '../shared/properties';

type ContractFields = Body<'updateEmploymentContract'>;

const employmentTypeOptions = toOptions<ContractFields['employmentType']>({
	full_time: 'Full Time',
	mini_job: 'Mini Job',
	part_time: 'Part Time',
	working_student: 'Working Student',
});

const rateIntervalOptions = toOptions<NonNullable<ContractFields['paySettings']>['rateInterval']>({
	hourly: 'Hourly',
	monthly: 'Monthly',
});

const showForWrite = { operation: ['create', 'replace'], resource: ['employmentContract'] };

/** A JSON field of Additional Fields, or `null` when it was not added. */
function jsonSection<T>(fields: IDataObject, name: string): T | null {
	const value = fields[name];
	if (value === undefined || value === '') return null;
	if (typeof value !== 'string') return value as T;
	return jsonParse<T>(value, { errorMessage: `${name} is not valid JSON` });
}

/** Every field except the employee; the API requires each one, with `null` for none. */
function contractFields(this: IExecuteSingleFunctions): ContractFields {
	const fields = this.getNodeParameter('additionalFields', {}) as IDataObject;
	const timeZone = this.getTimezone();
	return {
		activeFromIso: toCalendarDate(this.getNodeParameter('activeFrom'), timeZone),
		activeUntilIso: fields.activeUntil ? toCalendarDate(fields.activeUntil, timeZone) : null,
		employmentType: this.getNodeParameter('employmentType') as ContractFields['employmentType'],
		notes: (fields.notes as string) || null,
		paySettings:
			fields.payRate === undefined
				? null
				: {
						rateCents: Math.round((fields.payRate as number) * 100),
						rateInterval: (fields.rateInterval ?? 'hourly') as 'hourly' | 'monthly',
						wageTypeId: (fields.wageTypeId as string) || null,
					},
		absenceSettings: jsonSection(fields, 'absenceSettings'),
		workTimeSettings: jsonSection(fields, 'workTimeSettings'),
	};
}

const absenceSettingsExample = JSON.stringify(
	{
		yearlyQuotaWorkDays: 30,
		initialQuotaWorkDays: null,
		initialQuotaYear: null,
		allocationIntervalMonths: null,
		allocationDelayMonths: null,
		carryOverExpiry: { type: 'on_date', month: 3, day: 31 },
	},
	null,
	2,
);

const workTimeSettingsExample = JSON.stringify(
	{
		initialOvertimeMinutes: null,
		initialFlexOvertimeMinutes: null,
		maxTimeCreditMinutes: null,
		maxTimeDebtMinutes: null,
		models: [
			{
				startConstraint: 1,
				endConstraint: 12,
				constraintUnit: 'month_number',
				weekParity: null,
				fixed: {
					weekDayWorkMinutes: [480, 480, 480, 480, 480, 0, 0],
					daysWithoutTarget: [],
				},
			},
		],
	},
	null,
	2,
);

export const employmentContractDescription: INodeProperties[] = [
	...resourceProperties<'createEmploymentContract'>({
		resource: 'employmentContract',
		path: '/employment-contracts',
		nounPlural: 'employment contracts',
		get: {
			noun: 'employment contract',
			idParameter: 'employmentContractId',
			idDisplayName: 'Employment Contract ID',
			idDescription: 'ID of the employment contract',
			idOperations: ['delete', 'get', 'replace'],
		},
		simplifiedFields: [
			'id',
			'userId',
			'activeFromIso',
			'activeUntilIso',
			'employmentType',
			'paySettings',
			'updatedAt',
		],
		extraOperations: [
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete employment contract',
				description: 'Delete an employment contract',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/employment-contracts/{{$parameter.employmentContractId}}',
					},
					// The API answers 204 without a body.
					output: {
						postReceive: [{ type: 'set', properties: { value: '={{ { "deleted": true } }}' } }],
					},
				},
			},
			{
				name: 'Replace',
				value: 'replace',
				action: 'Replace employment contract',
				description:
					'Replace every field of an employment contract. Settings left out are removed.',
				routing: {
					request: {
						method: 'PUT',
						url: '=/employment-contracts/{{$parameter.employmentContractId}}',
					},
					send: {
						preSend: [
							async function (requestOptions) {
								requestOptions.body = contractFields.call(this) as IDataObject;
								return requestOptions;
							},
						],
					},
				},
			},
		],
		create: {
			description:
				'Create a new employment contract. Each employee can have only one contract per start date.',
			body() {
				return {
					userId: this.getNodeParameter('employeeId', undefined, {
						extractValue: true,
					}) as string,
					...contractFields.call(this),
				};
			},
		},
	}),
	{
		displayName: 'Employee',
		name: 'employeeId',
		...locator('searchEmployees'),
		required: true,
		displayOptions: { show: { operation: ['create'], resource: ['employmentContract'] } },
	},
	{
		displayName: 'Active From',
		name: 'activeFrom',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'First day the contract applies',
		displayOptions: { show: showForWrite },
	},
	{
		displayName: 'Employment Type',
		name: 'employmentType',
		type: 'options',
		options: employmentTypeOptions,
		required: true,
		default: 'full_time',
		displayOptions: { show: showForWrite },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showForWrite },
		options: [
			{
				displayName: 'Absence Settings',
				name: 'absenceSettings',
				type: 'json',
				default: absenceSettingsExample,
				description:
					'Vacation entitlement as JSON, in the shape of the API\'s <code>absenceSettings</code>. Leave out for none.',
			},
			{
				displayName: 'Active Until',
				name: 'activeUntil',
				type: 'dateTime',
				default: '',
				description: 'Last day the contract applies. Leave out for an open-ended contract.',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				description: 'Internal notes, not visible to the employee',
			},
			{
				displayName: 'Pay Rate',
				name: 'payRate',
				type: 'number',
				typeOptions: { minValue: 0, numberPrecision: 2 },
				default: 0,
				description:
					"Pay per Pay Rate Interval in the organization's currency, e.g. 15.50. Leave out for no pay settings.",
			},
			{
				displayName: 'Pay Rate Interval',
				name: 'rateInterval',
				type: 'options',
				options: rateIntervalOptions,
				default: 'hourly',
				description: 'Whether the pay rate is per hour or per month. Needs a pay rate.',
			},
			{
				displayName: 'Wage Type ID',
				name: 'wageTypeId',
				type: 'string',
				default: '',
				description: 'Wage type the pay is booked under. Needs a pay rate.',
			},
			{
				displayName: 'Work Time Settings',
				name: 'workTimeSettings',
				type: 'json',
				default: workTimeSettingsExample,
				description:
					'Target work time as JSON, in the shape of the API\'s <code>workTimeSettings</code>. Leave out for none.',
			},
		],
	},
	filterProperties('employmentContract', [
		{
			displayName: 'Employee',
			name: 'userId',
			...locator('searchEmployees'),
			routing: queryRouting<'listEmploymentContracts'>('userId'),
		},
	]),
];
