import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IStandardResponse } from './types';
import { SubstackUtils } from './SubstackUtils';
import { MarkdownParser } from './MarkdownParser';
import { DataFormatters } from './shared/DataFormatters';
import { OperationUtils } from './shared/OperationUtils';

export enum NoteOperation {
	Create = 'create',
	Get = 'get',
	GetNotesBySlug = 'getNotesBySlug',
	GetNotesById = 'getNotesById',
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
				name: 'Get Notes From Profile by ID',
				value: NoteOperation.GetNotesById,
				description: 'Get notes from a profile by its user ID',
				action: 'Get notes by ID',
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
		const notesIterable = await ownProfile.notes();
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
		const notesIterable = await profile.notes();
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

async function getNotesById(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const userId = OperationUtils.parseNumericParam(
			executeFunctions.getNodeParameter('userId', itemIndex),
			'userId',
		);
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '');
		const limit = OperationUtils.parseLimit(limitParam);

		const profile = await client.profileForId(userId);
		const notesIterable = await profile.notes();
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

async function createSimpleNote(
	ownProfile: any,
	body: string,
	executeFunctions: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	if (!body || !body.trim()) {
		return SubstackUtils.formatErrorResponse({
			message: 'Note must contain at least one paragraph with content - body cannot be empty',
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}

	try {
		const finalBuilder = ownProfile.newNote().paragraph().text(body.trim());
		return await finalBuilder.publish();
	} catch (buildError) {
		return SubstackUtils.formatErrorResponse({
			message: `Note construction failed: ${buildError.message}`,
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
}

async function createAdvancedNote(
	ownProfile: any,
	body: string,
	executeFunctions: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	if (!body || !body.trim()) {
		return SubstackUtils.formatErrorResponse({
			message: 'Note must contain at least one paragraph with content - body cannot be empty',
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}

	try {
		const finalBuilder = MarkdownParser.parseMarkdownToNoteStructured(
			body.trim(),
			ownProfile.newNote(),
		);
		return await finalBuilder.publish();
	} catch (error) {
		let userMessage = error.message;
		if (error.message.includes('Note must contain at least one paragraph with actual content')) {
			userMessage =
				'Note must contain at least one paragraph with meaningful content - empty formatting elements are not sufficient';
		}

		return SubstackUtils.formatErrorResponse({
			message: userMessage,
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
		const contentType = executeFunctions.getNodeParameter(
			'contentType',
			itemIndex,
			'simple',
		) as string;
		const visibility = executeFunctions.getNodeParameter(
			'visibility',
			itemIndex,
			'everyone',
		) as string;

		const ownProfile = await client.ownProfile();

		let response;

		if (contentType === 'simple') {
			response = await createSimpleNote(ownProfile, body, executeFunctions, itemIndex);
		} else {
			response = await createAdvancedNote(ownProfile, body, executeFunctions, itemIndex);
		}

		if (response && !response.success && response.error) {
			return response;
		}

		const formattedResponse = {
			success: true,
			noteId: response.id.toString(),
			body: response.body || body,
			url: SubstackUtils.formatUrl(publicationAddress, `/p/${response.id}`),
			date: response.date || new Date().toISOString(),
			status: response.status || 'published',
			userId: response.user_id?.toString() || 'unknown',
			visibility: visibility,
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
	[NoteOperation.GetNotesById]: getNotesById,
	[NoteOperation.GetNoteById]: getNoteById,
};
