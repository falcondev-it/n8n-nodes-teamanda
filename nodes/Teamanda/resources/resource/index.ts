import type { INodeProperties } from 'n8n-workflow';
import { queryRouting, toOptions, type Query } from '../../api';
import { filterProperties, resourceProperties } from '../shared/properties';

const sortOptions = toOptions<NonNullable<Query<'listResources'>['sort']>>({
	name: 'Name (Ascending)',
	'-name': 'Name (Descending)',
});

export const resourceDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'resource',
		path: '/resources',
		noun: 'scheduling resource',
		nounPlural: 'scheduling resources',
		idParameter: 'resourceId',
		idDisplayName: 'Resource ID',
	}),
	filterProperties('resource', [
		{
			displayName: 'Sort',
			name: 'sort',
			type: 'options',
			options: sortOptions,
			default: 'name',
			routing: queryRouting<'listResources'>('sort'),
		},
		{
			displayName: 'Updated Since',
			name: 'updatedSince',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listResources'>('updatedSince'),
		},
	]),
];
