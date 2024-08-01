import {createGatewayOnEdgeRuntime} from "@lobehub/chat-plugins-gateway";
import {NextRequest, NextResponse} from "next/server";

export async function OPTIONS(req: NextRequest, res: NextResponse) {
	return createGatewayOnEdgeRuntime()(req)
}

export async function POST(req: Request) {
	console.log('in gateway', process.env.NODE_ENV)
	if (process.env.NODE_ENV === 'development') {
		return createGatewayOnEdgeRuntime()(req)
	}

	return new Response('gateway')
}