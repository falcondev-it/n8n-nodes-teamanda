import type { INodeProperties } from 'n8n-workflow';
import { queryRouting, toOptions, type Query } from '../../api';
import { filterProperties, resourceProperties } from '../shared/properties';

const languageOptions = toOptions<NonNullable<Query<'listEmployeeFields'>['language']>>({
	DE: 'German (Formal)',
	DE_DU: 'German (Informal)',
	EN: 'English',
});

export const employeeFieldDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'employeeField',
		path: '/employee-fields',
		nounPlural: 'employee fields',
	}),
	filterProperties('employeeField', [
		{
			displayName: 'Language',
			name: 'language',
			type: 'options',
			options: languageOptions,
			default: 'DE',
			description: 'Language of the field labels',
			routing: queryRouting<'listEmployeeFields'>('language'),
		},
	]),
];
