import type { INodeProperties } from 'n8n-workflow';
import { queryRouting, toOptions, type Query } from '../../api';
import {
	archivedFilter,
	filterProperties,
	resourceProperties,
	sortFilter,
	updatedSinceFilter,
} from '../shared/properties';

const statusOptions = toOptions<NonNullable<Query<'listFormSubmissions'>['status']>>({
	COMPLETED: 'Abgeschlossen',
	DRAFT: 'Entwurf',
});

export const formSubmissionDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'formSubmission',
		path: '/form-submissions',
		nounPlural: 'Formulareinreichungen',
		get: {
			noun: 'Formulareinreichung',
			idParameter: 'formSubmissionId',
			idDisplayName: 'Einreichungs-ID',
			idDescription: 'UUID der Formulareinreichung; liefert auch die Feldwerte',
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
			displayName: 'Vorlagen-IDs',
			name: 'templateId',
			type: 'string',
			typeOptions: { multipleValues: true },
			default: [],
			description: 'UUIDs der Formularvorlagen, aus denen die Einreichungen stammen',
			routing: queryRouting<'listFormSubmissions'>('templateId'),
		},
		updatedSinceFilter<'listFormSubmissions'>(),
		sortFilter<'listFormSubmissions'>(['-createdAt', 'createdAt', 'updatedAt', '-updatedAt']),
	]),
];
