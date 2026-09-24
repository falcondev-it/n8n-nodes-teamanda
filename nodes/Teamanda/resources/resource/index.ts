import type { INodeProperties } from 'n8n-workflow';
import {
	filterProperties,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
} from '../shared/properties';

export const resourceDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'resource',
		path: '/resources',
		nounPlural: 'resources',
		get: {
			noun: 'resource',
			idParameter: 'resourceId',
			idDisplayName: 'Resource',
			idListSearchMethod: 'searchResources',
		},
	}),
	filterProperties('resource', [updatedSinceFilter<'listResources'>()]),
	sortProperty<'listResources'>('resource', ['name', '-name']),
];
