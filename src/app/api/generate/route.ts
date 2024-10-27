import {NextRequest, NextResponse} from "next/server";
import {createErrorResponse, getPluginSettingsFromRequest, PluginErrorType} from "@lobehub/chat-plugin-sdk";
import {IImageGenerationResponse, IImageGenerationResult, IImageGenerationStatusResponse, Settings} from "@/type";
import axios from "axios";

const BASE_URL = process.env.BASE_URL || 'https://dashscope.aliyuncs.com/api/v1'


export async function POST(req: NextRequest) {
	try {
		let settings = getPluginSettingsFromRequest<Settings>(req);
		if (!settings)
			return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
				message: 'Plugin settings not found.',
			});

		const apiKey = settings.ALIBABA_API_KEY

		const body = await req.json();
		const { prompt } = body

		// 调用阿里云的API生成图片
		const response = await axios.post(
			`${BASE_URL}/services/aigc/text2image/image-synthesis`,
			{
				model: 'wanx-v1',
				input: {
					prompt: prompt
				},
				parameters: {
					n: 1,
				},
			},
			{
				headers: {
					'X-DashScope-Async': 'enable',
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				}
			}
		);

		if (response.status !== 200) {
			if (response.status === 401) {
				return createErrorResponse(PluginErrorType.PluginSettingsInvalid, {
					message: 'Invalid API key.'
				})
			}
			console.error('Failed to generate image:', response.data);
			return NextResponse.json({
				message: 'Failed to generate image.'
			})
		}

		const respData: IImageGenerationResponse = response.data;

		const taskId = respData.output.task_id;

		// 检查图片生成的状态

		let statusData: IImageGenerationStatusResponse;

		do {
			// 请求接口获取状态
			const statusResponse = await axios.get(
				`${BASE_URL}/tasks/${taskId}`,
				{
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
				});

			statusData = statusResponse.data;
			// 间隔500ms
			await new Promise((resolve) => setTimeout(resolve, 500));
		} while(statusData.output.task_status === 'RUNNING' || statusData.output.task_status === 'PENDING');

		if (statusData.output.task_status !== 'SUCCEEDED') {
			console.error('Failed to generate image:', statusData);
			return NextResponse.json({
				message: 'Failed to generate image.'
			})
		}

		// 解析图片地址
		const results: IImageGenerationResult[] | undefined = statusData.output.results

		const imageUrl = results ? results[0].url : ''

		// 构建 Markdown 格式的响应
		const markdownResponse = `
      图片已成功生成！

      ![Generated Image](${imageUrl})

      *提示词: ${prompt}*
    `.trim();

		// 返回生成的图片URL
		return NextResponse.json({ markdownResponse });
	} catch (error) {
		console.error('Error generating image:', error);
		return NextResponse.json({
			message: 'Failed to generate image.'
		})
	}
}
