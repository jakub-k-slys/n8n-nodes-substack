import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IStandardResponse, ISubstackNote } from './types';
import { SubstackUtils } from './SubstackUtils';

export class NoteOperations {
	static async create(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	): Promise<IStandardResponse> {
		// Get note body
		const body = executeFunctions.getNodeParameter('body', itemIndex) as string;

		if (!body) {
			throw new NodeOperationError(executeFunctions.getNode(), 'Body is required', {
				itemIndex,
			});
		}

		try {
			// Get own profile first, then create note
			const ownProfile = await client.ownProfile();
			const response = await ownProfile.createNote({ body });

			// Format response to match expected output format
			const formattedNote: ISubstackNote = {
				noteId: response.id?.toString() || 'unknown',
				body: response.body || body,
				url: SubstackUtils.formatUrl(publicationAddress, `/p/${response.id || 'unknown'}`),
				date: response.publishedAt?.toISOString() || new Date().toISOString(),
				status: 'published',
				userId: response.author?.id?.toString() || 'unknown',
			};

			return {
				success: true,
				data: formattedNote,
				metadata: {
					date: response.publishedAt?.toISOString(),
					status: 'published',
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

	static async get(
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
					noteId: (note as any).rawData?.comment?.id?.toString() || note.id?.toString() || 'unknown', // Extract comment ID for noteId
					body: note.body || '',
					url: SubstackUtils.formatUrl(publicationAddress, `/p/${(note as any).rawData?.comment?.id || note.id || 'unknown'}`),
					date: (note as any).rawData?.context?.timestamp || note.publishedAt?.toISOString() || new Date().toISOString(),
					status: 'published',
					userId: note.author?.id?.toString() || 'unknown',
					likes: note.likesCount || 0,
					restacks: (note as any).rawData?.comment?.restacks || 0, // Try to get restacks from rawData
					type: 'note',
					entityKey: (note as any).rawData?.entity_key || note.id, // Use original entity_key if available
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
}
