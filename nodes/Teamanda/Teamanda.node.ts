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
		description: 'Mit der Teamanda-API interagieren',
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
				displayName: 'Ressource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Mitarbeiter',
						value: 'employee',
					},
					{
						name: 'Ressource',
						value: 'resource',
					},
					{
						name: 'Ressourcenbuchung',
						value: 'resourceBooking',
					},
					{
						name: 'Zeiteintrag',
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
