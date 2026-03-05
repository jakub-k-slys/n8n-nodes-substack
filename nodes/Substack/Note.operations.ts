import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IStandardResponse } from './types';
import { SubstackUtils } from './SubstackUtils';
import { DataFormatters } from './shared/DataFormatters';
import { OperationUtils } from './shared/OperationUtils';

export enum NoteOperation {
	Create = 'create',
	Get = 'get',
	GetNotesBySlug = 'getNotesBySlug',
	GetNoteById = 'getNoteById',
}

export const noteOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'get',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['note'],
			},
		},
		options: [
			{
				name: 'Create Note',
				value: NoteOperation.Create,
				description: 'Create a new Substack note',
				action: 'Create note',
			},
			{
				name: 'Get Notes',
				value: NoteOperation.Get,
				description: 'Get notes from own profile',
				action: 'Get notes',
			},
			{
				name: 'Get Notes From Profile by Slug',
				value: NoteOperation.GetNotesBySlug,
				description: 'Get notes from a profile by its publication slug',
				action: 'Get notes by slug',
			},
			{
				name: 'Get Note by ID',
				value: NoteOperation.GetNoteById,
				description: 'Get a specific note by its ID',
				action: 'Get note by ID',
			},
		],
	},
];

async function get(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '');
		const limit = OperationUtils.parseLimit(limitParam);

		const ownProfile = await client.ownProfile();
		const notesIterable = ownProfile.notes();
		const results = await OperationUtils.executeAsyncIterable(
			notesIterable,
			limit,
			DataFormatters.formatNote,
			publicationAddress,
		);

		return {
			success: true,
			data: results,
			metadata: { status: 'success' },
		};
	} catch (error) {
		return SubstackUtils.formatErrorResponse({
			message: error.message,
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
}

async function getNotesBySlug(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const slug = executeFunctions.getNodeParameter('slug', itemIndex) as string;
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '');
		const limit = OperationUtils.parseLimit(limitParam);

		const profile = await client.profileForSlug(slug);
		const notesIterable = profile.notes();
		const results = await OperationUtils.executeAsyncIterable(
			notesIterable,
			limit,
			DataFormatters.formatNote,
			publicationAddress,
		);

		return {
			success: true,
			data: results,
			metadata: { status: 'success' },
		};
	} catch (error) {
		return SubstackUtils.formatErrorResponse({
			message: error.message,
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
}

async function getNoteById(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const noteId = OperationUtils.parseNumericParam(
			executeFunctions.getNodeParameter('noteId', itemIndex),
			'noteId',
		);

		const note = await client.noteForId(noteId);
		const result = DataFormatters.formatNote(note, publicationAddress);

		return {
			success: true,
			data: result,
			metadata: { status: 'success' },
		};
	} catch (error) {
		return SubstackUtils.formatErrorResponse({
			message: error.message,
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
}

async function create(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const body = executeFunctions.getNodeParameter('body', itemIndex) as string;
		const visibility = executeFunctions.getNodeParameter(
			'visibility',
			itemIndex,
			'everyone',
		) as string;
		const attachment = executeFunctions.getNodeParameter(
			'attachment',
			itemIndex,
			'none',
		) as string;
		const linkUrl =
			attachment === 'link'
				? (executeFunctions.getNodeParameter('linkUrl', itemIndex) as string)
				: undefined;

		if (!body || !body.trim()) {
			throw new Error(
				'Note must contain at least one paragraph with content - body cannot be empty',
			);
		}

		const ownProfile = await client.ownProfile();
		const response = await ownProfile.publishNote(
			body.trim(),
			linkUrl ? { attachment: linkUrl } : undefined,
		);

		const formattedResponse = {
			success: true,
			noteId: response.id.toString(),
			body: body.trim(),
			url: SubstackUtils.formatUrl(publicationAddress, `/p/${response.id}`),
			date: new Date().toISOString(),
			status: 'published',
			visibility: visibility,
			attachment: attachment,
			linkUrl: linkUrl,
		};

		return {
			success: true,
			data: formattedResponse,
			metadata: {
				status: 'success',
			},
		};
	} catch (error) {
		return SubstackUtils.formatErrorResponse({
			message: error.message,
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
}

export const noteOperationHandlers: Record<
	NoteOperation,
	(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) => Promise<IStandardResponse>
> = {
	[NoteOperation.Create]: create,
	[NoteOperation.Get]: get,
	[NoteOperation.GetNotesBySlug]: getNotesBySlug,
	[NoteOperation.GetNoteById]: getNoteById,
};
