import React, { useId, useMemo, useRef, useState } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import worldData from 'world-atlas/countries-110m.json' with { type: 'json' }
import './world-map.css'

const WIDTH = 1000
const HEIGHT = 500
const MIN_ZOOM = 1
const MAX_ZOOM = 4
const features = feature(worldData, worldData.objects.countries).features

function coordinates(place) {
  const longitude = Number(place?.longitude ?? place?.lng ?? place?.lon)
  const latitude = Number(place?.latitude ?? place?.lat)
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null
  return [longitude, latitude]
}

function samePlace(a, b) {
  if (!a || !b) return false
  return a.id != null && b.id != null ? String(a.id) === String(b.id) : a === b || a.name === b.name
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

const worldFeatureCollection = { type: 'FeatureCollection', features }
const pathProjection = geoNaturalEarth1().fitExtent([[18, 16], [WIDTH - 18, HEIGHT - 18]], worldFeatureCollection)
const worldPath = geoPath(pathProjection)
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

export function MapView({ places = [], onSelect }) {
  const svgRef = useRef(null)
  const dragRef = useRef(null)
  const movedRef = useRef(false)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const mapId = useId().replace(/:/g, '')

  const projection = useMemo(() => pathProjection, [])
  const path = useMemo(() => geoPath(projection), [projection])
  const validPlaces = useMemo(() => (Array.isArray(places) ? places : []).map((place) => {
    const point = coordinates(place)
    return point ? { place, point: projection(point) } : null
  }).filter(Boolean), [places, projection])

  const limitPan = (nextPan, nextZoom = zoom) => {
    const maxX = Math.max(0, (WIDTH * nextZoom - WIDTH) / 2 + 22)
    const maxY = Math.max(0, (HEIGHT * nextZoom - HEIGHT) / 2 + 18)
    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    }
  }

  const zoomAt = (nextZoom, anchor = { x: WIDTH / 2, y: HEIGHT / 2 }) => {
    const bounded = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
    setPan((current) => limitPan({
      x: (anchor.x - WIDTH / 2) - ((anchor.x - WIDTH / 2) - current.x) * bounded / zoom,
      y: (anchor.y - HEIGHT / 2) - ((anchor.y - HEIGHT / 2) - current.y) * bounded / zoom,
    }, bounded))
    setZoom(bounded)
  }

  const reset = () => {
    setZoom(MIN_ZOOM)
    setPan({ x: 0, y: 0 })
  }

  const pointerPosition = (event) => {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * WIDTH / rect.width,
      y: (event.clientY - rect.top) * HEIGHT / rect.height,
    }
  }

  const onPointerDown = (event) => {
    if (event.button !== 0) return
    const point = pointerPosition(event)
    movedRef.current = false
    dragRef.current = { pointerId: event.pointerId, start: point, origin: pan }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const point = pointerPosition(event)
    const dx = point.x - drag.start.x
    const dy = point.y - drag.start.y
    if (Math.abs(dx) + Math.abs(dy) > 3) movedRef.current = true
    setPan(limitPan({ x: drag.origin.x + dx, y: drag.origin.y + dy }))
  }

  const onPointerUp = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const selectPlace = (place) => {
    if (movedRef.current) return
    // Notify the parent before changing local selection so it can render its card immediately.
    onSelect?.(place)
    setSelected(place)
    setHovered(place)
  }

  const handleMarkerKeyDown = (event, place) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectPlace(place)
    }
  }

  const openPlace = (place) => {
    if (place?.id != null) window.location.hash = `#place/${place.id}`
  }

  const active = hovered || selected
  const activePoint = validPlaces.find(({ place }) => samePlace(place, active))?.point
  const transform = `translate(${WIDTH / 2 + pan.x} ${HEIGHT / 2 + pan.y}) scale(${zoom}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`

  return (
    <div className="shotmap-world-map">
      <div className="shotmap-map-toolbar" aria-label="Map controls">
        <div className="shotmap-map-zoom" role="group" aria-label="Zoom map">
          <button type="button" onClick={() => zoomAt(zoom + 0.5)} aria-label="Zoom in">+</button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => zoomAt(zoom - 0.5)} aria-label="Zoom out">−</button>
        </div>
        <button type="button" className="shotmap-map-reset" onClick={reset} disabled={zoom === 1 && !pan.x && !pan.y}>
          Reset view
        </button>
      </div>
      <div className="shotmap-map-frame">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Interactive world map of photo places"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={(event) => {
            event.preventDefault()
            const point = pointerPosition(event)
            zoomAt(zoom + (event.deltaY < 0 ? 0.3 : -0.3), point)
          }}
        >
          <defs>
            <linearGradient id={`${mapId}-ocean`} x1="0" y1="0" x2="1" y2="1">
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
            <g transform={transform}>
              <rect x={-80} y={-80} width={WIDTH + 160} height={HEIGHT + 160} fill={`url(#${mapId}-grid)`} />
              <g className="shotmap-map-countries" aria-hidden="true">
                {features.map((item, index) => <path key={item.id || index} d={path(item)} />)}
              </g>
              <g className="shotmap-map-markers">
                {validPlaces.map(({ place, point }) => {
                  const isActive = samePlace(place, active)
                  return (
                    <g
                      key={place.id ?? `${place.name}-${point.join('-')}`}
                      className={`shotmap-map-marker${isActive ? ' is-active' : ''}`}
                      transform={`translate(${point[0]} ${point[1]})`}
                      tabIndex={0}
                      role="button"
                      aria-label={`Select ${place.name || 'photo place'}`}
                      aria-pressed={isActive}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => selectPlace(place)}
                      onKeyDown={(event) => handleMarkerKeyDown(event, place)}
                      onFocus={() => setHovered(place)}
                      onBlur={() => setHovered((current) => samePlace(current, place) ? null : current)}
                      onMouseEnter={() => setHovered(place)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <circle className="shotmap-marker-pulse" r="12" />
                      <circle className="shotmap-marker-halo" r="8" />
                      <circle className="shotmap-marker-dot" r="4" />
                    </g>
                  )
                })}
              </g>
            </g>
            {active && activePoint && (
              <foreignObject
                className="shotmap-map-tooltip"
                x={clamp((activePoint[0] - WIDTH / 2) * zoom + WIDTH / 2 + pan.x - 108, 10, WIDTH - 226)}
                y={clamp((activePoint[1] - HEIGHT / 2) * zoom + HEIGHT / 2 + pan.y - 86, 10, HEIGHT - 112)}
                width="216"
                height="104"
                onMouseEnter={() => setHovered(active)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="shotmap-tooltip-card">
                  <strong>{active.name || 'Photo place'}</strong>
                  {(active.city || active.country) && <span>{[active.city, active.country].filter(Boolean).join(', ')}</span>}
                  {active.score != null && <small>★ {active.score}/100</small>}
                  {active.id != null && <button type="button" onClick={() => openPlace(active)}>Open place <span aria-hidden="true">↗</span></button>}
                </div>
              </foreignObject>
            )}
          </g>
        </svg>
        <span className="shotmap-map-hint">Drag to explore · scroll to zoom</span>
      </div>
    </div>
  )
}

export default MapView
