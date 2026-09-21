import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { employeeDescription } from './resources/employee';
import { resourceDescription } from './resources/resource';
import { resourceBookingDescription } from './resources/resourceBooking';
import { timeEntryDescription } from './resources/timeEntry';

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
				options: [
					{
						name: 'Employee',
						value: 'employee',
					},
					{
						name: 'Resource',
						value: 'resource',
					},
					{
						name: 'Resource Booking',
						value: 'resourceBooking',
					},
					{
						name: 'Time Entry',
						value: 'timeEntry',
					},
				],
				default: 'employee',
			},
			...employeeDescription,
			...resourceDescription,
			...resourceBookingDescription,
			...timeEntryDescription,
		],
	};
}
