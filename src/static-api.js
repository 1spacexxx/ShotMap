// Client-side static database fallback for GitHub Pages hosting (when Node SQLite server is not running)
const STORAGE_KEY = 'shotmap_static_db_v3'

const FALLBACK_IMAGES = [
  'https://commons.wikimedia.org/wiki/Special:FilePath/Prague_Charles_Bridge_2021_11.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sagrada_Familia_01.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Colosseum_in_Rome,_Italy_-_April_2007.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Statue_of_Liberty_7.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Tokyo_Skytree_2012.JPG?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sydney_Opera_House_-_Dec_2008.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal_(Edited).jpeg?width=1600'
]

function analyzeDeterministic(seed = 'shotmap') {
  const n = Math.abs([...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0))
  const composition = 82 + (n % 16)
  const lighting = 80 + ((n >> 2) % 18)
  const sharpness = 83 + ((n >> 3) % 15)
  const colors = 84 + ((n >> 4) % 14)
  const visualQuality = Math.round((composition + lighting + sharpness + colors) / 4)
  return { composition, lighting, sharpness, colors, visualQuality, overallScore: visualQuality }
}

function createInitialDb() {
  const now = new Date().toISOString()
  const users = [
    { id: 1, username: 'demo', email: 'demo@shotmap.local', role: 'user', created_at: '2026-01-15T10:00:00Z', avatar_url: '', banned_until: null, posting_restricted_until: null },
    { id: 2, username: 'admin', email: 'admin@shotmap.local', role: 'admin', created_at: '2026-01-01T09:00:00Z', avatar_url: '', banned_until: null, posting_restricted_until: null },
    { id: 3, username: 'maya_chen', email: 'maya@shotmap.local', role: 'user', created_at: '2026-02-10T14:20:00Z', avatar_url: '', banned_until: null, posting_restricted_until: null },
    { id: 4, username: 'alex_turner', email: 'alex@shotmap.local', role: 'user', created_at: '2026-02-18T18:00:00Z', avatar_url: '', banned_until: null, posting_restricted_until: null },
    { id: 5, username: 'lena_ortiz', email: 'lena@shotmap.local', role: 'user', created_at: '2026-03-04T11:30:00Z', avatar_url: '', banned_until: null, posting_restricted_until: null }
  ]

  const places = [
    { id: 1, name: 'Charles Bridge', city: 'Prague', country: 'Czech Republic', latitude: 50.0865, longitude: 14.4114, average_score: 94 },
    { id: 2, name: 'Eiffel Tower', city: 'Paris', country: 'France', latitude: 48.8584, longitude: 2.2945, average_score: 91 },
    { id: 3, name: 'Sagrada Família', city: 'Barcelona', country: 'Spain', latitude: 41.4036, longitude: 2.1744, average_score: 89 },
    { id: 4, name: 'Colosseum', city: 'Rome', country: 'Italy', latitude: 41.8902, longitude: 12.4922, average_score: 86 },
    { id: 5, name: 'Statue of Liberty', city: 'New York', country: 'United States', latitude: 40.6892, longitude: -74.0445, average_score: 90 },
    { id: 6, name: 'Tokyo Skytree', city: 'Tokyo', country: 'Japan', latitude: 35.7101, longitude: 139.8107, average_score: 93 },
    { id: 7, name: 'Sydney Opera House', city: 'Sydney', country: 'Australia', latitude: -33.8568, longitude: 151.2153, average_score: 92 },
    { id: 8, name: 'Taj Mahal', city: 'Agra', country: 'India', latitude: 27.1751, longitude: 78.0421, average_score: 95 }
  ]

  const titles = [
    ['Golden hour at the bridge', 'Architecture', 'landscape', 3, 1, 94],
    ['Reflections of the Taj at sunrise', 'Architecture', 'landscape', 3, 8, 95],
    ['Neon horizon from Sumida River', 'Night', 'night', 4, 6, 93],
    ['The quiet side of Paris', 'City', 'architecture', 4, 2, 92],
    ['Sails over Sydney Harbour', 'Architecture', 'landscape', 5, 7, 92],
    ['Morning mist over Vltava', 'Landscape', 'landscape', 1, 1, 91],
    ['Blue hour in Barcelona', 'Architecture', 'night', 5, 3, 90],
    ['Harbor torch at dusk', 'City', 'portrait', 2, 5, 90],
    ['Iron lattice in twilight', 'Night', 'night', 3, 2, 89],
    ['Ancient arches at dawn', 'Architecture', 'landscape', 1, 4, 88],
    ['Stained glass symphony', 'Architecture', 'macro', 5, 3, 93],
    ['Roman travertine glow', 'City', 'street', 4, 4, 87]
  ]

  const photos = titles.map(([title, category, photo_type, user_id, place_id, score], idx) => ({
    id: idx + 1,
    user_id,
    place_id,
    image_url: FALLBACK_IMAGES[(place_id - 1) % FALLBACK_IMAGES.length],
    title,
    description: 'Captured during golden hour with natural light and balanced dynamic range.',
    category,
    photo_type,
    created_at: now,
    ai_score: score,
    composition: Math.min(99, score + 2),
    lighting: Math.max(78, score - 2),
    sharpness: score,
    colors: Math.min(98, score + 1),
    visual_quality: score,
    community_score: 4.8,
    likes: 22 + idx * 7,
    views: 140 + idx * 45,
    ai_model: 'test',
    error: null
  }))

  const reports = [
    { id: 1, user_id: 1, photo_id: 1, reason: 'wrong_location', details: 'GPS pin appears 400m east of the bridge tower', status: 'open', created_at: now },
    { id: 2, user_id: 3, photo_id: 2, reason: 'copyright', details: 'Watermark cropped in bottom corner', status: 'open', created_at: now },
    { id: 3, user_id: 4, photo_id: 3, reason: 'spam', details: 'Duplicate winter series upload', status: 'reviewed', created_at: now }
  ]

  const achievements = [
    { id: 1, key: 'first-shot', name: 'First Shot', description: 'Upload your first photo', icon: '📸' },
    { id: 2, key: 'photographer', name: 'Photographer', description: 'Upload 10 photos', icon: '🗂️' },
    { id: 3, key: 'high-score', name: 'High Score', description: 'Get an AI score above 90', icon: '⭐' },
    { id: 4, key: 'top-shot', name: 'Top Shot', description: 'Earn 10 likes', icon: '🔥' }
  ]

  const notifications = [
    { id: 1, user_id: 1, type: 'like', message: 'maya_chen liked your photo “Ancient arches at dawn” (+10 XP)', read_at: null, created_at: now },
    { id: 2, user_id: 1, type: 'rating', message: 'alex_turner rated “Morning mist over Vltava” ★ 5/5 — “Incredible atmospheric light!”', read_at: null, created_at: now },
    { id: 3, user_id: 1, type: 'achievement', message: '🏆 Milestone unlocked: “High Score” — Earned 91+ AI Critique on Charles Bridge', read_at: null, created_at: now },
    { id: 4, user_id: 2, type: 'system', message: '📣 System: ShotMap Command Center & AI Vision Telemetry v2.4 are active', read_at: null, created_at: now },
    { id: 5, user_id: 1, type: 'like', message: 'lena_ortiz saved “Morning mist over Vltava” to her curated collection', read_at: now, created_at: now }
  ]

  return {
    users,
    places,
    photos,
    reports,
    achievements,
    notifications,
    favorites: [{ user_id: 1, photo_id: 1 }, { user_id: 2, photo_id: 1 }],
    place_favorites: [{ user_id: 1, place_id: 1 }, { user_id: 2, place_id: 2 }],
    ai_settings: { mode: 'test', endpoint: '', model: 'gpt-4o-mini', updated_at: now, api_key_set: 0 }
  }
}

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const initial = createInitialDb()
  saveDb(initial)
  return initial
}

function saveDb(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function currentUser(db) {
  const token = localStorage.getItem('shotmap_token') || ''
  if (!token) return null
  if (token.startsWith('static-token-')) {
    const uid = Number(token.replace('static-token-', ''))
    return db.users.find(u => u.id === uid) || db.users[0]
  }
  return db.users[0]
}

export async function handleStaticApi(path, options = {}) {
  const db = loadDb()
  const method = (options.method || 'GET').toUpperCase()
  const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {}
  const url = new URL(path.startsWith('http') ? path : `http://shotmap.local${path}`)
  const p = url.pathname.replace(/^\/api/, '')
  const user = currentUser(db)

  const enrichPhoto = ph => {
    const u = db.users.find(x => x.id === ph.user_id)
    const pl = db.places.find(x => x.id === ph.place_id)
    return {
      ...ph,
      username: u?.username || 'photographer',
      place_name: pl?.name || 'Featured location',
      city: pl?.city || 'Prague',
      country: pl?.country || 'Czech Republic',
      latitude: pl?.latitude ?? 50.0865,
      longitude: pl?.longitude ?? 14.4114
    }
  }

  // Auth
  if (method === 'POST' && p === '/auth/login') {
    const email = String(body.email || '').toLowerCase().trim()
    let found = db.users.find(u => u.email.toLowerCase() === email || u.username.toLowerCase() === email)
    if (!found) {
      if (email.includes('admin')) found = db.users.find(u => u.role === 'admin')
      else found = db.users[0]
    }
    const token = `static-token-${found.id}`
    return { user: found, token }
  }
  if (method === 'POST' && p === '/auth/register') {
    const id = Math.max(0, ...db.users.map(u => u.id)) + 1
    const newUser = {
      id,
      username: body.username || `user_${id}`,
      email: body.email || `user${id}@shotmap.local`,
      role: 'user',
      created_at: new Date().toISOString(),
      avatar_url: '',
      banned_until: null,
      posting_restricted_until: null
    }
    db.users.push(newUser)
    saveDb(db)
    return { user: newUser, token: `static-token-${id}` }
  }
  if (method === 'POST' && p === '/auth/logout') return { ok: true }
  if (method === 'POST' && (p === '/auth/forgot-password' || p === '/auth/reset-password')) {
    return { ok: true, message: 'Password reset processed in demo mode', reset_token: 'demo-reset' }
  }

  if (method === 'GET' && p === '/me') {
    if (!user) throw new Error('Authentication required')
    return { user }
  }

  // Places & Geocode
  if (method === 'GET' && p === '/places') {
    const places = db.places.map(pl => ({
      ...pl,
      photos: db.photos.filter(ph => ph.place_id === pl.id).length || 3
    }))
    return { places, pagination: { page: 1, limit: 20, total: places.length, pages: 1 } }
  }
  if (method === 'GET' && p.startsWith('/places/')) {
    const id = Number(p.split('/').pop())
    const place = db.places.find(pl => pl.id === id) || db.places[0]
    const photos = db.photos.filter(ph => ph.place_id === place.id).map(enrichPhoto)
    return { place, photos: photos.length ? photos : db.photos.slice(0, 4).map(enrichPhoto) }
  }
  if (method === 'POST' && p.match(/^\/places\/\d+\/favorite$/)) {
    const activeUser = user || db.users[0]
    const placeId = Number(p.split('/')[2])
    const idx = db.place_favorites.findIndex(f => f.user_id === activeUser.id && f.place_id === placeId)
    if (idx >= 0) db.place_favorites.splice(idx, 1)
    else db.place_favorites.push({ user_id: activeUser.id, place_id: placeId })
    saveDb(db)
    return { saved: idx < 0 }
  }
  if (method === 'GET' && p === '/geocode') {
    const q = (url.searchParams.get('q') || '').toLowerCase()
    const results = db.places
      .filter(pl => !q || `${pl.name} ${pl.city} ${pl.country}`.toLowerCase().includes(q))
      .map(pl => ({
        id: pl.id,
        name: pl.name,
        city: pl.city,
        country: pl.country,
        latitude: pl.latitude,
        longitude: pl.longitude,
        label: `${pl.name}, ${pl.city}, ${pl.country}`,
        source: 'shotmap'
      }))
    return { results }
  }

  // Photos
  if (method === 'GET' && p === '/photos') {
    const category = url.searchParams.get('category') || ''
    const type = url.searchParams.get('type') || ''
    const min = Number(url.searchParams.get('min_score') || 0)
    const sort = url.searchParams.get('sort') || 'ai_score'
    const page = Math.max(1, Number(url.searchParams.get('page') || 1))
    const limit = Math.max(1, Number(url.searchParams.get('limit') || 6))

    const filtered = db.photos
      .filter(ph => ph.ai_score >= min && (!category || ph.category === category) && (!type || ph.photo_type === type))
      .sort((a, b) => Number(b[sort] || 0) - Number(a[sort] || 0))
      .map(enrichPhoto)

    const pages = Math.max(1, Math.ceil(filtered.length / limit))
    const slice = filtered.slice((page - 1) * limit, page * limit)
    return { photos: slice, pagination: { page, limit, total: filtered.length, pages } }
  }
  if (method === 'GET' && p.match(/^\/photos\/\d+$/)) {
    const id = Number(p.split('/').pop())
    const found = db.photos.find(ph => ph.id === id) || db.photos[0]
    found.views = (found.views || 0) + 1
    saveDb(db)
    return { photo: enrichPhoto(found) }
  }
  if (method === 'POST' && p === '/photos/guess-location') {
    return { guess: { place: 'Charles Bridge', city: 'Prague', country: 'Czech Republic', confidence: 92 } }
  }
  if (method === 'POST' && p === '/photos') {
    const activeUser = user || db.users[0]
    let placeId = Number(body.place_id)
    if (!placeId && body.place_name) {
      placeId = Math.max(0, ...db.places.map(x => x.id)) + 1
      db.places.push({
        id: placeId,
        name: body.place_name,
        city: body.city || 'Prague',
        country: body.country || 'Czech Republic',
        latitude: Number(body.latitude) || 50.0865,
        longitude: Number(body.longitude) || 14.4114,
        average_score: 91
      })
    }
    const metrics = analyzeDeterministic(body.title || body.image_url || String(Date.now()))
    const id = Math.max(0, ...db.photos.map(x => x.id)) + 1
    const photo = {
      id,
      user_id: activeUser.id,
      place_id: placeId || 1,
      image_url: body.image_url || FALLBACK_IMAGES[0],
      title: body.title || 'Untitled shot',
      description: '',
      category: body.category || 'City',
      photo_type: 'landscape',
      created_at: new Date().toISOString(),
      ai_score: metrics.overallScore,
      composition: metrics.composition,
      lighting: metrics.lighting,
      sharpness: metrics.sharpness,
      colors: metrics.colors,
      visual_quality: metrics.visualQuality,
      community_score: 5.0,
      likes: 1,
      views: 1,
      ai_model: 'test',
      error: null
    }
    db.photos.unshift(photo)
    saveDb(db)
    return { photo: { ...photo, ...metrics } }
  }
  if (method === 'DELETE' && p.match(/^\/photos\/\d+$/)) {
    const id = Number(p.split('/').pop())
    db.photos = db.photos.filter(ph => ph.id !== id)
    saveDb(db)
    return { ok: true }
  }
  const photoAction = p.match(/^\/photos\/(\d+)\/(like|favorite|rate)$/)
  if (method === 'POST' && photoAction) {
    const id = Number(photoAction[1])
    const act = photoAction[2]
    const ph = db.photos.find(x => x.id === id)
    const activeUser = user || db.users[0]
    if (ph && act === 'like') {
      ph.likes = (ph.likes || 0) + 1
      saveDb(db)
      return { ok: true, liked: true }
    }
    if (ph && act === 'favorite') {
      const idx = db.favorites.findIndex(f => f.user_id === activeUser.id && f.photo_id === id)
      if (idx >= 0) db.favorites.splice(idx, 1)
      else db.favorites.push({ user_id: activeUser.id, photo_id: id })
      saveDb(db)
      return { ok: true }
    }
    if (ph && act === 'rate') {
      ph.community_score = Number(body.score || 5)
      saveDb(db)
      return { ok: true }
    }
  }

  // Leaderboard & Recommendations
  if (method === 'GET' && p === '/leaderboard') {
    const rows = db.users.map(u => {
      const mine = db.photos.filter(ph => ph.user_id === u.id)
      const avg = mine.length ? Math.round(mine.reduce((s, x) => s + x.ai_score, 0) / mine.length) : 88
      const likes = mine.reduce((s, x) => s + (x.likes || 0), 0)
      return {
        id: u.id,
        username: u.username,
        avatar_url: u.avatar_url || '',
        photos: mine.length,
        average_score: avg,
        likes
      }
    }).sort((a, b) => b.average_score - a.average_score || b.likes - a.likes)
    return { users: rows }
  }
  if (method === 'GET' && p === '/recommendations') {
    return { places: db.places.slice(0, 4).map(pl => ({ ...pl, photos: 4 })) }
  }

  // Profile & Personal Studio (/me/*)
  if (method === 'GET' && p === '/profile') {
    const targetId = Number(url.searchParams.get('id')) || user?.id || 1
    const targetUser = db.users.find(u => u.id === targetId) || db.users[0]
    const mine = db.photos.filter(ph => ph.user_id === targetUser.id).map(enrichPhoto)
    const favIds = db.favorites.filter(f => f.user_id === targetUser.id).map(f => f.photo_id)
    const favorites = db.photos.filter(ph => favIds.includes(ph.id)).map(enrichPhoto)
    const savedPlaceIds = db.place_favorites.filter(f => f.user_id === targetUser.id).map(f => f.place_id)
    const savedPlaces = db.places.filter(pl => savedPlaceIds.includes(pl.id)).map(pl => ({ ...pl, photos: 3 }))
    const avg = mine.length ? Math.round(mine.reduce((s, x) => s + x.ai_score, 0) / mine.length) : 90
    const likes = mine.reduce((s, x) => s + (x.likes || 0), 0)
    const xp = mine.length * 20 + likes * 2 + 200
    return {
      user: targetUser,
      photos: mine,
      favorites,
      saved_places: savedPlaces,
      places: db.places.slice(0, 3),
      achievements: db.achievements.slice(0, 3),
      statistics: {
        photos: mine.length,
        likes,
        average_score: avg,
        places: 3,
        achievements: 3,
        level: Math.floor(xp / 250) + 1,
        xp
      }
    }
  }
  if (method === 'PUT' && p === '/profile') {
    const activeUser = user || db.users[0]
    if (body.username) activeUser.username = body.username
    if (body.avatar_url !== undefined) activeUser.avatar_url = body.avatar_url
    saveDb(db)
    return { user: activeUser }
  }
  if (method === 'GET' && p === '/me/statistics') {
    const activeUser = user || db.users[0]
    const mine = db.photos.filter(ph => ph.user_id === activeUser.id)
    const avg = mine.length ? Math.round(mine.reduce((s, x) => s + x.ai_score, 0) / mine.length) : 90
    const likes = mine.reduce((s, x) => s + (x.likes || 0), 0)
    const xp = mine.length * 20 + likes * 2 + 200
    return {
      statistics: {
        photos: mine.length,
        likes,
        average_ai: avg,
        composition: 93,
        lighting: 89,
        sharpness: 91,
        colors: 92,
        visual_quality: 91,
        places: 3,
        achievements: 3,
        xp,
        level: Math.floor(xp / 250) + 1,
        strongest: 'composition',
        weakest: 'lighting'
      }
    }
  }
  if (method === 'GET' && p === '/me/photos') {
    const activeUser = user || db.users[0]
    const min = Number(url.searchParams.get('min_score') || 0)
    const mine = db.photos.filter(ph => ph.user_id === activeUser.id && ph.ai_score >= min).map(enrichPhoto)
    return { photos: mine }
  }
  if (method === 'GET' && p === '/me/places') {
    return { places: db.places.slice(0, 4).map(pl => ({ ...pl, photos: 3, average_ai: pl.average_score })) }
  }
  if (method === 'GET' && (p === '/me/notifications' || p === '/notifications')) {
    const activeUser = user || db.users[0]
    return { notifications: db.notifications.filter(n => n.user_id === activeUser.id || n.user_id === 1) }
  }
  if (method === 'POST' && p === '/notifications/read') {
    const now = new Date().toISOString()
    db.notifications.forEach(n => { n.read_at = now })
    saveDb(db)
    return { ok: true }
  }
  if (method === 'PATCH' && p.match(/^\/notifications\/\d+\/read$/)) {
    const id = Number(p.split('/')[2])
    const found = db.notifications.find(n => n.id === id)
    if (found) found.read_at = new Date().toISOString()
    saveDb(db)
    return { ok: true }
  }
  if (p === '/me/settings') {
    return { settings: { theme: localStorage.getItem('shotmap_theme') || 'light', public_profile: 1, show_city: 1, show_activity: 1, allow_ratings: 1 } }
  }
  if (method === 'POST' && p === '/reports') {
    const activeUser = user || db.users[0]
    const id = Math.max(0, ...db.reports.map(r => r.id)) + 1
    db.reports.unshift({
      id,
      user_id: activeUser.id,
      photo_id: Number(body.photo_id) || 1,
      reason: body.reason || 'spam',
      details: body.details || '',
      status: 'open',
      created_at: new Date().toISOString()
    })
    saveDb(db)
    return { report: { id, status: 'open' } }
  }

  // Admin Routes
  if (p === '/admin/overview') {
    const avg_ai = db.photos.length ? Math.round(db.photos.reduce((s, x) => s + x.ai_score, 0) / db.photos.length * 10) / 10 : 90
    const total_likes = db.photos.reduce((s, x) => s + (x.likes || 0), 0)
    const total_views = db.photos.reduce((s, x) => s + (x.views || 0), 0)
    const catMap = {}
    for (const ph of db.photos) {
      const c = ph.category || 'City'
      if (!catMap[c]) catMap[c] = { category: c, count: 0, sum: 0 }
      catMap[c].count++
      catMap[c].sum += ph.ai_score
    }
    const categories = Object.values(catMap).map(c => ({ category: c.category, count: c.count, avg_score: Math.round(c.sum / c.count * 10) / 10 }))
    return {
      stats: {
        users: db.users.length,
        photos: db.photos.length,
        places: db.places.length,
        reports: db.reports.filter(r => r.status === 'open').length,
        avg_ai,
        total_likes,
        total_views,
        categories
      },
      settings: db.ai_settings
    }
  }
  if (p === '/admin/reports' && method === 'GET') {
    return {
      reports: db.reports.map(r => {
        const u = db.users.find(x => x.id === r.user_id)
        const ph = db.photos.find(x => x.id === r.photo_id) || db.photos[0]
        return {
          ...r,
          username: u?.username || 'demo',
          title: ph?.title || 'Featured shot',
          image_url: ph?.image_url || FALLBACK_IMAGES[0],
          ai_score: ph?.ai_score || 90
        }
      })
    }
  }
  if (method === 'PATCH' && p.match(/^\/admin\/reports\/\d+$/)) {
    const id = Number(p.split('/').pop())
    const rep = db.reports.find(r => r.id === id)
    if (rep && body.status) rep.status = body.status
    saveDb(db)
    return { ok: true }
  }
  if (p === '/admin/users' && method === 'GET') {
    return {
      users: db.users.map(u => {
        const mine = db.photos.filter(ph => ph.user_id === u.id)
        const avg = mine.length ? Math.round(mine.reduce((s, x) => s + x.ai_score, 0) / mine.length) : 88
        return { ...u, photos: mine.length, avg_score: avg }
      })
    }
  }
  if (method === 'PATCH' && p.match(/^\/admin\/users\/\d+$/)) {
    const id = Number(p.split('/').pop())
    const target = db.users.find(u => u.id === id)
    if (target) {
      const until = new Date(Date.now() + 7 * 86400000).toISOString()
      if (body.action === 'ban') target.banned_until = until
      if (body.action === 'restrict') target.posting_restricted_until = until
      if (body.action === 'unban') { target.banned_until = null; target.posting_restricted_until = null }
      if (body.action === 'promote') target.role = 'admin'
      if (body.action === 'demote') target.role = 'user'
      saveDb(db)
    }
    return { ok: true, user: target }
  }
  if (method === 'DELETE' && p.match(/^\/admin\/users\/\d+$/)) {
    const id = Number(p.split('/').pop())
    db.users = db.users.filter(u => u.id !== id)
    saveDb(db)
    return { ok: true }
  }
  if (p === '/admin/photos' && method === 'GET') {
    return { photos: db.photos.map(enrichPhoto) }
  }
  if (method === 'POST' && p.match(/^\/admin\/photos\/\d+\/rescore$/)) {
    const id = Number(p.split('/')[3])
    const ph = db.photos.find(x => x.id === id) || db.photos[0]
    const metrics = analyzeDeterministic(`${ph.title}-${Date.now()}`)
    ph.ai_score = metrics.overallScore
    ph.composition = metrics.composition
    ph.lighting = metrics.lighting
    ph.sharpness = metrics.sharpness
    ph.colors = metrics.colors
    ph.visual_quality = metrics.visualQuality
    saveDb(db)
    return { ok: true, metrics }
  }
  if (method === 'DELETE' && p.match(/^\/admin\/photos\/\d+$/)) {
    const id = Number(p.split('/').pop())
    db.photos = db.photos.filter(ph => ph.id !== id)
    saveDb(db)
    return { ok: true }
  }
  if (p === '/admin/places' && method === 'GET') {
    return { places: db.places.map(pl => ({ ...pl, photos: db.photos.filter(ph => ph.place_id === pl.id).length || 2 })) }
  }
  if (p === '/admin/places' && method === 'POST') {
    const id = Math.max(0, ...db.places.map(pl => pl.id)) + 1
    const place = {
      id,
      name: body.name,
      city: body.city,
      country: body.country,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      average_score: Number(body.average_score || 90)
    }
    db.places.unshift(place)
    saveDb(db)
    return { place }
  }
  if (method === 'DELETE' && p.match(/^\/admin\/places\/\d+$/)) {
    const id = Number(p.split('/').pop())
    db.places = db.places.filter(pl => pl.id !== id)
    saveDb(db)
    return { ok: true }
  }
  if (p === '/admin/ai-settings') {
    if (method === 'PUT') {
      db.ai_settings = {
        ...db.ai_settings,
        mode: body.mode || 'test',
        endpoint: body.endpoint || '',
        model: body.model || '',
        api_key_set: body.api_key ? 1 : db.ai_settings.api_key_set,
        updated_at: new Date().toISOString()
      }
      saveDb(db)
    }
    return { settings: db.ai_settings }
  }
  if (p === '/admin/broadcast' && method === 'POST') {
    const now = new Date().toISOString()
    for (const u of db.users) {
      db.notifications.unshift({
        id: Math.max(0, ...db.notifications.map(n => n.id)) + 1,
        user_id: u.id,
        type: 'system',
        message: `📣 Admin: ${body.message}`,
        read_at: null,
        created_at: now
      })
    }
    saveDb(db)
    return { ok: true, sent: db.users.length }
  }
  if (p === '/admin/reset-demo' && method === 'POST') {
    const fresh = createInitialDb()
    saveDb(fresh)
    return { ok: true }
  }

  return { ok: true }
}
