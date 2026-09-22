import type { INodeProperties } from 'n8n-workflow';
import { queryRouting, toOptions, type Query } from '../../api';
import { filterProperties, resourceProperties, startDateSortLabels } from '../shared/properties';

const sortOptions =
	toOptions<NonNullable<Query<'listResourceBookings'>['sort']>>(startDateSortLabels);

export const resourceBookingDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'resourceBooking',
		path: '/resource-bookings',
		noun: 'Ressourcenbuchung',
		nounPlural: 'Ressourcenbuchungen',
		idParameter: 'bookingId',
		idDisplayName: 'Buchungs-ID',
		idDescription: 'UUID der Ressourcenbuchung',
	}),
	filterProperties('resourceBooking', [
		{
			displayName: 'Bis',
			name: 'to',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listResourceBookings'>('to'),
		},
		{
			displayName: 'Geändert Seit',
			name: 'updatedSince',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listResourceBookings'>('updatedSince'),
		},
		{
			displayName: 'Ressourcen-ID',
			name: 'resourceId',
			type: 'string',
			default: '',
			routing: queryRouting<'listResourceBookings'>('resourceId'),
		},
		{
			displayName: 'Sortierung',
			name: 'sort',
			type: 'options',
			options: sortOptions,
			default: 'startDate',
			routing: queryRouting<'listResourceBookings'>('sort'),
		},
		{
			displayName: 'Von',
			name: 'from',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listResourceBookings'>('from'),
		},
	]),
];
