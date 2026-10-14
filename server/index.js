import { createServer } from 'node:http'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openStore, readResource, writeResource } from './database.js'
import { parseVideoUrl } from '../src/utils/mediaStorage.js'
export function createApp({databasePath,password=process.env.ADMIN_PASSWORD,origin=process.env.APP_ORIGIN}={}) {
  if (!password || password.length < 12) throw new Error('Configura ADMIN_PASSWORD con al menos 12 caracteres.')
  const db=openStore(databasePath), sessions=new Map(), attempts=new Map(), salt=randomBytes(16), hash=scryptSync(password,salt,64)
  const json=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value))}
  const server=createServer(async(req,res)=>{
    try {
      const path=new URL(req.url,'http://localhost').pathname
      const token=req.headers.cookie?.match(/(?:^|; )mugxie_session=([^;]+)/)?.[1]
      const authenticated=sessions.get(token)>Date.now()
      if (req.headers['sec-fetch-site'] === 'cross-site' && req.method !== 'GET') return json(res,403,{error:'Origen no permitido.'})
      if (req.method !== 'GET' && req.method !== 'HEAD' && origin && req.headers.origin !== origin) return json(res,403,{error:'Origen no permitido.'})
      async function body(limit=15*1024*1024) { let size=0; const chunks=[]; for await (const c of req) {size+=c.length;if(size>limit)throw new Error('Archivo demasiado grande.');chunks.push(c)} return Buffer.concat(chunks) }
      if(path==='/api/login' && req.method==='POST') {
        const ip=req.socket.remoteAddress, now=Date.now(), history=(attempts.get(ip)||[]).filter(t=>t>now-900000)
        if(history.length>=10)return json(res,429,{error:'Demasiados intentos. Espera 15 minutos.'})
        const input=JSON.parse(await body(4096)); history.push(now);attempts.set(ip,history)
        if(typeof input.password!=='string' || !timingSafeEqual(scryptSync(input.password,salt,64),hash))return json(res,401,{error:'Contraseña incorrecta.'})
        attempts.delete(ip);for(const [k,v] of sessions)if(v<now)sessions.delete(k)
        const session=randomBytes(32).toString('hex');sessions.set(session,now+8*3600000)
        res.setHeader('Set-Cookie',`mugxie_session=${session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${origin?.startsWith('https:')?'; Secure':''}`)
        return json(res,200,{ok:true})
      }
      if(path==='/api/logout' && req.method==='POST'){sessions.delete(token);res.setHeader('Set-Cookie','mugxie_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(res,200,{ok:true})}
      if(path==='/api/store' && req.method==='GET') {
        const data=Object.fromEntries(['products','categories','testimonials','config'].map(n=>[n,readResource(db,n)]))
        if(!authenticated)data.products.value=data.products.value.filter(p=>p.isVisible!==false)
        return json(res,200,data)
      }
      if(path.startsWith('/api/resource/') && req.method==='PUT') {
        if(!authenticated)return json(res,401,{error:'Inicia sesión para guardar.'})
        const name=path.split('/').pop();if(!['products','categories','testimonials','config'].includes(name))return json(res,404,{error:'No encontrado.'})
        const {value,revision}=JSON.parse(await body())
        if(name==='config') {if(!value||Array.isArray(value)||typeof value!=='object')throw Error('Configuración inválida.');delete value.adminPin}
        else if(!Array.isArray(value))throw Error('Formato inválido.')
        if(name==='products' && value.some(p=>!p.id||!p.name||!p.category||!Number.isFinite(p.price)||p.price<0||parseVideoUrl(p.video).type==='blocked'||/^(idb:|blob:)/.test(p.video||'')))throw Error('Producto inválido o video local/TikTok no permitido.')
        if(name==='testimonials' && value.some(t=>!t.id||!t.comment?.trim()||!t.image||!Number.isInteger(t.rating)||t.rating<1||t.rating>5))throw Error('Testimonio inválido.')
        if(name==='categories' && value.some(c=>typeof c!=='string'||!c.trim()))throw Error('Categoría inválida.')
        const updated=writeResource(db,name,value,revision)
        return updated?json(res,200,updated):json(res,409,{error:'Otra persona actualizó estos datos. Recarga antes de guardar.'})
      }
      if(path==='/api/media' && req.method==='POST') {
        if(!authenticated)return json(res,401,{error:'Inicia sesión.'})
        const type=req.headers['content-type'];if(!['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'].includes(type))throw Error('Formato de archivo no permitido.')
        const content=await body(50*1024*1024), id=randomBytes(20).toString('hex'); db.prepare('INSERT INTO media VALUES (?,?,?)').run(id,type,content)
        return json(res,201,{url:`/api/media/${id}`})
      }
      if(path.startsWith('/api/media/') && req.method==='GET') {
        const row=db.prepare('SELECT * FROM media WHERE id=?').get(path.split('/').pop());if(!row)return json(res,404,{error:'Archivo no encontrado.'})
        res.writeHead(200,{'Content-Type':row.type,'Content-Length':row.content.length,'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=86400'});return res.end(Buffer.from(row.content))
      }
      if(path.startsWith('/api/'))return json(res,404,{error:'No encontrado.'})
      if(req.method!=='GET')return json(res,405,{error:'Método no permitido.'})
      const relative=path.replace(/^\/+/,''), file=resolve('dist',relative||'index.html'), root=resolve('dist')
      if(!file.startsWith(root+'/')&&!file.startsWith(root+'\\')&&file!==root)return json(res,403,{error:'No permitido.'})
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'}
      try {const content=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(content)}catch {if(path!=='/'&&path!=='/admin')return json(res,404,{error:'No encontrado.'});res.writeHead(200,{'Content-Type':'text/html'});res.end(await readFile(resolve('dist/index.html')))}
    }catch(err){json(res,400,{error:err.message})}
  })
  server.on('close',()=>db.close());return server
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))createApp().listen(Number(process.env.PORT||3001),'0.0.0.0',()=>console.log('Mugxie: servidor y base de datos activos.'))
