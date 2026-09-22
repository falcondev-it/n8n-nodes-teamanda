import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TeamandaApi implements ICredentialType {
	name = 'teamandaApi';

	displayName = 'Teamanda API';

	icon = 'file:../nodes/Teamanda/teamanda.svg' as const;

	// Link to your community node's README
	documentationUrl =
		'https://github.com/falcondev-it/n8n-nodes-teamanda?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Basis-URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.teamanda.de/v1',
			required: true,
			description: 'Basis-URL der Teamanda-API',
		},
		{
			displayName: 'API-Schlüssel',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/employees?limit=1',
		},
	};
}
