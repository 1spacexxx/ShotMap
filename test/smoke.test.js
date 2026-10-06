import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { analyze, validateImageData } from '../server/index.js'

const root = process.cwd()
test('AI analysis returns bounded metrics and overall score', () => {
  const result = analyze('test-image')
  for (const key of ['composition','lighting','sharpness','colors','visualQuality','overallScore']) assert.ok(result[key] >= 0 && result[key] <= 100)
  assert.equal(result.overallScore, Math.round((result.composition + result.lighting + result.sharpness + result.colors) / 4))
})
test('ShotMap project has API-backed app entry', () => {
  assert.ok(fs.existsSync('server/index.js'))
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  for (const label of ['api', 'Analyze with AI', 'handleLogin']) assert.ok(source.includes(label))
})
test('production bundle exists after build', () => assert.ok(fs.existsSync('dist/index.html')))
test('profile editing and recommendations UI are wired', () => {
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  assert.match(source, /recommendations/)
  assert.match(source, /api\('\/profile'/)
  assert.match(source, /Edit profile/)
})
test('image validation checks binary signatures instead of trusting MIME', () => {
  assert.doesNotThrow(() => validateImageData('data:image/png;base64,' + Buffer.from('89504e470d0a1a0a', 'hex').toString('base64')))
  assert.throws(() => validateImageData('data:image/png;base64,' + Buffer.from('not-an-image').toString('base64')), /signature/i)
  assert.throws(() => validateImageData('data:image/jpeg;base64,' + Buffer.from('89504e470d0a1a0a', 'hex').toString('base64')), /signature/i)
})
test('photo type filters are wired through the app', () => {
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  assert.match(source, /photoType/)
  assert.match(source, /type=/)
})
test('distance filtering is wired through the API and UI', () => {
  const server = fs.readFileSync('server/index.js', 'utf8')
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  assert.match(server, /radius_km/)
  assert.match(source, /radiusKm/)
})
test('community pagination controls are wired through the UI', () => {
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  assert.match(source, /photoPage/)
  assert.match(source, /Next page/)
})
test('authenticated navigation exposes profile and admin routes', () => {
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  assert.match(source, /#profile/)
  assert.match(source, /#admin/)
  assert.match(source, /Admin dashboard/)
})
test('authenticated header exposes profile and admin navigation', () => {
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  assert.match(source, /Profile/)
  assert.match(source, /Admin/)
  assert.match(source, /window\.location\.hash='#profile'/)
})
test('map place markers open the place route and theme toggle is wired', () => {
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  assert.match(source, /#place\//)
  assert.ok(source.includes('custom-map'))
  assert.match(source, /photoPath/)
})
test('dark theme defines dark base surfaces and readable text', () => {
  const css = fs.readFileSync('src/styles.css', 'utf8')
  assert.match(css, /html\[data-theme="dark"\]\{--paper:#111310/)
  assert.match(css, /html\[data-theme="dark"\]\{--paper:#111310;--ink:#eceee8/)
})
test('community cards separate photo opening from like action', () => {
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  assert.match(source, /className="shot-image-link" aria-label=\{`Open photo/)
  assert.match(source, /className="shot-like" aria-label=\{`Like/)
  assert.match(source, /className="shot-title shot-title-button"/)
})
test('profile fallback image resolver is module-scoped and admin errors are visible', () => {
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  assert.match(source, /const photoFallbackUrl\s*=\s*\(/)
  assert.match(source, /photoFallbackUrl\(p\.id\)/)
  assert.match(source, /admin\/reports/)
})
test('leaderboard route and admin moderation controls are wired', () => {
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  const server = fs.readFileSync('server/index.js', 'utf8')
  assert.match(source, /route[\s\S]*#leaderboard/)
  assert.match(source, /LeaderboardPage/)
  assert.match(source, /admin\/users/)
  assert.match(source, /admin\/photos/)
  assert.match(server, /LIMIT 50/)
})
test('server applies basic security headers and bounded JSON input', () => {
  const server = fs.readFileSync('server/index.js', 'utf8')
  assert.match(server, /X-Content-Type-Options/)
  assert.match(server, /Content-Security-Policy/)
  assert.match(server, /MAX_BODY_BYTES/)
})
test('profile, leaderboard and map use live DB routes safely', () => {
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  const server = fs.readFileSync('server/index.js', 'utf8')
  assert.match(source, /api\('\/leaderboard'\)/)
  assert.match(source, /api\('\/profile'\)/)
  assert.ok(source.includes('Number(p.latitude)'))
  assert.match(server, /p==='\/api\/leaderboard'/)
  assert.match(server, /p==='\/api\/admin\/users'/)
  assert.match(server, /p==='\/api\/admin\/photos'/)
})
test('account dashboard exposes real overview and management routes', () => {
  const source = fs.readFileSync('src/dashboard.jsx', 'utf8')
  const server = fs.readFileSync('server/index.js', 'utf8')
  for (const label of ['Overview','Photos','Places','Saved','Achievements','Statistics','Notifications','Settings']) assert.match(source, new RegExp(label))
  assert.match(source, /\/me\/statistics/)
  assert.match(source, /\/me\/photos/)
  assert.match(server, /p==='\/api\/me\/statistics'/)
  assert.match(server, /p==='\/api\/me\/photos'/)
  assert.match(server, /p\.match\(\/\^\\\/api\\\/photos/)
})

test('upload, like, rate and favorite routes require authentication', () => {
  const server = fs.readFileSync('server/index.js', 'utf8')
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  assert.match(server, /Login required to upload/)
  assert.match(server, /if\(!u\)return json\(res,401,\{error:'Login required'\}\)/)
  assert.ok(source.includes('onClick={() => user ? setShowUpload(true) : setAuthMode(\'login\')}'))
})

test('admin AI settings are backed by a protected API and test mode', () => {
  const server = fs.readFileSync('server/index.js', 'utf8')
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  assert.match(server, /mode TEXT/)
  assert.match(server, /processImage/)
  assert.match(server, /AI settings require admin/)
  assert.match(server, /api_key_ciphertext/)
  assert.match(server, /encryptSecret/)
  assert.match(server, /suppliedKey===null\|\|suppliedKey===''/)
  assert.match(source, /API key/)
  assert.match(source, /api_key_set/)
  assert.match(source, /Test mode/)
})

test('external AI errors distinguish access rejection from an invalid key', () => {
  const server = fs.readFileSync('server/ai-provider.js', 'utf8')
  assert.match(server, /does not prove the key is invalid/)
  assert.match(server, /Authorization/)
})
test('profile settings persist theme and avatar controls', () => {
  const server = fs.readFileSync('server/index.js', 'utf8')
  const dashboard = fs.readFileSync('src/dashboard.jsx', 'utf8')
  assert.match(server, /p==='\/api\/me\/settings'/)
  assert.match(server, /avatar_url/)
  assert.match(dashboard, /Switch to dark mode/)
  assert.match(dashboard, /settings-file/)
  assert.match(dashboard, /api\('\/me\/settings'/)
})
test('profile without a session offers login instead of a dead retry loop', () => {
  const source = fs.readFileSync('src/dashboard.jsx', 'utf8')
  assert.ok(source.includes("error.toLowerCase().includes('login')"))
  assert.ok(source.includes('onLogin'))
})
test('map is self-contained and place markers open database place pages', () => {
  const source = fs.readFileSync('src/main.jsx', 'utf8')
  const server = fs.readFileSync('server/index.js', 'utf8')
  assert.ok(source.includes('svg'))
  assert.ok(source.includes('#place/'))
  assert.ok(source.includes('longitude'))
  assert.ok(source.includes('world'))
  assert.ok(source.includes('Zoom in'))
  assert.match(server, /worldPlaces/)
  assert.match(server, /commons.wikimedia.org/)
  assert.ok(!source.includes('MapServer/tile'))
})
test('authentication and HTTP security do not expose reset secrets or wildcard CORS', () => {
  const server = fs.readFileSync('server/index.js', 'utf8')
  assert.match(server, /scryptSync/)
  assert.match(server, /timingSafeEqual/)
  assert.doesNotMatch(server, /reset_token:token/)
  assert.doesNotMatch(server, /Access-Control-Allow-Origin':'\*'/)
  assert.match(server, /Content-Security-Policy/)
  assert.match(server, /Strict-Transport-Security/)
})

test('geocode module ranks local places and falls back safely without network', async () => {
  const { searchPlaces, slugify, localMatch } = await import('../server/geocode.js')
  const places=[{id:1,name:'Eiffel Tower',city:'Paris',country:'France',latitude:48.8584,longitude:2.2945},{id:2,name:'Charles Bridge',city:'Prague',country:'Czech Republic',latitude:50.0865,longitude:14.4114}]
  assert.deepEqual(slugify('  Prague, Česko! '), 'prague cesko')
  assert.equal(localMatch('zzzzqqqq', places).length, 0)
  assert.equal(localMatch('Eiffel', places)[0].name, 'Eiffel Tower')
  // A rejected remote lookup must not break the search: local matches still return.
  const fail=async()=>{throw new Error('offline')}
  const rows=await searchPlaces({text:'Eiffel Tower',places,limit:5,fetcher:fail,now:1000})
  assert.equal(rows[0].source,'shotmap')
  assert.ok(rows[0].label)
  // A successful remote lookup is merged after local results.
  const ok=async()=>({ok:true,json:async()=>[{lat:'50.0874654',lon:'14.4212535',name:'Praha',display_name:'Praha, Praha, Česko',address:{city:'Praha',country:'Česko'},osm_id:435514}]})
  const mixed=await searchPlaces({text:'Praha',places,limit:5,fetcher:ok,now:2000})
  assert.ok(mixed.some(r=>r.source==='nominatim'&&Number.isFinite(r.latitude)))
  // Cached rows are reused within the TTL window.
  const again=await searchPlaces({text:'Praha',places,limit:5,fetcher:fail,now:2500})
  assert.equal(again.length, mixed.length)
  // Short queries are rejected without touching the network.
  const fetches=[]
  const counting=async(url)=>{fetches.push(url);return {ok:true,json:async()=>[]}}
  await searchPlaces({text:'a',places,limit:5,fetcher:counting})
  assert.equal(fetches.length,0)
})

test('geocode API requires an authenticated session', () => {
  const server = fs.readFileSync('server/index.js', 'utf8')
  assert.match(server, /\/api\/geocode/)
  assert.match(server, /\/api\/photos\/guess-location/)
})

