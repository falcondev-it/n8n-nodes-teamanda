import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import type { Body } from '../../api';
import { multiDropdown } from '../shared/properties';

type EmailBody = Body<'sendEmailMessage'>;
type PushBody = Body<'sendPushMessage'>;

const showOnlyForEmail = { operation: ['sendEmail'], resource: ['message'] };
const showOnlyForPush = { operation: ['sendPush'], resource: ['message'] };
const showOnlyForMessages = { operation: ['sendEmail', 'sendPush'], resource: ['message'] };

const operations: INodePropertyOptions[] = [
	{
		name: 'Send Email',
		value: 'sendEmail',
		action: 'Send email',
		description: "Send an email in the Teamanda layout from the organization's sender",
		routing: { request: { method: 'POST', url: '/messages/email' } },
	},
	{
		name: 'Send Push Notification',
		value: 'sendPush',
		action: 'Send push notification',
		description: 'Send a push notification to the Teamanda app of employees',
		routing: { request: { method: 'POST', url: '/messages/push' } },
	},
];

function bodyField<K extends keyof EmailBody | keyof PushBody>(property: K) {
	return { send: { type: 'body' as const, property } };
}

export const messageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['message'] } },
		options: operations,
		default: 'sendEmail',
	},
	{
		displayName: 'Recipient Names or IDs',
		name: 'userIds',
		...multiDropdown('getEmployees'),
		required: true,
		displayOptions: { show: showOnlyForMessages },
		routing: bodyField('userIds'),
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { maxLength: 200 },
		displayOptions: { show: showOnlyForEmail },
		routing: bodyField('subject'),
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { maxLength: 100 },
		displayOptions: { show: showOnlyForPush },
		routing: bodyField('title'),
	},
	{
		displayName: 'Body',
		name: 'emailBody',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { rows: 5, maxLength: 10000 },
		description: 'Plain text or Markdown without HTML. Images are dropped.',
		displayOptions: { show: showOnlyForEmail },
		routing: bodyField('body'),
	},
	{
		displayName: 'Body',
		name: 'pushBody',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { rows: 3, maxLength: 500 },
		description: 'Plain text',
		displayOptions: { show: showOnlyForPush },
		routing: bodyField('body'),
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		required: true,
		default: '={{ $execution.id }}-{{ $nodeId }}-{{ $runIndex }}-{{ $itemIndex }}',
		typeOptions: { maxLength: 200 },
		description:
			"Unique per message. A recipient who already got a message with this key on this channel gets nothing new, so 'Retry On Fail' does not send twice. To also survive re-running the execution, build the key from your data, e.g. the absence request ID.",
		displayOptions: { show: showOnlyForMessages },
		routing: bodyField('idempotencyKey'),
	},
	{
		displayName:
			'Teamanda sends at most 2,000 messages per organization in 24 hours, one per recipient. A request over the limit sends nothing. The API key needs the Send Messages permission.',
		name: 'messageNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: showOnlyForMessages },
	},
];
