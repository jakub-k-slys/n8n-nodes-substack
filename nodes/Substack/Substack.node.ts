import { 
	IExecuteFunctions,
	INodeExecutionData,
	INodeType, 
	INodeTypeDescription, 
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { Substack as SubstackClient } from 'substack-api';
import { noteFields, noteOperations } from './SubstackDescription';

export class Substack implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Substack',
		name: 'substack', 
		icon: { light: 'file:substack.svg', dark: 'file:substack.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Substack API',
		defaults: {
			name: 'Substack',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'substackApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Note',
						value: 'note',
					},
				],
				default: 'note',
			},

			...noteOperations,
			...noteFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				// Get credentials
				const credentials = await this.getCredentials('substackApi');
				const { publicationAddress, apiKey } = credentials;

				if (!apiKey) {
					throw new NodeOperationError(this.getNode(), 'API key is required', { itemIndex: i });
				}

				// Initialize Substack client
				const client = new SubstackClient({
					hostname: publicationAddress as string,
					apiKey: apiKey as string,
				});

				if (resource === 'note') {
					if (operation === 'create') {
						// Get note parameters
						const title = this.getNodeParameter('title', i) as string;
						const body = this.getNodeParameter('body', i) as string;

						if (!title || !body) {
							throw new NodeOperationError(this.getNode(), 'Title and body are required', { itemIndex: i });
						}

						// Create note content by combining title and body
						// For simple notes, we'll create a formatted note with title as first paragraph
						const noteContent = title + '\n\n' + body;

						// Publish the note using the substack-api library
						const response = await client.publishNote(noteContent);

						// Format response to match expected output format
						const outputData = {
							success: true,
							title: title,
							noteId: response.id,
							url: `https://${publicationAddress}/p/${response.id}`, // Construct URL based on response
							date: response.date,
							status: response.status,
							userId: response.user_id,
						};

						returnData.push({
							json: outputData,
							pairedItem: { item: i },
						});
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, { itemIndex: i });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { 
							error: error.message,
							success: false 
						},
						pairedItem: { item: i },
					});
				} else {
					throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
				}
			}
		}

		return [returnData];
	}
}