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

				// Initialize Substack client
				const { client, publicationAddress } = await SubstackUtils.initializeClient(this, i);

				if (resource === 'note') {
					if (operation === 'create') {
						const outputData = await NoteOperations.create(this, client, publicationAddress, i);
						
						returnData.push({
							json: outputData,
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