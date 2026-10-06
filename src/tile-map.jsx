import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './tile-map.css'

export function MapView({ places = [], selectedPlace = null, onSelect }) {
  const el = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)
  const markersRef = useRef(new Map())
  const select = useRef(onSelect)
  select.current = onSelect

  useEffect(() => {
    const m = L.map(el.current, {
      center: [47.5, 9.5],
      zoom: 4,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
      zoomControl: true
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(m)
    map.current = m
    layer.current = L.layerGroup().addTo(m)
    const o = new ResizeObserver(() => m.invalidateSize())
    o.observe(el.current)
    return () => {
      o.disconnect()
      m.remove()
    }
  }, [])

  useEffect(() => {
    if (!layer.current) return
    layer.current.clearLayers()
    markersRef.current.clear()

    const validCoords = []
    for (const p of places) {
      const lat = Number(p.latitude)
      const lng = Number(p.longitude)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
      validCoords.push([lat, lng])

      const isSelected = selectedPlace && (selectedPlace.id ? selectedPlace.id === p.id : selectedPlace.name === p.name)
      const scoreText = p.score || p.average_score || ''
      const icon = L.divIcon({
        className: `shotmap-pin ${isSelected ? 'is-active' : ''}`,
        html: `<div class="shotmap-pin-inner"><span></span>${scoreText ? `<b>${scoreText}</b>` : ''}</div>`,
        iconSize: [44, 28],
        iconAnchor: [22, 14]
      })

      const marker = L.marker([lat, lng], { icon, title: p.name }).addTo(layer.current)
      const c = document.createElement('div')
      c.className = 'map-popup'
      const h = document.createElement('strong')
      h.textContent = p.name
      c.append(h)
      const t = document.createElement('p')
      t.textContent = `${p.city || ''}${scoreText ? ` · ★ ${scoreText}/100` : ''}`
      c.append(t)
      const b = document.createElement('button')
      b.textContent = 'Open place ↗'
      b.onclick = () => {
        select.current?.(p)
        if (p.id) window.location.hash = `#place/${p.id}`
      }
      c.append(b)
      marker.bindPopup(c).on('click', () => select.current?.(p))
      markersRef.current.set(p.id || p.name, { marker, lat, lng })
    }
  }, [places, selectedPlace])

  useEffect(() => {
    if (!map.current || !selectedPlace) return
    const lat = Number(selectedPlace.latitude)
    const lng = Number(selectedPlace.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    const currentZoom = map.current.getZoom()
    map.current.flyTo([lat, lng], Math.max(currentZoom, 5), {
      animate: true,
      duration: 0.75
    })
  }, [selectedPlace])

  const fitAll = () => {
    if (!map.current) return
    const pts = places
      .map(p => [Number(p.latitude), Number(p.longitude)])
      .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng))
    if (pts.length > 1) {
      map.current.fitBounds(pts, { padding: [50, 50], maxZoom: 6 })
    } else if (pts.length === 1) {
      map.current.flyTo(pts[0], 6, { duration: 0.6 })
    } else {
      map.current.setView([22, 10], 2)
    }
  }

  return (
    <div className="tile-world">
      <div ref={el} className="tile-world-canvas" aria-label="Interactive world map"/>
      <div className="tile-map-QuickActions">
        <button type="button" className="tile-reset" onClick={fitAll}>Fit markers</button>
        <button type="button" className="tile-reset secondary" onClick={() => map.current?.setView([22, 10], 2)}>Whole world</button>
      </div>
    </div>
  )
}
