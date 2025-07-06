import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { profileFields } from '../Profile.fields';
import { profileOperations } from '../Profile.operations';
import { postFields } from '../Post.fields';
import { postOperations } from '../Post.operations';
import { noteFields } from '../Note.fields';
import { noteOperations } from '../Note.operations';
import { commentFields } from '../Comment.fields';
import { commentOperations } from '../Comment.operations';
import { ProfileOperations } from '../Profile.operations.class';
import { PostOperations } from '../Post.operations.class';
import { NoteOperations } from '../Note.operations.class';
import { CommentOperations } from '../Comment.operations.class';
import { SubstackUtils } from './SubstackUtils';
import { IStandardResponse } from './types';

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
					{
						name: 'Profile',
						value: 'profile',
					},
				],
				default: 'profile',
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
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let response: IStandardResponse;

				if (resource === 'profile') {
					if (operation === 'getOwnProfile') {
						response = await ProfileOperations.getOwnProfile(this, client, publicationAddress, i);
					} else if (operation === 'getProfileBySlug') {
						response = await ProfileOperations.getProfileBySlug(this, client, publicationAddress, i);
					} else if (operation === 'getProfileById') {
						response = await ProfileOperations.getProfileById(this, client, publicationAddress, i);
					} else if (operation === 'getFollowees') {
						response = await ProfileOperations.getFollowees(this, client, publicationAddress, i);
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
					}
				} else if (resource === 'post') {
					if (operation === 'getPostsBySlug') {
						response = await PostOperations.getPostsBySlug(this, client, publicationAddress, i);
					} else if (operation === 'getPostsById') {
						response = await PostOperations.getPostsById(this, client, publicationAddress, i);
					} else if (operation === 'getPostById') {
						response = await PostOperations.getPostById(this, client, publicationAddress, i);
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
					}
				} else if (resource === 'note') {
					if (operation === 'getNotesBySlug') {
						response = await NoteOperations.getNotesBySlug(this, client, publicationAddress, i);
					} else if (operation === 'getNotesById') {
						response = await NoteOperations.getNotesById(this, client, publicationAddress, i);
					} else if (operation === 'getNoteById') {
						response = await NoteOperations.getNoteById(this, client, publicationAddress, i);
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
					}
				} else if (resource === 'comment') {
					if (operation === 'getCommentById') {
						response = await CommentOperations.getCommentById(this, client, publicationAddress, i);
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
