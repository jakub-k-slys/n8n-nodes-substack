import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { profileFields } from './Profile.fields';
import { profileOperations, profileOperationHandlers } from './Profile.operations';
import { postFields } from './Post.fields';
import { postOperations, postOperationHandlers } from './Post.operations';
import { noteFields } from './Note.fields';
import { noteOperations, noteOperationHandlers } from './Note.operations';
import { commentFields } from './Comment.fields';
import { commentOperations, commentOperationHandlers } from './Comment.operations';

import { SubstackUtils } from './SubstackUtils';
import { IStandardResponse } from './types';
export enum SubstackResource {
	Profile = 'profile',
	Post = 'post',
	Note = 'note',
	Comment = 'comment',
}

type OperationHandlerMap = {
	[SubstackResource.Profile]: typeof profileOperationHandlers;
	[SubstackResource.Post]: typeof postOperationHandlers;
	[SubstackResource.Note]: typeof noteOperationHandlers;
	[SubstackResource.Comment]: typeof commentOperationHandlers;
};

const resourceOperationHandlers: OperationHandlerMap = {
	[SubstackResource.Profile]: profileOperationHandlers,
	[SubstackResource.Post]: postOperationHandlers,
	[SubstackResource.Note]: noteOperationHandlers,
	[SubstackResource.Comment]: commentOperationHandlers,
};

export class Substack implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Substack',
		name: 'substack',
		icon: 'file:substack.svg',
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
				default: 'profile',
				noDataExpression: true,
				options: [
					{
						name: 'Comment',
						value: SubstackResource.Comment,
					},
					{
						name: 'Note',
						value: SubstackResource.Note,
					},
					{
						name: 'Post',
						value: SubstackResource.Post,
					},
					{
						name: 'Profile',
						value: SubstackResource.Profile,
					},
				],
			},

			...profileOperations,
			...profileFields,
			...postOperations,
			...postFields,
			...noteOperations,
			...noteFields,
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
				const resource = this.getNodeParameter('resource', i) as SubstackResource;
				const operation = this.getNodeParameter('operation', i) as string;

				const fallback = () => {
					// Check if resource exists first
					if (!resourceOperationHandlers[resource]) {
						throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, {
							itemIndex: i,
						});
					}
					// If resource exists but operation doesn't
					throw new NodeOperationError(
						this.getNode(),
						`Unknown operation: ${operation} for resource: ${resource}`,
						{
							itemIndex: i,
						},
					);
				};

				const operationHandler =
					(resourceOperationHandlers[resource] as any)?.[operation] || fallback;
				const response: IStandardResponse = await operationHandler(
					this,
					client,
					publicationAddress,
					i,
				);

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
