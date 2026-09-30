import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { toCalendarDate } from '../../api';
import {
	archivedFilter,
	createOption,
	filterProperties,
	locator,
	optionalId,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
} from '../shared/properties';

const showOnlyForCreate = { operation: ['create'], resource: ['project'] };

export const projectDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'project',
		path: '/projects',
		nounPlural: 'projects',
		get: {
			noun: 'project',
			idParameter: 'projectId',
			idDisplayName: 'Project',
			idListSearchMethod: 'searchProjects',
		},
		extraOperations: [
			createOption<'createProject'>({
				path: '/projects',
				noun: 'project',
				description:
					'Create a new project. Not idempotent. Members, locations, and custom fields are set in Teamanda.',
				body() {
					const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;
					const timeZone = this.getTimezone();
					return {
						name: this.getNodeParameter('name') as string,
						startDateIso: toCalendarDate(this.getNodeParameter('startDate'), timeZone),
						endDateIso: additionalFields.endDate
							? toCalendarDate(additionalFields.endDate, timeZone)
							: null,
						costCenterId: optionalId.call(this, 'costCenterId'),
						autoAssignMembers: additionalFields.autoAssignMembers as boolean | undefined,
					};
				},
			}),
		],
	}),
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForCreate },
		description: 'First day of the project',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showOnlyForCreate },
		options: [
			{
				displayName: 'Add New Employees Automatically',
				name: 'autoAssignMembers',
				type: 'boolean',
				default: false,
				description: 'Whether employees added to the organization later join the project',
			},
			{
				displayName: 'Cost Center',
				name: 'costCenterId',
				...locator('searchCostCenters'),
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'Last day of the project. Leave empty for an open-ended project.',
			},
		],
	},
	filterProperties('project', [
		archivedFilter<'listProjects'>(),
		updatedSinceFilter<'listProjects'>(),
	]),
	sortProperty<'listProjects'>('project', ['name', '-name']),
];
