import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { Substack as SubstackClient } from 'substack-api';

export class NoteOperations {
	static async create(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) {
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
		return {
			success: true,
			noteId: response.id,
			body: response.body || body,
			url: `${publicationAddress}/p/${response.id}`, // Use full URL from credentials
			date: response.date,
			status: response.status,
			userId: response.user_id,
		};
	}

	static async get(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) {
		// Get parameters for retrieving notes
		const limit = executeFunctions.getNodeParameter('limit', itemIndex, 10) as number;
		const offset = executeFunctions.getNodeParameter('offset', itemIndex, 0) as number;

		// Retrieve notes using the substack-api library
		const response = await client.getNotes({ limit, offset });

		// Format response - SubstackNotes has an items property containing the notes
		const notes = response.items || [];
		const formattedNotes = [];

		// Return each note as a separate item
		for (const note of notes) {
			// Extract note content from the comment field
			const comment = note.comment;
			if (comment) {
				formattedNotes.push({
					noteId: comment.id,
					body: comment.body || '',
					url: `${publicationAddress}/p/${comment.id}`,
					date: comment.date,
					status: 'published',
					userId: comment.user_id,
					likes: comment.reaction_count || 0,
					restacks: comment.restacks || 0,
					type: comment.type,
					entityKey: note.entity_key,
				});
			}
		}

		return formattedNotes;
	}
}
