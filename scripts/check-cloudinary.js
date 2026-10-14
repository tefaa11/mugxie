import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { uploadCloudinary } from '../cloudflare/cloudinary.js'
const text=readFileSync('.cloudinary.env','utf8')
const connection=text.match(/cloudinary:\/\/[^\s'"`]+/)?.[0]
const url=new URL(connection)
const env={CLOUDINARY_CLOUD_NAME:url.hostname,CLOUDINARY_API_KEY:decodeURIComponent(url.username),CLOUDINARY_API_SECRET:decodeURIComponent(url.password)}
try {
  const photo=await uploadCloudinary(env,readFileSync('public/logo.png'),'image/png',randomBytes(20).toString('hex'))
  const response=await fetch(photo)
  if(!response.ok)throw new Error('No se pudo leer la imagen subida.')
  mkdirSync('artifacts',{recursive:true});writeFileSync('artifacts/cloudinary-check.json',JSON.stringify({url:photo,status:response.status,type:response.headers.get('content-type')},null,2))
  console.log('Cloudinary verificado: subida firmada y lectura pública de la foto correctas.')
}catch(err){console.error(err.message);process.exitCode=1}
