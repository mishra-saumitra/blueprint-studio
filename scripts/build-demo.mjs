import {execFileSync} from 'node:child_process';
import {cpSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
execFileSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.demo.config.ts'],{stdio:'inherit'});
rmSync('docs',{recursive:true,force:true});mkdirSync('docs',{recursive:true});
cpSync('demo-dist','docs',{recursive:true});writeFileSync('docs/.nojekyll','');
