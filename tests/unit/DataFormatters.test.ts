import { DataFormatters } from '../../nodes/Substack/shared/DataFormatters';

describe('DataFormatters Unit Tests', () => {
	describe('formatPost', () => {
		const mockPublicationAddress = 'https://test.substack.com';

		it('should format post with htmlBody field', () => {
			const mockPost = {
				id: 123,
				title: 'Test Post',
				subtitle: 'Test subtitle',
				slug: 'test-post',
				htmlBody: '<h1>Hello World</h1><p>This is a <strong>test</strong> post.</p>',
				publishedAt: new Date('2023-01-01T00:00:00Z'),
				truncatedBody: 'Test description',
				url: 'https://test.substack.com/p/test-post',
			};

			const result = DataFormatters.formatPost(mockPost, mockPublicationAddress);

			expect(result).toMatchObject({
				id: 123,
				title: 'Test Post',
				subtitle: 'Test subtitle',
				url: 'https://test.substack.com/p/test-post',
				description: 'Test description',
				htmlBody: '<h1>Hello World</h1><p>This is a <strong>test</strong> post.</p>',
			});
			expect(result).not.toHaveProperty('markdown');
			expect(result).not.toHaveProperty('type');
			expect(result).not.toHaveProperty('published');
			expect(result).not.toHaveProperty('paywalled');
		});

		it('should handle empty htmlBody', () => {
			const mockPost = {
				id: 456,
				title: 'Empty Post',
				htmlBody: '',
				publishedAt: new Date('2023-01-01T00:00:00Z'),
			};

			const result = DataFormatters.formatPost(mockPost, mockPublicationAddress);

			expect(result.htmlBody).toBe('');
		});

		it('should handle missing htmlBody', () => {
			const mockPost = {
				id: 789,
				title: 'No HTML Body',
				publishedAt: new Date('2023-01-01T00:00:00Z'),
			};

			const result = DataFormatters.formatPost(mockPost, mockPublicationAddress);

			expect(result.htmlBody).toBe('');
		});

		it('should maintain all post fields', () => {
			const mockPost = {
				id: 111,
				title: 'Full Post',
				subtitle: 'Full subtitle',
				slug: 'full-post',
				htmlBody: '<p>Simple content</p>',
				body: 'Simple content',
				truncatedBody: 'Full description',
				publishedAt: new Date('2023-01-01T00:00:00Z'),
				url: 'https://test.substack.com/p/full-post',
			};

			const result = DataFormatters.formatPost(mockPost, mockPublicationAddress);

			expect(result.id).toBe(111);
			expect(result.title).toBe('Full Post');
			expect(result.subtitle).toBe('Full subtitle');
			expect(result.description).toBe('Full description');
			expect(result.htmlBody).toBe('<p>Simple content</p>');
		});
	});
});
