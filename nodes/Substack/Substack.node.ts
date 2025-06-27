import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { noteFields, noteOperations, postFields, postOperations, commentFields, commentOperations } from './SubstackDescription';
import { NoteOperations } from './NoteOperations';
import { PostOperations } from './PostOperations';
import { CommentOperations } from './CommentOperations';
import { SubstackUtils } from './SubstackUtils';
import { IStandardResponse } from './types';

export class Substack implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Substack',
		name: 'substack',
		icon: { light: 'file:substack.svg', dark: 'file:substack.svg' },
		group: ['output'],
		defaultVersion: 1,
		version: [1],
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
						name: 'Comment',
						value: 'comment',
					},
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
			...commentOperations,
			...commentFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const { client, publicationAddress } = await SubstackUtils.initializeClient(this);

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let response: IStandardResponse;

				if (resource === 'post') {
					if (operation === 'getAll') {
						response = await PostOperations.getAll(this, client, publicationAddress, i);
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
					}
				} else if (resource === 'note') {
					if (operation === 'create') {
						response = await NoteOperations.create(this, client, publicationAddress, i);
					} else if (operation === 'get') {
						response = await NoteOperations.get(this, client, publicationAddress, i);
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
					}
				} else if (resource === 'comment') {
					if (operation === 'getAll') {
						response = await CommentOperations.getAll(this, client, publicationAddress, i);
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, {
						itemIndex: i,
					});
				}

				if (!response.success) {
					if (this.continueOnFail()) {
						returnData.push({
							json: { error: response.error },
							pairedItem: { item: i },
						});
						continue;
					}
					throw new NodeOperationError(this.getNode(), response.error || 'Unknown error occurred');
				}

				// Handle array responses (like get notes/posts)
				if (Array.isArray(response.data)) {
					response.data.forEach((item) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});
				} else {
					// Handle single item responses (like create note)
					returnData.push({
						json: response.data,
						pairedItem: { item: i },
					});
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
