import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
	INodePropertyOptions,
} from 'n8n-workflow';
import { PAGE_SIZE, type Body } from './api';
import type { paths } from './generated/api-types';

type ListPath = Extract<keyof paths, `/options/${string}` | '/employee-fields' | '/tasks'>;
type OptionsPath = Extract<ListPath, `/options/${string}`>;

type Item<P extends ListPath> = paths[P]['get'] extends {
	responses: { 200: { content: { 'application/json': { items: Array<infer I> } } } };
}
	? I
	: never;

async function fetchPage<P extends ListPath>(
	context: ILoadOptionsFunctions,
	path: P,
	qs: { offset: number; search?: string },
): Promise<{ items: Array<Item<P>>; hasMore: boolean }> {
	const { baseUrl } = await context.getCredentials<{ baseUrl: string }>('teamandaApi');
	return (await context.helpers.httpRequestWithAuthentication.call(context, 'teamandaApi', {
		method: 'GET',
		baseURL: baseUrl,
		url: path,
		qs: { limit: PAGE_SIZE, ...qs },
		json: true,
	})) as { items: Array<Item<P>>; hasMore: boolean };
}

async function fetchAll<P extends ListPath>(
	context: ILoadOptionsFunctions,
	path: P,
): Promise<Array<Item<P>>> {
	const items: Array<Item<P>> = [];
	for (let offset = 0; ; offset += PAGE_SIZE) {
		const page = await fetchPage(context, path, { offset });
		items.push(...page.items);
		if (!page.hasMore) return items;
	}
}

/** One page per call; n8n hands the token back to load the next page. */
function searchOptionsEndpoint(path: OptionsPath) {
	return async function (
		this: ILoadOptionsFunctions,
		filter?: string,
		paginationToken?: string,
	): Promise<INodeListSearchResult> {
		const offset = Number(paginationToken ?? 0);
		const page = await fetchPage(this, path, { offset, search: filter || undefined });
		return {
			results: page.items.map(({ value, label }) => ({ name: label, value })),
			paginationToken: page.hasMore ? String(offset + PAGE_SIZE) : undefined,
		};
	};
}

function fromOptionsEndpoint(path: OptionsPath) {
	return async function (this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const items = await fetchAll(this, path);
		return items.map(({ value, label }) => ({ name: label, value }));
	};
}

const workTypeLabels: Record<Body<'createTimeEntry'>['type'], string> = {
	bad_weather: 'Bad Weather',
	breaktime: 'Break Time',
	community_service: 'Community Service',
	home_office: 'Remote Work',
	off_time: 'Outside Working Hours',
	travel_time: 'Travel Time',
	worktime: 'Work Time',
};

export const loadOptions = {
	getEmployees: fromOptionsEndpoint('/options/employees'),
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

export const listSearch = {
	searchCostCenters: searchOptionsEndpoint('/options/cost-centers'),
	searchEmployees: searchOptionsEndpoint('/options/employees'),
	searchProjects: searchOptionsEndpoint('/options/projects'),
	searchResources: searchOptionsEndpoint('/options/workspaces'),
	searchTaskCategories: searchOptionsEndpoint('/options/task-categories'),
	async searchTasks(
		this: ILoadOptionsFunctions,
		_filter?: string,
		paginationToken?: string,
	): Promise<INodeListSearchResult> {
		const offset = Number(paginationToken ?? 0);
		const page = await fetchPage(this, '/tasks', { offset });
		return {
			results: page.items.map(({ id, taskNumber, title }) => ({
				name: `#${taskNumber} ${title}`,
				value: id,
			})),
			paginationToken: page.hasMore ? String(offset + PAGE_SIZE) : undefined,
		};
	},
};

export type ListSearchMethod = keyof typeof listSearch;
