import { uploadCloudinary } from './cloudinary.js'
import { HttpError, parseRange, resourceNames, validateResource } from './validation.js'

const encoder = new TextEncoder()
const json = (value, status = 200, extra = {}) => new Response(JSON.stringify(value), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}})
async function digest(value) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)))].map(v => v.toString(16).padStart(2,'0')).join('') }
function randomToken() { return [...crypto.getRandomValues(new Uint8Array(20))].map(v=>v.toString(16).padStart(2,'0')).join('') }
async function readBytes(request, limit) {
  const declared = Number(request.headers.get('content-length'))
  if (declared > limit) throw new HttpError(413,'El archivo supera el tamaño permitido.')
  const reader=request.body?.getReader(), chunks=[]; let total=0
  if (!reader) return new Uint8Array()
  while (true) { const {done,value}=await reader.read(); if(done)break; total+=value.byteLength; if(total>limit){await reader.cancel();throw new HttpError(413,'El archivo supera el tamaño permitido.')} chunks.push(value) }
  const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return bytes
}
async function readJson(request, limit=1024*1024) {
  try { return JSON.parse(new TextDecoder().decode(await readBytes(request,limit))) } catch(err) {if(err instanceof HttpError)throw err;throw new HttpError(400,'JSON inválido.')}
}
async function authenticated(request, env) {
  const token=request.headers.get('cookie')?.match(/(?:^|;\s*)mugxie_session=([a-f0-9]{40})(?:;|$)/)?.[1]
  if(!token)return false
  const session=await env.DB.prepare('SELECT expires FROM sessions WHERE token_hash=?').bind(await digest(token)).first()
  return !!session && session.expires > Date.now()
}
function cookie(request, token, maxAge) { return `mugxie_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}` }
function validFile(bytes,type) {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0,16))
  if(type==='image/png')return bytes[0]===137&&head.slice(1,4)==='PNG'
  if(type==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255
  if(type==='image/webp')return head.startsWith('RIFF')&&head.slice(8,12)==='WEBP'
  if(type==='image/gif')return head.startsWith('GIF87a')||head.startsWith('GIF89a')
  if(type==='video/mp4'||type==='video/quicktime')return head.slice(4,8)==='ftyp'
  if(type==='video/webm')return bytes[0]===26&&bytes[1]===69&&bytes[2]===223&&bytes[3]===163
  return false
}
async function readStore(env, admin) {
  const {results}=await env.DB.prepare('SELECT name,value,revision FROM resources').all()
  const data=Object.fromEntries(results.map(row=>[row.name,{value:JSON.parse(row.value),revision:row.revision}]))
  if(resourceNames.some(name=>!data[name]))throw new HttpError(503,'La tienda está pendiente de inicializar.')
  if(!admin)data.products.value=data.products.value.filter(p=>p.isVisible!==false)
  return data
}
async function serveMedia(request,env,path) {
  if(!env.MEDIA)return json({error:'Archivo no encontrado.'},404)
  const id=path.slice('/api/media/'.length)
  if(!/^[a-f0-9]{40}$/.test(id))return json({error:'Archivo no encontrado.'},404)
  const metadata=await env.MEDIA.head(id)
  if(!metadata)return json({error:'Archivo no encontrado.'},404)
  let range
  try { range=parseRange(request.headers.get('range'),metadata.size) } catch {return new Response(null,{status:416,headers:{'Content-Range':`bytes */${metadata.size}`}})}
  const headers=new Headers({'Accept-Ranges':'bytes','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff','ETag':metadata.httpEtag})
  metadata.writeHttpMetadata(headers)
  if(!range && request.headers.get('if-none-match')===metadata.httpEtag)return new Response(null,{status:304,headers})
  headers.set('Content-Length',String(range?range.length:metadata.size))
  if(range)headers.set('Content-Range',`bytes ${range.offset}-${range.offset+range.length-1}/${metadata.size}`)
  if(request.method==='HEAD')return new Response(null,{status:range?206:200,headers})
  const object=await env.MEDIA.get(id,range?{range}:{})
  if(!object)return json({error:'Archivo no encontrado.'},404)
  return new Response(object.body,{status:range?206:200,headers})
}
export default {
  async fetch(request, env) {
    try {
      const url=new URL(request.url), path=url.pathname, method=request.method
      if(!path.startsWith('/api/')) {
        if(path==='/admin'||path==='/admin/') {
          // El panel cambia con frecuencia. Evitamos que el navegador reutilice
          // una versión anterior de la página y oculte ajustes recién publicados.
          const response=await env.ASSETS.fetch(new Request(new URL('/',url),request))
          const headers=new Headers(response.headers)
          headers.set('Cache-Control','no-store, max-age=0')
          return new Response(response.body,{status:response.status,statusText:response.statusText,headers})
        }
        return env.ASSETS.fetch(request)
      }
      if(!env.DB)throw new HttpError(503,'La tienda está pendiente de configurar.')
      if(method!=='GET'&&method!=='HEAD') {
        if(request.headers.get('origin')!==url.origin || request.headers.get('sec-fetch-site')==='cross-site')throw new HttpError(403,'Origen no permitido.')
      }
      if(path==='/api/login'&&method==='POST') {
        if(!env.ADMIN_PASSWORD||env.ADMIN_PASSWORD.length<16)throw new HttpError(503,'El administrador está pendiente de configurar.')
        const body=await readJson(request,4096), now=Date.now(), key=await digest((request.headers.get('cf-connecting-ip')||'local')+env.ADMIN_PASSWORD)
        await env.DB.prepare('DELETE FROM login_attempts WHERE window_start<?').bind(now-900000).run()
        const attempt=await env.DB.prepare('INSERT INTO login_attempts(key,window_start,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now).first()
        if(attempt.count>10)throw new HttpError(429,'Demasiados intentos. Espera 15 minutos.')
        const actual=await digest(typeof body.password==='string'?body.password:''), expected=await digest(env.ADMIN_PASSWORD)
        let difference=0;for(let i=0;i<expected.length;i++)difference|=actual.charCodeAt(i)^expected.charCodeAt(i)
        if(difference)throw new HttpError(401,'Contraseña incorrecta.')
        const token=randomToken()
        await env.DB.batch([
          env.DB.prepare('DELETE FROM login_attempts WHERE key=?').bind(key),
          env.DB.prepare('DELETE FROM sessions WHERE expires<=?').bind(now),
          env.DB.prepare('INSERT INTO sessions(token_hash,expires) VALUES (?,?)').bind(await digest(token),now+28800000),
        ])
        return json({ok:true},200,{'Set-Cookie':cookie(request,token,28800)})
      }
      if(path==='/api/logout'&&method==='POST') {
        const token=request.headers.get('cookie')?.match(/mugxie_session=([a-f0-9]{40})/)?.[1]
        if(token)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await digest(token)).run()
        return json({ok:true},200,{'Set-Cookie':cookie(request,'',0)})
      }
      if(path==='/api/session'&&method==='GET')return json({authenticated:await authenticated(request,env)})
      if(path==='/api/store'&&method==='GET')return json(await readStore(env,await authenticated(request,env)))
      if(path.startsWith('/api/resource/')&&method==='PUT') {
        if(!await authenticated(request,env))throw new HttpError(401,'Inicia sesión para guardar.')
        const name=path.slice('/api/resource/'.length)
        if(!resourceNames.includes(name))throw new HttpError(404,'No encontrado.')
        const {value,revision}=await readJson(request)
        if(!Number.isSafeInteger(revision)||revision<0)throw new HttpError(400,'Revisión inválida.')
        const sanitized=validateResource(name,value)
        const row=await env.DB.prepare('UPDATE resources SET value=?,revision=revision+1 WHERE name=? AND revision=? RETURNING value,revision').bind(JSON.stringify(sanitized),name,revision).first()
        if(!row)throw new HttpError(409,'Otra persona actualizó estos datos. Recarga antes de guardar.')
        return json({value:JSON.parse(row.value),revision:row.revision})
      }
      if(path==='/api/media'&&method==='POST') {
        if(!await authenticated(request,env))throw new HttpError(401,'Inicia sesión para subir archivos.')
        const type=request.headers.get('content-type')?.split(';')[0]
        if(!['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'].includes(type))throw new HttpError(400,'Formato de archivo no permitido.')
        const bytes=await readBytes(request,(type.startsWith('image/')?5:25)*1024*1024)
        if(!validFile(bytes,type))throw new HttpError(400,'El archivo no coincide con su formato.')
        const id=randomToken()
        if(env.CLOUDINARY_CLOUD_NAME || !env.MEDIA) return json({url:await uploadCloudinary(env,bytes,type,id)},201)
        // Compatibilidad con archivos locales R2 de las pruebas anteriores.
        await env.MEDIA.put(id,bytes,{httpMetadata:{contentType:type}})
        return json({url:`/api/media/${id}`},201)
      }
      if(path.startsWith('/api/media/')&&(method==='GET'||method==='HEAD'))return serveMedia(request,env,path)
      return json({error:'No encontrado.'},404)
    }catch(err){
      if(err instanceof HttpError)return json({error:err.message},err.status)
      console.error('Error en API Mugxie:',err.message)
      return json({error:'No se pudo completar la operación. Intenta nuevamente.'},500)
    }
  },
}

