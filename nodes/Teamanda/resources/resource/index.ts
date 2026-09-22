import type { INodeProperties } from 'n8n-workflow';
import { queryRouting, toOptions, type Query } from '../../api';
import { filterProperties, resourceProperties } from '../shared/properties';

const sortOptions = toOptions<NonNullable<Query<'listResources'>['sort']>>({
	name: 'Name (Aufsteigend)',
	'-name': 'Name (Absteigend)',
});

export const resourceDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'resource',
		path: '/resources',
		noun: 'Ressource',
		nounPlural: 'Ressourcen',
		idParameter: 'resourceId',
		idDisplayName: 'Ressourcen-ID',
		idDescription: 'UUID der Ressource',
	}),
	filterProperties('resource', [
		{
			displayName: 'Geändert Seit',
			name: 'updatedSince',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listResources'>('updatedSince'),
		},
		{
			displayName: 'Sortierung',
			name: 'sort',
			type: 'options',
			options: sortOptions,
			default: 'name',
			routing: queryRouting<'listResources'>('sort'),
		},
	]),
];
