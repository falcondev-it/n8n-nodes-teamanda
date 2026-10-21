import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import type { Body } from '../../api';
import { multiDropdown } from '../shared/properties';

type EmailBody = Body<'sendEmailMessage'>;
type PushBody = Body<'sendPushMessage'>;

const show = (operation: 'sendEmail' | 'sendPush') => ({
	displayOptions: { show: { operation: [operation], resource: ['message'] } },
});
const showForBoth = {
	displayOptions: { show: { operation: ['sendEmail', 'sendPush'], resource: ['message'] } },
};

function sendTo(url: string) {
	return { request: { method: 'POST' as const, url } };
}

const operations: INodePropertyOptions[] = [
	{
		name: 'Send Email',
		value: 'sendEmail',
		action: 'Send an email to employees',
		description: "Send an email in the Teamanda layout from the organization's sender",
		routing: sendTo('/messages/email'),
	},
	{
		name: 'Send Push Notification',
		value: 'sendPush',
		action: 'Send a push notification to employees',
		description: 'Send a push notification to the Teamanda app of employees',
		routing: sendTo('/messages/push'),
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
		...showForBoth,
		routing: bodyField('userIds'),
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { maxLength: 200 },
		...show('sendEmail'),
		routing: bodyField('subject'),
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { maxLength: 100 },
		...show('sendPush'),
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
		...show('sendEmail'),
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
		...show('sendPush'),
		routing: bodyField('body'),
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		required: true,
		default: '={{ $execution.id }}-{{ $itemIndex }}',
		description:
			'Unique per message. A recipient who already got a message with this key on this channel gets nothing new, so a retried request does not send twice.',
		...showForBoth,
		routing: bodyField('idempotencyKey'),
	},
	{
		displayName:
			'Teamanda sends at most 2,000 messages per organization in 24 hours, one per recipient. A request over the limit sends nothing. The API key needs the Send Messages permission.',
		name: 'messageNotice',
		type: 'notice',
		default: '',
		...showForBoth,
	},
];
