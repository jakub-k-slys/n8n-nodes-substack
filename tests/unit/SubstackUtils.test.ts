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

	describe('formatUrl', () => {
		it('should handle URLs with special characters', () => {
			const publicationAddress = 'https://myblog.substack.com';
			const path = '/p/special-chars-&-symbols';
			
			const result = SubstackUtils.formatUrl(publicationAddress, path);
			
			expect(result).toBe('https://myblog.substack.com/p/special-chars-%26-symbols');
		});

		it('should encode Unicode characters properly', () => {
			const publicationAddress = 'https://myblog.substack.com';
			const path = '/p/café-résumé';
			
			const result = SubstackUtils.formatUrl(publicationAddress, path);
			
			expect(result).toBe('https://myblog.substack.com/p/caf%C3%A9-r%C3%A9sum%C3%A9');
		});
	});
});