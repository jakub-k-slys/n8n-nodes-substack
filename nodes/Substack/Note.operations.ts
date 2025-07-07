import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IStandardResponse, ISubstackNote } from './types';
import { SubstackUtils } from './SubstackUtils';

export enum NoteOperation {
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
		default: '',
		default: NoteOperation.Get,
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['note'],
			},
		},
		options: [
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

		// Get note by ID using client.noteForId(noteId)
		const note = await client.noteForId(noteId);

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

export const noteOperationHandlers: Record<
	NoteOperation,
	(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) => Promise<IStandardResponse>
> = {
	[NoteOperation.Get]: get,
	[NoteOperation.GetNotesBySlug]: getNotesBySlug,
	[NoteOperation.GetNotesById]: getNotesById,
	[NoteOperation.GetNoteById]: getNoteById,
};
