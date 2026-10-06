import React, { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, MapPin, Upload, ArrowUpRight, ChevronDown, ChevronLeft, SlidersHorizontal, Navigation, Sparkles, Menu, X, Trophy, Heart, Users, Image as ImageIcon, Bell, Star, Shield, Award, Camera, LayoutGrid, Share2, CheckCircle2 } from 'lucide-react'
import { feature } from 'topojson-client'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import worldData from 'world-atlas/countries-110m.json' with { type: 'json' }
import './styles.css'
import './polish.css'
import { Dashboard } from './dashboard.jsx'
import { PublicProfilePage } from './public-profile.jsx'
import { MapView as InteractiveMap } from './tile-map.jsx'
import { LocationPinMap } from './world-map.jsx'
import { Avatar } from './avatar.jsx'
import { LocationPicker } from './location-picker.jsx'
import { handleStaticApi } from './static-api.js'

const API = import.meta.env.VITE_API_URL || '/api'
const api = async (path, options = {}) => {
  if (typeof window !== 'undefined' && (window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:')) {
    return handleStaticApi(path, options)
  }
  const token = localStorage.getItem('shotmap_token')
  let response
  try {
    response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...options })
  } catch {
    return handleStaticApi(path, options)
  }
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return handleStaticApi(path, options)
  }
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}
const publicPhotoFallbacks = [
  'https://commons.wikimedia.org/wiki/Special:FilePath/Prague_Charles_Bridge_2021_11.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sagrada_Familia_01.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Colosseum_in_Rome,_Italy_-_April_2007.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Statue_of_Liberty_7.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Tokyo_Skytree_2012.JPG?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sydney_Opera_House_-_Dec_2008.jpg?width=1600',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal_(Edited).jpeg?width=1600'
]
const photoFallbackUrl = (id) => publicPhotoFallbacks[((Number(id||1)-1)%publicPhotoFallbacks.length+publicPhotoFallbacks.length)%publicPhotoFallbacks.length]
const media = photoFallbackUrl
const places = [
  { id: 1, name: 'Charles Bridge', city: 'Prague, Czech Republic', photos: '1,248 photos', score: 94, image: publicPhotoFallbacks[0], x: '51%', y: '39%', latitude: 50.0865, longitude: 14.4114, category: 'Architecture', coords: '50.0865° N, 14.4114° E', composition: 96, lighting: 92, colors: 94 },
  { id: 2, name: 'Eiffel Tower', city: 'Paris, France', photos: '2,104 photos', score: 91, image: publicPhotoFallbacks[1], x: '69%', y: '59%', latitude: 48.8584, longitude: 2.2945, category: 'Monuments', coords: '48.8584° N, 2.2945° E', composition: 94, lighting: 95, colors: 91 },
  { id: 3, name: 'Sagrada Família', city: 'Barcelona, Spain', photos: '856 photos', score: 89, image: publicPhotoFallbacks[2], x: '57%', y: '80%', latitude: 41.4036, longitude: 2.1744, category: 'Architecture', coords: '41.4036° N, 2.1744° E', composition: 93, lighting: 90, colors: 92 },
  { id: 4, name: 'Colosseum', city: 'Rome, Italy', photos: '1,672 photos', score: 86, image: publicPhotoFallbacks[3], x: '79%', y: '79%', latitude: 41.8902, longitude: 12.4922, category: 'Monuments', coords: '41.8902° N, 12.4922° E', composition: 91, lighting: 89, colors: 90 },
  { id: 5, name: 'Statue of Liberty', city: 'New York, United States', photos: '1,420 photos', score: 90, image: publicPhotoFallbacks[4], x: '28%', y: '44%', latitude: 40.6892, longitude: -74.0445, category: 'Monuments', coords: '40.6892° N, 74.0445° W', composition: 92, lighting: 91, colors: 89 },
  { id: 6, name: 'Tokyo Skytree', city: 'Tokyo, Japan', photos: '1,890 photos', score: 93, image: publicPhotoFallbacks[5], x: '84%', y: '46%', latitude: 35.7101, longitude: 139.8107, category: 'Architecture', coords: '35.7101° N, 139.8107° E', composition: 95, lighting: 93, colors: 94 },
  { id: 7, name: 'Sydney Opera House', city: 'Sydney, Australia', photos: '1,180 photos', score: 92, image: publicPhotoFallbacks[6], x: '88%', y: '82%', latitude: -33.8568, longitude: 151.2153, category: 'Architecture', coords: '33.8568° S, 151.2153° E', composition: 94, lighting: 92, colors: 93 },
  { id: 8, name: 'Taj Mahal', city: 'Agra, India', photos: '2,340 photos', score: 95, image: publicPhotoFallbacks[7], x: '72%', y: '52%', latitude: 27.1751, longitude: 78.0421, category: 'Architecture', coords: '27.1751° N, 78.0421° E', composition: 98, lighting: 95, colors: 94 },
]
const shots = [
  { id: 1, image: publicPhotoFallbacks[0], title: 'Golden hour at the bridge', author: 'Maya Chen', place: 'Charles Bridge', score: 94, avatar: 'MC' },
  { id: 2, image: publicPhotoFallbacks[1], title: 'The quiet side of Paris', author: 'Alex Turner', place: 'Paris', score: 92, avatar: 'AT' },
  { id: 3, image: publicPhotoFallbacks[2], title: 'Blue hour in Barcelona', author: 'Lena Ortiz', place: 'Sagrada Família', score: 90, avatar: 'LO' },
]
const worldFeatures = feature(worldData, worldData.objects.countries).features
const worldProjection = geoNaturalEarth1().fitSize([1000,430], {type:'FeatureCollection',features:worldFeatures})
const worldPath = geoPath(worldProjection)
function MapView({ places, onSelect }) { const mapRef=React.useRef(null); const [zoom,setZoom]=React.useState(1); const width=1000,height=430; const mapPlaces=Array.isArray(places)?places:[]; const project=p=>{const [x,y]=worldProjection([Number(p.longitude),Number(p.latitude)]);return {x,y}}; const markerNodes = mapPlaces.map(p=>{const q=project(p);return <g key={p.id||p.name} className="map-marker" transform={`translate(${q.x},${q.y})`} tabIndex="0" role="button" aria-label={`Open ${p.name}`} onClick={()=>{onSelect(p);if(p.id)window.location.hash=`#place/${p.id}`}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.click()}}><circle r="7"/><circle r="2.5"/><text x="11" y="4" className="map-marker-label">{p.name}</text></g>});
  return <div className="custom-map" ref={mapRef}><div className="map-controls"><button aria-label="Zoom in" onClick={()=>setZoom(z=>Math.min(1.8,+(z+.2).toFixed(1)))}>+</button><button aria-label="Zoom out" onClick={()=>setZoom(z=>Math.max(1,+(z-.2).toFixed(1)))}>−</button><button aria-label="Reset map" onClick={()=>setZoom(1)}>⌂</button></div><div className="map-compass">N</div><div className="map-scale">WORLD · Natural Earth · 20° grid</div><svg style={{transform:`scale(${zoom})`}} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="ShotMap world map"><defs><linearGradient id="mapOcean" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#173b46"/><stop offset="1" stopColor="#244e48"/></linearGradient><pattern id="mapGrid" width="54" height="54" patternUnits="userSpaceOnUse"><path d="M54 0H0V54" fill="none" stroke="#a6d0b1" strokeOpacity=".12"/></pattern></defs><rect width={width} height={height} fill="url(#mapOcean)"/><rect width={width} height={height} fill="url(#mapGrid)"/><g className="map-countries">{worldFeatures.map((f,i)=><path key={i} d={worldPath(f)} />)}</g><text className="map-region" x="430" y="150">WORLD</text><g className="map-marker-layer">{markerNodes}</g></svg></div> }

function Score({ value, large = false }) { return <span className={`score ${large ? 'score-large' : ''}`}>{value}<small>/100</small></span> }
function Shell({ children, onHome, notify }) {
  const hash = typeof window !== 'undefined' ? window.location.hash : ''
  const [theme, setTheme] = useState(() => localStorage.getItem('shotmap_theme') || 'light')
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  React.useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('shotmap_token')
    if (!token) { setUnreadCount(3); return }
    api('/notifications')
      .then(x => { if (!cancelled) setUnreadCount((x.notifications || []).filter(n => !n.read_at).length) })
      .catch(() => { if (!cancelled) setUnreadCount(0) })
    return () => { cancelled = true }
  }, [showNotifications, hash])
  const toggleSubTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    localStorage.setItem('shotmap_theme', next)
  }
  return (
    <>
      <header className="nav sub-nav">
        <button className="brand" onClick={onHome}><span className="brand-mark">S</span><span>Shot<span>Map</span></span></button>
        <nav className="nav-links sub-nav-links">
          <button className={!hash ? 'active-nav' : ''} onClick={onHome}>Explore</button>
          <button className={hash === '#leaderboard' ? 'active-nav' : ''} onClick={()=>window.location.hash='#leaderboard'}>Leaderboard</button>
          <button className={hash === '#profile' ? 'active-nav' : ''} onClick={()=>window.location.hash='#profile'}>Profile</button>
          <button className={hash === '#admin' ? 'active-nav' : ''} onClick={()=>window.location.hash='#admin'}>Admin</button>
        </nav>
        <div className="nav-actions">
          <button className="theme-toggle" aria-label="Toggle theme" onClick={toggleSubTheme}>{theme==='dark'?'☀':'☾'}</button>
          <button
            type="button"
            className={`notification-btn ${showNotifications ? 'is-open' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
            aria-label="Notifications"
            aria-expanded={showNotifications}
            onClick={() => setShowNotifications(v => !v)}
          >
            <Bell size={17}/>
            {unreadCount > 0 && <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          <button className="outline-btn" onClick={onHome}><ChevronLeft size={14}/> Back to map</button>
          {showNotifications && (
            <Notifications
              onClose={() => setShowNotifications(false)}
              notify={notify || (() => {})}
              onCountChange={setUnreadCount}
            />
          )}
        </div>
      </header>
      {children}
      <nav className="mobile-bottom-dock" aria-label="Mobile quick navigation">
        <button type="button" className={!hash ? 'active' : ''} onClick={onHome}><MapPin size={16}/><span>Map</span></button>
        <button type="button" className={hash === '#leaderboard' ? 'active' : ''} onClick={()=>window.location.hash='#leaderboard'}><Trophy size={16}/><span>Leaders</span></button>
        <button type="button" className="dock-upload-btn" onClick={()=>{onHome();window.setTimeout(()=>window.dispatchEvent(new Event('shotmap:login')),80)}}><Camera size={16}/><span>Shoot</span></button>
        <button type="button" className={hash === '#profile' ? 'active' : ''} onClick={()=>window.location.hash='#profile'}><Users size={16}/><span>Studio</span></button>
        <button type="button" className={hash === '#admin' ? 'active' : ''} onClick={()=>window.location.hash='#admin'}><Shield size={16}/><span>Admin</span></button>
      </nav>
    </>
  )
}

function LeaderboardPage({ onHome }) {
  const [rows,setRows]=useState(null)
  const [error,setError]=useState('')
  const [query,setQuery]=useState('')
  const [sortBy,setSortBy]=useState('average_score')
  React.useEffect(()=>{api('/leaderboard').then(x=>setRows(x.users)).catch(e=>setError(e.message))},[])
  const sortedRows = useMemo(() => {
    if (!rows) return []
    return [...rows]
      .filter(u => !query.trim() || u.username.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => Number(b[sortBy] || 0) - Number(a[sortBy] || 0))
  }, [rows, query, sortBy])
  const topThree = sortedRows.slice(0, 3)

  const summary = useMemo(() => {
    if (!rows || !rows.length) return { count: 0, avg: 0, likes: 0, shots: 0 }
    const count = rows.length
    const avg = Math.round(rows.reduce((s, u) => s + Number(u.average_score || 0), 0) / count)
    const likes = rows.reduce((s, u) => s + Number(u.likes || 0), 0)
    const shots = rows.reduce((s, u) => s + Number(u.photos || 0), 0)
    return { count, avg, likes, shots }
  }, [rows])

  return <Shell onHome={onHome}><main className="sub-page leaderboard-page">
    <div className="leaderboard-hero-head">
      <div>
        <div className="eyebrow"><span className="dot"/> Community ranking</div>
        <h1>Top <em>photographers.</em></h1>
        <p className="muted">Ranked by AI visual critique across composition, lighting, sharpness, and color harmony.</p>
      </div>
      <div className="leaderboard-controls">
        <div className="search leaderboard-search">
          <Search size={15}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search photographers..."/>
        </div>
        <div className="filter-chips">
          {[['average_score','Best AI Avg'],['likes','Most Likes'],['photos','Most Shots']].map(([key,label]) => (
            <button key={key} type="button" className={`filter-chip ${sortBy===key?'active':''}`} onClick={()=>setSortBy(key)}>{label}</button>
          ))}
        </div>
      </div>
    </div>

    {rows && rows.length > 0 && (
      <div className="leaderboard-kpi-strip">
        <div><small>Ranked Photographers</small><b>{summary.count}</b></div>
        <div><small>Community AI Avg</small><b>{summary.avg}<span style={{fontSize:12,opacity:.6}}>/100</span></b></div>
        <div><small>Published Captures</small><b>{summary.shots}</b></div>
        <div><small>Total Community Likes</small><b><Heart size={14} color="var(--orange)"/> {summary.likes}</b></div>
      </div>
    )}

    {error ? <p className="muted">{error}</p> : !rows ? <p role="status">Loading leaderboard…</p> : <>
      {topThree.length > 0 && (
        <div className="podium-cards-grid">
          {topThree.map((u, idx) => {
            const level = Math.max(1, Math.floor(((u.photos || 0) * 20 + (u.likes || 0) * 2) / 250) + 1)
            const medalLabels = ['Gold Laureate', 'Silver Fellow', 'Bronze Finalist']
            return (
              <article key={u.id} className={`podium-card rank-${idx + 1}`} onClick={() => window.location.hash=`#user/${u.id}`}>
                <div className="podium-card-top">
                  <span className={`podium-rank-badge medal-${idx + 1}`}><Trophy size={13}/> #{String(idx + 1).padStart(2, '0')} · {medalLabels[idx]}</span>
                  <span className="podium-ai-pill">AI <b>{u.average_score}</b>/100</span>
                </div>
                <div className="podium-user">
                  <Avatar className="podium-avatar" user={u}/>
                  <div>
                    <strong>{u.username}</strong>
                    <small>Level {level} Photographer</small>
                  </div>
                </div>
                <div className="podium-metrics">
                  <div><small>Photos</small><b>{u.photos}</b></div>
                  <div><small>AI Avg</small><b>{u.average_score}</b></div>
                  <div><small>Likes</small><b><Heart size={12} color="var(--orange)"/> {u.likes}</b></div>
                </div>
                <div className="podium-card-foot">
                  <span>View full portfolio</span>
                  <ArrowUpRight size={14}/>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="leader-list">
        {sortedRows.map((u,i)=>{
          const lvl = Math.max(1, Math.floor(((u.photos || 0) * 20 + (u.likes || 0) * 2) / 250) + 1)
          return (
            <button className={`leader-row clickable ${i < 3 ? 'podium' : ''}`} key={u.id} onClick={() => window.location.hash=`#user/${u.id}`}>
              <b className="leader-rank">{String(i+1).padStart(2,'0')}</b>
              <Avatar className="leader-avatar" user={u}/>
              <div className="leader-name-wrap">
                <strong>{u.username}</strong>
                <small className="leader-lvl-pill">Lvl {lvl}</small>
              </div>
              <span>{u.photos} photos</span>
              <span className="leader-score-cell">
                <b>{u.average_score}</b> AI avg
                <i className="leader-mini-bar"><em style={{width:`${Math.min(100, u.average_score || 0)}%`}}/></i>
              </span>
              <span><Heart size={13} color="var(--orange)"/> {u.likes}</span>
            </button>
          )
        })}
      </div>
    </>}
  </main></Shell>
}

function PhotoPage({ id, onHome, notify }) {
  const [data,setData]=useState(null); const [error,setError]=useState(''); const [rating,setRating]=useState(0); const [report,setReport]=useState(false); const [reason,setReason]=useState('spam'); const [details,setDetails]=useState('');
  const [lightbox, setLightbox] = useState(false); const [fav, setFav] = useState(false);
  const [showHud, setShowHud] = useState(false);
  const [related, setRelated] = useState([]);
  async function photoPath(path){setData(null);setError('');try{const data=await api(path);setData(data);if(data?.photo?.place_id){api(`/places/${data.photo.place_id}`).then(pl=>setRelated((pl.photos||[]).filter(x=>String(x.id)!==String(data.photo.id)).slice(0,4))).catch(()=>{})}}catch(e){setError(e.message)}}
  React.useEffect(()=>{photoPath(`/photos/${id}`)},[id]);
  if(error)return <Shell onHome={onHome} notify={notify}><main className="sub-page"><h1>Photo unavailable</h1><p>{error}</p><button className="primary" onClick={()=>{setError('');photoPath(`/photos/${id}`)}}>Retry</button><button className="text-btn" onClick={onHome}>Back to explore</button></main></Shell>;
  if(!data)return <Shell onHome={onHome} notify={notify}><main className="sub-page"><p>Loading photo…</p></main></Shell>;
  const p=data.photo;
  const sendReport=async()=>{try{await api('/reports',{method:'POST',body:JSON.stringify({photo_id:id,reason,details})});setReport(false);setDetails('');notify('Report sent')}catch(e){notify(e.message)}};
  const sharePhoto=()=>{navigator.clipboard?.writeText(window.location.href).then(()=>notify('Photo link copied to clipboard')).catch(()=>notify('Link ready in address bar'))}
  const verdict = p.ai_score >= 92 ? 'Masterpiece composition & light balance' : p.ai_score >= 85 ? 'Strong editorial framing & color harmony' : 'Authentic capture with balanced exposure'
  const imgSrc = p.image_url || photoFallbackUrl(p.place_id || p.id)

  return <Shell onHome={onHome} notify={notify}><main className="sub-page detail-grid">
    <div className="detail-photo-frame">
      <div className="detail-photo-zoom-wrap" onClick={() => setLightbox(true)} title="Click to inspect fullscreen">
        <img className="detail-photo" src={imgSrc} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=photoFallbackUrl(p.id)}} alt={p.title}/>
        {showHud && (
          <div className="photo-hud-overlay" onClick={e => e.stopPropagation()}>
            <div className="hud-grid-line v1"/><div className="hud-grid-line v2"/>
            <div className="hud-grid-line h1"/><div className="hud-grid-line h2"/>
            <div className="hud-reticle">
              <span className="hud-reticle-tag">◎ AI Focus Lock · {p.sharpness}/100</span>
            </div>
            <div className="hud-telemetry-bar">
              <span>COMP {p.composition}%</span>
              <span>LIGHT {p.lighting}%</span>
              <span>COLOR {p.colors}%</span>
              <span>QUAL {p.visual_quality}%</span>
            </div>
          </div>
        )}
        <div className="photo-frame-controls" onClick={e => e.stopPropagation()}>
          <button type="button" className={`photo-hud-btn ${showHud ? 'active' : ''}`} onClick={() => setShowHud(v => !v)}>
            ⊞ {showHud ? 'Hide AI Grid' : 'AI Grid HUD'}
          </button>
          <button type="button" className="photo-zoom-badge" onClick={() => setLightbox(true)}>⤢ Fullscreen</button>
        </div>
      </div>
      <div className="detail-photo-caption">
        <span
          onClick={() => { if (p.place_id) window.location.hash = `#place/${p.place_id}` }}
          style={{ cursor: p.place_id ? 'pointer' : 'default' }}
          title={p.place_id ? 'Open place gallery' : ''}
        >
          <MapPin size={13} color="var(--orange)"/> {p.place_name || 'Featured location'}{p.city ? `, ${p.city}` : ''}
        </span>
        {Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)) && (
          <small>{Number(p.latitude).toFixed(4)}° N, {Number(p.longitude).toFixed(4)}° E</small>
        )}
      </div>
      <div className="detail-exif-strip">
        <span>📷 Sony A7R V · 24–70mm GM</span>
        <span>ƒ/2.8 · 1/500s · ISO 100</span>
        <span>☀ Golden Hour Natural Light</span>
      </div>
      <div className="detail-meta-pills">
        <span className="meta-chip"><Camera size={12}/> {p.category || 'Architecture'}</span>
        <span className="meta-chip"><Sparkles size={12}/> AI {p.ai_score}/100</span>
        <span className="meta-chip"><Heart size={12}/> {p.likes || 0} likes</span>
        <span className="meta-chip">👁 {p.views || 1} views</span>
      </div>

      {related.length > 0 && (
        <div className="detail-related-box">
          <div className="detail-related-head">
            <b>More captures from {p.place_name}</b>
            {p.place_id && <button type="button" className="text-btn" onClick={() => window.location.hash = `#place/${p.place_id}`}>View place ↗</button>}
          </div>
          <div className="detail-related-grid">
            {related.map(r => (
              <button key={r.id} type="button" className="detail-related-item" onClick={() => window.location.hash = `#photo/${r.id}`}>
                <img src={r.image_url || photoFallbackUrl(r.id)} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = photoFallbackUrl(r.id) }} alt={r.title}/>
                <span>AI {r.ai_score}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    <section className="detail-analysis-card">
      <div className="eyebrow"><span className="dot"/> Photo analysis</div>
      <h1>{p.title}</h1>
      <p className="muted">
        by <button className="author-link" onClick={() => window.location.hash = `#user/${p.user_id}`}>{p.username}</button>
        {' · '}
        {p.place_id ? (
          <button className="author-link" onClick={() => window.location.hash = `#place/${p.place_id}`}>{p.place_name}, {p.city}</button>
        ) : (
          <span>{p.place_name}, {p.city}</span>
        )}
      </p>
      <LocationPinMap latitude={p.latitude} longitude={p.longitude} label={p.place_name} height={195}/>
      <div className="detail-score-card">
        <div className="detail-score"><Score value={p.ai_score} large/></div>
        <div className="metrics">
          {[['Composition',p.composition],['Lighting',p.lighting],['Sharpness',p.sharpness],['Colors',p.colors],['Visual quality',p.visual_quality]].map(([n,v])=>(
            <div key={n}><span>{n}</span><b>{v}</b><i><em style={{width:`${v}%`}}/></i></div>
          ))}
        </div>
      </div>
      <div className="detail-verdict-banner">
        <Sparkles size={14} color="var(--orange)"/>
        <span><b>AI Critique Verdict:</b> {verdict}</span>
      </div>
      <div className="community">
        <b>Community rating</b>
        <span>{p.community_score||'—'} / 5 · {p.likes} likes · {p.views} views</span>
        <div>{[1,2,3,4,5].map(n=><button className={n<=rating?'rated':''} key={n} onClick={async()=>{try{setRating(n);await api(`/photos/${id}/rate`,{method:'POST',body:JSON.stringify({score:n})});notify('Rating saved')}catch(e){notify(e.message)}}}>★</button>)}</div>
      </div>
      <div className="detail-actions">
        <button className="primary" onClick={async()=>{try{await api(`/photos/${id}/like`,{method:'POST'});photoPath(`/photos/${id}`);notify('Updated like')}catch(e){notify(e.message)}}}><Heart size={14}/> Like ({p.likes || 0})</button>
        <button className="outline-btn" onClick={async()=>{try{const r=await api(`/photos/${id}/favorite`,{method:'POST'});setFav(Boolean(r.favorited ?? !fav));notify('Favorite updated')}catch(e){notify(e.message)}}}>{fav ? '♥ Saved in favorites' : '♡ Save to favorites'}</button>
        <button className="outline-btn" onClick={sharePhoto}><Share2 size={14}/> Share</button>
        <button className="report-link" onClick={()=>setReport(!report)}>Report photo</button>
      </div>
      {report&&<div className="report-box"><select value={reason} onChange={e=>setReason(e.target.value)}><option value="spam">Spam</option><option value="inappropriate">Inappropriate</option><option value="copyright">Copyright</option><option value="wrong_location">Wrong location</option><option value="other">Other</option></select><textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Details (optional)" maxLength="500"/><button className="primary" onClick={sendReport}>Send report</button></div>}
    </section>
    {lightbox && (
      <div className="lightbox-backdrop" onClick={() => setLightbox(false)}>
        <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
          <button type="button" className="lightbox-close" onClick={() => setLightbox(false)}>× Close</button>
          <img src={imgSrc} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=photoFallbackUrl(p.id)}} alt={p.title}/>
          <div className="lightbox-caption">
            <div>
              <strong>{p.title}</strong>
              <span>by @{p.username} · {p.place_name}, {p.city}</span>
            </div>
            <span className="podium-ai-pill">AI <b>{p.ai_score}</b>/100</span>
          </div>
        </div>
      </div>
    )}
  </main></Shell>
}

function PlacePage({ id, onHome, notify }) {
  const [data,setData]=useState(null); const [saved,setSaved]=useState(false); const [placeSort,setPlaceSort]=useState('ai_score');
  React.useEffect(()=>{api(`/places/${id}`).then(setData).catch(e=>notify(e.message))},[id]);
  if(!data)return <Shell onHome={onHome} notify={notify}><main className="sub-page"><p>Loading place…</p></main></Shell>;
  const sortedPhotos = [...(data.photos || [])].sort((a, b) => {
    if (placeSort === 'likes') return Number(b.likes || 0) - Number(a.likes || 0)
    if (placeSort === 'newest') return Number(b.id || 0) - Number(a.id || 0)
    return Number(b.ai_score || 0) - Number(a.ai_score || 0)
  })
  const copyCoords = () => {
    const coordsText = `${Number(data.place.latitude).toFixed(4)}, ${Number(data.place.longitude).toFixed(4)}`
    navigator.clipboard?.writeText(coordsText).then(() => notify(`GPS coordinates copied: ${coordsText}`)).catch(() => notify(coordsText))
  }
  return <Shell onHome={onHome} notify={notify}><main className="sub-page">
    <div className="place-hero-banner">
      <div>
        <div className="eyebrow"><span className="dot"/> Place gallery & field guide</div>
        <h1>{data.place.name}</h1>
        <p className="muted"><MapPin size={14} color="var(--orange)"/> {data.place.city}, {data.place.country} · {data.photos.length} photos · ★ {data.place.average_score}/100</p>
      </div>
      <div className="place-hero-actions">
        <div className="place-score-pill"><span>AVG AI</span><b>{data.place.average_score}<small>/100</small></b></div>
        {Number.isFinite(Number(data.place.latitude)) && (
          <button type="button" className="outline-btn" onClick={copyCoords}>
            📍 Copy GPS
          </button>
        )}
        <button className="outline-btn" onClick={async()=>{try{const r=await api(`/places/${id}/favorite`,{method:'POST'});setSaved(r.saved);notify(r.saved?'Place saved':'Place removed from saved')}catch(e){notify(e.message)}}}>{saved?'♥ Saved place':'♡ Save place'}</button>
      </div>
    </div>

    <div className="place-field-guide">
      <div className="field-guide-card">
        <span>☀ BEST LIGHT WINDOW</span>
        <b>Golden Hour & Blue Hour</b>
        <small>06:15–07:30 AM · 19:45–20:40 PM</small>
      </div>
      <div className="field-guide-card">
        <span>📷 RECOMMENDED OPTICS</span>
        <b>24–35mm Wide / 70mm</b>
        <small>ƒ/5.6–ƒ/8 for architectural sharpness</small>
      </div>
      <div className="field-guide-card">
        <span>🧭 VANTAGE & CROWD TIP</span>
        <b>Low Crowd at Sunrise</b>
        <small>Arrive 25 min before dawn for clean foreground</small>
      </div>
      <div className="field-guide-card">
        <span>🛰️ COORDINATES</span>
        <b>{Number(data.place.latitude || 48.8584).toFixed(4)}° N, {Number(data.place.longitude || 2.2945).toFixed(4)}° E</b>
        <small>Verified ShotMap landmark pin</small>
      </div>
    </div>

    {Number.isFinite(Number(data.place.latitude)) && Number.isFinite(Number(data.place.longitude)) && (
      <div style={{marginBottom: 26}}>
        <LocationPinMap latitude={data.place.latitude} longitude={data.place.longitude} label={data.place.name} height={220}/>
      </div>
    )}
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18,flexWrap:'wrap',gap:12}}>
      <h2 style={{margin:0,fontSize:22,letterSpacing:'-.5px'}}>Captured at {data.place.name}</h2>
      <div className="filter-chips">
        {[['ai_score','Best AI Score'],['likes','Most Liked'],['newest','Newest']].map(([k,lbl])=>(
          <button key={k} type="button" className={`filter-chip ${placeSort===k?'active':''}`} onClick={()=>setPlaceSort(k)}>{lbl}</button>
        ))}
      </div>
    </div>
    <div className="gallery place-rich-gallery">
      {sortedPhotos.map((p, idx)=>(
        <button key={p.id} className="place-gallery-card" onClick={()=>{window.location.hash=`#photo/${p.id}`}}>
          <img src={p.image_url||media(p.id)} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=media(p.id)}} alt={p.title}/>
          {idx === 0 && placeSort === 'ai_score' && <em className="top-shot-crown"><Trophy size={11}/> #1 Top Shot</em>}
          <span>AI {p.ai_score}</span>
          <div className="place-gallery-overlay">
            <strong>{p.title || 'Featured shot'}</strong>
            <small>{p.username ? `by ${p.username}` : 'Community capture'}{p.likes != null ? ` · ♥ ${p.likes}` : ''}</small>
          </div>
        </button>
      ))}
    </div>
  </main></Shell>
}

function ProfilePageV2({ onHome, notify }) {
  const token=localStorage.getItem('shotmap_token'); const [data,setData]=useState(null); const [error,setError]=useState(''); const [recommendations,setRecommendations]=useState([]); const [leaderboard,setLeaderboard]=useState([]); const [editing,setEditing]=useState(false); const [username,setUsername]=useState(''); const [avatar,setAvatar]=useState(''); const [theme,setTheme]=useState(localStorage.getItem('shotmap_theme')||'light');
  React.useEffect(()=>{let cancelled=false; (async()=>{if(!token){setError('Log in to view your profile.');return}try{const p=await api('/profile');if(cancelled)return;setData(p);setUsername(p.user.username);const results=await Promise.allSettled([api('/recommendations'),api('/leaderboard')]);if(cancelled)return;if(results[0].status==='fulfilled')setRecommendations(results[0].value.places||[]);if(results[1].status==='fulfilled')setLeaderboard(results[1].value.users||[])}catch(e){if(!cancelled)setError(e.message||'Profile request failed')}})();return()=>{cancelled=true}},[token]);
  if(error)return <Shell onHome={onHome}><main className="sub-page"><h1>Profile unavailable</h1><p className="muted">{error}</p><button className="primary" onClick={()=>window.dispatchEvent(new Event('shotmap:login'))}>Log in</button></main></Shell>; if(!data)return <Shell onHome={onHome}><main className="sub-page" role="status"><p>Loading profile…</p></main></Shell>; const rankIndex=leaderboard.findIndex(u=>u.id===data.user.id); const rank=rankIndex<0?'—':rankIndex+1; const average=data.photos.length?Math.round(data.photos.reduce((sum,p)=>sum+(p.ai_score||0),0)/data.photos.length):0; const points=data.photos.reduce((sum,p)=>sum+(p.ai_score||0),0)+data.photos.reduce((sum,p)=>sum+(p.likes||0),0)*5; const save=async()=>{try{const r=await api('/profile',{method:'PUT',body:JSON.stringify({username})});setData({...data,user:r.user});setEditing(false);notify('Profile updated')}catch(e){notify(e.message)}}; return <Shell onHome={onHome}><main className="sub-page"><div className="profile-head"><span className="profile-avatar">{data.user.username.slice(0,2).toUpperCase()}</span><div>{editing?<input className="auth-input" value={username} onChange={e=>setUsername(e.target.value)} maxLength="32"/>:<h1>{data.user.username}</h1>}<p className="muted">{data.photos.length} photos · {data.favorites.length} saved · {data.achievements.length} achievements</p></div><div className="detail-actions">{editing?<><button className="primary" onClick={save}>Save changes</button><button className="outline-btn" onClick={()=>setEditing(false)}>Cancel</button></>:<button className="outline-btn" onClick={()=>setEditing(true)}>Edit profile</button>}</div></div><div className="profile-metrics"><div><span>POINTS</span><b>{points}</b></div><div><span>GLOBAL RANK</span><b>#{rank}</b></div><div><span>PHOTO RATING</span><b>{average}/100</b></div><div><span>TOTAL LIKES</span><b>{data.photos.reduce((s,p)=>s+(p.likes||0),0)}</b></div></div><h2>My photos</h2><div className="gallery">{data.photos.map(p=><button key={p.id} onClick={()=>window.location.hash=`#photo/${p.id}`}><img src={p.image_url||photoFallbackUrl(p.id)} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=photoFallbackUrl(p.id)}}/><span>{p.ai_score}</span></button>)}</div><h2>Saved photos</h2><div className="gallery">{data.favorites.map(p=><button key={p.id} onClick={()=>window.location.hash=`#photo/${p.id}`}><img src={p.image_url||photoFallbackUrl(p.id)} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=photoFallbackUrl(p.id)}}/><span>{p.ai_score}</span></button>)}</div><h2>Recommended places</h2><div className="saved-places">{recommendations.map(p=><button key={p.id} onClick={()=>window.location.hash=`#place/${p.id}`}><b>{p.name}</b><span>{p.city}, {p.country} · {p.photos} photos</span></button>)}</div></main></Shell>
}
const GUEST_PREVIEW_NOTIFICATIONS = [
  { id: 'g1', type: 'like', message: 'LukasOrtega liked “Golden hour at the bridge” in Prague', read_at: null, created_at: new Date(Date.now() - 14 * 60000).toISOString() },
  { id: 'g2', type: 'rating', message: 'AnnaT rated “Blue hour in Barcelona” 5/5 ★', read_at: null, created_at: new Date(Date.now() - 48 * 60000).toISOString() },
  { id: 'g3', type: 'achievement', message: '🏆 Unlocked badge: High Score (AI score above 90/100)', read_at: null, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'g4', type: 'system', message: '📣 ShotMap AI Vision Engine v2.4 active — composition & golden-hour telemetry calibrated.', read_at: new Date().toISOString(), created_at: new Date(Date.now() - 18 * 3600000).toISOString() }
]

function formatNotifTime(iso) {
  if (!iso) return 'Just now'
  const diffMin = Math.max(0, (Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${Math.round(diffMin)}m ago`
  if (diffMin < 1440) return `${Math.round(diffMin / 60)}h ago`
  if (diffMin < 10080) return `${Math.round(diffMin / 1440)}d ago`
  return new Date(iso).toLocaleDateString()
}

function getNotifMeta(type) {
  if (type === 'like') return { label: 'LIKE', cls: 'type-like', Icon: Heart, fallback: '♥' }
  if (type === 'rating') return { label: 'RATING', cls: 'type-rating', Icon: Star, fallback: '★' }
  if (type === 'achievement') return { label: 'AWARD', cls: 'type-achievement', Icon: Trophy, fallback: '🏆' }
  return { label: 'SYSTEM', cls: 'type-system', Icon: Sparkles, fallback: '📣' }
}

function Notifications({ onClose, notify, onCountChange }) {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [isGuest, setIsGuest] = useState(false)

  React.useEffect(() => {
    const token = localStorage.getItem('shotmap_token')
    if (!token) {
      setIsGuest(true)
      setItems(GUEST_PREVIEW_NOTIFICATIONS)
      onCountChange?.(GUEST_PREVIEW_NOTIFICATIONS.filter(n => !n.read_at).length)
      return
    }
    api('/notifications')
      .then(x => {
        const list = x.notifications || []
        setIsGuest(false)
        setItems(list)
        onCountChange?.(list.filter(n => !n.read_at).length)
      })
      .catch(() => {
        setIsGuest(true)
        setItems(GUEST_PREVIEW_NOTIFICATIONS)
      })
  }, [])

  const unread = items.filter(n => !n.read_at).length
  const filtered = items.filter(n => {
    if (filter === 'unread') return !n.read_at
    if (filter === 'like') return n.type === 'like' || n.type === 'rating'
    if (filter === 'system') return n.type === 'system' || n.type === 'achievement'
    return true
  })

  const markItemRead = async (n) => {
    if (n.read_at) return
    const next = items.map(x => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)
    setItems(next)
    onCountChange?.(next.filter(x => !x.read_at).length)
    if (!isGuest) {
      await api(`/notifications/${n.id}/read`, { method: 'PATCH' }).catch(() => {})
    }
  }

  const markAll = async () => {
    if (!isGuest) {
      await api('/notifications/read', { method: 'POST' }).catch(() => {})
    }
    const next = items.map(x => ({ ...x, read_at: x.read_at || new Date().toISOString() }))
    setItems(next)
    onCountChange?.(0)
    notify?.('All notifications marked read')
  }

  const openInStudio = () => {
    sessionStorage.setItem('shotmap_studio_tab', 'Notifications')
    window.dispatchEvent(new CustomEvent('shotmap:studio-tab', { detail: 'Notifications' }))
    onClose?.()
    window.location.hash = '#profile'
  }

  return (
    <>
      <div className="popover-backdrop" onClick={onClose}/>
      <div className="popover" role="dialog" aria-label="Notifications">
        <div className="popover-head">
          <div className="popover-title-wrap">
            <span className="popover-bell-chip"><Bell size={14}/></span>
            <b>Notifications{unread ? <span className="badge">{unread}</span> : null}</b>
          </div>
          <div className="popover-head-actions">
            <button type="button" className="popover-mark-btn" onClick={markAll} disabled={!unread}>
              Mark all read
            </button>
            <button type="button" className="modal-close popover-close-inline" aria-label="Close notifications" onClick={onClose}>×</button>
          </div>
        </div>

        {isGuest && (
          <div className="popover-guest-banner">
            <span>Previewing live ShotMap activity</span>
            <button type="button" onClick={() => { onClose?.(); window.dispatchEvent(new Event('shotmap:login')) }}>
              Sign in ↗
            </button>
          </div>
        )}

        <div className="popover-filter-bar">
          {[
            ['all', `All (${items.length})`],
            ['unread', `Unread (${unread})`],
            ['like', 'Likes & ★'],
            ['system', 'Awards & AI']
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`popover-filter-pill ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="popover-list">
          {filtered.length ? filtered.map(n => {
            const meta = getNotifMeta(n.type)
            const Icon = meta.Icon
            return (
              <div
                className={`${n.read_at ? 'notice read' : 'notice'} ${meta.cls}`}
                key={n.id}
                onClick={() => markItemRead(n)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') markItemRead(n) }}
              >
                <span className={`notice-icon-badge ${meta.cls}`} aria-hidden="true">
                  <Icon size={14}/>
                </span>
                <div className="notice-content">
                  <div className="notice-meta-row">
                    <em className={`notice-type-tag ${meta.cls}`}>{meta.label}</em>
                    <small className="notice-time">{formatNotifTime(n.created_at)}</small>
                    {!n.read_at && <i className="notice-unread-dot" title="Unread"/>}
                  </div>
                  <p className="notice-msg">{n.message}</p>
                </div>
              </div>
            )
          }) : (
            <div className="popover-empty">
              <Bell size={20}/>
              <p className="muted">No notifications in this filter.</p>
            </div>
          )}
        </div>

        <div className="popover-foot">
          <button type="button" className="popover-studio-btn" onClick={openInStudio}>
            <span>Open Notification Center in Studio</span>
            <ArrowUpRight size={14}/>
          </button>
        </div>
      </div>
    </>
  )
}

function AdminPage({ onHome, notify }) {
  const [reports,setReports]=useState([]); const [users,setUsers]=useState([]); const [photos,setPhotos]=useState([]); const [adminPlaces,setAdminPlaces]=useState([]); const [error,setError]=useState(''); const [overview,setOverview]=useState(null); const [settings,setSettings]=useState({mode:'test',endpoint:'',model:'',api_key:''}); const [saving,setSaving]=useState(false); const [adminTab,setAdminTab]=useState('all'); const [adminQuery,setAdminQuery]=useState(''); const [userFilter,setUserFilter]=useState('all'); const [reportFilter,setReportFilter]=useState('all');
  const [showBroadcast,setShowBroadcast]=useState(false); const [broadcastMsg,setBroadcastMsg]=useState(''); const [sendingBroadcast,setSendingBroadcast]=useState(false);
  const [showAddPlace,setShowAddPlace]=useState(false); const [newPlace,setNewPlace]=useState({name:'',city:'',country:'',latitude:'',longitude:'',average_score:90});
  const [diagResult,setDiagResult]=useState(null); const [rescoringId,setRescoringId]=useState(null);

  const load=async()=>{try{const [r,u,p,o,ai,pl]=await Promise.all([api('/admin/reports'),api('/admin/users'),api('/admin/photos'),api('/admin/overview'),api('/admin/ai-settings'),api('/admin/places').catch(()=>({places:[]}))]);setReports(r.reports||[]);setUsers(u.users||[]);setPhotos(p.photos||[]);setOverview(o.stats);setSettings({...ai.settings,api_key:''});setAdminPlaces(pl.places||[]);setError('')}catch(e){setError(e.message)}};
  React.useEffect(()=>{load()},[]);
  const saveAI=async()=>{setSaving(true);try{const payload={mode:settings.mode,endpoint:settings.endpoint,model:settings.model};if(settings.api_key)payload.api_key=settings.api_key;const r=await api('/admin/ai-settings',{method:'PUT',body:JSON.stringify(payload)});setSettings({...r.settings,api_key:''});await load();notify(r.settings.api_key_set?'AI settings saved; key stored securely':'AI settings saved')}catch(e){notify(e.message)}finally{setSaving(false)}};
  const resolve=async(id,status)=>{try{await api(`/admin/reports/${id}`,{method:'PATCH',body:JSON.stringify({status})});await load();notify(`Report #${id} marked ${status}`)}catch(e){notify(e.message)}};
  const resolveAllOpen=async()=>{const openList=reports.filter(r=>r.status==='open');if(!openList.length)return notify('No open reports to resolve');try{await Promise.all(openList.map(r=>api(`/admin/reports/${r.id}`,{method:'PATCH',body:JSON.stringify({status:'resolved'})})));await load();notify(`Resolved ${openList.length} open reports`)}catch(e){notify(e.message)}};
  const remove=async(id)=>{if(!confirm('Delete this photo?'))return;try{await api(`/admin/photos/${id}`,{method:'DELETE'});await load();notify('Photo deleted')}catch(e){notify(e.message)}};
  const rescorePhoto=async(id)=>{setRescoringId(id);try{const r=await api(`/admin/photos/${id}/rescore`,{method:'POST'});await load();notify(`Photo #${id} re-scored: AI ${r.metrics.overallScore}/100`)}catch(e){notify(e.message)}finally{setRescoringId(null)}};
  const runDiagnostics=async()=>{if(!photos.length)return notify('No photos available to test');const target=photos[0];setRescoringId(target.id);try{const r=await api(`/admin/photos/${target.id}/rescore`,{method:'POST'});setDiagResult({photoTitle:target.title,...r.metrics});await load();notify(`AI Diagnostic complete: ${r.metrics.overallScore}/100`)}catch(e){notify(e.message)}finally{setRescoringId(null)}};
  const sendBroadcast=async(e)=>{e.preventDefault();if(!broadcastMsg.trim()||sendingBroadcast)return;setSendingBroadcast(true);try{const r=await api('/admin/broadcast',{method:'POST',body:JSON.stringify({message:broadcastMsg.trim()})});setBroadcastMsg('');setShowBroadcast(false);notify(`Broadcast sent to ${r.sent} users`)}catch(err){notify(err.message)}finally{setSendingBroadcast(false)}};
  const createPlace=async(e)=>{e.preventDefault();try{await api('/admin/places',{method:'POST',body:JSON.stringify(newPlace)});setNewPlace({name:'',city:'',country:'',latitude:'',longitude:'',average_score:90});setShowAddPlace(false);await load();notify('New landmark added to ShotMap')}catch(err){notify(err.message)}};
  const deletePlace=async(id)=>{if(!confirm('Remove this place from ShotMap?'))return;try{await api(`/admin/places/${id}`,{method:'DELETE'});await load();notify('Place removed')}catch(err){notify(err.message)}};
  const exportSnapshot=()=>{
    const payload = { exportedAt: new Date().toISOString(), overview, usersCount: users.length, photosCount: photos.length, placesCount: adminPlaces.length, reports, users, photos, places: adminPlaces }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shotmap-admin-snapshot-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    notify('Admin JSON snapshot downloaded')
  }
  const resetDemo=async()=>{
    try {
      await api('/admin/reset-demo', { method: 'POST' })
      await load()
      notify('Demo database restored to initial state')
    } catch (e) { notify(e.message) }
  }

  const q = adminQuery.trim().toLowerCase()
  const filteredReports = reports.filter(r => {
    if (reportFilter !== 'all' && r.status !== reportFilter) return false
    return !q || `${r.reason} ${r.details || ''} ${r.title} ${r.username} ${r.status}`.toLowerCase().includes(q)
  })
  const filteredUsers = users.filter(u => {
    if (userFilter === 'admin' && u.role !== 'admin') return false
    if (userFilter === 'user' && u.role !== 'user') return false
    if (userFilter === 'restricted' && !u.banned_until && !u.posting_restricted_until) return false
    return !q || `${u.username} ${u.email} ${u.role}`.toLowerCase().includes(q)
  })
  const filteredPhotos = photos.filter(p => !q || `${p.title} ${p.username} ${p.place_name || ''} ${p.category || ''}`.toLowerCase().includes(q))
  const filteredPlaces = adminPlaces.filter(pl => !q || `${pl.name} ${pl.city} ${pl.country}`.toLowerCase().includes(q))
  const openReportsCount = overview?.reports ?? reports.filter(r=>r.status==='open').length

  return <Shell onHome={onHome}><main className="sub-page admin-page">
    <div className="admin-top-bar">
      <div className="eyebrow"><span className="dot"/> Restricted area · SQLite Command Center</div>
      <div className="admin-health-pills">
        <span><CheckCircle2 size={12} color="var(--green)"/> SQLite WAL Active</span>
        <span><Sparkles size={12} color="var(--orange)"/> AI Mode: {settings.mode === 'api' ? 'External API' : 'Heuristic Test'}</span>
        <span><Star size={12} color="var(--orange)"/> Avg AI: {overview?.avg_ai || 88.5}/100</span>
        <span><Shield size={12}/> CSP & HSTS Protected</span>
      </div>
    </div>

    <div className="admin-head">
      <div>
        <h1>Admin dashboard</h1>
        <p className="muted">Moderation, database, landmarks, user roles and AI vision telemetry</p>
      </div>
      <div className="admin-head-actions">
        <div className="search admin-search">
          <Search size={15}/>
          <input value={adminQuery} onChange={e=>setAdminQuery(e.target.value)} placeholder="Filter users, photos, places, reports..."/>
        </div>
        <button type="button" className={`outline-btn ${showBroadcast ? 'active-tool-btn' : ''}`} onClick={() => { setShowBroadcast(v => !v); setShowAddPlace(false) }}>
          <Bell size={14}/> Broadcast
        </button>
        <button type="button" className={`outline-btn ${showAddPlace ? 'active-tool-btn' : ''}`} onClick={() => { setShowAddPlace(v => !v); setShowBroadcast(false) }}>
          <MapPin size={14}/> + Add place
        </button>
        <button type="button" className="outline-btn" onClick={exportSnapshot}>
          ⬇ Export JSON
        </button>
        <button type="button" className="outline-btn" onClick={resetDemo}>
          ↺ Reset Demo
        </button>
        <button type="button" className="outline-btn" onClick={load}>Refresh</button>
      </div>
    </div>

    {showBroadcast && (
      <form className="admin-drawer-card" onSubmit={sendBroadcast}>
        <div className="admin-drawer-head">
          <div>
            <div className="eyebrow">System notification</div>
            <h3>Broadcast announcement to all {users.length} photographers</h3>
          </div>
          <button type="button" className="text-btn" onClick={() => setShowBroadcast(false)}>Close ×</button>
        </div>
        <div className="filter-chips" style={{marginBottom: 12}}>
          {[
            'Weekend Golden Hour Challenge is now live! Upload your best shot.',
            'AI Vision critique model updated with enhanced lighting & color telemetry.',
            'New world landmarks added to the interactive ShotMap.'
          ].map(preset => (
            <button key={preset} type="button" className="filter-chip" onClick={() => setBroadcastMsg(preset)}>
              + {preset.slice(0, 44)}…
            </button>
          ))}
        </div>
        <div className="admin-drawer-row">
          <input
            className="auth-input"
            value={broadcastMsg}
            onChange={e => setBroadcastMsg(e.target.value)}
            placeholder="Write a notification message for all users..."
            maxLength={280}
            required
          />
          <button className="primary" type="submit" disabled={sendingBroadcast || !broadcastMsg.trim()}>
            <Bell size={14}/> {sendingBroadcast ? 'Sending…' : 'Send broadcast'}
          </button>
        </div>
      </form>
    )}

    {showAddPlace && (
      <form className="admin-drawer-card" onSubmit={createPlace}>
        <div className="admin-drawer-head">
          <div>
            <div className="eyebrow">Map directory</div>
            <h3>Add a new landmark to ShotMap</h3>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <small className="muted">Quick presets:</small>
            {[
              { name: 'Mont Saint-Michel', city: 'Normandy', country: 'France', latitude: 48.6361, longitude: -1.5115, average_score: 93 },
              { name: 'Fushimi Inari Taisha', city: 'Kyoto', country: 'Japan', latitude: 34.9671, longitude: 135.7727, average_score: 94 },
              { name: 'Matterhorn Viewpoint', city: 'Zermatt', country: 'Switzerland', latitude: 45.9766, longitude: 7.6585, average_score: 95 }
            ].map(preset => (
              <button key={preset.name} type="button" className="filter-chip" onClick={() => setNewPlace(preset)}>
                {preset.name}
              </button>
            ))}
            <button type="button" className="text-btn" onClick={() => setShowAddPlace(false)}>Close ×</button>
          </div>
        </div>
        <div className="admin-place-form-grid">
          <input className="auth-input" placeholder="Landmark name (e.g. Mont Saint-Michel)" value={newPlace.name} onChange={e=>setNewPlace({...newPlace,name:e.target.value})} required/>
          <input className="auth-input" placeholder="City" value={newPlace.city} onChange={e=>setNewPlace({...newPlace,city:e.target.value})} required/>
          <input className="auth-input" placeholder="Country" value={newPlace.country} onChange={e=>setNewPlace({...newPlace,country:e.target.value})} required/>
          <input className="auth-input" type="number" step="any" placeholder="Latitude (e.g. 48.6361)" value={newPlace.latitude} onChange={e=>setNewPlace({...newPlace,latitude:e.target.value})} required/>
          <input className="auth-input" type="number" step="any" placeholder="Longitude (e.g. -1.5115)" value={newPlace.longitude} onChange={e=>setNewPlace({...newPlace,longitude:e.target.value})} required/>
          <button className="primary" type="submit"><MapPin size={14}/> Create landmark</button>
        </div>
      </form>
    )}

    {error&&<div className="error-box">{error}</div>}

    <div className="admin-stats">
      {[
        ['Users', overview?.users??users.length, `${users.filter(u=>u.role==='admin').length} admins · ${users.filter(u=>!u.banned_until).length} active`, Users],
        ['Photos', overview?.photos??photos.length, `Avg AI ${overview?.avg_ai || 88}/100 · ♥ ${overview?.total_likes || 0} likes`, ImageIcon],
        ['Places', overview?.places??adminPlaces.length, 'Mapped global locations', MapPin],
        ['Open reports', openReportsCount, `${reports.length} total in queue`, Shield]
      ].map(([label,value,sub,Icon])=>(
        <b key={label} className="admin-kpi-card">
          <div className="admin-kpi-top">
            <small>{label}</small>
            <span className="admin-kpi-icon"><Icon size={16}/></span>
          </div>
          <div className="admin-kpi-val">{value}</div>
          <span className="admin-stat-sub">{sub}</span>
        </b>
      ))}
    </div>

    <div className="admin-bento-grid">
      <section className="admin-ai-card">
        <div className="admin-card-head-row">
          <div>
            <div className="eyebrow">Photo processing</div>
            <h2>AI provider</h2>
            <p className="muted">Test mode runs locally. API mode sends the photo to a vision chat model. Use a /v1 base URL or /chat/completions endpoint, not an image-generation model.</p>
          </div>
          <span className={`ai-mode-badge ${settings.mode === 'api' ? 'live' : 'test'}`}>
            {settings.mode === 'api' ? '● External Vision API' : '● Local Heuristic Engine'}
          </span>
        </div>
        <div className="admin-ai-fields-grid">
          <label>Mode<select value={settings.mode} onChange={e=>setSettings({...settings,mode:e.target.value})}><option value="test">Test mode</option><option value="api">External API</option></select></label>
          <label>Model<input className="auth-input" value={settings.model||''} onChange={e=>setSettings({...settings,model:e.target.value})} placeholder="gpt-4o-mini / vision-model" disabled={settings.mode!=='api'}/></label>
          <label className="span-2">Endpoint<input className="auth-input" value={settings.endpoint||''} onChange={e=>setSettings({...settings,endpoint:e.target.value})} placeholder="https://api.openai.com/v1/chat/completions" disabled={settings.mode!=='api'}/></label>
          <label className="span-2">API key<input className="auth-input" type="password" value={settings.api_key||''} onChange={e=>setSettings({...settings,api_key:e.target.value})} placeholder={settings.api_key_set?'Saved — leave empty to keep it':'sk-…'} disabled={settings.mode!=='api'}/></label>
        </div>
        <div className="admin-ai-actions">
          <button className="primary" onClick={saveAI} disabled={saving}>{saving?'Saving…':'Save AI settings'}</button>
          <button type="button" className="outline-btn" onClick={runDiagnostics} disabled={rescoringId !== null}>
            <Sparkles size={14}/> {rescoringId ? 'Testing…' : 'Test AI pipeline'}
          </button>
        </div>
        {diagResult && (
          <div className="admin-diag-box">
            <div className="admin-diag-head">
              <b><Sparkles size={13} color="var(--orange)"/> Diagnostic sample: “{diagResult.photoTitle}”</b>
              <span className="podium-ai-pill">Overall {diagResult.overallScore}/100</span>
            </div>
            <div className="admin-diag-bars">
              {[['Composition', diagResult.composition], ['Lighting', diagResult.lighting], ['Sharpness', diagResult.sharpness], ['Colors', diagResult.colors]].map(([k, v]) => (
                <div key={k}><small>{k} <b>{v}</b></small><i><em style={{width:`${v}%`}}/></i></div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="admin-telemetry-card">
        <div className="eyebrow">Platform analytics</div>
        <h2>Category & AI telemetry</h2>
        <p className="muted">Live distribution of published shots and average AI quality scores across categories.</p>
        <div className="admin-mini-kpis">
          <div><small>Avg AI Score</small><b>{overview?.avg_ai || 88.5}</b></div>
          <div><small>Total Likes</small><b>{overview?.total_likes || 0}</b></div>
          <div><small>Total Views</small><b>{overview?.total_views || 0}</b></div>
          <div><small>Encrypted Key</small><b>{settings.api_key_set ? 'Set ✓' : 'Local'}</b></div>
        </div>
        <div className="admin-category-bars">
          {(overview?.categories?.length ? overview.categories : [
            { category: 'City', count: photos.length || 12, avg_score: 89 },
            { category: 'Architecture', count: 6, avg_score: 92 },
            { category: 'Landscape', count: 4, avg_score: 90 }
          ]).map(cat => {
            const pct = Math.min(100, Math.max(12, Math.round((cat.count / Math.max(1, photos.length)) * 100)))
            return (
              <div key={cat.category || 'Uncategorized'} className="admin-cat-row">
                <div className="admin-cat-meta">
                  <strong>{cat.category || 'City'}</strong>
                  <span>{cat.count} photos · ★ <b>{cat.avg_score}</b> AI avg</span>
                </div>
                <div className="admin-cat-bar"><em style={{ width: `${pct}%` }}/></div>
              </div>
            )
          })}
        </div>
      </section>
    </div>

    <div className="admin-tabs-bar">
      <div className="filter-chips">
        {[
          ['all', 'All sections'],
          ['reports', `Reports (${filteredReports.length})`],
          ['users', `Users (${filteredUsers.length})`],
          ['photos', `Recent photos (${filteredPhotos.length})`],
          ['places', `Places (${filteredPlaces.length})`]
        ].map(([key, label]) => (
          <button key={key} type="button" className={`filter-chip ${adminTab===key?'active':''}`} onClick={()=>setAdminTab(key)}>{label}</button>
        ))}
      </div>
    </div>

    {(adminTab === 'all' || adminTab === 'reports') && <>
      <div className="admin-section-header">
        <div>
          <h2>Reports</h2>
          <p className="muted">Community flags awaiting moderator review</p>
        </div>
        <div className="admin-section-tools">
          <div className="filter-chips">
            {['all','open','reviewed','resolved','rejected'].map(st => (
              <button key={st} type="button" className={`filter-chip ${reportFilter===st?'active':''}`} onClick={()=>setReportFilter(st)}>
                {st === 'all' ? 'All statuses' : st}
              </button>
            ))}
          </div>
          {openReportsCount > 0 && (
            <button type="button" className="outline-btn" onClick={resolveAllOpen}>
              ✓ Resolve all open ({openReportsCount})
            </button>
          )}
        </div>
      </div>
      {filteredReports.length ? <div className="admin-table">
        {filteredReports.map(r=>(
          <div key={r.id} className="admin-report-row">
            <div className="admin-photo-cell" onClick={()=>r.photo_id&&(window.location.hash=`#photo/${r.photo_id}`)} style={{cursor:'pointer'}}>
              <img className="admin-photo-thumb" src={r.image_url||photoFallbackUrl(r.photo_id||r.id)} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=photoFallbackUrl(r.id)}} alt={r.title}/>
              <div>
                <b>#{r.id} <span className="report-reason-tag">{r.reason.replace('_',' ')}</span></b>
                <small className="muted" style={{display:'block',fontSize:11,marginTop:2}}>
                  {r.details || 'Flagged for moderator inspection'}
                </small>
              </div>
            </div>
            <span>
              <strong>{r.title}</strong>
              <small className="muted" style={{display:'block',fontSize:11}}>Reported by @{r.username} · AI {r.ai_score || 88}/100</small>
            </span>
            <em className={`status-pill status-${r.status}`}>{r.status}</em>
            <div className="admin-row-actions">
              <select value={r.status} onChange={e=>resolve(r.id,e.target.value)}>
                <option>open</option><option>reviewed</option><option>resolved</option><option>rejected</option>
              </select>
              {r.status !== 'resolved' && (
                <button type="button" onClick={()=>resolve(r.id,'resolved')}>Resolve ✓</button>
              )}
              {r.photo_id && (
                <button type="button" onClick={()=>window.location.hash=`#photo/${r.photo_id}`}>Inspect ↗</button>
              )}
            </div>
          </div>
        ))}
      </div> : <p className="muted">No reports matching this filter.</p>}
    </>}

    {(adminTab === 'all' || adminTab === 'users') && <>
      <div className="admin-section-header">
        <div>
          <h2>Users</h2>
          <p className="muted">Manage community accounts, roles and publishing permissions</p>
        </div>
        <div className="filter-chips">
          {[['all','All users'],['admin','Admins'],['user','Photographers'],['restricted','Banned / Restricted']].map(([k,lbl]) => (
            <button key={k} type="button" className={`filter-chip ${userFilter===k?'active':''}`} onClick={()=>setUserFilter(k)}>{lbl}</button>
          ))}
        </div>
      </div>
      <div className="admin-table">
        {filteredUsers.map(u=>{
          const isRestricted = Boolean(u.banned_until || u.posting_restricted_until)
          return (
            <div key={u.id} className="admin-user-row">
              <div className="admin-user-cell" onClick={()=>window.location.hash=`#user/${u.id}`} style={{cursor:'pointer'}}>
                <Avatar user={u} className="leader-avatar"/>
                <div>
                  <b>#{u.id} {u.username}</b>
                  <small className="muted" style={{display:'block',fontSize:11}}>{u.email}</small>
                </div>
              </div>
              <span>
                <em className={`user-state-dot ${isRestricted ? 'warn' : 'ok'}`}/>
                {u.banned_until?'Banned until '+new Date(u.banned_until).toLocaleDateString():u.posting_restricted_until?'Posting restricted until '+new Date(u.posting_restricted_until).toLocaleDateString():'Active'}
                <small className="muted" style={{display:'block',fontSize:11,marginTop:2}}>{u.photos || 0} photos · ★ {u.avg_score || 0} AI avg</small>
              </span>
              <em className={`role-pill role-${u.role}`}>{u.role}</em>
              <div className="admin-row-actions">
                {isRestricted && (
                  <button onClick={async()=>{await api(`/admin/users/${u.id}`,{method:'PATCH',body:JSON.stringify({action:'unban'})});await load();notify('User restored to active')}}>Restore ✓</button>
                )}
                {u.role!=='admin' ? <>
                  <button onClick={async()=>{await api(`/admin/users/${u.id}`,{method:'PATCH',body:JSON.stringify({action:'ban',days:7})});await load();notify('User banned for 7 days')}}>Ban 7d</button>
                  <button onClick={async()=>{await api(`/admin/users/${u.id}`,{method:'PATCH',body:JSON.stringify({action:'restrict',days:7})});await load();notify('Publishing restricted for 7 days')}}>Restrict 7d</button>
                  <button onClick={async()=>{await api(`/admin/users/${u.id}`,{method:'PATCH',body:JSON.stringify({action:'promote'})});await load();notify(`${u.username} promoted to admin`)}}>Make Admin</button>
                  <button className="danger-btn" onClick={async()=>{if(confirm('Delete this user?')){await api(`/admin/users/${u.id}`,{method:'DELETE'});await load();notify('User deleted')}}}>Delete</button>
                </> : (
                  <span className="muted" style={{fontSize:11,padding:'0 8px'}}>Protected Admin</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>}

    {(adminTab === 'all' || adminTab === 'photos') && <>
      <div className="admin-section-header">
        <div>
          <h2>Recent photos</h2>
          <p className="muted">Inspect AI sub-scores, re-run neural critique, or remove policy-violating uploads</p>
        </div>
      </div>
      <div className="admin-table">
        {filteredPhotos.map(p=>(
          <div key={p.id} className="admin-photo-row">
            <div className="admin-photo-cell" onClick={()=>window.location.hash=`#photo/${p.id}`} style={{cursor:'pointer'}}>
              <img className="admin-photo-thumb" src={p.image_url||photoFallbackUrl(p.id)} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=photoFallbackUrl(p.id)}} alt={p.title}/>
              <div>
                <b>#{p.id} {p.title}</b>
                <small className="muted" style={{display:'block',fontSize:11,marginTop:2}}>
                  by @{p.username} · {p.place_name||'No place'} · <span className="admin-cat-tag">{p.category||'City'}</span>
                </small>
              </div>
            </div>
            <div className="admin-photo-telemetry">
              <span className="admin-ai-badge">AI <strong>{p.ai_score}</strong>/100</span>
              <div className="admin-submetrics">
                <span title="Composition">C:{p.composition||90}</span>
                <span title="Lighting">L:{p.lighting||88}</span>
                <span title="Sharpness">S:{p.sharpness||89}</span>
                <span title="Colors">Co:{p.colors||91}</span>
              </div>
              {p.error && <small className="admin-err-note">{p.error}</small>}
            </div>
            <em><Heart size={12} color="var(--orange)"/> {p.likes} likes</em>
            <div className="admin-row-actions">
              <button onClick={()=>rescorePhoto(p.id)} disabled={rescoringId===p.id}>
                <Sparkles size={12}/> {rescoringId===p.id?'Scoring…':'Re-score AI'}
              </button>
              <button onClick={()=>window.location.hash=`#photo/${p.id}`}>Open ↗</button>
              <button className="danger-btn" onClick={()=>remove(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>}

    {(adminTab === 'all' || adminTab === 'places') && <>
      <div className="admin-section-header">
        <div>
          <h2>Mapped places</h2>
          <p className="muted">Landmarks and coordinates indexed on the interactive ShotMap</p>
        </div>
        <button type="button" className="outline-btn" onClick={() => setShowAddPlace(true)}>
          <MapPin size={14}/> + Add new place
        </button>
      </div>
      <div className="admin-table">
        {filteredPlaces.map(pl=>(
          <div key={pl.id} className="admin-place-row">
            <div className="admin-photo-cell" onClick={()=>window.location.hash=`#place/${pl.id}`} style={{cursor:'pointer'}}>
              <img className="admin-photo-thumb" src={media(pl.id)} alt={pl.name}/>
              <div>
                <b>#{pl.id} {pl.name}</b>
                <small className="muted" style={{display:'block',fontSize:11,marginTop:2}}>{pl.city}, {pl.country}</small>
              </div>
            </div>
            <span style={{fontFamily:'"DM Mono", monospace',fontSize:11}}>
              {Number(pl.latitude).toFixed(4)}°, {Number(pl.longitude).toFixed(4)}°
            </span>
            <span><strong>{pl.photos || 0}</strong> photos · ★ <b>{pl.average_score}</b>/100</span>
            <div className="admin-row-actions">
              <button onClick={()=>window.location.hash=`#place/${pl.id}`}>Open place ↗</button>
              <button className="danger-btn" onClick={()=>deletePlace(pl.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>}
  </main></Shell>
}

function App() {
  const [menu, setMenu] = useState(false)
  const [theme,setTheme] = useState(() => localStorage.getItem('shotmap_theme') || 'light')
  const [search, setSearch] = useState('')
  const [mapChip, setMapChip] = useState('All')
  const [heroIndex, setHeroIndex] = useState(0)
  const [activePlace, setActivePlace] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [authMode, setAuthMode] = useState(null)
  const [authForm, setAuthForm] = useState({username:'',email:'',password:'',token:''})
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [uploaded, setUploaded] = useState(null)
  const [uploadPlace,setUploadPlace]=useState(null)
  const [uploadTitle,setUploadTitle]=useState('')
  const [ownership,setOwnership]=useState(false)
  const [uploadBusy,setUploadBusy]=useState(false)
  const [guessing,setGuessing]=useState(false)
  const [locationGuess, setLocationGuess] = useState(null)
  const [toast, setToast] = useState('')
  const [user, setUser] = useState(null)
  const [dbPlaces, setDbPlaces] = useState([])
  const [dbShots, setDbShots] = useState([])
  const [photoPage, setPhotoPage] = useState(1)
  const searchInputRef = useRef(null)

  React.useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  React.useEffect(() => { if(!user) { setUnreadCount(3); return } let cancelled = false; const tick = () => api('/notifications').then(x => { if(!cancelled) setUnreadCount((x.notifications||[]).filter(n => !n.read_at).length) }).catch(() => {}); tick(); const t = window.setInterval(tick, 30000); return () => { cancelled = true; window.clearInterval(t) } }, [user, showNotifications])
  const [photoPages, setPhotoPages] = useState(1)
  const [photoFilter, setPhotoFilter] = useState({category:'',photoType:'',radiusKm:0,min_score:0,sort:'ai_score'})
  const [leaderboard, setLeaderboard] = useState([])
  React.useEffect(()=>{const refresh=()=>{api('/leaderboard').then(x=>setLeaderboard(x.users)).catch(()=>{});api('/me').then(x=>setUser(x.user)).catch(()=>{})};window.addEventListener('shotmap:profile-updated',refresh);window.addEventListener('hashchange',refresh);return()=>{window.removeEventListener('shotmap:profile-updated',refresh);window.removeEventListener('hashchange',refresh)}},[])
  React.useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('shotmap_theme',theme)},[theme])
  React.useEffect(() => { api('/places').then(({places}) => setDbPlaces(places)).catch(() => {}); api(`/photos?sort=${photoFilter.sort}&category=${encodeURIComponent(photoFilter.category)}&type=${encodeURIComponent(photoFilter.photoType)}&radius_km=${photoFilter.radiusKm}&lat=48.8&lng=12.8&min_score=${photoFilter.min_score}&page=${photoPage}&limit=6`).then(({photos,pagination}) => { setDbShots(photos); setPhotoPages(pagination.pages) }).catch(() => {}); api('/leaderboard').then(({users}) => setLeaderboard(users)).catch(() => {}); const token=localStorage.getItem('shotmap_token'); if(token) api('/me').then(({user})=>setUser(user)).catch(()=>localStorage.removeItem('shotmap_token')) }, [photoFilter,photoPage])

  const livePlaces = dbPlaces.length ? dbPlaces.map((p,i) => ({
    ...p,
    city: `${p.city}, ${p.country}`,
    photos: `${p.photos} photos`,
    score: p.average_score,
    image: media(p.id),
    x: places[i%places.length].x,
    y: places[i%places.length].y,
    id: p.id,
    category: places[i%places.length].category,
    coords: Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))
      ? `${Math.abs(Number(p.latitude)).toFixed(4)}° ${Number(p.latitude)>=0?'N':'S'}, ${Math.abs(Number(p.longitude)).toFixed(4)}° ${Number(p.longitude)>=0?'E':'W'}`
      : places[i%places.length].coords
  })) : places

  const liveShots = dbShots.length ? dbShots.map(s => ({image:s.image_url,title:s.title,author:s.username,place:s.place_name,score:s.ai_score,likes:s.likes||0,userId:s.user_id||1,avatar:s.username?.slice(0,2).toUpperCase(),id:s.id})) : shots

  const filteredPlaces = useMemo(() => {
    return livePlaces.filter(p => {
      const matchesText = `${p.name} ${p.city}`.toLowerCase().includes(search.toLowerCase())
      if (!matchesText) return false
      if (mapChip === 'All') return true
      if (mapChip === 'Top 90+') return Number(p.score) >= 90
      if (mapChip === 'Europe') return /(Czech|France|Spain|Italy|Prague|Paris|Barcelona|Rome)/i.test(`${p.city} ${p.country || ''}`)
      return (p.category || '').toLowerCase() === mapChip.toLowerCase()
    })
  }, [search, livePlaces, mapChip])

  const heroCards = useMemo(() => {
    const base = places
    const idx = heroIndex % base.length
    return [
      base[(idx + 3) % base.length],
      base[(idx + 1) % base.length],
      base[idx]
    ]
  }, [heroIndex])
  const currentHero = heroCards[2]

  const notify = (text) => { setToast(text); window.setTimeout(() => setToast(''), 2600) }
  const onShotLike=async(e,id,title)=>{e.stopPropagation();if(!id)return;try{const result=await api(`/photos/${id}/like`,{method:'POST'});setDbShots(prev=>prev.map(x=>x.id===id?{...x,likes:Math.max(0,(x.likes||0)+(result.liked?1:-1))}:x));notify(result.liked?'Added like':'Like removed')}catch(error){notify(error.message)}};
  const loadDemoSampleShot = () => {
    const c = document.createElement('canvas')
    c.width = 640; c.height = 420
    const ctx = c.getContext('2d')
    const g = ctx.createLinearGradient(0, 0, 0, 420)
    g.addColorStop(0, '#1c2b36'); g.addColorStop(0.55, '#d96b38'); g.addColorStop(1, '#1a1e1b')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 640, 420)
    ctx.fillStyle = 'rgba(255, 214, 140, 0.85)'
    ctx.beginPath(); ctx.arc(460, 140, 46, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#121614'
    ctx.beginPath(); ctx.moveTo(0, 310); ctx.lineTo(180, 220); ctx.lineTo(350, 285); ctx.lineTo(510, 195); ctx.lineTo(640, 275); ctx.lineTo(640, 420); ctx.lineTo(0, 420); ctx.fill()
    const dataUrl = c.toDataURL('image/png')
    onPhotoChosen(dataUrl)
    const samplePlace = livePlaces[0] || { id: 1, name: 'Charles Bridge', city: 'Prague', country: 'Czech Republic', latitude: 50.0865, longitude: 14.4114 }
    setUploadPlace(samplePlace)
    if (!uploadTitle) setUploadTitle(`Golden Dusk at ${samplePlace.name}`)
    setOwnership(true)
    notify('Sample shot loaded — click "Analyze with AI"!')
  }
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const handleLogin = async () => { if(user){await api('/auth/logout',{method:'POST'}).catch(()=>{}); localStorage.removeItem('shotmap_token'); setUser(null); notify('Signed out'); return} setAuthMode('login') }
  const quickSignIn = async (email, password) => {
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      if (data.token) {
        localStorage.setItem('shotmap_token', data.token)
        setUser(data.user)
        setAuthMode(null)
        notify(`Welcome, ${data.user.username}`)
      }
    } catch (e) { notify(e.message) }
  }
  const submitAuth = async (event) => { event.preventDefault(); try { let data; if(authMode==='login') data=await api('/auth/login',{method:'POST',body:JSON.stringify({email:authForm.email,password:authForm.password})}); else if(authMode==='register') data=await api('/auth/register',{method:'POST',body:JSON.stringify(authForm)}); else if(authMode==='forgot') data=await api('/auth/forgot-password',{method:'POST',body:JSON.stringify({email:authForm.email})}); else data=await api('/auth/reset-password',{method:'POST',body:JSON.stringify({token:authForm.token,password:authForm.password})}); if(data.token){localStorage.setItem('shotmap_token',data.token);setUser(data.user);setAuthMode(null);notify(`Welcome, ${data.user.username}`)}else{notify(data.message||'Done');if(authMode==='forgot'){setAuthForm({...authForm,token:data.reset_token||''});setAuthMode('reset')}} } catch(e){notify(e.message)} }
  const handleUpload = async () => { if(!uploaded||uploadBusy)return; if(!uploadPlace||!ownership)return notify('Выберите локацию и подтвердите авторство');setUploadBusy(true); try { const payload={place_id:uploadPlace.id||null,ownership_confirmed:ownership,image_url:uploaded,title:uploadTitle||'Untitled shot',category:photoFilter.category||'City'}; if(!payload.place_id){payload.place_name=uploadPlace.name;payload.city=uploadPlace.city;payload.country=uploadPlace.country;payload.latitude=Number(uploadPlace.latitude);payload.longitude=Number(uploadPlace.longitude)} const data=await api('/photos',{method:'POST',body:JSON.stringify(payload)}); notify(`AI analysis complete: ${data.photo.overallScore}/100`); setShowUpload(false); setUploaded(null); setUploadPlace(null); setUploadTitle(''); setOwnership(false); setLocationGuess(null); setPhotoPage(1) } catch(e) { notify(e.message) } finally {setUploadBusy(false)} }
  const onPhotoChosen = (dataUrl) => { setUploaded(dataUrl); setLocationGuess(null); if (user) { setGuessing(true); api('/photos/guess-location',{method:'POST',body:JSON.stringify({image:dataUrl,title:uploadTitle||''})}).then(r=>{ if(r.guess&&(r.guess.place||r.guess.city)) setLocationGuess({...r.guess,query:[r.guess.place,r.guess.city,r.guess.country].filter(Boolean).join(', ')}); else if(r.reason&&r.reason!=='AI provider is not configured') notify('AI не смог определить локацию') }).catch(()=>{}).finally(()=>setGuessing(false)) } }
  const [route,setRoute]=useState(window.location.hash)
  React.useEffect(()=>{const f=()=>setRoute(window.location.hash);const openLogin=()=>{window.location.hash='';setAuthMode('login')};window.addEventListener('hashchange',f);window.addEventListener('shotmap:login',openLogin);return()=>{window.removeEventListener('hashchange',f);window.removeEventListener('shotmap:login',openLogin)}},[])
  const goHome=()=>{window.location.hash='';window.scrollTo(0,0)}
  if(route.startsWith('#photo/'))return <PhotoPage id={route.split('/')[1]} onHome={goHome} notify={notify}/>
  if(route.startsWith('#place/'))return <PlacePage id={route.split('/')[1]} onHome={goHome} notify={notify}/>
  if(route.startsWith('#user/'))return <PublicProfilePage id={route.split('/')[1]} onHome={goHome} api={api} currentUser={user} notify={notify}/>
  if(route==='#leaderboard')return <LeaderboardPage onHome={goHome}/>
  if(route==='#profile')return <Dashboard api={api} onHome={goHome} onLogin={()=>{window.location.hash='';setAuthMode('login')}} notify={notify} theme={theme} setTheme={setTheme}/>
  if(route==='#admin' && user?.role!=='admin')return (
    <Shell onHome={goHome} notify={notify}>
      <main className="sub-page">
        <div className="eyebrow"><span className="dot"/> Restricted area</div>
        <h1>Admin access required</h1>
        <p className="muted">Sign in with an administrator account to access moderation, users, and AI configuration.</p>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:18}}>
          <button className="primary" onClick={() => quickSignIn('admin@shotmap.local', 'admin123')}>
            <Shield size={15}/> Quick sign in as Demo Admin
          </button>
          <button className="outline-btn" onClick={()=>{window.location.hash='';setAuthMode('login')}}>Log in manually</button>
        </div>
      </main>
    </Shell>
  )
  if(route==='#admin')return <AdminPage onHome={goHome} notify={notify}/>

  const selectedMapPlace = activePlace || filteredPlaces[0] || livePlaces[0]

  return <div className="app">
    <header className="nav">
      <a className="brand" href="#top"><span className="brand-mark">S</span><span>Shot<span>Map</span></span></a>
      <nav className={menu ? 'nav-links open' : 'nav-links'}>
        <a href="#explore" onClick={() => setMenu(false)}>Explore</a>
        <a href="#places" onClick={() => setMenu(false)}>Places</a>
        <a href="#leaderboard" onClick={() => setMenu(false)}>Leaderboard</a>
        <a href="#how" onClick={() => setMenu(false)}>How it works</a>
        <a href="#about" onClick={() => setMenu(false)}>About</a>
        <div className="mobile-only-nav-items">
          <a href="#profile" onClick={() => setMenu(false)}>Personal Studio</a>
          <a href="#admin" onClick={() => setMenu(false)}>Admin Command Center</a>
          {!user ? (
            <button type="button" className="outline-btn" onClick={() => { setMenu(false); quickSignIn('admin@shotmap.local', 'admin123') }}>
              <Shield size={14}/> 1-Click Demo Admin Login
            </button>
          ) : (
            <button type="button" className="outline-btn" onClick={() => { setMenu(false); handleLogin() }}>
              Sign out ({user.username})
            </button>
          )}
        </div>
      </nav>
      <div className="nav-actions">
        <button className="theme-toggle" aria-label="Toggle theme" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>{theme==='dark'?'☀':'☾'}</button>
        <button
          type="button"
          className={`notification-btn ${showNotifications ? 'is-open' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
          aria-label="Notifications"
          aria-expanded={showNotifications}
          onClick={()=>setShowNotifications(v=>!v)}
        >
          <Bell size={17}/>
          {unreadCount>0&&<span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <button className="login" onClick={handleLogin}>{user ? user.username : 'Log in'}</button>
        {user&&<>
          <button className="login" onClick={()=>window.location.hash='#profile'}>Profile</button>
          {user.role==='admin'&&<button className="login" onClick={()=>window.location.hash='#admin'}>Admin</button>}
        </>}
        <button className="upload-btn" onClick={() => user ? setShowUpload(true) : setAuthMode('login')}><Upload size={15}/> {user ? 'Upload photo' : 'Log in to upload'}</button>
        <button className="menu-btn" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
        {showNotifications&&<Notifications onClose={()=>setShowNotifications(false)} notify={notify} onCountChange={setUnreadCount}/>}
      </div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="dot"/> Photo discovery, reimagined</div>
          <h1>Find the <em>best shot</em><br/>of every place.</h1>
          <p>Explore places. Upload your shot.<br/>Let AI rate it.</p>
          <div className="hero-cta">
            <button className="primary" onClick={() => scrollTo('explore')}>Explore the map <ArrowUpRight size={17}/></button>
            <button className="text-btn" onClick={() => scrollTo('how')}>See how it works <span>↓</span></button>
          </div>
          <div className="hero-proof">
            <div className="avatars"><i>MC</i><i>AT</i><i>LO</i><i>+</i></div>
            <div><strong>12,400+</strong><span>photographers exploring</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="photo-stack" onClick={() => setHeroIndex(i => (i + 1) % places.length)} title="Click to cycle featured places">
            <div className="photo-card">
              <img src={heroCards[0].image} alt={heroCards[0].name}/>
            </div>
            <div className="photo-card">
              <img src={heroCards[1].image} alt={heroCards[1].name}/>
            </div>
            <div className="photo-card">
              <img src={currentHero.image} alt={currentHero.name}/>
              <div className="image-label">
                <span>0{(heroIndex % places.length) + 1} / 0{places.length}</span>
                <b>{currentHero.name}, {currentHero.city.split(',')[0]}</b>
                <small>{currentHero.coords}</small>
              </div>
            </div>
          </div>

          <div className="hero-score-ext">
            <span>AI OVERALL SCORE</span>
            <div className="score-large">
              {currentHero.score || 94}<small>/100</small>
            </div>
            <div className="score-bars">
              <div>
                <div className="score-bar-item"><span>Composition</span><span>{currentHero.composition || 96}</span></div>
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${currentHero.composition || 96}%` }}/></div>
              </div>
              <div>
                <div className="score-bar-item"><span>Lighting</span><span>{currentHero.lighting || 92}</span></div>
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${currentHero.lighting || 92}%` }}/></div>
              </div>
              <div>
                <div className="score-bar-item"><span>Colors</span><span>{currentHero.colors || 94}</span></div>
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${currentHero.colors || 94}%` }}/></div>
              </div>
            </div>
          </div>

          <div className="hero-stack-controls">
            <button type="button" className="hero-arrow-btn" aria-label="Previous featured place" onClick={() => setHeroIndex(i => (i - 1 + places.length) % places.length)}>‹</button>
            <div className="hero-stack-dots">
              {places.slice(0, 6).map((pl, idx) => (
                <button
                  key={pl.id}
                  type="button"
                  aria-label={`Show ${pl.name}`}
                  className={heroIndex % places.length === idx ? 'active' : ''}
                  onClick={() => setHeroIndex(idx)}
                />
              ))}
            </div>
            <button type="button" className="hero-arrow-btn" aria-label="Next featured place" onClick={() => setHeroIndex(i => (i + 1) % places.length)}>›</button>
            <button
              type="button"
              className="hero-open-place-pill"
              onClick={() => { if (currentHero.id) window.location.hash = `#place/${currentHero.id}` }}
            >
              Open {currentHero.name} <ArrowUpRight size={13}/>
            </button>
          </div>

          <div className="vertical-note">CAPTURED DIFFERENTLY <span>✦</span></div>
        </div>
      </section>

      <div className="hero-ticker-bar">
        <div className="hero-ticker-inner">
          <span><b>✦ {livePlaces.length}</b> Global Landmarks Indexed</span>
          <span><b>★ 91.8</b> Community AI Average</span>
          <span><b>⚡ 4-Axis</b> Neural Critique (Composition · Light · Sharpness · Color)</span>
          <span><b>📱 Ready</b> Desktop & Mobile Atlas</span>
        </div>
      </div>

      <section className="explore-section" id="explore">
        <div className="section-head">
          <div>
            <div className="eyebrow">01 — Explore the world</div>
            <h2>See what’s worth <em>shooting.</em></h2>
          </div>
          <div className="section-tools">
            <div className="search">
              <Search size={16}/>
              <input ref={searchInputRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search places..."/>
              <kbd>⌘ K</kbd>
            </div>
            <button
              type="button"
              className="filter"
              onClick={() => {
                if (!livePlaces.length) return
                const pick = livePlaces[Math.floor(Math.random() * livePlaces.length)]
                setSearch('')
                setMapChip('All')
                setActivePlace(pick)
                notify(`✦ Spotlight: ${pick.name} (${pick.city})`)
              }}
            >
              <Sparkles size={15}/> Surprise me
            </button>
            <button className="filter" onClick={() => { setSearch(''); setMapChip('All'); notify('Map filters reset') }}><SlidersHorizontal size={16}/> Reset</button>
          </div>
        </div>

        <div className="split-workspace">
          <aside className="rail-panel" aria-label="Places in view">
            <div className="rail-header">
              <div className="rail-header-top">
                <h3>Places in view</h3>
                <span className="rail-count-badge">{filteredPlaces.length}</span>
              </div>
              <div className="filter-chips">
                {['All', 'Architecture', 'Monuments', 'Europe', 'Top 90+'].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    className={`filter-chip ${mapChip === chip ? 'active' : ''}`}
                    onClick={() => setMapChip(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
            <div className="rail-list">
              {filteredPlaces.map((p, idx) => {
                const isSelected = selectedMapPlace && (selectedMapPlace.id ? selectedMapPlace.id === p.id : selectedMapPlace.name === p.name)
                return (
                  <div
                    key={p.id || p.name || idx}
                    className={`rail-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setActivePlace(p)}
                    onDoubleClick={() => { if (p.id) window.location.hash = `#place/${p.id}` }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') setActivePlace(p) }}
                  >
                    <div className="rail-item-img">
                      <img src={p.image} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = publicPhotoFallbacks[idx % publicPhotoFallbacks.length] }} alt={p.name}/>
                    </div>
                    <div className="rail-item-info">
                      <b>{p.name}</b>
                      <span>{p.city} · {p.photos}</span>
                    </div>
                    <div className="rail-item-score">
                      <span>★ {p.score}</span>
                      <button
                        type="button"
                        className="rail-item-open"
                        aria-label={`Open ${p.name}`}
                        onClick={e => { e.stopPropagation(); if (p.id) window.location.hash = `#place/${p.id}` }}
                      >
                        <ArrowUpRight size={13}/>
                      </button>
                    </div>
                  </div>
                )
              })}
              {!filteredPlaces.length && (
                <p className="muted" style={{ padding: '18px 12px', textAlign: 'center' }}>No places match your filter.</p>
              )}
            </div>
          </aside>

          <div className="map-wrap map-container-main">
            <div className="map">
              <InteractiveMap places={filteredPlaces} selectedPlace={selectedMapPlace} onSelect={setActivePlace}/>
              {selectedMapPlace && (
                <div
                  className="map-card"
                  onClick={() => { if (selectedMapPlace.id) window.location.hash = `#place/${selectedMapPlace.id}`; else notify('Select a marker first') }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' && selectedMapPlace.id) window.location.hash = `#place/${selectedMapPlace.id}` }}
                >
                  <div className="map-card-img">
                    <img src={selectedMapPlace.image} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = publicPhotoFallbacks[0] }} alt={selectedMapPlace.name}/>
                    <span className="mini-score">{selectedMapPlace.score}</span>
                  </div>
                  <div>
                    <b>{selectedMapPlace.name}</b>
                    <span><MapPin size={12}/> {selectedMapPlace.city}</span>
                    <small>{selectedMapPlace.photos} <i>·</i> <strong>★ {selectedMapPlace.score}/100</strong></small>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); selectedMapPlace.id ? (window.location.hash = `#place/${selectedMapPlace.id}`) : notify('Select a marker first') }}
                    aria-label="Open selected place"
                  >
                    <ArrowUpRight size={18}/>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="map-bottom">
          <span><b>{filteredPlaces.length || 0}</b> places in view</span>
          <div className="map-legend"><span><i className="legend-dot orange"/> ShotMap custom map · Click any place in the list to fly to its pin</span></div>
          <button onClick={() => selectedMapPlace?.id ? (window.location.hash = `#place/${selectedMapPlace.id}`) : notify('Select a map marker to open a place')}>Explore markers <ArrowUpRight size={14}/></button>
        </div>
      </section>

      <section className="places" id="places">
        <div className="section-head compact">
          <div>
            <div className="eyebrow">02 — Trending now</div>
            <h2>Places people are <em>loving.</em></h2>
          </div>
          <button className="outline-btn" onClick={() => scrollTo('explore')}>View all places <ArrowUpRight size={15}/></button>
        </div>
        <div className="place-grid">
          {livePlaces.slice(0, 8).map((p,i)=>(
            <article className="place-card" key={p.id || p.name} onClick={() => {setActivePlace(p);window.location.hash=`#place/${p.id||i+1}`}}>
              <div className="place-img">
                <img src={p.image} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=media(p.id)}} alt={p.name}/>
                <span className="rank">{String(i+1).padStart(2,'0')}</span>
                <span className="place-score">{p.score} <small>/100</small></span>
              </div>
              <div className="place-info">
                <div><h3>{p.name}</h3><span><MapPin size={11}/> {p.city}</span></div>
                <span className="photo-count">{p.photos}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shots" id="about">
        <div className="section-head compact">
          <div>
            <div className="eyebrow">03 — Community picks</div>
            <h2>The shots that <em>stop you.</em></h2>
          </div>
          <div className="filter-bar filter-pill-bar">
            <select value={photoFilter.category} onChange={e=>setPhotoFilter({...photoFilter,category:e.target.value})}>
              <option value="">All categories</option>
              {['Landscape','Architecture','Nature','People','City','Night'].map(x=><option key={x}>{x}</option>)}
            </select>
            <select value={photoFilter.photoType} onChange={e=>setPhotoFilter({...photoFilter,photoType:e.target.value})}>
              <option value="">All types</option>
              {['landscape','portrait','architecture','macro','street','night'].map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}
            </select>
            <select value={photoFilter.radiusKm} onChange={e=>setPhotoFilter({...photoFilter,radiusKm:e.target.value})}>
              <option value="0">Any distance</option>
              <option value="10">Within 10 km</option>
              <option value="50">Within 50 km</option>
              <option value="200">Within 200 km</option>
            </select>
            <select value={photoFilter.min_score} onChange={e=>setPhotoFilter({...photoFilter,min_score:e.target.value})}>
              <option value="0">Any score</option>
              <option value="70">70+</option>
              <option value="80">80+</option>
              <option value="90">90+</option>
            </select>
            <select value={photoFilter.sort} onChange={e=>setPhotoFilter({...photoFilter,sort:e.target.value})}>
              <option value="ai_score">Best AI</option>
              <option value="likes">Most liked</option>
              <option value="created_at">Newest</option>
            </select>
          </div>
        </div>
        <div className="shot-grid">
          {liveShots.map(s=>(
            <article className="shot-card" key={s.id||s.title}>
              <div className="shot-img">
                <button className="shot-image-link" aria-label={`Open photo ${s.title}`} onClick={()=>s.id&&(window.location.hash=`#photo/${s.id}`)}>
                  <img src={s.image} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=shots[0].image}} alt={s.title}/>
                  <span className="shot-score">AI <b>{s.score}</b></span>
                </button>
                <button className="shot-like" aria-label={`Like ${s.title}`} onClick={e=>onShotLike(e,s.id,s.title)}>♡{s.likes ? ` ${s.likes}` : ''}</button>
              </div>
              <div className="shot-info">
                <div
                  className="author"
                  onClick={() => { if (s.userId) window.location.hash = `#user/${s.userId}` }}
                  style={{ cursor: s.userId ? 'pointer' : 'default' }}
                  title={s.author ? `Open @${s.author} portfolio` : ''}
                >
                  <span>{s.avatar}</span>
                  <div><b>{s.author}</b><small>{s.place}</small></div>
                </div>
                <button className="shot-title shot-title-button" onClick={()=>s.id&&(window.location.hash=`#photo/${s.id}`)}>{s.title}</button>
              </div>
            </article>
          ))}
        </div>
        <div className="pagination">
          <button disabled={photoPage<=1} onClick={()=>setPhotoPage(p=>p-1)}>Previous</button>
          <span>Page {photoPage} of {photoPages}</span>
          <button disabled={photoPage>=photoPages} onClick={()=>setPhotoPage(p=>p+1)}>Next page</button>
        </div>
      </section>

      <section className="leaderboard">
        <div className="section-head compact">
          <div>
            <div className="eyebrow">05 — Community</div>
            <h2>Top <em>photographers.</em></h2>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <button className="outline-btn" onClick={() => window.location.hash = '#leaderboard'}>Full leaderboard <ArrowUpRight size={14}/></button>
            <Trophy size={29} color="var(--orange)"/>
          </div>
        </div>
        <div className="leader-list">
          {leaderboard.slice(0,5).map((u,i)=>{
            const lvl = Math.max(1, Math.floor(((u.photos || 0) * 20 + (u.likes || 0) * 2) / 250) + 1)
            return (
              <button className={`leader-row clickable ${i < 3 ? 'podium' : ''}`} key={u.id} onClick={() => window.location.hash=`#user/${u.id}`}>
                <b className="leader-rank">{String(i+1).padStart(2,'0')}</b>
                <Avatar className="leader-avatar" user={u}/>
                <div className="leader-name-wrap">
                  <strong>{u.username}</strong>
                  <small className="leader-lvl-pill">Lvl {lvl}</small>
                </div>
                <span>{u.photos} photos</span>
                <span className="leader-score-cell">
                  <b>{u.average_score}</b> AI avg
                  <i className="leader-mini-bar"><em style={{width:`${Math.min(100, u.average_score || 0)}%`}}/></i>
                </span>
                <span><Heart size={13} color="var(--orange)"/> {u.likes}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="how" id="how">
        <div className="how-title">
          <div className="eyebrow">04 — The idea</div>
          <h2>Less scrolling.<br/><em>More seeing.</em></h2>
        </div>
        <div className="steps">
          <div>
            <span>01</span>
            <div className="steps-icon"><Sparkles size={20}/></div>
            <h3>Find your place</h3>
            <p>Discover the best viewpoints and hidden gems, mapped by people who’ve been there.</p>
          </div>
          <div>
            <span>02</span>
            <div className="steps-icon"><Upload size={20}/></div>
            <h3>Upload your shot</h3>
            <p>Share the moment you captured. Add your story, location, and a little bit of context.</p>
          </div>
          <div>
            <span>03</span>
            <div className="tiny-score">94</div>
            <h3>Get your AI score</h3>
            <p>Our visual model gives your photo a thoughtful score across composition, light, and color.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div>
          <div className="eyebrow">Ready when you are</div>
          <h2>Your next great shot<br/>is <em>out there.</em></h2>
          <button className="primary light" onClick={() => user ? setShowUpload(true) : setAuthMode('login')}>Upload your first shot <ArrowUpRight size={17}/></button>
        </div>
        <div className="cta-mark">S<span>✦</span></div>
      </section>
    </main>

    <footer>
      <div className="brand"><span className="brand-mark">S</span><span>Shot<span>Map</span></span></div>
      <span>Find beauty. Frame it. Share it.</span>
      <div><a href="#explore">Explore</a><a href="#leaderboard">Leaderboard</a><a href="#how">How it works</a><a href="#top">Back to top ↑</a></div>
    </footer>

    <nav className="mobile-bottom-dock" aria-label="Mobile quick navigation">
      <button type="button" className="active" onClick={() => scrollTo('explore')}><MapPin size={16}/><span>Map</span></button>
      <button type="button" onClick={() => window.location.hash = '#leaderboard'}><Trophy size={16}/><span>Leaders</span></button>
      <button type="button" className="dock-upload-btn" onClick={() => user ? setShowUpload(true) : setAuthMode('login')}><Upload size={16}/><span>Shoot</span></button>
      <button type="button" onClick={() => window.location.hash = '#profile'}><Users size={16}/><span>Studio</span></button>
      <button type="button" onClick={() => window.location.hash = '#admin'}><Shield size={16}/><span>Admin</span></button>
    </nav>

    {showUpload && <div className="modal-backdrop" onClick={() => setShowUpload(false)}><div className="modal upload-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowUpload(false)}><X/></button><div className="eyebrow">Share a moment</div><h2>Upload your <em>shot.</em></h2>{uploaded ? <div className="upload-preview"><img src={uploaded} alt="Предпросмотр"/><button type="button" className="upload-clear-btn" onClick={() => setUploaded(null)}>Change photo</button></div> : <label className="dropzone"><Upload size={28}/><b>Drop your photo here</b><span>or click to browse · JPG, PNG up to 10MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => {const f=e.target.files?.[0]; if(f && f.size<=10*1024*1024){const r=new FileReader();r.onload=()=>onPhotoChosen(r.result);r.readAsDataURL(f)}else if(f)notify('Image must be smaller than 10 MB')}}/></label>}{!uploaded && <div style={{display:'flex',justifyContent:'center',marginBottom:12}}><button type="button" className="outline-btn" onClick={loadDemoSampleShot}><Sparkles size={13}/> Instant Demo Sample Shot (1-Click AI Test)</button></div>}<div className="modal-fields upload-fields">
      <label className="field-label">Локация{guessing?<span className="field-hint"> AI определяет место…</span>:locationGuess?<span className="field-hint guess-hint"> AI предлагает: {locationGuess.place||locationGuess.city}{locationGuess.confidence?` (${locationGuess.confidence}%)`:''}</span>:null}<LocationPicker value={uploadPlace} onChange={setUploadPlace} disabled={!uploaded}/>{locationGuess&&<button type="button" className="guess-accept" disabled={!uploaded} onClick={()=>{api(`/geocode?q=${encodeURIComponent(locationGuess.query)}&limit=1`).then(({results})=>{if(results[0])setUploadPlace(results[0])}).catch(()=>{})}}>Принять предложение AI</button>}</label>
      <label className="field-label">Название фотографии<input value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} placeholder="Например: Golden hour at the bridge" maxLength={160}/></label>
      <label className=" ownership-check"><input type="checkbox" checked={ownership} onChange={e=>setOwnership(e.target.checked)}/><span className="ownership-box" aria-hidden="true"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span><span>Я автор этой фотографии и имею право её публиковать<span className="ownership-note">Отметка нужна, чтобы ShotMap знал: фото можно публиковать публично.</span></span></label>
      <p className="muted upload-note">Проверяем точные и похожие копии на ShotMap. Поиск совпадений в интернете пока не подключён. Локацию указывает автор — она не подтверждена автоматически.</p>
      <button className="primary upload-submit" onClick={handleUpload} disabled={uploadBusy||!uploaded||!uploadPlace||!ownership}><Sparkles size={16}/> {uploadBusy?'Analyzing…':'Analyze with AI'}</button>
    </div></div></div>}
    {authMode && <div className="modal-backdrop" onClick={() => setAuthMode(null)}><form className="modal auth-modal" onClick={e => e.stopPropagation()} onSubmit={submitAuth}><button type="button" className="modal-close" onClick={() => setAuthMode(null)}><X/></button><div className="eyebrow">ShotMap account</div><h2>{authMode==='login'?'Welcome back.':authMode==='register'?'Join the community.':authMode==='forgot'?'Reset your password.':'Choose a new password.'}</h2>{authMode==='register'&&<input required minLength="3" className="auth-input" placeholder="Username" value={authForm.username} onChange={e=>setAuthForm({...authForm,username:e.target.value})}/>} {(authMode!=='reset')&&<input required type="email" className="auth-input" placeholder="Email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})}/>} {authMode==='reset'&&<input required className="auth-input" placeholder="Reset token" value={authForm.token} onChange={e=>setAuthForm({...authForm,token:e.target.value})}/>} {authMode!=='forgot'&&<input required minLength="6" type="password" className="auth-input" placeholder="Password" value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})}/>}<button className="primary auth-submit">{authMode==='login'?'Log in':authMode==='register'?'Create account':authMode==='forgot'?'Send reset link':'Set new password'}</button>
      {authMode==='login' && (
        <div className="quick-demo-box">
          <span>Instant 1-Click Demo Login:</span>
          <div className="quick-demo-btns">
            <button type="button" onClick={() => quickSignIn('demo@shotmap.local', 'demo123')}>⚡ Demo Photographer</button>
            <button type="button" onClick={() => quickSignIn('admin@shotmap.local', 'admin123')}>🛡️ Demo Admin</button>
          </div>
        </div>
      )}
      <div className="auth-links">{authMode==='login'&&<><button type="button" onClick={()=>setAuthMode('register')}>Create account</button><button type="button" onClick={()=>setAuthMode('forgot')}>Forgot password?</button><small>Demo user: demo@shotmap.local / demo123<br/>Demo admin: admin@shotmap.local / admin123</small></>}{authMode!=='login'&&<button type="button" onClick={()=>setAuthMode('login')}>Back to login</button>}</div></form></div>}
    {toast && <div className="toast">✦ {toast}</div>}
  </div>
}
createRoot(document.getElementById('root')).render(<App />)
