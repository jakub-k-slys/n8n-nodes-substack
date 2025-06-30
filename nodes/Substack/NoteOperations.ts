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
		try {
			// Get note body
			const body = executeFunctions.getNodeParameter('body', itemIndex) as string;

			if (!body) {
				throw new NodeOperationError(executeFunctions.getNode(), 'Body is required', {
					itemIndex,
				});
			}

			// Create the note using the new entity model
			const ownProfile = await client.ownProfile();
			const note = await ownProfile.createNote({ body });

			// Format response to match expected output format
			const formattedNote: ISubstackNote = {
				noteId: note.id.toString(),
				body: note.body || body,
				url: SubstackUtils.formatUrl(publicationAddress, `/p/${note.id}`),
				date: note.publishedAt.toISOString(),
				status: 'published',
				userId: note.author.id.toString(),
				likes: note.likesCount || 0,
				restacks: 0,
				type: 'note',
				entityKey: note.id,
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
			const options: any = {};
			if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
				options.limit = Number(limitParam);
			} else {
				options.limit = 100;
			}

			// Get own profile and retrieve notes using the new entity model
			const ownProfile = await client.ownProfile();
			const formattedNotes: ISubstackNote[] = [];

			// Iterate through async iterable notes
			for await (const note of ownProfile.notes(options)) {
				formattedNotes.push({
					noteId: note.id.toString(),
					body: note.body || '',
					url: SubstackUtils.formatUrl(publicationAddress, `/p/${note.id}`),
					date: note.publishedAt.toISOString(),
					status: 'published',
					userId: note.author.id.toString(),
					likes: note.likesCount || 0,
					restacks: 0, // Not available in new API
					type: 'note',
					entityKey: note.id,
				});
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
