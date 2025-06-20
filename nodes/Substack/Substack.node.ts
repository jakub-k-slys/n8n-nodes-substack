import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
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
		requestDefaults: {
			baseURL: '={{$credentials?.publicationAddress ? "https://" + $credentials.publicationAddress : "https://substack.com"}}',
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
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
}