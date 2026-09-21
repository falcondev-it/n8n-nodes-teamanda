import type { INodeProperties } from 'n8n-workflow';
import { queryRouting, toOptions, type Query } from '../../api';
import { filterProperties, resourceProperties, startDateSortLabels } from '../shared/properties';

const sortOptions =
	toOptions<NonNullable<Query<'listResourceBookings'>['sort']>>(startDateSortLabels);

export const resourceBookingDescription: INodeProperties[] = [
	...resourceProperties({
		resource: 'resourceBooking',
		path: '/resource-bookings',
		noun: 'resource booking',
		nounPlural: 'resource bookings',
		idParameter: 'bookingId',
		idDisplayName: 'Booking ID',
	}),
	filterProperties('resourceBooking', [
		{
			displayName: 'From',
			name: 'from',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listResourceBookings'>('from'),
		},
		{
			displayName: 'Resource ID',
			name: 'resourceId',
			type: 'string',
			default: '',
			routing: queryRouting<'listResourceBookings'>('resourceId'),
		},
		{
			displayName: 'Sort',
			name: 'sort',
			type: 'options',
			options: sortOptions,
			default: 'startDate',
			routing: queryRouting<'listResourceBookings'>('sort'),
		},
		{
			displayName: 'To',
			name: 'to',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listResourceBookings'>('to'),
		},
		{
			displayName: 'Updated Since',
			name: 'updatedSince',
			type: 'dateTime',
			default: '',
			routing: queryRouting<'listResourceBookings'>('updatedSince'),
		},
	]),
];
