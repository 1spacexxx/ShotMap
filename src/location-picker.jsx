import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X, Sparkles } from 'lucide-react'
import { handleStaticApi } from './static-api.js'

const api = async (path, options = {}) => {
  if (typeof window !== 'undefined' && (window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:')) {
    return handleStaticApi(path, options)
  }
  const token = localStorage.getItem('shotmap_token')
  let response
  try {
    response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}${path}`, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...options })
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

// Address / landmark picker with live autocomplete. Results come from the ShotMap
// database first, then from the OpenStreetMap geocoder, so typing a plain street
// address works the same way as picking a famous landmark.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
