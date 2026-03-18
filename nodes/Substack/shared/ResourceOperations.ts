import { IExecuteFunctions } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IStandardResponse } from '../types';
import { SubstackUtils } from '../SubstackUtils';
import { OperationUtils } from './OperationUtils';

export class ResourceOperations {
	/**
	 * Execute a resource list operation with standardized patterns
	 */
	static async executeResourceList<T>(config: {
		executeFunctions: IExecuteFunctions;
		client: SubstackClient;
		publicationAddress: string;
		itemIndex: number;
		getIterable: (client: SubstackClient, params: any) => Promise<AsyncIterable<T>>;
		formatter: (item: T, publicationAddress: string, ...args: any[]) => any;
		additionalParams?: Record<string, any>;
		formatterArgs?: any[];
	}): Promise<IStandardResponse> {
		try {
			const limitParam = config.executeFunctions.getNodeParameter('limit', config.itemIndex, '');
			const limit = OperationUtils.parseLimit(limitParam);

			// Extract additional parameters
			const params: any = {};
			if (config.additionalParams) {
				for (const [key, defaultValue] of Object.entries(config.additionalParams)) {
					params[key] = config.executeFunctions.getNodeParameter(
						key,
						config.itemIndex,
						defaultValue,
					);
				}
			}

			const iterable = await config.getIterable(config.client, params);
			const results = await OperationUtils.executeAsyncIterable(
				iterable,
				limit,
				config.formatter,
				config.publicationAddress,
				...(config.formatterArgs || []),
			);

			return {
				success: true,
				data: results,
				metadata: { status: 'success' },
			};
		} catch (error) {
			return SubstackUtils.formatErrorResponse({
				message: error.message,
				node: config.executeFunctions.getNode(),
				itemIndex: config.itemIndex,
			});
		}
	}

	/**
	 * Execute a single resource operation (get by ID)
	 */
	static async executeSingleResource<T>(config: {
		executeFunctions: IExecuteFunctions;
		client: SubstackClient;
		publicationAddress: string;
		itemIndex: number;
		getResource: (client: SubstackClient, params: any) => Promise<T>;
		formatter: (item: T, publicationAddress: string, ...args: any[]) => any;
		additionalParams?: Record<string, any>;
		formatterArgs?: any[];
	}): Promise<IStandardResponse> {
		try {
			// Extract additional parameters
			const params: any = {};
			if (config.additionalParams) {
				for (const [key, defaultValue] of Object.entries(config.additionalParams)) {
					params[key] = config.executeFunctions.getNodeParameter(
						key,
						config.itemIndex,
						defaultValue,
					);
				}
			}

			const resource = await config.getResource(config.client, params);
			const result = config.formatter(
				resource,
				config.publicationAddress,
				...(config.formatterArgs || []),
			);

			return {
				success: true,
				data: result,
				metadata: { status: 'success' },
			};
		} catch (error) {
			return SubstackUtils.formatErrorResponse({
				message: error.message,
				node: config.executeFunctions.getNode(),
				itemIndex: config.itemIndex,
			});
		}
	}
}
