export class OperationUtils {
	/**
	 * Execute an async iterable with limit and formatting
	 */
	static async executeAsyncIterable<T, R>(
		iterable: AsyncIterable<T>,
		limit: number,
		formatter: (item: T, ...args: any[]) => R,
		...formatterArgs: any[]
	): Promise<R[]> {
		const results: R[] = [];
		let count = 0;

		for await (const item of iterable) {
			if (count >= limit) break;

			try {
				results.push(formatter(item, ...formatterArgs));
			} catch (error) {
				// Skip malformed items but continue processing
			}
			count++;
		}

		return results;
	}

	/**
	 * Parse limit parameter with default fallback
	 */
	static parseLimit(limitParam: any): number {
		if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
			return Number(limitParam);
		}
		return 100; // Default limit
	}

	/**
	 * Parse numeric parameter (like postId, userId) with validation
	 */
	static parseNumericParam(param: any, paramName: string): number {
		const numericValue = typeof param === 'string' ? parseInt(param, 10) : param;

		if (!numericValue || isNaN(numericValue)) {
			throw new Error(`Invalid ${paramName}: must be a valid number`);
		}

		return numericValue;
	}
}
