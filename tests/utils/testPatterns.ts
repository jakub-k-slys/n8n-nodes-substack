import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';

/**
 * Standardized test patterns for different types of operations
 * This eliminates duplication and ensures consistent testing across all resources
 */

export interface ResourceTestConfig {
	resource: string;
	operation: string;
	additionalParams?: Record<string, any>;
	expectedCount?: number;
}

export interface MockEnvironment {
	mockClient: any;
	mockOwnProfile: any;
	mockNoteBuilder?: any;
	mockParagraphBuilder?: any;
	mockPost?: any;
}

/**
 * Standard pattern for testing successful resource retrieval operations
 */
export const testSuccessfulRetrieval = async (
	substackNode: Substack,
	config: ResourceTestConfig,
	mockEnv: MockEnvironment,
	assertions?: {
		clientMethod?: string;
		profileMethod?: string;
		expectedFields?: string[];
		customVerification?: (result: any) => void;
	}
) => {
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
	} else {
		expect(result[0].length).toBeGreaterThanOrEqual(0);
	}

	// Verify client method calls if specified
	if (assertions?.clientMethod) {
		expect(mockEnv.mockClient[assertions.clientMethod]).toHaveBeenCalledTimes(1);
	}
	
	if (assertions?.profileMethod) {
		expect(mockEnv.mockOwnProfile[assertions.profileMethod]).toHaveBeenCalledTimes(1);
	}

	// Verify output structure if there are results
	if (result[0].length > 0) {
		const firstItem = result[0][0];
		expect(firstItem).toHaveProperty('json');
		expect(firstItem).toHaveProperty('pairedItem');
		expect(firstItem.pairedItem).toEqual({ item: 0 });

		// Check expected fields if specified
		if (assertions?.expectedFields) {
			assertions.expectedFields.forEach(field => {
				expect(firstItem.json).toHaveProperty(field);
			});
		}
	}

	// Custom verification if provided
	if (assertions?.customVerification) {
		assertions.customVerification(result);
	}

	return result;
};

/**
 * Standard pattern for testing custom limit parameters
 */
export const testCustomLimit = async (
	substackNode: Substack,
	config: ResourceTestConfig & { limit: number },
	mockEnv: MockEnvironment
) => {
	const mockExecuteFunctions = createMockExecuteFunctions({
		nodeParameters: {
			resource: config.resource,
			operation: config.operation,
			limit: config.limit,
			...config.additionalParams,
		},
		credentials: mockCredentials,
	});

	const result = await substackNode.execute.call(mockExecuteFunctions);
	
	expect(result[0]).toBeDefined();
	expect(result[0].length).toBeLessThanOrEqual(config.limit);
	
	return result;
};

/**
 * Standard pattern for testing empty response handling
 */
export const testEmptyResponse = async (
	substackNode: Substack,
	config: ResourceTestConfig,
	mockEnv: MockEnvironment,
	emptyIteratorSetup: () => void
) => {
	// Setup empty response
	emptyIteratorSetup();

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
	
	return result;
};

/**
 * Standard pattern for testing API error handling
 */
export const testApiError = async (
	substackNode: Substack,
	config: ResourceTestConfig,
	mockEnv: MockEnvironment,
	errorSetup: () => void,
	expectedError?: string | RegExp
) => {
	// Setup error condition
	errorSetup();

	const mockExecuteFunctions = createMockExecuteFunctions({
		nodeParameters: {
			resource: config.resource,
			operation: config.operation,
			...config.additionalParams,
		},
		credentials: mockCredentials,
	});

	if (expectedError) {
		await expect(
			substackNode.execute.call(mockExecuteFunctions)
		).rejects.toThrow(expectedError);
	} else {
		await expect(
			substackNode.execute.call(mockExecuteFunctions)
		).rejects.toThrow();
	}
};

/**
 * Standard pattern for testing continueOnFail mode
 */
export const testContinueOnFail = async (
	substackNode: Substack,
	config: ResourceTestConfig,
	mockEnv: MockEnvironment,
	errorSetup: () => void
) => {
	// Setup error condition
	errorSetup();

	const mockExecuteFunctions = createMockExecuteFunctions({
		nodeParameters: {
			resource: config.resource,
			operation: config.operation,
			...config.additionalParams,
		},
		credentials: mockCredentials,
	});

	// Enable continueOnFail
	mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);

	const result = await substackNode.execute.call(mockExecuteFunctions);
	
	// Should not throw, but should return error response
	expect(result[0][0].json).toHaveProperty('error');
	
	return result;
};

/**
 * Standard pattern for testing invalid operation parameters
 */
export const testInvalidOperation = async (
	substackNode: Substack,
	resource: string,
	invalidOperation: string
) => {
	const mockExecuteFunctions = createMockExecuteFunctions({
		nodeParameters: {
			resource: resource,
			operation: invalidOperation,
		},
		credentials: mockCredentials,
	});

	await expect(
		substackNode.execute.call(mockExecuteFunctions)
	).rejects.toThrow(`Unknown operation: ${invalidOperation}`);
};

/**
 * Standard pattern for testing output structure and formatting
 */
export const testOutputStructure = async (
	substackNode: Substack,
	config: ResourceTestConfig,
	mockEnv: MockEnvironment,
	expectedFields: string[]
) => {
	const result = await testSuccessfulRetrieval(substackNode, config, mockEnv);
	
	if (result[0].length > 0) {
		result[0].forEach((output: any, index: number) => {
			// Verify standard n8n output structure
			expect(output).toHaveProperty('json');
			expect(output).toHaveProperty('pairedItem');
			expect(output.pairedItem).toEqual({ item: 0 });
			
			// Verify all expected fields are present
			expectedFields.forEach(field => {
				expect(output.json).toHaveProperty(field);
			});
		});
	}
	
	return result;
};

/**
 * Standard pattern for testing large limit values
 */
export const testLargeLimitHandling = async (
	substackNode: Substack,
	config: ResourceTestConfig & { limit: number },
	mockEnv: MockEnvironment,
	expectedMaxResults: number
) => {
	const result = await testCustomLimit(substackNode, config, mockEnv);
	
	// Should work with available data, not exceed what's actually available
	expect(result[0].length).toBeLessThanOrEqual(expectedMaxResults);
	
	return result;
};

/**
 * Helper to create standardized test suites for resource operations
 */
export const createResourceTestSuite = (
	resource: string,
	operation: string,
	options: {
		additionalParams?: Record<string, any>;
		expectedFields?: string[];
		clientMethod?: string;
		profileMethod?: string;
		customTests?: Array<{
			name: string;
			test: (substackNode: Substack, mockEnv: MockEnvironment) => Promise<void>;
		}>;
	} = {}
) => {
	const config: ResourceTestConfig = {
		resource,
		operation,
		additionalParams: options.additionalParams,
	};

	return {
		config,
		testSuccessfulRetrieval: (substackNode: Substack, mockEnv: MockEnvironment) => 
			testSuccessfulRetrieval(substackNode, config, mockEnv, {
				clientMethod: options.clientMethod,
				profileMethod: options.profileMethod,
				expectedFields: options.expectedFields,
			}),
		testCustomLimit: (substackNode: Substack, mockEnv: MockEnvironment, limit: number) => 
			testCustomLimit(substackNode, { ...config, limit }, mockEnv),
		testEmptyResponse: (substackNode: Substack, mockEnv: MockEnvironment, emptySetup: () => void) => 
			testEmptyResponse(substackNode, config, mockEnv, emptySetup),
		testApiError: (substackNode: Substack, mockEnv: MockEnvironment, errorSetup: () => void) => 
			testApiError(substackNode, config, mockEnv, errorSetup),
		testOutputStructure: (substackNode: Substack, mockEnv: MockEnvironment) => 
			testOutputStructure(substackNode, config, mockEnv, options.expectedFields || []),
		customTests: options.customTests || [],
	};
};