import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { Substack as SubstackClient } from 'substack-api';
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

		// Publish the note using the substack-api library
		const response = await client.publishNote(body);

		// Format response to match expected output format
		const formattedNote: ISubstackNote = {
			noteId: response.id.toString(),
			body: response.body || body,
			url: SubstackUtils.formatUrl(publicationAddress, `/p/${response.id}`),
			date: response.date,
			status: response.status,
			userId: response.user_id.toString(),
		};

		return {
			success: true,
			data: formattedNote,
			metadata: {
				date: response.date,
				status: response.status,
			},
		};
	}

	static async get(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	): Promise<IStandardResponse> {
		try {
			// Get parameters for retrieving notes
			const limit = executeFunctions.getNodeParameter('limit', itemIndex, 10) as number;

			// Retrieve notes using the substack-api library
			const notes = client.getNotes({ limit });
			const formattedNotes: ISubstackNote[] = [];

			// Iterate through async iterable notes
			for await (const note of notes) {
				// Extract note content from the comment field
				const comment = note.comment;
				if (comment) {
					formattedNotes.push({
						noteId: comment.id.toString(),
						body: comment.body || '',
						url: SubstackUtils.formatUrl(publicationAddress, `/p/${comment.id}`),
						date: comment.date,
						status: 'published',
						userId: comment.user_id.toString(),
						likes: comment.reaction_count || 0,
						restacks: comment.restacks || 0,
						type: comment.type,
						entityKey: note.entity_key,
					});
				}
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
