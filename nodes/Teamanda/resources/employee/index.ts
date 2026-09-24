import type { INodeProperties } from 'n8n-workflow';
import { queryRouting, toOptions, type Query } from '../../api';
import {
	dropdown,
	filterProperties,
	multiDropdown,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
} from '../shared/properties';

const statusOptions = toOptions<NonNullable<Query<'listEmployees'>['status']>>({
	active: 'Active',
	all: 'All',
	archived: 'Archived',
});

export const employeeDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'employee',
		path: '/employees',
		nounPlural: 'employees',
		get: {
			noun: 'employee',
			idParameter: 'employeeId',
			idDisplayName: 'Employee',
			idListSearchMethod: 'searchEmployees',
		},
	}),
	filterProperties('employee', [
		{
			displayName: 'Filter by Attributes',
			name: 'attributes',
			type: 'fixedCollection',
			typeOptions: { multipleValues: true },
			placeholder: 'Add Attribute',
			default: {},
			description: 'Only employees whose attributes exactly match these values',
			options: [
				{
					displayName: 'Attribute',
					name: 'attribute',
					values: [
						{
							displayName: 'Attribute Name or ID',
							name: 'key',
							...dropdown('getEmployeeFields'),
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'string',
							default: '',
						},
					],
				},
			],
			routing: {
				// The API declares `attributes` as a deepObject, so send an object and let
				// n8n serialise it to `attributes[key]=value`.
				send: {
					type: 'query',
					property: 'attributes',
					value: '={{ Object.fromEntries(($value.attribute ?? []).map((a) => [a.key, a.value])) }}',
				},
			},
		},
		{
			displayName: 'Returned Attribute Names or IDs',
			name: 'fields',
			...multiDropdown('getEmployeeFields'),
			description:
				'Only return these attributes in the response. Leave empty for all public attributes.',
			routing: queryRouting<'listEmployees'>('fields'),
		},
		{
			displayName: 'Status',
			name: 'status',
			type: 'options',
			options: statusOptions,
			default: 'all',
			routing: queryRouting<'listEmployees'>('status'),
		},
		{
			displayName: 'Search',
			name: 'search',
			type: 'string',
			default: '',
			description: 'Searches display name and full name',
			routing: queryRouting<'listEmployees'>('search'),
		},
		{
			displayName: 'Team Names or IDs',
			name: 'teamId',
			...multiDropdown('getTeams'),
			routing: queryRouting<'listEmployees'>('teamId'),
		},
		updatedSinceFilter<'listEmployees'>(),
	]),
	sortProperty<'listEmployees'>('employee', [
		'id',
		'displayName',
		'-displayName',
		'updatedAt',
		'-updatedAt',
	]),
];
