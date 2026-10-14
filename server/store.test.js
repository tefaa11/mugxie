import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from './index.js'
test('autorización, catálogo compartido, conflictos, fotos y persistencia', async () => {
  const dir=mkdtempSync(join(tmpdir(),'mugxie-test-')), databasePath=join(dir,'store.sqlite'), password='test-password-123456'
  let server=createApp({databasePath,password}); await new Promise(r=>server.listen(0,'127.0.0.1',r))
  let base=`http://127.0.0.1:${server.address().port}/api`
  const request=(path,options={})=>fetch(base+path,options)
  const initial=await (await request('/store')).json()
  assert.equal(initial.config.value.adminPin,undefined)
  const payload={value:[],revision:initial.products.revision}
  assert.equal((await request('/resource/products',{method:'PUT',body:JSON.stringify(payload)})).status,401)
  assert.equal((await request('/login',{method:'POST',body:JSON.stringify({password:'wrong'})})).status,401)
  const login=await request('/login',{method:'POST',body:JSON.stringify({password})});assert.equal(login.status,200)
  const cookie=login.headers.get('set-cookie').split(';')[0]
  assert.match(login.headers.get('set-cookie'),/HttpOnly/)
  const put=(name,value,revision)=>request('/resource/'+name,{method:'PUT',headers:{cookie},body:JSON.stringify({value,revision})})
  const products=initial.products.value.map((p,i)=>i===0?{...p,isVisible:false}:p)
  assert.equal((await put('products',products,0)).status,200)
  assert.equal((await (await request('/store')).json()).products.value.length,products.length-1)
  assert.equal((await (await request('/store',{headers:{cookie}})).json()).products.value.length,products.length)
  assert.equal((await put('products',products,0)).status,409)
  assert.equal((await put('products',[{...products[0],video:'https://vm.tiktok.com/a'}],1)).status,400)
  assert.equal((await put('products',[{...products[0],video:'idb://local'}],1)).status,400)
  const upload=await request('/media',{method:'POST',headers:{cookie,'content-type':'image/png'},body:Buffer.from([137,80,78,71])});assert.equal(upload.status,201)
  const media=await upload.json();assert.equal((await fetch(base.replace('/api','')+media.url)).status,200)
  assert.equal((await put('testimonials',[{id:'test',comment:'Excelente',rating:5,image:media.url}],0)).status,200)
  assert.equal((await put('categories',[...initial.categories.value,'Nueva categoría'],0)).status,200)
  await new Promise(r=>server.close(r))
  server=createApp({databasePath,password});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}/api`
  const persisted=await (await request('/store')).json();assert.equal(persisted.testimonials.value[0].comment,'Excelente');assert.ok(persisted.categories.value.includes('Nueva categoría'))
  await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true})
})
