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
	type?: string;
}

export interface ISubstackPost {
	id: number;
	title: string;
	subtitle?: string;
	slug?: string;
	url: string;
	postDate: string;
	description?: string;
	htmlBody?: string;
}

export interface ISubstackComment {
	id: number;
	body: string;
	isAdmin?: boolean;
	parentPostId: number;
}

export interface ISubstackFollowing {
	id: number;
	name?: string;
	handle?: string;
	bio?: string;
	url?: string;
	avatarUrl?: string;
}

export interface IErrorResponse {
	message: string;
	node: INode;
	itemIndex: number;
}
