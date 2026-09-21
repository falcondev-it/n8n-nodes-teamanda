import type { INodePropertyOptions } from 'n8n-workflow';
import type { operations } from './generated/api-types';

type OperationId = keyof operations;

export type Query<Id extends OperationId> = NonNullable<operations[Id]['parameters']['query']>;

export type Body<Id extends OperationId> = operations[Id] extends {
	requestBody: { content: { 'application/json': infer B } };
}
	? B
	: never;

export function queryRouting<Id extends OperationId>(property: keyof Query<Id> & string) {
	return { send: { type: 'query' as const, property } };
}

/** n8n requires option lists sorted by display name. */
export function toOptions<T extends string>(labels: Record<T, string>): INodePropertyOptions[] {
	return Object.entries<string>(labels)
		.map(([value, name]) => ({ name, value }))
		.sort((a, b) => a.name.localeCompare(b.name));
}
