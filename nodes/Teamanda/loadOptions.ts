import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { PAGE_SIZE, type Body, type JsonResponse } from './api';
import type { paths } from './generated/api-types';

type ListPath = Extract<keyof paths, `/options/${string}` | '/employee-fields'>;

async function fetchAll<T>(
	context: ILoadOptionsFunctions,
	path: ListPath,
	qs: IDataObject = {},
): Promise<T[]> {
	const { baseUrl } = await context.getCredentials<{ baseUrl: string }>('teamandaApi');
	const items: T[] = [];
	for (let offset = 0; ; offset += PAGE_SIZE) {
		const page = (await context.helpers.httpRequestWithAuthentication.call(context, 'teamandaApi', {
			method: 'GET',
			baseURL: baseUrl,
			url: path,
			qs: { ...qs, limit: PAGE_SIZE, offset },
			json: true,
		})) as { items: T[]; hasMore: boolean };
		items.push(...page.items);
		if (!page.hasMore) return items;
	}
}

type OptionItem = JsonResponse<'listEmployeeOptions'>['items'][number];
type EmployeeField = JsonResponse<'listEmployeeFields'>['items'][number];

function fromOptionsEndpoint(path: Extract<ListPath, `/options/${string}`>) {
	return async function (this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const items = await fetchAll<OptionItem>(this, path);
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
	getTaskCategories: fromOptionsEndpoint('/options/task-categories'),
	getTeams: fromOptionsEndpoint('/options/teams'),
	getWorkspaces: fromOptionsEndpoint('/options/workspaces'),
	async getEmployeeFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const fields = await fetchAll<EmployeeField>(this, '/employee-fields');
		return fields.map(({ key, label }) => ({ name: label, value: key }));
	},
	/** Only the work types the organization has enabled; the API labels them with their raw value. */
	async getWorkTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const items = await fetchAll<OptionItem>(this, '/options/work-types');
		return items
			.map(({ value, label }) => ({
				name: workTypeLabels[value as keyof typeof workTypeLabels] ?? label,
				value,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	},
};

export type LoadOptionsMethod = keyof typeof loadOptions;
