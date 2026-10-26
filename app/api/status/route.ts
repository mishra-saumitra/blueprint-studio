import { env } from 'cloudflare:workers';
import { getStatus } from '../../../lib/ai-server';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { return getStatus(request, env); }
