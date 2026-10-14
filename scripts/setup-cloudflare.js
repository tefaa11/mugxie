import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const cli = resolve('node_modules/wrangler/bin/wrangler.js')
const run = (args, capture = false) => {
  const result = spawnSync(process.execPath, [cli, ...args], {stdio:capture?'pipe':'inherit',encoding:'utf8'})
  if(result.status!==0) throw new Error(capture ? result.stderr || result.stdout : `No se pudo completar: wrangler ${args.join(' ')}`)
  return result.stdout
}
const configPath = resolve('wrangler.jsonc')
try {
  let databases = JSON.parse(run(['d1','list','--json'],true))
  let database = databases.find(db => db.name==='mugxie-catalogo')
  if (!database) {
    run(['d1','create','mugxie-catalogo','--location','enam'])
    databases = JSON.parse(run(['d1','list','--json'],true))
    database = databases.find(db => db.name==='mugxie-catalogo')
  }
  if(!database?.uuid)throw new Error('No se pudo identificar la base D1.')
  const config = JSON.parse(readFileSync(configPath,'utf8').replace(/^\uFEFF/,''))
  config.d1_databases[0].database_id = database.uuid
  writeFileSync(configPath,JSON.stringify(config,null,2)+'\n')
  run(['d1','migrations','apply','mugxie-catalogo','--remote'])
  console.log('D1 configurada. Configura los secretos de Cloudinary y ADMIN_PASSWORD antes de publicar.')
} catch(err) { console.error(err.message); process.exitCode=1 }
