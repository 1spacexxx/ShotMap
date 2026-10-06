import crypto from 'node:crypto'

// Nominatim (OpenStreetMap) public endpoint. Usage policy requires a
// identifying User-Agent and a maximum of about one request per second.
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'ShotMap/1.0 (photo place lookup; contact: admin@shotmap.local)'
const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map()

function keyFor(text, limit) {
  return crypto.createHash('sha256').update(`${text.toLowerCase()}|${limit}`).digest('hex')
}

function slugify(value) {
  return String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function localMatch(text, places) {
  const q = slugify(text)
  if (!q) return []
  const words = q.split(' ').filter(Boolean)
  return (places || [])
    .map((p) => {
      const hay = `${slugify(p.name)} ${slugify(p.city)} ${slugify(p.country)}`
      let score = 0
      if (hay.includes(q)) score = 100 - Math.abs(hay.length - q.length) / 10
      else {
        let hits = 0
        for (const w of words) if (hay.includes(w)) hits++
        score = hits ? (hits / words.length) * 70 : 0
      }
      return { p, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p)
}

async function fetchNominatim(text, limit, fetcher = fetch) {
  const url = `${NOMINATIM}?${new URLSearchParams({ q: text, format: 'jsonv2', limit: String(limit), addressdetails: '1' })}`
  const response = await fetcher(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(8000), redirect: 'error' })
  if (!response.ok) throw new Error(`Geocoder returned ${response.status}`)
  const rows = await response.json()
  return (rows || []).map((r) => ({
    name: r.name || r.display_name?.split(',')[0] || 'Location',
    label: r.display_name || [r.name || 'Location', r.address?.city || r.address?.town || r.address?.village || r.address?.county, r.address?.country].filter(Boolean).join(', '),
    city: r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || r.address?.county || r.address?.state || r.display_name?.split(',').slice(1, 3).join(',').trim() || '',
    country: r.address?.country || '',
    latitude: Number(r.lat),
    longitude: Number(r.lon),
    source: 'nominatim',
    osm_id: r.osm_id ? String(r.osm_id) : null,
  }))
}

export async function searchPlaces({ text, places = [], limit = 8, fetcher = fetch, now = Date.now() }) {
  const query = String(text || '').trim().slice(0, 120)
  if (query.length < 2) return []
  const key = keyFor(query, limit)
  const hit = cache.get(key)
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.rows

  let rows = []
  try { rows = await fetchNominatim(query, limit, fetcher) } catch (error) { console.warn('[geocode] remote lookup failed:', error.message) }

  rows = localMatch(query, places)
    .map((p) => ({ ...p, label: [p.name, p.city, p.country].filter(Boolean).join(', '), source: 'shotmap' }))
    .concat(rows.filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude)).map((r) => ({ ...r, label: r.display_name || [r.name, r.city, r.country].filter(Boolean).join(', ') })))
    // De-duplicate by rounded coordinates so an existing place does not appear twice.
    .filter((r, i, all) => i === all.findIndex((x) => Math.abs(x.latitude - r.latitude) < 0.001 && Math.abs(x.longitude - r.longitude) < 0.001))
    .slice(0, limit)

  cache.set(key, { at: now, rows })
  return rows
}

export async function guessLocationName({ endpoint, model, apiKey, image, title = '', fetcher = fetch }) {
  if (!endpoint || !model) return null
  const target = endpoint.replace(/\/+$/, '') + '/chat/completions'
  const prompt = `You are a geolocation assistant for a photography community. Look at this photo${title ? ` titled "${title}"` : ''}. Identify the most likely real-world place, landmark or city shown. Answer with ONLY a compact JSON object: {"place": "<name of landmark or area>", "city": "<city>", "country": "<country>", "confidence": <0-100>}. If the place cannot be identified from what is visible, answer {"place":"","city":"","country":"","confidence":0}. Do not guess from the title alone and do not explain.`
  const payload = { model, stream: false, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: image } }] }] }
  const response = await fetcher(target, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: `Bearer ${String(apiKey).replace(/^Bearer\s+/i, '').trim()}` } : {}) }, body: JSON.stringify(payload), redirect: 'error', signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`)
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  const text = Array.isArray(content) ? content.map((c) => c.text || '').join('') : content
  if (typeof text !== 'string') throw new Error('AI returned no location text')
  const parsed = JSON.parse(text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, ''))
  const confidence = Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0)))
  if (!parsed.place && !parsed.city) return null
  return { place: String(parsed.place || '').slice(0, 120), city: String(parsed.city || '').slice(0, 120), country: String(parsed.country || '').slice(0, 120), confidence }
}

export { slugify, localMatch, fetchNominatim }
