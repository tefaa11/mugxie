import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { Miniflare, convertV4MiniflareOptions } from 'miniflare'
import { parseRange, validateResource } from './validation.js'
import { defaultProducts, defaultCategories } from '../src/data/initialProducts.js'
import { defaultStoreConfig } from '../src/data/storeConfig.js'

test('rangos y validación de medios y testimonios', () => {
  assert.deepEqual(parseRange('bytes=2-5',10),{offset:2,length:4})
  assert.deepEqual(parseRange('bytes=-3',10),{offset:7,length:3})
  assert.deepEqual(parseRange('bytes=7-',10),{offset:7,length:3})
  assert.throws(()=>parseRange('bytes=10-',10))
  assert.throws(()=>parseRange('bytes=0-2,4-6',10))
  assert.throws(()=>validateResource('products',[{...defaultProducts[0],video:'https://vm.tiktok.com/a'}]))
  assert.throws(()=>validateResource('testimonials',[{id:'a',comment:'Hola',image:'javascript:alert(1)',rating:5}]))
  const result=validateResource('testimonials',[{id:'a',comment:'Hola',image:'https://example.com/photo.jpg',rating:5,name:'No debe publicarse'}])
  assert.equal(result[0].name,undefined)
})

test('Worker real: D1, R2, acceso, conflictos, carga, reproducción y sesión', async () => {
  const scriptPath=resolve('.wrangler/build/worker.js')
  assert.ok(existsSync(scriptPath),'Ejecuta npm run cf:check antes de las pruebas de Cloudflare.')
  const password='test-cloudflare-password-2026'
  const mf=new Miniflare(convertV4MiniflareOptions({workers:[{name:'mugxie-test',modules:true,scriptPath,compatibilityDate:'2026-10-13',d1Databases:{DB:'mugxie-test'},r2Buckets:['MEDIA'],bindings:{ADMIN_PASSWORD:password},serviceBindings:{ASSETS:()=>new Response('<h1>Mugxie</h1>',{headers:{'Content-Type':'text/html'}})}}]}))
  try {
    const db=await mf.getD1Database('DB')
    for(const sql of readFileSync('cloudflare/migrations/0001_schema.sql','utf8').split(';').filter(s=>s.trim()))await db.prepare(sql).run()
    for(const [name,value] of Object.entries({products:defaultProducts,categories:defaultCategories,testimonials:[],config:defaultStoreConfig}))await db.prepare('INSERT INTO resources(name,value) VALUES (?,?)').bind(name,JSON.stringify(value)).run()
    const origin='https://mugxie.test'
    const request=(path,options={})=>mf.dispatchFetch(origin+path,{...options,headers:{origin,...options.headers}})
    const put=(name,value,revision,cookie)=>request('/api/resource/'+name,{method:'PUT',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify({value,revision})})
    assert.equal((await request('/admin')).status,200)
    assert.equal((await request('/api/resource/products',{method:'PUT',body:'{}'})).status,401)
    assert.equal((await request('/api/login',{method:'POST',headers:{origin:'https://attacker.test'},body:'{}'})).status,403)
    assert.equal((await request('/api/login',{method:'POST',body:'{"password":"wrong"}'})).status,401)
    const login=await request('/api/login',{method:'POST',body:JSON.stringify({password})});assert.equal(login.status,200)
    const cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/Secure/);assert.match(login.headers.get('set-cookie'),/HttpOnly/)
    assert.equal((await (await request('/api/session',{headers:{cookie}})).json()).authenticated,true)
    const products=defaultProducts.map((p,i)=>i===0?{...p,isVisible:false}:p)
    assert.equal((await put('products',products,0,cookie)).status,200)
    assert.equal((await (await request('/api/store')).json()).products.value.length,products.length-1)
    assert.equal((await (await request('/api/store',{headers:{cookie}})).json()).products.value.length,products.length)
    assert.equal((await put('products',products,0,cookie)).status,409)
    assert.equal((await put('products',[{...products[0],video:'idb://local'}],1,cookie)).status,400)
    assert.equal((await put('products',[{...products[0],video:'https://tiktok.com/video/1'}],1,cookie)).status,400)
    assert.equal((await put('config',{...defaultStoreConfig,adminPin:'secret'},0,cookie)).status,200)
    assert.equal((await (await request('/api/store')).json()).config.value.adminPin,undefined)
    const png=Uint8Array.from([137,80,78,71,13,10,26,10,1,2,3,4])
    const upload=await request('/api/media',{method:'POST',headers:{cookie,'Content-Type':'image/png'},body:png});assert.equal(upload.status,201)
    const {url}=await upload.json()
    assert.deepEqual(new Uint8Array(await (await request(url)).arrayBuffer()),png)
    const partial=await request(url,{headers:{range:'bytes=4-7'}});assert.equal(partial.status,206);assert.equal(partial.headers.get('content-range'),'bytes 4-7/12');assert.deepEqual(new Uint8Array(await partial.arrayBuffer()),png.slice(4,8))
    assert.equal((await request(url,{headers:{range:'bytes=99-'}})).status,416)
    const head=await request(url,{method:'HEAD'});assert.equal(head.headers.get('content-length'),'12');assert.equal(await head.text(),'')
    const wrong=await request('/api/media',{method:'POST',headers:{cookie,'Content-Type':'image/png'},body:'not a photo'});assert.equal(wrong.status,400)
    assert.equal((await request('/api/media',{method:'POST',headers:{cookie,'Content-Type':'video/mp4','Content-Length':String(26*1024*1024)},body:new Uint8Array(26*1024*1024)})).status,413)
    const testimonial={id:'test',comment:'Hermoso vaso',rating:5,image:url}
    assert.equal((await put('testimonials',[testimonial],0,cookie)).status,200)
    assert.equal((await (await request('/api/store')).json()).testimonials.value[0].comment,'Hermoso vaso')
    const race=await Promise.all([put('categories',[...defaultCategories,'Nueva'],0,cookie),put('categories',[...defaultCategories,'Otra'],0,cookie)])
    assert.deepEqual(race.map(r=>r.status).sort(),[200,409])
    assert.equal((await request('/api/logout',{method:'POST',headers:{cookie}})).status,200)
    assert.equal((await put('testimonials',[],1,cookie)).status,401)
    for(let i=0;i<10;i++)assert.equal((await request('/api/login',{method:'POST',body:'{"password":"incorrecta"}'})).status,401)
    assert.equal((await request('/api/login',{method:'POST',body:JSON.stringify({password})})).status,429)
  } finally { await mf.dispose() }
})


