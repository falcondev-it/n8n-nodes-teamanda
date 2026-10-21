import type { INodeProperties } from 'n8n-workflow';
import { queryRouting } from '../../api';
import {
	filterProperties,
	locator,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
	windowFilters,
} from '../shared/properties';

export const projectAssignmentDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'projectAssignment',
		path: '/project-assignments',
		nounPlural: 'project assignments',
		get: {
			noun: 'project assignment',
			idParameter: 'projectAssignmentId',
			idDisplayName: 'Project Assignment ID',
			idDescription: 'ID of the project assignment',
		},
	}),
	filterProperties('projectAssignment', [
		...windowFilters<'listProjectAssignments'>('date'),
		updatedSinceFilter<'listProjectAssignments'>(),
		{
			displayName: 'Employee',
			name: 'userId',
			...locator('searchEmployees'),
			routing: queryRouting<'listProjectAssignments'>('userId'),
		},
		{
			displayName: 'Project',
			name: 'projectId',
			...locator('searchProjects'),
			routing: queryRouting<'listProjectAssignments'>('projectId'),
		},
	]),
	sortProperty<'listProjectAssignments'>('projectAssignment', [
		'startDate',
		'-startDate',
		'updatedAt',
		'-updatedAt',
	]),
];
