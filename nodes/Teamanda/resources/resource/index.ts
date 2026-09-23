import type { INodeProperties } from 'n8n-workflow';
import {
	filterProperties,
	resourceProperties,
	sortFilter,
	updatedSinceFilter,
} from '../shared/properties';

export const resourceDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'resource',
		path: '/resources',
		nounPlural: 'Ressourcen',
		get: {
			noun: 'Ressource',
			idParameter: 'resourceId',
			idDisplayName: 'Ressource',
			idDescription: 'UUID der Ressource',
			idLoadOptionsMethod: 'getWorkspaces',
		},
	}),
	filterProperties('resource', [
		updatedSinceFilter<'listResources'>(),
		sortFilter<'listResources'>(['name', '-name']),
	]),
];
