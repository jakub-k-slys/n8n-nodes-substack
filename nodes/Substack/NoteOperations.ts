import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { Substack as SubstackClient } from 'substack-api';

export class NoteOperations {
	static async create(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) {
		// Get note parameters
		const title = executeFunctions.getNodeParameter('title', itemIndex) as string;
		const body = executeFunctions.getNodeParameter('body', itemIndex) as string;

		if (!title || !body) {
			throw new NodeOperationError(executeFunctions.getNode(), 'Title and body are required', {
				itemIndex,
			});
		}

		// Create note content by combining title and body
		// For simple notes, we'll create a formatted note with title as first paragraph
		const noteContent = title + '\n\n' + body;

		// Publish the note using the substack-api library
		const response = await client.publishNote(noteContent);

		// Format response to match expected output format
		return {
			success: true,
			title: title,
			noteId: response.id,
			url: `https://${publicationAddress}/p/${response.id}`, // Construct URL based on response
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
					title: '', // Notes don't typically have titles separate from body
					body: comment.body || '',
					url: `https://${publicationAddress}/p/${comment.id}`,
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
