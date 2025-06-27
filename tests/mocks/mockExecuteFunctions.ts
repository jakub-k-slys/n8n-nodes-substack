import { IExecuteFunctions, INode, INodeExecutionData } from 'n8n-workflow';
import { mockCredentials } from './mockData';

export class MockExecuteFunctions {
	private nodeParameters: Record<string, any> = {};
	private inputData: INodeExecutionData[] = [{ json: {} }];
	private credentials: any = mockCredentials;
	private node: INode = {
		id: 'test-node-id',
		name: 'Test Substack Node',
		type: 'n8n-nodes-substack.substack',
		typeVersion: 1,
		position: [0, 0],
		parameters: {},
	};

	setNodeParameter(name: string, value: any): void {
		this.nodeParameters[name] = value;
	}

	setInputData(data: INodeExecutionData[]): void {
		this.inputData = data;
	}

	setCredentials(creds: any): void {
		this.credentials = creds;
	}

	createMockExecuteFunctions(): IExecuteFunctions {
		const mockFunctions = {
			getNodeParameter: jest.fn((name: string, itemIndex: number, defaultValue?: any) => {
				return this.nodeParameters[name] ?? defaultValue;
			}),
			
			getInputData: jest.fn(() => this.inputData),
			
			getCredentials: jest.fn(async (credentialType: string) => {
				if (credentialType === 'substackApi') {
					return this.credentials;
				}
				throw new Error(`Unknown credential type: ${credentialType}`);
			}),
			
			getNode: jest.fn(() => this.node),
			
			continueOnFail: jest.fn(() => false),
			
			// Add other required methods as needed
			helpers: {},
			getContext: jest.fn(),
			getWorkflow: jest.fn(),
			getMode: jest.fn(),
			getActivationMode: jest.fn(),
			getNodeInputs: jest.fn(),
			getNodeOutputs: jest.fn(),
			getRestApiUrl: jest.fn(),
			getInstanceBaseUrl: jest.fn(),
			getInstanceId: jest.fn(),
			getTimezone: jest.fn(),
			getExecuteData: jest.fn(),
			sendMessageToUI: jest.fn(),
			getChildNodes: jest.fn(),
			getParentNodes: jest.fn(),
			getParameterValue: jest.fn(),
			getInputConnectionData: jest.fn(),
			getNodeInputData: jest.fn(),
			evaluateExpression: jest.fn(),
			executeWorkflow: jest.fn(),
			sendResponse: jest.fn(),
			addInputData: jest.fn(),
			addOutputData: jest.fn(),
			logger: {
				debug: jest.fn(),
				info: jest.fn(),
				warn: jest.fn(),
				error: jest.fn(),
			},
		} as unknown as IExecuteFunctions;

		return mockFunctions;
	}
}

export function createMockExecuteFunctions(overrides: Partial<{
	nodeParameters: Record<string, any>;
	inputData: INodeExecutionData[];
	credentials: any;
}>): IExecuteFunctions {
	const factory = new MockExecuteFunctions();
	
	if (overrides.nodeParameters) {
		Object.entries(overrides.nodeParameters).forEach(([key, value]) => {
			factory.setNodeParameter(key, value);
		});
	}
	
	if (overrides.inputData) {
		factory.setInputData(overrides.inputData);
	}
	
	if (overrides.credentials) {
		factory.setCredentials(overrides.credentials);
	}
	
	return factory.createMockExecuteFunctions();
}