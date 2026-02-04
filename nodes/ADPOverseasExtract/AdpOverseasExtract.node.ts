import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class AdpOverseasExtract implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ADP Overseas Extract',
		name: 'adpOverseasExtract',
		icon: { light: 'file:adp.svg', dark: 'file:adp.dark.svg' },
		group: ['transform'],
		version: 1,
		description: 'Automatically extract data from overseas invoices, receipts, and purchase orders using AI',
		defaults: {
			name: 'ADP Overseas Extract',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'adpApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Input Source',
				name: 'inputSource',
				type: 'options',
				options: [
					{
						name: 'From Previous Node (Binary File)',
						value: 'binary',
						description: 'Use binary file from previous node (recommended)',
					},
					{
						name: 'From URL',
						value: 'url',
						description: 'Provide file URL manually',
					},
				],
				default: 'binary',
				description: 'Where to get the file from',
			},
			{
				displayName: 'File URL',
				name: 'fileUrl',
				type: 'string',
				displayOptions: {
					show: {
						inputSource: ['url'],
					},
				},
				default: '',
				placeholder: 'https://example.com/invoice.pdf',
				description: 'The URL of the file to process',
			},
			{
				displayName: 'With Recognition Result',
				name: 'withRecResult',
				type: 'boolean',
				default: false,
				description: 'Whether to include OCR recognition results in response',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('adpApi');
		const baseUrl = credentials.baseUrl as string;
		const accessKey = credentials.accessKey as string;
		const appKey = credentials.appKey as string;
		const appSecret = credentials.appSecret as string;
		const tenantName = (credentials.tenantName as string) || 'laiye';

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				// Get node parameters
				const inputSource = this.getNodeParameter('inputSource', itemIndex) as string;
				const withRecResult = this.getNodeParameter('withRecResult', itemIndex) as boolean;

				let fileBase64 = '';
				let fileUrl = '';

				if (inputSource === 'binary') {
					// Get binary data from previous node
					const item = items[itemIndex];

					// Check if binary data exists
					if (!item.binary || !item.binary.data) {
						throw new NodeOperationError(
							this.getNode(),
							'No binary file found in input. Please make sure the previous node outputs a binary file.',
							{ itemIndex }
						);
					}

					// Convert binary buffer to base64
					// binary.data can be a Buffer or string
					const binaryData = item.binary.data;
					if (Buffer.isBuffer(binaryData)) {
						fileBase64 = binaryData.toString('base64');
					} else if (typeof binaryData === 'string') {
						// Already base64 encoded
						fileBase64 = binaryData;
					} else if (binaryData instanceof ArrayBuffer) {
						fileBase64 = Buffer.from(binaryData).toString('base64');
					} else {
						// Try to convert any other type
						fileBase64 = Buffer.from(String(binaryData)).toString('base64');
					}

				} else if (inputSource === 'url') {
					// Get file URL from parameter
					fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
				}

				// Prepare request headers
				const timestamp = Math.floor(Date.now() / 1000).toString();
				// Generate a random signature without external dependencies
				const signature = Date.now().toString(36) + Math.random().toString(36).substring(2);
				const headers: Record<string, string> = {
					'X-Access-Key': accessKey,
					'X-Timestamp': timestamp,
					'X-Signature': signature,
					'Content-Type': 'application/json',
				};

				// Prepare request body
				const requestBody: Record<string, string | boolean> = {
					app_key: appKey,
					app_secret: appSecret,
				};

				if (fileBase64) {
					requestBody.file_base64 = fileBase64;
				}
				if (fileUrl) {
					requestBody.file_url = fileUrl;
				}

				if (withRecResult !== undefined) {
					requestBody.with_rec_result = withRecResult;
				}

				// Make API request to sync endpoint
				const apiUrl = `${baseUrl}/open/agentic_doc_processor/${tenantName}/v1/app/doc/extract`;

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: apiUrl,
					headers,
					json: true,
					body: requestBody,
				});

				// Return the full API response
				returnData.push({
					json: response,
					pairedItem: itemIndex,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							details: error,
						},
						pairedItem: itemIndex,
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}
