import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('public',{recursive:true,force:true});await mkdir('public',{recursive:true});await copyFile('index.html','public/index.html');await cp('founder-clarity','public/founder-clarity',{recursive:true});
