import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { PAGE_SIZE, type Body } from './api';
import type { paths } from './generated/api-types';

type ListPath = Extract<keyof paths, `/options/${string}` | '/employee-fields'>;

type Item<P extends ListPath> = paths[P]['get'] extends {
	responses: { 200: { content: { 'application/json': { items: Array<infer I> } } } };
}
	? I
	: never;

async function fetchAll<P extends ListPath>(
	context: ILoadOptionsFunctions,
	path: P,
): Promise<Array<Item<P>>> {
	const { baseUrl } = await context.getCredentials<{ baseUrl: string }>('teamandaApi');
	const items: Array<Item<P>> = [];
	for (let offset = 0; ; offset += PAGE_SIZE) {
		const page = (await context.helpers.httpRequestWithAuthentication.call(context, 'teamandaApi', {
			method: 'GET',
			baseURL: baseUrl,
			url: path,
			qs: { limit: PAGE_SIZE, offset },
			json: true,
		})) as { items: Array<Item<P>>; hasMore: boolean };
		items.push(...page.items);
		if (!page.hasMore) return items;
	}
}

function fromOptionsEndpoint(path: Extract<ListPath, `/options/${string}`>) {
	return async function (this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const items = await fetchAll(this, path);
		return items.map(({ value, label }) => ({ name: label, value }));
	};
}

const workTypeLabels: Record<Body<'createTimeEntry'>['type'], string> = {
	bad_weather: 'Schlechtwetter',
	breaktime: 'Pausenzeit',
	community_service: 'Sozialstunden',
	home_office: 'Mobile Arbeit',
	off_time: 'Außerhalb der Arbeitszeit',
	travel_time: 'Reisezeit',
	worktime: 'Arbeitszeit',
};

export const loadOptions = {
	getCostCenters: fromOptionsEndpoint('/options/cost-centers'),
	getEmployees: fromOptionsEndpoint('/options/employees'),
	getProjects: fromOptionsEndpoint('/options/projects'),
	getResources: fromOptionsEndpoint('/options/workspaces'),
	getTaskCategories: fromOptionsEndpoint('/options/task-categories'),
	getTeams: fromOptionsEndpoint('/options/teams'),
	async getEmployeeFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const fields = await fetchAll(this, '/employee-fields');
		return fields.map(({ key, label }) => ({ name: label, value: key }));
	},
	/** Only the work types the organization has enabled; the API labels them with their raw value. */
	async getWorkTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const items = await fetchAll(this, '/options/work-types');
		return items
			.map(({ value, label }) => ({
				name: workTypeLabels[value as keyof typeof workTypeLabels] ?? label,
				value,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	},
};

export type LoadOptionsMethod = keyof typeof loadOptions;
