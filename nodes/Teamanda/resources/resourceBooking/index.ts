import type { INodeProperties } from 'n8n-workflow';
import { queryRouting } from '../../api';
import {
	dropdown,
	filterProperties,
	resourceProperties,
	sortFilter,
	updatedSinceFilter,
	windowFilters,
} from '../shared/properties';

export const resourceBookingDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'resourceBooking',
		path: '/resource-bookings',
		nounPlural: 'Ressourcenbuchungen',
		get: {
			noun: 'Ressourcenbuchung',
			idParameter: 'bookingId',
			idDisplayName: 'Buchungs-ID',
			idDescription: 'UUID der Ressourcenbuchung',
		},
	}),
	filterProperties('resourceBooking', [
		...windowFilters<'listResourceBookings'>('dateTime'),
		updatedSinceFilter<'listResourceBookings'>(),
		{
			displayName: 'Ressource',
			name: 'resourceId',
			...dropdown('getWorkspaces'),
			routing: queryRouting<'listResourceBookings'>('resourceId'),
		},
		sortFilter<'listResourceBookings'>(['startDate', '-startDate']),
	]),
];
