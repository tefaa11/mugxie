import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8').replace(/^\uFEFF/,''))
if(config.d1_databases[0].database_id==='00000000-0000-0000-0000-000000000000') {
  console.error('Falta configurar la cuenta: inicia sesión y ejecuta npm run cf:setup.');process.exit(1)
}
for(const args of [['node_modules/vite/bin/vite.js','build'],['node_modules/wrangler/bin/wrangler.js','deploy']]) {
  const result=spawnSync(process.execPath,args,{stdio:'inherit'})
  if(result.status!==0)process.exit(result.status || 1)
}
