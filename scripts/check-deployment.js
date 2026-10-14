import { readFileSync } from 'node:fs'
const base='https://mugxie.mugxie-tienda.workers.dev'
const password=readFileSync('.admin-credentials.txt','utf8').match(/^Contraseña: (.+)$/m)?.[1]
try {
  for(const path of ['/','/admin','/api/store']) {
    const response=await fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(20000)})
    if(!response.ok)throw new Error(`${path}: HTTP ${response.status}`)
    if(path==='/api/store'){const data=await response.json();console.log(`Catálogo público: ${data.products.value.length} productos; base de datos conectada.`)}else console.log(`${path}: disponible (HTTP ${response.status}).`)
  }
  const response=await fetch(base+'/api/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({password}),redirect:'manual',signal:AbortSignal.timeout(20000)})
  if(!response.ok)throw new Error(`Acceso administrador: HTTP ${response.status}`)
  const cookie=response.headers.get('set-cookie').split(';')[0]
  const session=await fetch(base+'/api/session',{headers:{cookie}})
  if(!(await session.json()).authenticated)throw new Error('No se pudo verificar la sesión.')
  await fetch(base+'/api/logout',{method:'POST',headers:{Origin:base,cookie}})
  console.log('Inicio de sesión del administrador verificado; sesión de prueba cerrada.')
} catch(err) {console.error(err.message);process.exitCode=1}

