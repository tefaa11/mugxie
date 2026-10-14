import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { uploadCloudinary } from './cloudinary.js'
test('Cloudinary firma cargas privadas y devuelve enlaces HTTPS', async () => {
  const env={CLOUDINARY_CLOUD_NAME:'test-cloud',CLOUDINARY_API_KEY:'test-key',CLOUDINARY_API_SECRET:'test-secret'}
  const id='a'.repeat(40)
  for(const type of ['image/webp','video/mp4']) {
    const result=await uploadCloudinary(env,new Uint8Array([1,2,3]),type,id,async(url,options)=>{
      assert.equal(url,`https://api.cloudinary.com/v1_1/test-cloud/${type.startsWith('video')?'video':'image'}/upload`)
      const form=options.body
      const expected=createHash('sha256').update(`public_id=mugxie/${id}&timestamp=${form.get('timestamp')}test-secret`).digest('hex')
      assert.equal(form.get('signature'),expected);assert.equal(form.get('api_secret'),null);assert.equal(form.get('file').type,type)
      return Response.json({secure_url:'https://res.cloudinary.com/test-cloud/image/upload/mugxie/a.webp'})
    })
    assert.ok(result.startsWith('https://res.cloudinary.com/test-cloud/'))
  }
  await assert.rejects(uploadCloudinary({},new Uint8Array(),'image/png',id),/Falta conectar/)
  await assert.rejects(uploadCloudinary(env,new Uint8Array(),'image/png',id,async()=>Response.json({secure_url:'https://attacker.test/file'})),/inválido/)
  await assert.rejects(uploadCloudinary(env,new Uint8Array(),'image/png',id,async()=>Response.json({error:'quota'},{status:429})),/cuota/)
})
