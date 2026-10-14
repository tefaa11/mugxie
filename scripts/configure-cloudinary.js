import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
const source = readFileSync('.cloudinary.env', 'utf8').replace(/^\uFEFF/, '')
const raw = source.match(/^\s*(?:export\s+)?CLOUDINARY_URL\s*=\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '')
const connection = source.match(/cloudinary:\/\/[^\s'\"]+/)?.[0] || raw
let url
try { url = new URL(connection) } catch { console.error('Falta pegar CLOUDINARY_URL en .cloudinary.env.'); process.exit(1) }
if(url.protocol!=='cloudinary:'||!url.username||!url.password||!/^[a-zA-Z0-9_-]+$/.test(url.hostname)){console.error('La configuración de Cloudinary no es válida.');process.exit(1)}
if (!/^\d+$/.test(decodeURIComponent(url.username)) || /[<>]/.test(decodeURIComponent(url.password)) || /^(?:your_)?api[_-]?secret$/i.test(decodeURIComponent(url.password))) { console.error('El archivo contiene marcadores de ejemplo. Reemplázalos por los valores reales de Cloudinary.'); process.exit(1) }
const secrets={CLOUDINARY_CLOUD_NAME:url.hostname,CLOUDINARY_API_KEY:decodeURIComponent(url.username),CLOUDINARY_API_SECRET:decodeURIComponent(url.password)}
const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','bulk'],{input:JSON.stringify(secrets),encoding:'utf8'})
if(result.status!==0){console.error('No se pudieron guardar las credenciales de Cloudinary en Cloudflare.');process.exit(result.status||1)}
console.log('Cloudinary conectado. Las credenciales están guardadas como secretos de Cloudflare.')




