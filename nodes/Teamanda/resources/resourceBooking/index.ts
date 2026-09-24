import type { INodeProperties } from 'n8n-workflow';
import { queryRouting } from '../../api';
import {
	dropdown,
	filterProperties,
	resourceProperties,
	sortProperty,
	updatedSinceFilter,
	windowFilters,
} from '../shared/properties';

export const resourceBookingDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'resourceBooking',
		path: '/resource-bookings',
		nounPlural: 'resource bookings',
		get: {
			noun: 'resource booking',
			idParameter: 'bookingId',
			idDisplayName: 'Booking ID',
			idDescription: 'ID of the resource booking',
		},
	}),
	filterProperties('resourceBooking', [
		...windowFilters<'listResourceBookings'>('dateTime'),
		updatedSinceFilter<'listResourceBookings'>(),
		{
			displayName: 'Resource Name or ID',
			name: 'resourceId',
			...dropdown('getResources'),
			routing: queryRouting<'listResourceBookings'>('resourceId'),
		},
	]),
	sortProperty<'listResourceBookings'>('resourceBooking', ['startDate', '-startDate']),
];
