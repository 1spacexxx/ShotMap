import {DatabaseSync} from 'node:sqlite'
import crypto from 'node:crypto'
import sharp from 'sharp'
const d=new DatabaseSync('data/shotmap.sqlite')
const u=d.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get()
const token=crypto.randomBytes(32).toString('hex')
d.prepare('INSERT INTO sessions(token,user_id,expires_at) VALUES (?,?,?)').run(token,u.id,new Date(Date.now()+180000).toISOString())
const post=async body=>{const r=await fetch('http://localhost:3001/api/photos',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,body:await r.json()}}
const png=await sharp({create:{width:320,height:200,channels:3,background:'#3a7ca5'}}).png().toBuffer()
const data=`data:image/png;base64,${png.toString('base64')}`
try{
 console.log('no ownership:',JSON.stringify(await post({place_id:1,image_url:data,title:'probe'})))
 console.log('bad place  :',JSON.stringify(await post({place_id:999,image_url:data,title:'probe',ownership_confirmed:true})))
 const first=await post({place_id:1,image_url:data,title:'Anti-plagiarism probe',ownership_confirmed:true})
 console.log('first      :',JSON.stringify({status:first.status,score:first.body.photo?.overallScore,error:first.body.error}))
 const id=first.body.photo?.id
 const recompressed=`data:image/jpeg;base64,${(await sharp(png).jpeg({quality:60}).toBuffer()).toString('base64')}`
 console.log('recompress :',JSON.stringify(await post({place_id:1,image_url:recompressed,title:'probe',ownership_confirmed:true})))
 console.log('remote url :',JSON.stringify(await post({place_id:1,image_url:'https://commons.wikimedia.org/wiki/Special:FilePath/Colosseo%202020.jpg?width=600',title:'probe',ownership_confirmed:true})))
 if(id){await fetch('http://localhost:3001/api/photos/'+id,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});console.log('cleanup    :',!d.prepare('SELECT id FROM photos WHERE id=?').get(id))}
 console.log('indexed    :',d.prepare('SELECT COUNT(*) c FROM image_fingerprints').get().c)
}finally{d.prepare('DELETE FROM sessions WHERE token=?').run(token);d.close()}
