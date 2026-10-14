import { readFileSync } from 'node:fs'
const base='https://mugxie.mugxie-tienda.workers.dev'
const password=readFileSync('.admin-credentials.txt','utf8').match(/^Contraseña: (.+)$/m)?.[1]
let cookie
try {
 const login=await fetch(base+'/api/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({password})})
 if(!login.ok)throw new Error('No se pudo iniciar la sesión de prueba.')
 cookie=login.headers.get('set-cookie').split(';')[0]
 const upload=await fetch(base+'/api/media',{method:'POST',headers:{Origin:base,cookie,'Content-Type':'image/png'},body:readFileSync('public/logo.png'),signal:AbortSignal.timeout(60000)})
 const result=await upload.json()
 if(!upload.ok)throw new Error(result.error)
 const image=await fetch(result.url,{signal:AbortSignal.timeout(20000)})
 if(!image.ok)throw new Error('No se pudo abrir la imagen.')
 console.log('Verificación completa: administrador → API de Mugxie → Cloudinary → imagen pública, correcta.')
}catch(err){console.error(err.message);process.exitCode=1}
finally{if(cookie)await fetch(base+'/api/logout',{method:'POST',headers:{Origin:base,cookie}})}
