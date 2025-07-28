// Simple mock for marked library to avoid ES module issues during testing
module.exports = {
	marked: {
		lexer: (markdown) => {
			// Simple parser that just returns basic tokens for testing
			const tokens = [];
			
			if (!markdown || !markdown.trim()) {
				return tokens;
			}
			
			// Split by lines and create paragraph tokens
			const lines = markdown.split('\n').filter(line => line.trim());
			
			lines.forEach(line => {
				const trimmed = line.trim();
				if (trimmed.startsWith('##')) {
					tokens.push({
						type: 'heading',
						depth: 2,
						text: trimmed.substring(2).trim(),
						tokens: [{
							type: 'text',
							text: trimmed.substring(2).trim()
						}]
					});
				} else if (trimmed.startsWith('- ')) {
					tokens.push({
						type: 'list',
						ordered: false,
						items: [{
							text: trimmed.substring(2).trim(),
							tokens: [{
								type: 'paragraph',
								text: trimmed.substring(2).trim(),
								tokens: [{
									type: 'text',
									text: trimmed.substring(2).trim()
								}]
							}]
						}]
					});
				} else if (trimmed) {
					// Check for inline formatting
					const tokens_inline = [];
					if (trimmed.includes('**')) {
						// Simple bold parsing
						const parts = trimmed.split('**');
						for (let i = 0; i < parts.length; i++) {
							if (i % 2 === 0) {
								if (parts[i]) tokens_inline.push({ type: 'text', text: parts[i] });
							} else {
								if (parts[i]) tokens_inline.push({ type: 'strong', text: parts[i] });
							}
						}
					} else {
						tokens_inline.push({ type: 'text', text: trimmed });
					}
					
					tokens.push({
						type: 'paragraph',
						text: trimmed,
						tokens: tokens_inline
					});
				}
			});
			
			return tokens;
		}
	}
};