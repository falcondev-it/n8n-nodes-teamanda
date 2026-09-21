import type { INodeProperties } from 'n8n-workflow';
import { filterProperties, resourceProperties } from '../shared/properties';

export const employeeDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'employee',
		path: '/employees',
		noun: 'employee',
		nounPlural: 'employees',
		idParameter: 'employeeId',
		idDisplayName: 'Employee ID',
	}),
	filterProperties('employee', [
		{
			displayName: 'Attribute Filters',
			name: 'attributes',
			type: 'json',
			default: '{}',
			description: 'Public employee attributes to match, as a JSON object of strings',
			routing: {
				// The API declares `attributes` as a deepObject, so send a parsed object and let
				// n8n serialise it to `attributes[key]=value`.
				send: { type: 'query', property: 'attributes', value: '={{ JSON.parse($value) }}' },
			},
		},
	]),
];
