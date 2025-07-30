import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';
import { testErrorMessages, testLimits } from '../fixtures/testData';
import { MockEnvironment, ResourceTestConfig } from './testPatterns';

/**
 * Higher-level test helpers that combine multiple test patterns
 * for common testing scenarios
 */

/**
 * Comprehensive test suite for resource retrieval operations
 * This creates a standard set of tests that should apply to most retrieval operations
 */
export const createRetrievalTestSuite = (
	resource: string,
	operation: string,
	options: {
		additionalParams?: Record<string, any>;
		expectedFields?: string[];
		clientMethod?: string;
		profileMethod?: string;
		mockDataCount?: number;
		skipLimitTests?: boolean;
		skipEmptyTests?: boolean;
		customErrorSetup?: (mockEnv: MockEnvironment) => void;
	} = {}
) => {
	const config: ResourceTestConfig = {
		resource,
		operation,
		additionalParams: options.additionalParams,
		expectedCount: options.mockDataCount,
	};

	return {
		/**
		 * Test successful retrieval with default parameters
		 */
		testSuccessful: async (substackNode: Substack, mockEnv: MockEnvironment) => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: config.resource,
					operation: config.operation,
					...config.additionalParams,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Standard assertions
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			
			if (config.expectedCount !== undefined) {
				expect(result[0].length).toBe(config.expectedCount);
			}

			// Verify client method calls
			if (options.clientMethod) {
				expect(mockEnv.mockClient[options.clientMethod]).toHaveBeenCalledTimes(1);
			}
			
			if (options.profileMethod) {
				expect(mockEnv.mockOwnProfile[options.profileMethod]).toHaveBeenCalledTimes(1);
			}

			// Verify output structure
			if (result[0].length > 0) {
				const firstItem = result[0][0];
				expect(firstItem).toHaveProperty('json');
				expect(firstItem).toHaveProperty('pairedItem');
				expect(firstItem.pairedItem).toEqual({ item: 0 });

				// Check expected fields
				if (options.expectedFields) {
					options.expectedFields.forEach(field => {
						expect(firstItem.json).toHaveProperty(field);
					});
				}
			}

			return result;
		},

		/**
		 * Test custom limit parameter handling
		 */
		testCustomLimit: async (substackNode: Substack, mockEnv: MockEnvironment) => {
			if (options.skipLimitTests) return;

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: config.resource,
					operation: config.operation,
					limit: testLimits.small,
					...config.additionalParams,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);
			
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBeLessThanOrEqual(testLimits.small);
		},

		/**
		 * Test empty response handling
		 */
		testEmptyResponse: async (
			substackNode: Substack, 
			mockEnv: MockEnvironment,
			emptySetup: () => void
		) => {
			if (options.skipEmptyTests) return;

			emptySetup();

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: config.resource,
					operation: config.operation,
					...config.additionalParams,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);
			
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(0);
		},

		/**
		 * Test API error handling
		 */
		testApiError: async (
			substackNode: Substack,
			mockEnv: MockEnvironment,
			errorSetup?: () => void
		) => {
			const setupFn = errorSetup || (() => {
				if (options.customErrorSetup) {
					options.customErrorSetup(mockEnv);
				} else if (options.profileMethod) {
					mockEnv.mockOwnProfile[options.profileMethod].mockRejectedValue(
						new Error(testErrorMessages.apiError)
					);
				}
			});

			setupFn();

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: config.resource,
					operation: config.operation,
					...config.additionalParams,
				},
				credentials: mockCredentials,
			});

			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();
		},

		/**
		 * Test continueOnFail mode
		 */
		testContinueOnFail: async (
			substackNode: Substack,
			mockEnv: MockEnvironment,
			errorSetup?: () => void
		) => {
			const setupFn = errorSetup || (() => {
				if (options.customErrorSetup) {
					options.customErrorSetup(mockEnv);
				} else if (options.profileMethod) {
					mockEnv.mockOwnProfile[options.profileMethod].mockRejectedValue(
						new Error(testErrorMessages.apiError)
					);
				}
			});

			setupFn();

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: config.resource,
					operation: config.operation,
					...config.additionalParams,
				},
				credentials: mockCredentials,
			});

			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);

			const result = await substackNode.execute.call(mockExecuteFunctions);
			expect(result[0][0].json).toHaveProperty('error');
		},

		/**
		 * Test large limit values
		 */
		testLargeLimit: async (substackNode: Substack, mockEnv: MockEnvironment) => {
			if (options.skipLimitTests) return;

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: config.resource,
					operation: config.operation,
					limit: testLimits.large,
					...config.additionalParams,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);
			
			// Should work with available data
			expect(result[0].length).toBeLessThanOrEqual(options.mockDataCount || 10);
		},
	};
};

/**
 * Test suite for operations that require ID parameters
 */
export const createByIdTestSuite = (
	resource: string,
	operation: string,
	idParam: string,
	options: {
		validId?: string | number;
		invalidId?: string | number;
		clientMethod?: string;
		expectedFields?: string[];
	} = {}
) => {
	const validId = options.validId || (resource === 'post' ? 98765 : '12345');
	const invalidId = options.invalidId || (resource === 'post' ? 999999 : '999999');

	return {
		/**
		 * Test successful retrieval by ID
		 */
		testSuccessfulById: async (substackNode: Substack, mockEnv: MockEnvironment) => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: resource,
					operation: operation,
					[idParam]: validId,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(1);

			// Verify client method call
			if (options.clientMethod) {
				const expectedCallValue = typeof validId === 'string' ? parseInt(validId) : validId;
				expect(mockEnv.mockClient[options.clientMethod]).toHaveBeenCalledWith(expectedCallValue);
			}

			// Verify expected fields
			if (options.expectedFields) {
				const itemData = result[0][0].json;
				options.expectedFields.forEach(field => {
					expect(itemData).toHaveProperty(field);
				});
			}

			return result;
		},

		/**
		 * Test error handling for invalid ID
		 */
		testInvalidId: async (substackNode: Substack, mockEnv: MockEnvironment) => {
			if (options.clientMethod) {
				mockEnv.mockClient[options.clientMethod].mockRejectedValue(
					new Error(`${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`)
				);
			}

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: resource,
					operation: operation,
					[idParam]: invalidId,
				},
				credentials: mockCredentials,
			});

			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();
		},

		/**
		 * Test handling of different ID formats (string vs number)
		 */
		testIdFormatHandling: async (substackNode: Substack, mockEnv: MockEnvironment) => {
			const stringId = typeof validId === 'number' ? validId.toString() : validId;
			
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: resource,
					operation: operation,
					[idParam]: stringId,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(1);

			if (options.clientMethod) {
				const expectedCallValue = typeof stringId === 'string' ? parseInt(stringId) : stringId;
				expect(mockEnv.mockClient[options.clientMethod]).toHaveBeenCalledWith(expectedCallValue);
			}
		},
	};
};

/**
 * Standard validation test patterns
 */
export const createValidationTestSuite = (resource: string) => ({
	/**
	 * Test invalid operation validation
	 */
	testInvalidOperation: async (substackNode: Substack) => {
		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: resource,
				operation: 'invalid_operation',
			},
			credentials: mockCredentials,
		});

		await expect(
			substackNode.execute.call(mockExecuteFunctions)
		).rejects.toThrow(testErrorMessages.invalidOperation('invalid_operation'));
	},

	/**
	 * Test invalid resource validation
	 */
	testInvalidResource: async (substackNode: Substack) => {
		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'invalid_resource',
				operation: 'get',
			},
			credentials: mockCredentials,
		});

		await expect(
			substackNode.execute.call(mockExecuteFunctions)
		).rejects.toThrow(testErrorMessages.invalidResource('invalid_resource'));
	},
});

/**
 * Helper to run all standard tests for a resource retrieval operation
 */
export const runStandardRetrievalTests = async (
	describe: jest.Describe,
	it: jest.It,
	substackNode: Substack,
	mockEnv: MockEnvironment,
	resource: string,
	operation: string,
	options: Parameters<typeof createRetrievalTestSuite>[2] = {}
) => {
	const testSuite = createRetrievalTestSuite(resource, operation, options);

	describe(`${resource.charAt(0).toUpperCase() + resource.slice(1)} Retrieval`, () => {
		it(`should successfully retrieve ${resource}s with default parameters`, async () => {
			await testSuite.testSuccessful(substackNode, mockEnv);
		});

		if (!options.skipLimitTests) {
			it('should handle custom limit parameter', async () => {
				await testSuite.testCustomLimit(substackNode, mockEnv);
			});

			it('should handle large limit values', async () => {
				await testSuite.testLargeLimit(substackNode, mockEnv);
			});
		}

		if (!options.skipEmptyTests) {
			it(`should handle empty ${resource}s list`, async () => {
				await testSuite.testEmptyResponse(substackNode, mockEnv, () => {
					if (options.profileMethod) {
						mockEnv.mockOwnProfile[options.profileMethod].mockResolvedValue({
							async *[Symbol.asyncIterator]() {
								// Empty iterator
							},
						});
					}
				});
			});
		}

		it('should handle client errors during retrieval', async () => {
			await testSuite.testApiError(substackNode, mockEnv);
		});

		it(`should handle continueOnFail mode for ${resource} retrieval`, async () => {
			await testSuite.testContinueOnFail(substackNode, mockEnv);
		});
	});
};