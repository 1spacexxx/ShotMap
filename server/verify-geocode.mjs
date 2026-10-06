import { DatabaseSync } from 'node:sqlite'
import crypto from 'node:crypto'
import sharp from 'sharp'

const db = new DatabaseSync('data/shotmap.sqlite')
const u = db.prepare("SELECT id,username FROM users WHERE role='admin' LIMIT 1").get()
const token = crypto.randomBytes(32).toString('hex')
db.prepare('INSERT INTO sessions(token,user_id,expires_at) VALUES (?,?,?)').run(token, u.id, new Date(Date.now() + 180000).toISOString())

const base = 'http://localhost:3001'
const auth = { Authorization: `Bearer ${token}` }

function summarize(label, status, body) {
  const rows = (body.results || []).slice(0, 4).map(r => `${r.name} · ${r.city} · ${r.country} · ${r.latitude.toFixed(3)},${r.longitude.toFixed(3)} [${r.source}]`)
  console.log(`${label.padEnd(14)} ${status} ${rows.length ? '\n   ' + rows.join('\n   ') : JSON.stringify(body).slice(0, 140)}`)
}

async function get(path) {
  const r = await fetch(base + path, { headers: auth })
  return { status: r.status, body: await r.json() }
}

async function main() {
  const cases = [
    ['eiffel', '/api/geocode?q=Eiffel%20Tower%20Paris'],
    ['prague', '/api/geocode?q=%D0%9F%D1%80%D0%B0%D0%B3%D0%B0'],
    ['tokyo', '/api/geocode?q=Tokyo%20Skytree'],
    ['cyrillic', '/api/geocode?q=%D0%9A%D0%B8%D0%B5%D0%B2'],
    ['nonsense', '/api/geocode?q=zzzzqqqq'],
    ['short', '/api/geocode?q=a'],
  ]
  const seen = []
  for (const [label, path] of cases) {
    const before = Date.now()
    const r = await get(path)
    seen.push({ label, ms: Date.now() - before, results: r.body.results?.length || 0 })
    summarize(label, r.status, r.body)
  }

  // Second pass for the same query must hit the cache (fast + identical).
  const cached = await get('/api/geocode?q=Eiffel%20Tower%20Paris')
  console.log(`cache          ${cached.status} results=${cached.body.results.length}`)

  // AI location guess on a synthetic image — must not crash and must return a guess object.
  const png = await sharp({ create: { width: 320, height: 200, channels: 3, background: '#3a7ca5' } }).png().toBuffer()
  const data = `data:image/png;base64,${png.toString('base64')}`
  const g = await fetch(base + '/api/photos/guess-location', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ image: data, title: 'Probe' }) })
  const gb = await g.json()
  console.log('guess          ', g.status, JSON.stringify(gb).slice(0, 160))

  db.prepare('DELETE FROM sessions WHERE token=?').run(token)
  db.close()
  console.log('\nTIMINGS', JSON.stringify(seen))
}

main().catch(e => { console.error('FAILED', e); process.exit(1) })
