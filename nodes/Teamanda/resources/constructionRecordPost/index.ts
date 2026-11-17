import {
	NodeApiError,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type INodeProperties,
	type JsonObject,
	type PostReceiveAction,
} from 'n8n-workflow';
import type { operations } from '../../generated/api-types';
import { locator } from '../shared/properties';

type CreatePost = operations['createConstructionRecordPost'];
type PostField = keyof NonNullable<CreatePost['requestBody']>['content']['multipart/form-data'];
type Problem = CreatePost['responses'][422]['content']['application/problem+json'];

const showOnlyForCreate = { operation: ['create'], resource: ['constructionRecordPost'] };

async function sendMultipart(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const form = new FormData();
	const append = (field: PostField, value: string | Blob, fileName?: string) =>
		fileName === undefined ? form.append(field, value) : form.append(field, value, fileName);

	append('text', this.getNodeParameter('text') as string);
	const binaryFields = (this.getNodeParameter('binaryPropertyNames', '') as string)
		.split(',')
		.map((name) => name.trim())
		.filter(Boolean);
	for (const name of binaryFields) {
		const binary = this.helpers.assertBinaryData(name);
		const buffer = await this.helpers.getBinaryDataBuffer(name);
		append(
			'files',
			new Blob([new Uint8Array(buffer)], { type: binary.mimeType }),
			binary.fileName ?? name,
		);
	}
	const idempotencyKey = this.getNodeParameter('additionalFields.idempotencyKey', '') as string;
	if (idempotencyKey) append('idempotencyKey', idempotencyKey);

	// axios sets the multipart Content-Type with its boundary and the Content-Length the API requires.
	delete requestOptions.headers?.['Content-Type'];
	// n8n's type names the `form-data` package, but it hands any body to axios, which streams a
	// native FormData as well.
	requestOptions.body = form as unknown as IHttpRequestOptions['body'];
	return requestOptions;
}

/** Turns the API's problem response into a node error carrying its reason. */
const throwProblem: PostReceiveAction = async function (items, response) {
	if (response.statusCode < 400) return items;
	const problem = (response.body ?? {}) as Partial<Problem>;
	const reasons = problem.errors?.map(({ message }) => message) ?? [];
	throw new NodeApiError(this.getNode(), problem as JsonObject, {
		httpCode: String(response.statusCode),
		message: [
			problem.detail ?? problem.title ?? 'The Teamanda API rejected the request',
			...reasons,
		].join(' '),
		description: problem.resolution,
	});
};

export const constructionRecordPostDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['constructionRecordPost'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create construction record post',
				description:
					'Create a post with text and attachments in the construction record of a project',
				routing: {
					request: {
						method: 'POST',
						url: '=/projects/{{$parameter.projectId}}/construction-record/posts',
						ignoreHttpStatusErrors: true,
					},
					send: { preSend: [sendMultipart] },
					output: { postReceive: [throwProblem] },
				},
			},
		],
		default: 'create',
	},
	{
		displayName: 'Project',
		name: 'projectId',
		...locator('searchProjects'),
		required: true,
		displayOptions: { show: showOnlyForCreate },
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { rows: 5 },
		description: 'Plain text or Markdown. HTML is shown as text, images are dropped.',
		displayOptions: { show: showOnlyForCreate },
	},
	{
		displayName: 'Input Binary Fields',
		name: 'binaryPropertyNames',
		type: 'string',
		default: '',
		placeholder: 'e.g. attachment_0, attachment_1',
		description:
			'Comma-separated names of the input binary fields to attach: images, PDFs, and office documents, at most 25 MB each and 100 MB per post. Leave empty for a text-only post.',
		displayOptions: { show: showOnlyForCreate },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showOnlyForCreate },
		options: [
			{
				displayName: 'Idempotency Key',
				name: 'idempotencyKey',
				type: 'string',
				default: '',
				description:
					"Unique per post, e.g. the email's Message-ID. A retry with the same key returns the post created first and uploads nothing.",
			},
		],
	},
	{
		displayName:
			'The post is authored by the employee who created the API key. The organization needs the Projektakte module, and the API key needs the Create Construction Record Posts permission.',
		name: 'constructionRecordPostNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: showOnlyForCreate },
	},
];
