import { SubstackUtils } from '../../nodes/Substack/SubstackUtils';

describe('SubstackUtils', () => {
	describe('formatUrl', () => {
		it('should correctly format URLs with proper path handling', () => {
			const publicationAddress = 'https://myblog.substack.com';
			const path = '/p/12345';
			
			const result = SubstackUtils.formatUrl(publicationAddress, path);
			
			expect(result).toBe('https://myblog.substack.com/p/12345');
		});

		it('should handle URLs without leading slash in path', () => {
			const publicationAddress = 'https://myblog.substack.com';
			const path = 'p/12345';
			
			const result = SubstackUtils.formatUrl(publicationAddress, path);
			
			expect(result).toBe('https://myblog.substack.com/p/12345');
		});

		it('should handle publication addresses with trailing slashes', () => {
			const publicationAddress = 'https://myblog.substack.com/';
			const path = '/p/12345';
			
			const result = SubstackUtils.formatUrl(publicationAddress, path);
			
			expect(result).toBe('https://myblog.substack.com/p/12345');
		});

		it('should handle multiple trailing slashes', () => {
			const publicationAddress = 'https://myblog.substack.com///';
			const path = '/p/12345';
			
			const result = SubstackUtils.formatUrl(publicationAddress, path);
			
			expect(result).toBe('https://myblog.substack.com/p/12345');
		});
	});

	describe('validateResponse', () => {
		it('should return successful response for valid data', () => {
			const responseData = {
				id: 123,
				title: 'Test',
				date: '2024-01-15T10:30:00Z',
				status: 'published',
			};

			const result = SubstackUtils.validateResponse(responseData);

			expect(result.success).toBe(true);
			expect(result.data).toEqual(responseData);
			expect(result.metadata?.date).toBe('2024-01-15T10:30:00Z');
			expect(result.metadata?.status).toBe('published');
		});

		it('should return error response for null/undefined data', () => {
			const result = SubstackUtils.validateResponse(null);

			expect(result.success).toBe(false);
			expect(result.data).toBeNull();
			expect(result.error).toBe('Empty response received');
		});

		it('should handle response without date/status fields', () => {
			const responseData = { id: 123, title: 'Test' };

			const result = SubstackUtils.validateResponse(responseData);

			expect(result.success).toBe(true);
			expect(result.data).toEqual(responseData);
			expect(result.metadata?.date).toBeUndefined();
			expect(result.metadata?.status).toBeUndefined();
		});
	});
});