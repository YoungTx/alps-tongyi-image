/**
 * @description: This file contains all the typescript interfaces used in the application.
 */

// Image Generation API
export interface IImageGenerationResponse {
	code?: string;
	message?: string;
	request_id: string;
	output: {
		task_id: string;
		task_status: string;
	}
}

// Image Generation Result API
export interface IImageGenerationResult {
	url?: string;
	code?: string;
	message?: string;
}

// Image Generation Status API
export interface IImageGenerationStatusResponse {
	request_id: string;
	usage: {
		image_count: number;
	};
	output: {
		code?: string;
		message?: string;
		task_id: string;
		task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
		results?: IImageGenerationResult[];
		task_metrics: {
			TOTAL: number;
			SUCCESS: number;
			FAILED: number;
		}
	}
}

export interface Settings {
	ALIBABA_API_KEY: string;
}