import type { INodeProperties } from 'n8n-workflow';
import { queryRouting, toOptions, type Query } from '../../api';
import { employeesFilter, filterProperties, resourceProperties } from '../shared/properties';

const statusOptions = toOptions<NonNullable<Query<'listAttendance'>['status']>>({
	absent: 'Abwesend',
	away: 'Nicht Da',
	working: 'Arbeitet',
});

export const attendanceDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'attendance',
		path: '/attendance',
		nounPlural: 'Anwesenheiten',
	}),
	filterProperties('attendance', [
		employeesFilter<'listAttendance'>('userId'),
		{
			displayName: 'Status',
			name: 'status',
			type: 'options',
			options: statusOptions,
			default: 'working',
			routing: queryRouting<'listAttendance'>('status'),
		},
	]),
];
