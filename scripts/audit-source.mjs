import {readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
const skip=new Set(['.git','node_modules','.sites-runtime','.wrangler','.next','.vinext','demo-dist','dist']);
let count=0;const failures=[];
function scan(dir){for(const e of readdirSync(dir,{withFileTypes:true})){if(skip.has(e.name))continue;const file=path.join(dir,e.name);if(e.isDirectory())scan(file);else{if(/^\.env(?!\.example)|^\.dev\.vars|\.pem$/.test(e.name))failures.push(file+' private environment file');const text=readFileSync(file,'utf8');if(/sk-(?:proj-)?[A-Za-z0-9_-]{30,}/.test(text))failures.push(file+' credential-like string');if(process.env.OPENAI_API_KEY && text.includes(process.env.OPENAI_API_KEY))failures.push(file+' actual API credential');count++;}}}
scan('.');console.log(JSON.stringify({filesScanned:count,findings:failures}));if(failures.length)process.exitCode=1;
