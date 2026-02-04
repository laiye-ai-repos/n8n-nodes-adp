import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
} from 'n8n-workflow';

export class ADPApi implements ICredentialType {
	name = 'adpApi';
	displayName = 'ADP API';
	documentationUrl = 'https://docs.adp.example.com';
	icon: Icon = 'file:icon.svg';
	properties = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string' as const,
			default: 'https://adp.laiye.com',
			required: true,
			description: 'The base URL of the ADP API',
		},
		{
			displayName: 'Access Key',
			name: 'accessKey',
			type: 'string' as const,
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Tenant-level access key for authentication',
		},
		{
			displayName: 'App Key',
			name: 'appKey',
			type: 'string' as const,
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Application key',
		},
		{
			displayName: 'App Secret',
			name: 'appSecret',
			type: 'string' as const,
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Application secret',
		},
		{
			displayName: 'Tenant Name',
			name: 'tenantName',
			type: 'string' as const,
			default: 'laiye',
			required: false,
			description: 'Tenant name (defaults to "laiye")',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/open/agentic_doc_processor/{{$credentials.tenantName}}/v1/app/doc/extract',
			method: 'POST',
			body: {
				app_key: '={{$credentials.appKey}}',
				app_secret: '={{$credentials.appSecret}}',
				file_base64: '',
			},
		},
	};
};
