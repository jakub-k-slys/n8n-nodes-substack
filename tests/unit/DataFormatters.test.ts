import { DataFormatters } from '../../nodes/Substack/shared/DataFormatters';

describe('DataFormatters Unit Tests', () => {
	describe('formatPost', () => {
		const mockPublicationAddress = 'https://test.substack.com';

		it('should format post with htmlBody and markdown fields', () => {
			const mockPost = {
				id: 123,
				title: 'Test Post',
				htmlBody: '<h1>Hello World</h1><p>This is a <strong>test</strong> post.</p>',
				publishedAt: new Date('2023-01-01T00:00:00Z'),
				rawData: {
					subtitle: 'Test subtitle',
					type: 'newsletter',
					published: true,
					paywalled: false,
					description: 'Test description'
				}
			};

			const result = DataFormatters.formatPost(mockPost, mockPublicationAddress);

			expect(result).toMatchObject({
				id: 123,
				title: 'Test Post',
				subtitle: 'Test subtitle',
				url: 'https://test.substack.com/p/123',
				type: 'newsletter',
				published: true,
				paywalled: false,
				description: 'Test description',
				htmlBody: '<h1>Hello World</h1><p>This is a <strong>test</strong> post.</p>',
				markdown: 'Hello World\n===========\n\nThis is a **test** post.',
			});
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
			expect(result.markdown).toBe('');
		});

		it('should handle missing htmlBody', () => {
			const mockPost = {
				id: 789,
				title: 'No HTML Body',
				publishedAt: new Date('2023-01-01T00:00:00Z'),
			};

			const result = DataFormatters.formatPost(mockPost, mockPublicationAddress);

			expect(result.htmlBody).toBe('');
			expect(result.markdown).toBe('');
		});

		it('should convert complex HTML to markdown correctly', () => {
			const mockPost = {
				id: 999,
				title: 'Complex HTML Post',
				htmlBody: `
					<h2>Heading 2</h2>
					<p>Paragraph with <em>emphasis</em> and <strong>strong text</strong>.</p>
					<ul>
						<li>List item 1</li>
						<li>List item 2</li>
					</ul>
					<blockquote>This is a quote</blockquote>
					<a href="https://example.com">Link text</a>
				`,
				publishedAt: new Date('2023-01-01T00:00:00Z'),
			};

			const result = DataFormatters.formatPost(mockPost, mockPublicationAddress);

			expect(result.markdown).toContain('Heading 2\n---------');
			expect(result.markdown).toContain('_emphasis_');
			expect(result.markdown).toContain('**strong text**');
			expect(result.markdown).toContain('*   List item 1');
			expect(result.markdown).toContain('> This is a quote');
			expect(result.markdown).toContain('[Link text](https://example.com)');
		});

		it('should maintain all other post fields while adding htmlBody and markdown', () => {
			const mockPost = {
				id: 111,
				title: 'Full Post',
				htmlBody: '<p>Simple content</p>',
				body: 'Simple content',
				publishedAt: new Date('2023-01-01T00:00:00Z'),
				rawData: {
					subtitle: 'Full subtitle',
					post_date: '2023-01-01T00:00:00Z',
					type: 'podcast',
					published: false,
					paywalled: true,
					description: 'Full description'
				}
			};

			const result = DataFormatters.formatPost(mockPost, mockPublicationAddress);

			// Verify all existing fields are preserved
			expect(result.id).toBe(111);
			expect(result.title).toBe('Full Post');
			expect(result.subtitle).toBe('Full subtitle');
			expect(result.type).toBe('podcast');
			expect(result.published).toBe(false);
			expect(result.paywalled).toBe(true);
			expect(result.description).toBe('Full description');
			
			// Verify new fields are added
			expect(result.htmlBody).toBe('<p>Simple content</p>');
			expect(result.markdown).toBe('Simple content');
		});
	});
});