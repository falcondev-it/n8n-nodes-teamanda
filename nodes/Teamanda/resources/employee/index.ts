import type { INodeProperties } from 'n8n-workflow';
import { CALENDAR_DATE, queryRouting, toOptions, type Query } from '../../api';
import {
	dropdown,
	filterProperties,
	multiDropdown,
	resourceProperties,
	sortFilter,
	updatedSinceFilter,
} from '../shared/properties';

const statusOptions = toOptions<NonNullable<Query<'listEmployees'>['status']>>({
	active: 'Aktiv',
	all: 'Alle',
	archived: 'Archiviert',
});

export const employeeDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'employee',
		path: '/employees',
		nounPlural: 'Mitarbeiter',
		get: {
			noun: 'Mitarbeiter',
			idParameter: 'employeeId',
			idDisplayName: 'Mitarbeiter',
			idLoadOptionsMethod: 'getEmployees',
			idOperations: ['get', 'getWage'],
		},
		extraOperations: [
			{
				name: 'Lohn Abrufen',
				value: 'getWage',
				action: 'Lohn eines Mitarbeiters abrufen',
				description: 'Lohnsatz aus dem am Stichtag gültigen Arbeitsvertrag abrufen',
				routing: {
					request: { method: 'GET', url: '=/employees/{{$parameter.employeeId}}/wage' },
				},
			},
		],
	}),
	{
		displayName: 'Optionen',
		name: 'wageOptions',
		type: 'collection',
		placeholder: 'Option hinzufügen',
		default: {},
		displayOptions: { show: { operation: ['getWage'], resource: ['employee'] } },
		options: [
			{
				displayName: 'Stichtag',
				name: 'date',
				type: 'dateTime',
				default: '',
				description: 'Tag, dessen Vertrag gilt. Standard ist heute.',
				routing: queryRouting<'getEmployeeWage'>('date', CALENDAR_DATE),
			},
		],
	},
	filterProperties('employee', [
		{
			displayName: 'Nach Attributen Filtern',
			name: 'attributes',
			type: 'fixedCollection',
			typeOptions: { multipleValues: true },
			placeholder: 'Attribut hinzufügen',
			default: {},
			description: 'Nur Mitarbeiter, deren Attribute exakt diesen Werten entsprechen',
			options: [
				{
					displayName: 'Attribut',
					name: 'attribute',
					values: [
						{
							displayName: 'Attribut',
							name: 'key',
							...dropdown('getEmployeeFields'),
						},
						{
							displayName: 'Wert',
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
			displayName: 'Zurückgegebene Attribute',
			name: 'fields',
			...multiDropdown('getEmployeeFields'),
			description:
				'Nur diese Attribute in der Antwort zurückgeben. Leer lassen für alle öffentlichen Attribute.',
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
			displayName: 'Suche',
			name: 'search',
			type: 'string',
			default: '',
			description: 'Durchsucht Anzeigename und vollständigen Namen',
			routing: queryRouting<'listEmployees'>('search'),
		},
		{
			displayName: 'Teams',
			name: 'teamId',
			...multiDropdown('getTeams'),
			routing: queryRouting<'listEmployees'>('teamId'),
		},
		updatedSinceFilter<'listEmployees'>(),
		sortFilter<'listEmployees'>(['id', 'displayName', '-displayName', 'updatedAt', '-updatedAt']),
	]),
];
