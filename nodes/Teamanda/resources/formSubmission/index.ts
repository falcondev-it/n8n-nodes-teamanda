import type { INodeProperties } from 'n8n-workflow';
import { queryRouting, toOptions, type Query } from '../../api';
import {
	archivedFilter,
	filterProperties,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
} from '../shared/properties';

const statusOptions = toOptions<NonNullable<Query<'listFormSubmissions'>['status']>>({
	COMPLETED: 'Completed',
	DRAFT: 'Draft',
});

export const formSubmissionDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'formSubmission',
		path: '/form-submissions',
		nounPlural: 'form submissions',
		get: {
			noun: 'form submission',
			idParameter: 'formSubmissionId',
			idDisplayName: 'Form Submission ID',
			idDescription: 'ID of the form submission. Also returns the field values.',
		},
	}),
	filterProperties('formSubmission', [
		archivedFilter<'listFormSubmissions'>(),
		{
			displayName: 'Status',
			name: 'status',
			type: 'options',
			options: statusOptions,
			default: 'COMPLETED',
			routing: queryRouting<'listFormSubmissions'>('status'),
		},
		{
			displayName: 'Template IDs',
			name: 'templateId',
			type: 'string',
			typeOptions: { multipleValues: true },
			default: [],
			description: 'IDs of the form templates the submissions come from',
			routing: queryRouting<'listFormSubmissions'>('templateId'),
		},
		updatedSinceFilter<'listFormSubmissions'>(),
	]),
	sortProperty<'listFormSubmissions'>('formSubmission', [
		'-createdAt',
		'createdAt',
		'updatedAt',
		'-updatedAt',
	]),
];
