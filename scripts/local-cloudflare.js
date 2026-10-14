import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
const target='.dev.vars'
if(!existsSync(target)) {
  const existing=existsSync('.env')?readFileSync('.env','utf8').match(/^ADMIN_PASSWORD=(.+)$/m)?.[1].trim():null
  writeFileSync(target,'ADMIN_PASSWORD='+ (existing || randomBytes(24).toString('base64url'))+'\n')
}
console.log('Contraseña local configurada en .dev.vars (archivo privado, no se publica).')
