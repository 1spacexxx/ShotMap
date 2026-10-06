# ShotMap — Shared UI Components

Framework: React 19 + Vite (ESM, JSX)
Icons: `lucide-react`
Styling: Vanilla CSS with CSS Custom Properties (`src/styles.css`, `src/polish.css`, `src/tile-map.css`, `src/world-map.css`)

---

## 1. `Avatar` (`src/avatar.jsx`)
- **Component Name**: `Avatar`
- **Description**: Circular user avatar image with automatic fallback to 2-letter uppercase initials on load error or missing URL.
- **Key Props**: `user` (`{ username, avatar_url }`), `className` (string), `style` (object)

```jsx
import React, { useState } from 'react'

export function Avatar({ user, className = '', style, ...props }) {
  const [failedSource, setFailedSource] = useState(null)
  const username = typeof user?.username === 'string' ? user.username.trim() : ''
  const source = typeof user?.avatar_url === 'string' ? user.avatar_url.trim() : ''
  const words = username.split(/\s+/).filter(Boolean)
  const initials = (words.length > 1 ? words[0][0] + words[words.length - 1][0] : username.slice(0, 2)).toUpperCase() || '?'
  return <span
    {...props}
    className={className}
    role="img"
    aria-label={username ? `${username}'s avatar` : 'User avatar'}
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', borderRadius: '50%', ...(!className ? { width: 40, height: 40, background: 'var(--green, #315b4d)', color: '#fff' } : {}), ...style }}
  >
    {source && source !== failedSource ? <img key={source} src={source} alt="" onError={() => setFailedSource(source)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : initials}
  </span>
}

export default Avatar
```

---

## 2. `LocationPicker` (`src/location-picker.jsx`)
- **Component Name**: `LocationPicker`
- **Description**: Address and landmark autocomplete input querying `/api/geocode` (ShotMap DB + OpenStreetMap).
- **Key Props**: `value` (`{ label, name, city, country, latitude, longitude, source }`), `onChange` (fn), `disabled` (boolean)

```jsx
import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X, Sparkles } from 'lucide-react'

const api = async (path, options = {}) => {
  const token = localStorage.getItem('shotmap_token')
  const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}${path}`, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...options })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}

export function LocationPicker({ value, onChange, disabled }) {
  const [query, setQuery] = useState(value?.label || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(-1)
  const box = useRef(null)
  const timer = useRef(null)
  const picked = useRef(false)

  useEffect(() => {
    if (value?.label && value.label !== query) { setQuery(value.label); picked.current = true }
  }, [value])

  useEffect(() => {
    const onClick = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const runSearch = (text) => {
    setLoading(true)
    api(`/geocode?q=${encodeURIComponent(text)}&limit=8`)
      .then(({ results }) => { setResults(results); setActive(-1); setOpen(true) })
      .catch(() => { setResults([]) })
      .finally(() => setLoading(false))
  }

  const onType = (e) => {
    const text = e.target.value
    setQuery(text)
    picked.current = false
    onChange(null)
    if (timer.current) clearTimeout(timer.current)
    if (text.trim().length < 2) { setResults([]); setOpen(false); return }
    timer.current = setTimeout(() => runSearch(text.trim()), 350)
  }

  const select = (item) => {
    picked.current = true
    setQuery(item.label)
    setOpen(false)
    onChange(item)
  }

  const onKey = (e) => {
    if (!open || !results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) select(results[active]) }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
  }

  const clear = () => { setQuery(''); setResults([]); onChange(null); setOpen(false) }

  return (
    <div className="loc-picker" ref={box}>
      <MapPin size={15} className="loc-picker-icon" />
      <input
        type="text"
        value={query}
        onChange={onType}
        onKeyDown={onKey}
        onFocus={() => results.length && setOpen(true)}
        placeholder="Адрес или название места…"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        aria-label="Место съёмки"
      />
      {query && !disabled && <button type="button" className="loc-clear" onClick={clear} aria-label="Очистить"><X size={14} /></button>}
      {loading && <span className="loc-spinner"><Sparkles size={14} /></span>}
      {open && results.length > 0 && (
        <ul className="loc-results" role="listbox">
          {results.map((r, i) => (
            <li key={`${r.source}-${r.latitude}-${r.longitude}-${i}`} role="option" aria-selected={i === active} className={i === active ? 'active' : ''}>
              <button type="button" onMouseEnter={() => setActive(i)} onClick={() => select(r)}>
                <span className="loc-name">{r.name}</span>
                <span className="loc-sub">{[r.city, r.country].filter(Boolean).join(', ')}</span>
                <span className="loc-source">{r.source === 'shotmap' ? 'ShotMap' : 'OpenStreetMap'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

---

## 3. `Score` (`src/main.jsx`)
- **Component Name**: `Score`
- **Description**: Displays an AI photo rating out of 100 (`94/100`) in standard or large hero/detail size.
- **Key Props**: `value` (number/string), `large` (boolean)

```jsx
function Score({ value, large = false }) {
  return <span className={`score ${large ? 'score-large' : ''}`}>{value}<small>/100</small></span>
}
```

---

## 4. `Notifications` Popover (`src/main.jsx`)
- **Component Name**: `Notifications`
- **Description**: Dropdown popover showing user notifications with unread badge and "Mark all read" action.
- **Key Props**: `onClose` (fn), `notify` (fn)

```jsx
function Notifications({ onClose, notify }) {
  const [items,setItems]=useState([]);
  React.useEffect(()=>{api('/notifications').then(x=>setItems(x.notifications)).catch(e=>notify(e.message))},[]);
  const unread=items.filter(n=>!n.read_at).length;
  return (
    <div className="popover">
      <div className="popover-head">
        <b>Notifications{unread?<span className="badge">{unread}</span>:null}</b>
        <button onClick={async()=>{await api('/notifications/read',{method:'POST'});setItems(items.map(x=>({...x,read_at:new Date().toISOString()})))}}>Mark all read</button>
      </div>
      {items.length?items.map(n=><div className={n.read_at?'notice read':'notice'} key={n.id}><span>{n.type==='like'?'♥':'★'}</span>{n.message}</div>):<p className="muted">No notifications yet.</p>}
      <button className="modal-close" onClick={onClose}>×</button>
    </div>
  )
}
```

---

## 5. `InteractiveMap` / `MapView` (`src/tile-map.jsx`)
- **Component Name**: `MapView`
- **Description**: Interactive Leaflet OpenStreetMap world view with orange pins and place popups.
- **Key Props**: `places` (array), `onSelect` (fn)

```jsx
import React, {useEffect,useRef} from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './tile-map.css'
export function MapView({places=[],onSelect}) {
 const el=useRef(null),map=useRef(null),layer=useRef(null),select=useRef(onSelect);select.current=onSelect
 useEffect(()=>{const m=L.map(el.current,{center:[22,10],zoom:2,minZoom:2,maxZoom:18,worldCopyJump:true});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}).addTo(m);map.current=m;layer.current=L.layerGroup().addTo(m);const o=new ResizeObserver(()=>m.invalidateSize());o.observe(el.current);return()=>{o.disconnect();m.remove()}},[])
 useEffect(()=>{if(!layer.current)return;layer.current.clearLayers();for(const p of places){const lat=Number(p.latitude),lng=Number(p.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lng))continue;const icon=L.divIcon({className:'shotmap-pin',html:'<span></span>',iconSize:[24,24],iconAnchor:[12,12]});const marker=L.marker([lat,lng],{icon,title:p.name}).addTo(layer.current);const c=document.createElement('div');c.className='map-popup';const h=document.createElement('strong');h.textContent=p.name;c.append(h);const t=document.createElement('p');t.textContent=p.city;c.append(t);const b=document.createElement('button');b.textContent='Открыть место ↗';b.onclick=()=>{select.current?.(p);window.location.hash=`#place/${p.id}`};c.append(b);marker.bindPopup(c).on('click',()=>select.current?.(p))}},[places])
 return <div className="tile-world"><div ref={el} className="tile-world-canvas" aria-label="Интерактивная карта мира"/><button className="tile-reset" onClick={()=>map.current?.setView([22,10],2)}>Весь мир</button></div>
}
```

---

## 6. `LocationPinMap` & Vector `MapView` (`src/world-map.jsx`)
- **Component Name**: `LocationPinMap`, `MapView`
- **Description**: D3 Natural Earth SVG world map with ocean gradient, grid lines, and pulsing location pin (used on Photo Detail page).
- **Key Props**: `latitude`, `longitude`, `label`, `height`

```jsx
export function LocationPinMap({ latitude, longitude, label, height = 200 }) {
  const coords = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) ? coordinates({ latitude, longitude }) : null
  if (!coords) return null
  const [x, y] = pathProjection(coords)
  const mapId = 'loc' + Math.random().toString(36).slice(2, 8)
  return (
    <svg className="shotmap-location-map" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ height }} role="img" aria-label={label ? `Location: ${label}` : 'Photo location on world map'}>
      <defs>
        <linearGradient id={`${mapId}-ocean`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--shotmap-map-ocean-start)" />
          <stop offset="1" stopColor="var(--shotmap-map-ocean-end)" />
        </linearGradient>
        <pattern id={`${mapId}-grid`} width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0H0V50" fill="none" stroke="var(--shotmap-map-grid)" strokeWidth="1" />
        </pattern>
        <clipPath id={`${mapId}-clip`}><rect width={WIDTH} height={HEIGHT} rx="16" /></clipPath>
      </defs>
      <rect width={WIDTH} height={HEIGHT} rx="16" className="shotmap-map-ocean" fill={`url(#${mapId}-ocean)`} />
      <g clipPath={`url(#${mapId}-clip)`}>
        <rect x={-80} y={-80} width={WIDTH + 160} height={HEIGHT + 160} fill={`url(#${mapId}-grid)`} />
        <g className="shotmap-map-countries" aria-hidden="true">
          {features.map((item, index) => <path key={item.id || index} d={worldPath(item)} />)}
        </g>
      </g>
      <g className="shotmap-location-pin" transform={`translate(${x} ${y})`}>
        <circle r="26" className="shotmap-pin-pulse" />
        <circle r="7" className="shotmap-pin-dot" />
      </g>
    </svg>
  )
}
```
