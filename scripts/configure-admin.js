import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
const file = '.admin-credentials.txt'
let password
if (existsSync(file)) password = readFileSync(file, 'utf8').match(/^Contraseña: (.+)$/m)?.[1]
if (!password) {
  password = randomBytes(24).toString('base64url')
  writeFileSync(file, `Acceso al administrador Mugxie: /admin\nContraseña: ${password}\n\nArchivo privado: no lo subas al sitio ni a Git.\n`, {mode:0o600})
}
const result = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'secret', 'put', 'ADMIN_PASSWORD'], {input:password+'\n',encoding:'utf8'})
if(result.status!==0) {console.error(result.stderr || result.stdout);process.exit(result.status || 1)}
console.log('Secreto del administrador configurado. Credenciales guardadas en .admin-credentials.txt.')
