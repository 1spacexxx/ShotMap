import crypto from 'node:crypto'
import sharp from 'sharp'
export async function fingerprint(bytes) {
 const image=sharp(bytes,{limitInputPixels:40000000,failOn:'error'}).rotate()
 const pixels=await image.clone().resize(9,8,{fit:'fill'}).greyscale().raw().toBuffer()
 let bits=0n;for(let y=0;y<8;y++)for(let x=0;x<8;x++)bits=(bits<<1n)|BigInt(pixels[y*9+x]>pixels[y*9+x+1])
 const canonical=await image.clone().resize(128,128,{fit:'fill'}).removeAlpha().raw().toBuffer()
 return {sha256:crypto.createHash('sha256').update(bytes).digest('hex'),visualHash:bits.toString(16).padStart(16,'0'),canonical:crypto.createHash('sha256').update(canonical).digest('hex')}
}
export function distance(a,b){let n=BigInt('0x'+a)^BigInt('0x'+b),count=0;while(n){count++;n&=n-1n}return count}
export function findCopy(candidate,rows){return rows.find(r=>r.sha256===candidate.sha256||r.canonical===candidate.canonical||distance(r.visual_hash,candidate.visualHash)<=4)}
