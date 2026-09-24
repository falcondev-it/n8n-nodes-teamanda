import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { loadOptions } from './loadOptions';
import { absenceDescription } from './resources/absence';
import { attendanceDescription } from './resources/attendance';
import { dailyReportDescription } from './resources/dailyReport';
import { employeeDescription } from './resources/employee';
import { employeeFieldDescription } from './resources/employeeField';
import { formSubmissionDescription } from './resources/formSubmission';
import { overtimePayoutDescription, specialPaymentDescription } from './resources/payroll';
import { resourceDescription } from './resources/resource';
import { resourceBookingDescription } from './resources/resourceBooking';
import { taskDescription } from './resources/task';
import { timeEntryDescription } from './resources/timeEntry';
import { workspaceEntryDescription } from './resources/workspaceEntry';
import type { ResourceName } from './resources/shared/properties';
import { toOptions } from './api';

const resourceOptions = toOptions<ResourceName>({
	absence: 'Absence',
	attendance: 'Attendance',
	dailyReport: 'Daily Report',
	employee: 'Employee',
	employeeField: 'Employee Field',
	formSubmission: 'Form Submission',
	overtimePayout: 'Overtime Payout',
	resource: 'Resource',
	resourceBooking: 'Resource Booking',
	specialPayment: 'Special Payment',
	task: 'Task',
	timeEntry: 'Time Entry',
	workspaceEntry: 'Workspace Booking',
});

export class Teamanda implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Teamanda',
		name: 'teamanda',
		icon: { light: 'file:teamanda.svg', dark: 'file:teamanda.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Teamanda API',
		defaults: {
			name: 'Teamanda',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'teamandaApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			// The API declares its array query parameters as repeated keys, e.g. `userId=a&userId=b`.
			arrayFormat: 'repeat',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: resourceOptions,
				default: 'employee',
			},
			...absenceDescription,
			...attendanceDescription,
			...dailyReportDescription,
			...employeeDescription,
			...employeeFieldDescription,
			...formSubmissionDescription,
			...overtimePayoutDescription,
			...resourceDescription,
			...resourceBookingDescription,
			...specialPaymentDescription,
			...taskDescription,
			...timeEntryDescription,
			...workspaceEntryDescription,
		],
	};

	methods = { loadOptions };
}
