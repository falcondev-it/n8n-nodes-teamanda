import type { INodeProperties } from 'n8n-workflow';
import { queryRouting } from '../../api';
import {
	archivedFilter,
	employeesFilter,
	filterProperties,
	multiDropdown,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
	windowFilters,
} from '../shared/properties';

export const workspaceEntryDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'workspaceEntry',
		path: '/workspace-entries',
		nounPlural: 'resource entries',
	}),
	filterProperties('workspaceEntry', [
		archivedFilter<'listWorkspaceEntries'>(),
		...windowFilters<'listWorkspaceEntries'>('dateTime'),
		employeesFilter<'listWorkspaceEntries'>(),
		{
			displayName: 'Resource Names or IDs',
			name: 'resourceId',
			...multiDropdown('getResources'),
			routing: queryRouting<'listWorkspaceEntries'>('resourceId'),
		},
		updatedSinceFilter<'listWorkspaceEntries'>(),
	]),
	sortProperty<'listWorkspaceEntries'>('workspaceEntry', ['startDate', '-startDate']),
];
