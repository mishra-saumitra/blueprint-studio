import test from 'node:test';
import assert from 'node:assert/strict';
import { handleBlueprint, getStatus, reserveQuota, validateInput } from '../lib/ai-server.ts';
const origin='https://private.example';
const base={source:'S4HANA',warehouse:'Datasphere',reporting:'SAC',version:'any'};
function request(body: unknown={query:'Monthly profit and loss reporting',landscape:base,customSources:[]}, overrides:Record<string,string>={}) {
 return new Request(origin+'/api/blueprint',{method:'POST',headers:{origin,'content-type':'application/json','oai-authenticated-user-id':'owner',...overrides},body:JSON.stringify(body)});
}
function fakeDb() {
 const counts=new Map<string,number>();
 return { prepare() { return { bind(key:string,limit:number) { return { async first() {
  const c=counts.get(key)||0;if(c>=limit)return null;counts.set(key,c+1);return {count:c+1};
 } }; } }; } } as unknown as D1Database;
}
const env=()=>({OPENAI_API_KEY:'synthetic-test-value',AI_ENABLED:'true',OWNER_USER_ID:'owner',DB:fakeDb()});
const noFetch:typeof fetch=async()=>{throw Error('Provider must not be called');};
test('unauthenticated requests denied before provider call',async()=>{assert.equal((await handleBlueprint(request(undefined,{'oai-authenticated-user-id':''}),env(),noFetch)).status,403);});
test('different user denied even with authentication',async()=>{assert.equal((await handleBlueprint(request(undefined,{'oai-authenticated-user-id':'visitor'}),env(),noFetch)).status,403);});
test('missing owner configuration fails closed',async()=>{assert.equal((await handleBlueprint(request(),{...env(),OWNER_USER_ID:undefined},noFetch)).status,403);});
test('disabled generation fails closed',async()=>{assert.equal((await handleBlueprint(request(),{...env(),AI_ENABLED:'false'},noFetch)).status,503);});
test('cross origin blocked even with valid owner',async()=>{assert.equal((await handleBlueprint(request(undefined,{origin:'https://attacker.example'}),env(),noFetch)).status,403);});
test('missing origin rejected',async()=>{assert.equal((await handleBlueprint(request(undefined,{origin:''}),env(),noFetch)).status,403);});
test('invalid landscape and oversized input rejected',()=>{assert.throws(()=>validateInput({query:'hello valid',landscape:{...base,source:'OTHER'}}));assert.throws(()=>validateInput({query:'a'.repeat(4001),landscape:base}));});
test('oversized body rejected before parsing or provider',async()=>{assert.equal((await handleBlueprint(request({padding:'x'.repeat(50000)}),env(),noFetch)).status,413);});
test('wrong content type rejected',async()=>{assert.equal((await handleBlueprint(request(undefined,{'content-type':'text/plain'}),env(),noFetch)).status,415);});
test('minute quota applies atomically on third attempt',async()=>{const db=fakeDb();await reserveQuota(db,'owner',100000);await reserveQuota(db,'owner',100000);await assert.rejects(()=>reserveQuota(db,'owner',100000),/limit reached/);});
test('daily quota cannot be bypassed by changing minute',async()=>{const db=fakeDb();for(let i=0;i<20;i++)await reserveQuota(db,'owner',i*60000);await assert.rejects(()=>reserveQuota(db,'owner',21*60000),/limit reached/);});
test('quota resets on a new UTC day',async()=>{const db=fakeDb();for(let i=0;i<20;i++)await reserveQuota(db,'owner',i*60000);await reserveQuota(db,'owner',86400000);});
test('provider failures never leak raw error or credential',async()=>{const r=await handleBlueprint(request(),env(),async()=>new Response('synthetic-test-value internal',{status:401}));assert.equal(r.status,502);assert.doesNotMatch(await r.text(),/synthetic-test-value|internal/);});
test('provider incompletion yields clear error',async()=>{const r=await handleBlueprint(request(),env(),async()=>Response.json({status:'incomplete'}));assert.equal(r.status,502);});
test('provider refusal is surfaced without arbitrary HTML',async()=>{const r=await handleBlueprint(request(),env(),async()=>Response.json({status:'completed',output:[{content:[{type:'refusal'}]}]}));assert.equal(r.status,502);});
test('status reveals no credential',async()=>{const r=await getStatus(request(),env()).text();assert.doesNotMatch(r,/synthetic-test-value|OPENAI_API_KEY/);});
