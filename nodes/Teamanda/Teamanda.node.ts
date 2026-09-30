import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { listSearch, loadOptions } from './loadOptions';
import { absenceDescription } from './resources/absence';
import { attendanceDescription } from './resources/attendance';
import { costCenterDescription } from './resources/costCenter';
import { dailyReportDescription } from './resources/dailyReport';
import { employeeDescription } from './resources/employee';
import { employeeFieldDescription } from './resources/employeeField';
import { formSubmissionDescription } from './resources/formSubmission';
import {
	overtimePayoutDescription,
	payRateDescription,
	specialPaymentDescription,
} from './resources/payroll';
import { projectDescription } from './resources/project';
import { resourceDescription } from './resources/resource';
import { resourceBookingDescription } from './resources/resourceBooking';
import { tagDescription } from './resources/tag';
import { taskDescription } from './resources/task';
import { timeEntryDescription } from './resources/timeEntry';
import { workspaceEntryDescription } from './resources/workspaceEntry';
import type { ResourceName } from './resources/shared/properties';
import { toOptions } from './api';

const resourceOptions = toOptions<ResourceName>({
	absence: 'Absence',
	attendance: 'Attendance',
	costCenter: 'Cost Center',
	dailyReport: 'Daily Report',
	employee: 'Employee',
	employeeField: 'Employee Field',
	formSubmission: 'Form Submission',
	overtimePayout: 'Overtime Payout',
	payRate: 'Pay Rate',
	project: 'Project',
	resource: 'Resource',
	resourceBooking: 'Resource Booking',
	specialPayment: 'Special Payment',
	tag: 'Tag',
	task: 'Task',
	timeEntry: 'Time Entry',
	workspaceEntry: 'Resource Entry',
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
			...costCenterDescription,
			...dailyReportDescription,
			...employeeDescription,
			...employeeFieldDescription,
			...formSubmissionDescription,
			...overtimePayoutDescription,
			...payRateDescription,
			...projectDescription,
			...resourceDescription,
			...resourceBookingDescription,
			...specialPaymentDescription,
			...tagDescription,
			...taskDescription,
			...timeEntryDescription,
			...workspaceEntryDescription,
		],
	};

	methods = { listSearch, loadOptions };
}
