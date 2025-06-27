import { INode } from 'n8n-workflow';

export interface IStandardResponse {
	success: boolean;
	data: any;
	error?: string;
	metadata?: {
		url?: string;
		date?: string;
		status?: string;
	};
}

export interface ISubstackNote {
	noteId: string;
	body: string;
	url: string;
	date: string;
	status: string;
	userId: string;
	likes?: number;
	restacks?: number;
	type?: string;
	entityKey?: string;
}

export interface ISubstackPost {
	id: number;
	title: string;
	subtitle?: string;
	url: string;
	postDate: string;
	type: 'newsletter' | 'podcast' | 'thread';
	published?: boolean;
	paywalled?: boolean;
	description?: string;
}

export interface ISubstackComment {
	id: number;
	body: string;
	createdAt: string;
	parentPostId: number;
	author: {
		id: number;
		name: string;
		isAdmin?: boolean;
	};
}

export interface IErrorResponse {
	message: string;
	node: INode;
	itemIndex: number;
}
