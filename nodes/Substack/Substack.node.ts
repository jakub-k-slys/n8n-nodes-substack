import { 
	IExecuteFunctions,
	INodeExecutionData,
	INodeType, 
	INodeTypeDescription, 
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { noteFields, noteOperations } from './SubstackDescription';
import { NoteOperations } from './NoteOperations';
import { SubstackUtils } from './SubstackUtils';

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
					{
						name: 'Post',
						value: 'post',
					},
				],
				default: 'note',
			},

			...noteOperations,
			...noteFields,
			...postOperations,
			...postFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('substackApi');
		
		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials provided');
		}

		const returnData: INodeExecutionData[] = [];

		// Extract hostname from publication address
		const publicationAddress = credentials.publicationAddress as string;
		const hostname = publicationAddress.replace(/^https?:\/\//, '');

		// Initialize Substack client
		const client = new SubstackClient({
			hostname,
			apiKey: credentials.apiKey as string,
		});

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				if (resource === 'post') {
					if (operation === 'getAll') {
						const limit = this.getNodeParameter('limit', i, 50) as number;
						const offset = this.getNodeParameter('offset', i, 0) as number;

						const posts = await client.getPosts({ limit, offset });
						
						posts.forEach((post) => {
							returnData.push({
								json: { ...post } as any,
								pairedItem: { item: i },
							});
						});
					}
				} else if (resource === 'note') {
					if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						const body = this.getNodeParameter('body', i) as string;

						// For now, use the simple publishNote method
						// In the future, this could be enhanced to use the note builder
						const result = await client.publishNote(`${title}\n\n${body}`);
						
						returnData.push({
							json: {
								title,
								success: true,
								noteId: result.id,
								body: result.body,
								date: result.date,
							},
							pairedItem: { item: i },
						});
            
					} else if (operation === 'get') {
						const notes = await NoteOperations.get(this, client, publicationAddress, i);
						
						// Return each note as a separate item
						for (const note of notes) {
							returnData.push({
								json: note,
								pairedItem: { item: i },
							});
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
					}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}