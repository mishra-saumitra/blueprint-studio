/** Optional live test: run with OPENAI_API_KEY supplied via the runtime environment. Never prints the credential. */
import { handleBlueprint } from '../lib/ai-server.ts';
import { validateBlueprint, defaultLandscape } from '../lib/blueprint.ts';
import { writeFile } from 'node:fs/promises';
const db = {prepare:()=>({bind:()=>({first:async()=>({count:1})})})} as unknown as D1Database;
const query=process.argv[2] || 'Monthly P&L with profit center breakdown, actual versus plan and cost center drill-down';
const request=new Request('https://private.example/api/blueprint',{method:'POST',headers:{origin:'https://private.example','content-type':'application/json','oai-authenticated-user-id':'smoke-owner'},body:JSON.stringify({query,landscape:defaultLandscape,customSources:[]})});
const response=await handleBlueprint(request,{OPENAI_API_KEY:process.env.OPENAI_API_KEY,OWNER_USER_ID:'smoke-owner',AI_ENABLED:'true',DB:db});
const body=await response.json() as {blueprint?:unknown;error?:string};
if(!response.ok){console.log(JSON.stringify({status:response.status,error:body.error}));process.exitCode=1;}else{
 const bp=validateBlueprint(body.blueprint);
 await writeFile('/private/tmp/blueprint-live-result.json',JSON.stringify(bp,null,2));
 console.log(JSON.stringify({status:response.status,title:bp.title,tables:bp.tables.map(t=>t.id),phases:bp.steps.length,codeBlocks:bp.code.length,mode:bp.mode}));
}
