import { env } from 'cloudflare:workers';
import { handleBlueprint } from '../../../lib/ai-server';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) { return handleBlueprint(request, env); }
