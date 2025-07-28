import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IStandardResponse, ISubstackNote } from './types';
import { SubstackUtils } from './SubstackUtils';
import { MarkdownParser } from './MarkdownParser';

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
		// Get parameters for retrieving notes
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '') as number | string;

		// Apply default limit of 100 if not specified
		let limit = 100;
		if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
			limit = Number(limitParam);
		}

		// Get own profile first, then get notes
		const ownProfile = await client.ownProfile();
		const notesIterable = await ownProfile.notes();
		const formattedNotes: ISubstackNote[] = [];

		// Iterate through async iterable notes with limit
		let count = 0;
		for await (const note of notesIterable) {
			if (count >= limit) break;

			formattedNotes.push({
				noteId: (note as any).rawData?.comment?.id?.toString() || note.id?.toString() || 'unknown',
				body: note.body || '',
				url: SubstackUtils.formatUrl(
					publicationAddress,
					`/p/${(note as any).rawData?.comment?.id || note.id || 'unknown'}`,
				),
				date:
					(note as any).rawData?.context?.timestamp ||
					note.publishedAt?.toISOString() ||
					new Date().toISOString(),
				status: 'published',
				userId: note.author?.id?.toString() || 'unknown',
				likes: note.likesCount || 0,
				restacks: (note as any).rawData?.comment?.restacks || 0,
				type: 'note',
				entityKey: (note as any).rawData?.entity_key || note.id,
			});
			count++;
		}

		return {
			success: true,
			data: formattedNotes,
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

async function getNotesBySlug(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const slug = executeFunctions.getNodeParameter('slug', itemIndex) as string;
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '') as number | string;

		// Apply default limit of 100 if not specified
		let limit = 100;
		if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
			limit = Number(limitParam);
		}

		// Get notes from profile by slug using client.profileForSlug(slug).notes()
		const profile = await client.profileForSlug(slug);
		const notesIterable = await profile.notes();
		const formattedNotes: ISubstackNote[] = [];

		// Iterate through async iterable notes with limit
		let count = 0;
		for await (const note of notesIterable) {
			if (count >= limit) break;

			try {
				formattedNotes.push({
					noteId:
						(note as any).rawData?.comment?.id?.toString() || note.id?.toString() || 'unknown',
					body: note.body || '',
					url: SubstackUtils.formatUrl(
						publicationAddress,
						`/p/${(note as any).rawData?.comment?.id || note.id || 'unknown'}`,
					),
					date:
						(note as any).rawData?.context?.timestamp ||
						note.publishedAt?.toISOString() ||
						new Date().toISOString(),
					status: 'published',
					userId: note.author?.id?.toString() || 'unknown',
					likes: note.likesCount || 0,
					restacks: (note as any).rawData?.comment?.restacks || 0,
					type: 'note',
					entityKey: (note as any).rawData?.entity_key || note.id,
				});
			} catch (error) {
				// Skip malformed notes but continue processing
			}
			count++;
		}

		return {
			success: true,
			data: formattedNotes,
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

async function getNotesById(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const userId = executeFunctions.getNodeParameter('userId', itemIndex) as number;
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '') as number | string;

		// Apply default limit of 100 if not specified
		let limit = 100;
		if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
			limit = Number(limitParam);
		}

		// Get notes from profile by ID using client.profileForId(id).notes()
		const profile = await client.profileForId(userId);
		const notesIterable = await profile.notes();
		const formattedNotes: ISubstackNote[] = [];

		// Iterate through async iterable notes with limit
		let count = 0;
		for await (const note of notesIterable) {
			if (count >= limit) break;

			try {
				formattedNotes.push({
					noteId:
						(note as any).rawData?.comment?.id?.toString() || note.id?.toString() || 'unknown',
					body: note.body || '',
					url: SubstackUtils.formatUrl(
						publicationAddress,
						`/p/${(note as any).rawData?.comment?.id || note.id || 'unknown'}`,
					),
					date:
						(note as any).rawData?.context?.timestamp ||
						note.publishedAt?.toISOString() ||
						new Date().toISOString(),
					status: 'published',
					userId: note.author?.id?.toString() || 'unknown',
					likes: note.likesCount || 0,
					restacks: (note as any).rawData?.comment?.restacks || 0,
					type: 'note',
					entityKey: (note as any).rawData?.entity_key || note.id,
				});
			} catch (error) {
				// Skip malformed notes but continue processing
			}
			count++;
		}

		return {
			success: true,
			data: formattedNotes,
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

async function getNoteById(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const noteId = executeFunctions.getNodeParameter('noteId', itemIndex) as string;

		// Get note by ID using client.noteForId(noteId) - convert string to number
		const note = await client.noteForId(parseInt(noteId, 10));

		const formattedNote: ISubstackNote = {
			noteId: (note as any).rawData?.comment?.id?.toString() || note.id?.toString() || 'unknown',
			body: note.body || '',
			url: SubstackUtils.formatUrl(
				publicationAddress,
				`/p/${(note as any).rawData?.comment?.id || note.id || 'unknown'}`,
			),
			date:
				(note as any).rawData?.context?.timestamp ||
				note.publishedAt?.toISOString() ||
				new Date().toISOString(),
			status: 'published',
			userId: note.author?.id?.toString() || 'unknown',
			likes: note.likesCount || 0,
			restacks: (note as any).rawData?.comment?.restacks || 0,
			type: 'note',
			entityKey: (note as any).rawData?.entity_key || note.id,
		};

		return {
			success: true,
			data: formattedNote,
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

async function createSimpleNote(
	ownProfile: any,
	body: string,
	executeFunctions: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	// Use structured builder pattern for plain text
	const noteBuilder = ownProfile.newNote();
	
	// Validate that we have content before building
	if (!body || !body.trim()) {
		return SubstackUtils.formatErrorResponse({
			message: 'Note must contain at least one paragraph with content - body cannot be empty',
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
	
	// Create content from body only
	const content = body.trim();
	
	// Build note using structured approach
	try {
		// Create a paragraph with the content using correct API pattern
		noteBuilder.paragraph().text(content);
		return await noteBuilder.publish();
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
	// Use markdown parsing for advanced mode with structured builder
	const noteBuilder = ownProfile.newNote();
	
	// Validate that we have content before parsing
	if (!body || !body.trim()) {
		return SubstackUtils.formatErrorResponse({
			message: 'Note must contain at least one paragraph with content - body cannot be empty',
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
	
	// Create content from body only
	const content = body.trim();
	
	try {
		// Parse markdown and apply to note builder using structured approach
		MarkdownParser.parseMarkdownToNoteStructured(content, noteBuilder);
		return await noteBuilder.publish();
	} catch (error) {
		// Provide more user-friendly error messages
		let userMessage = error.message;
		if (error.message.includes('Note must contain at least one paragraph with actual content')) {
			userMessage = 'Note must contain at least one paragraph with meaningful content - empty formatting elements are not sufficient';
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
		const contentType = executeFunctions.getNodeParameter('contentType', itemIndex, 'simple') as string;
		const visibility = executeFunctions.getNodeParameter('visibility', itemIndex, 'everyone') as string;

		// Get own profile to create notes
		const ownProfile = await client.ownProfile();
		
		let response;

		if (contentType === 'simple') {
			response = await createSimpleNote(ownProfile, body, executeFunctions, itemIndex);
		} else {
			response = await createAdvancedNote(ownProfile, body, executeFunctions, itemIndex);
		}

		// If the response is an error response, return it directly
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
