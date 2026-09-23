import type { INodeProperties } from 'n8n-workflow';
import { queryRouting } from '../../api';
import {
	archivedFilter,
	employeesFilter,
	filterProperties,
	multiDropdown,
	resourceProperties,
	sortFilter,
	updatedSinceFilter,
	windowFilters,
} from '../shared/properties';

export const workspaceEntryDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'workspaceEntry',
		path: '/workspace-entries',
		nounPlural: 'Arbeitsplatzbuchungen',
	}),
	filterProperties('workspaceEntry', [
		archivedFilter<'listWorkspaceEntries'>(),
		...windowFilters<'listWorkspaceEntries'>('dateTime'),
		employeesFilter<'listWorkspaceEntries'>(),
		{
			displayName: 'Arbeitsplätze',
			name: 'resourceId',
			...multiDropdown('getResources'),
			routing: queryRouting<'listWorkspaceEntries'>('resourceId'),
		},
		updatedSinceFilter<'listWorkspaceEntries'>(),
		sortFilter<'listWorkspaceEntries'>(['startDate', '-startDate']),
	]),
];
