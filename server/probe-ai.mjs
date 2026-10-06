import {DatabaseSync} from 'node:sqlite'
import crypto from 'node:crypto'
import {readFile} from 'node:fs/promises'
import {requestAnalysis} from './ai-provider.js'
const db=new DatabaseSync('data/shotmap.sqlite')
const s=db.prepare('SELECT endpoint,model,api_key_ciphertext FROM ai_settings WHERE id=1').get()
const secret=process.env.SHOTMAP_SETTINGS_SECRET || (await readFile('data/shotmap-settings-key','utf8')).trim()
const [iv,tag,data]=s.api_key_ciphertext.split('.')
const dec=crypto.createDecipheriv('aes-256-gcm',crypto.createHash('sha256').update(secret).digest(),Buffer.from(iv,'base64'));dec.setAuthTag(Buffer.from(tag,'base64'))
const key=Buffer.concat([dec.update(Buffer.from(data,'base64')),dec.final()]).toString().replace(/^Bearer\s+/i,'').trim()
const u=new URL(s.endpoint);u.pathname='/v1/models';u.search='';u.hash=''
try {const r=await fetch(u,{headers:{Authorization:`Bearer ${key}`},redirect:'error',signal:AbortSignal.timeout(20000)});console.log(JSON.stringify({status:r.status,contentType:r.headers.get('content-type')}));if(r.ok){const b=await r.json(); console.log(JSON.stringify({models:b.data?.map(x=>x.id),selected:s.model}))}} catch{console.log('Provider model discovery failed (network/redirect/timeout)')}
try {
  const photo=db.prepare("SELECT image_url FROM photos WHERE image_url LIKE '/uploads/%' LIMIT 1").get()
  if(photo){const bytes=await readFile('.'+photo.image_url);const ext=photo.image_url.split('.').pop();const image=`data:image/${ext==='jpg'?'jpeg':ext};base64,${bytes.toString('base64')}`;const result=await requestAnalysis({endpoint:s.endpoint,model:'gpt-5.5',apiKey:key,image});console.log(JSON.stringify({analysis:result,model:'gpt-5.5'}));db.prepare("UPDATE ai_settings SET model='gpt-5.5',updated_at=? WHERE id=1").run(new Date().toISOString());console.log('Saved and read back model: '+db.prepare('SELECT model FROM ai_settings WHERE id=1').get().model)}
  else console.log('No local photo available for live vision verification')
} catch(e){console.log(e.message)}
db.close()
