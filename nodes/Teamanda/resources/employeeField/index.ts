import type { INodeProperties } from 'n8n-workflow';
import { queryRouting, toOptions, type Query } from '../../api';
import { filterProperties, resourceProperties } from '../shared/properties';

const languageOptions = toOptions<NonNullable<Query<'listEmployeeFields'>['language']>>({
	DE: 'Deutsch (Sie)',
	DE_DU: 'Deutsch (Du)',
	EN: 'Englisch',
});

export const employeeFieldDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'employeeField',
		path: '/employee-fields',
		nounPlural: 'Mitarbeiterfelder',
	}),
	filterProperties('employeeField', [
		{
			displayName: 'Sprache',
			name: 'language',
			type: 'options',
			options: languageOptions,
			default: 'DE',
			description: 'Sprache der Feldbezeichnungen',
			routing: queryRouting<'listEmployeeFields'>('language'),
		},
	]),
];
