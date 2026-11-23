import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require(process.env.ATLAS_TYPESCRIPT||'typescript');
const modules=[],seen=new Map();
const resolve=(name,base)=>{
 if(name==='./scenes.json')return path.resolve('src/scenes.json');
 const req=createRequire(base);
 const entry=req.resolve(name,{paths:[process.env.ATLAS_DEPS||process.cwd(),path.dirname(base)]});
 if(['react','react-dom','scheduler'].includes(name))return path.join(path.dirname(entry),'cjs',name+'.production.min.js');
 return entry;
};
function add(file){if(seen.has(file))return seen.get(file);const id=modules.length;seen.set(file,id);modules.push('');let source=fs.readFileSync(file,'utf8');
 if(file.endsWith('.json'))source='module.exports='+source;
 if(file.endsWith('.tsx'))source=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true},reportDiagnostics:true}).outputText;
 source=source.replaceAll('process.env.NODE_ENV','"production"');
 source=source.replace(/require\(["']([^"']+)["']\)/g,(_,name)=>`load(${add(resolve(name,file))})`);
 modules[id]=`function(module,exports,load){\n${source}\n}`;return id;
}
const entry=add(path.resolve('src/Diagram.tsx'));
const bundle=`(()=>{const modules=[${modules.join(',\n')}],cache={};function load(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,load);return m.exports}load(${entry});})();`;
fs.writeFileSync('diagram.bundle.js',bundle);
const archive=execFileSync('python3',['-c',`import io,zipfile,base64,pathlib
b=io.BytesIO()
with zipfile.ZipFile(b,'w',zipfile.ZIP_DEFLATED) as z:
 for name in ['build.mjs','package.json','README.md','template.html','src/Diagram.tsx','src/scenes.json','src/diagram.css','src/ux.js']:
  z.write(name,'atlas-react/'+name)
print(base64.b64encode(b.getvalue()).decode())`],{encoding:'utf8'}).trim();
let html=fs.readFileSync('template.html','utf8').replace('/* ATLAS_REACT_BUNDLE */',bundle.replaceAll('</script','<\\/script')).replace('/* ATLAS_REACT_CSS */',fs.readFileSync('src/diagram.css','utf8'));
html=html.replace('</head>','<script id="atlas-source" type="application/zip">'+archive+'</script></head>');
html=html.replace('/* ATLAS_UX */',fs.readFileSync('src/ux.js','utf8'));
fs.writeFileSync('../index.html',html);
console.log(`Built index.html (${Buffer.byteLength(html)} bytes), ${modules.length} bundled modules.`);
