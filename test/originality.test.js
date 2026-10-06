import test from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import {fingerprint,findCopy,distance} from '../server/originality.js'
test('fingerprint recognizes identical images and recompressed copies',async()=>{const bytes=await sharp({create:{width:200,height:120,channels:3,background:'#478cab'}}).png().toBuffer();const a=await fingerprint(bytes);const jpeg=await sharp(bytes).jpeg({quality:70}).toBuffer();const b=await fingerprint(jpeg);assert.notEqual(a.sha256,b.sha256);assert.ok(findCopy(b,[{photo_id:1,sha256:a.sha256,canonical:a.canonical,visual_hash:a.visualHash}]));assert.equal(distance(a.visualHash,a.visualHash),0)})
test('invalid image bytes are rejected by actual decoder',async()=>{await assert.rejects(fingerprint(Buffer.from('not an image')))})
