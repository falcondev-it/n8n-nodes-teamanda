import type { INodePropertyOptions } from 'n8n-workflow';
import type { operations } from './generated/api-types';

export type OperationId = keyof operations;

export type Query<Id extends OperationId> = NonNullable<operations[Id]['parameters']['query']>;

export type Body<Id extends OperationId> = operations[Id] extends {
	requestBody: { content: { 'application/json': infer B } };
}
	? B
	: never;

export type JsonResponse<Id extends OperationId> = operations[Id]['responses'] extends {
	200: { content: { 'application/json': infer R } };
}
	? R
	: never;

/** The API caps `limit` at 100, so a page can never be larger. */
export const PAGE_SIZE = 100;

export function queryRouting<Id extends OperationId>(
	property: keyof Query<Id> & string,
	value?: string,
) {
	return { send: { type: 'query' as const, property, ...(value && { value }) } };
}

/** Sends a dateTime field as the calendar date (`YYYY-MM-DD`) some query parameters take. */
export const CALENDAR_DATE = '={{ String($value).slice(0, 10) }}';

/** The API accepts only UTC instants (`…Z`) in request bodies. */
export function toUtc(dateTime: string): string {
	return new Date(dateTime).toISOString();
}

/** n8n requires option lists sorted by display name. */
export function toOptions<T extends string>(labels: Record<T, string>): INodePropertyOptions[] {
	return Object.entries<string>(labels)
		.map(([value, name]) => ({ name, value }))
		.sort((a, b) => a.name.localeCompare(b.name));
}
