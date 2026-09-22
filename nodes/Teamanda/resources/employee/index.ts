import type { INodeProperties } from 'n8n-workflow';
import { filterProperties, resourceProperties } from '../shared/properties';

export const employeeDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'employee',
		path: '/employees',
		noun: 'Mitarbeiter',
		nounPlural: 'Mitarbeiter',
		idParameter: 'employeeId',
		idDisplayName: 'Mitarbeiter-ID',
		idDescription: 'UUID des Mitarbeiters',
	}),
	filterProperties('employee', [
		{
			displayName: 'Attributfilter',
			name: 'attributes',
			type: 'json',
			default: '{}',
			description:
				'Öffentliche Mitarbeiter-Attribute, die übereinstimmen müssen, als JSON-Objekt aus Strings',
			routing: {
				// The API declares `attributes` as a deepObject, so send a parsed object and let
				// n8n serialise it to `attributes[key]=value`.
				send: { type: 'query', property: 'attributes', value: '={{ JSON.parse($value) }}' },
			},
		},
	]),
];
