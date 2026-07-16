import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function WeatherRadarView({ lat, lon, active }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layersRef = useRef({})
  const [mapReady, setMapReady] = useState(false)
  const [selectedOverlay, setSelectedOverlay] = useState('precipitation')
  const [rainviewerLoading, setRainviewerLoading] = useState(false)
  const [timestamps, setTimestamps] = useState([])
  const [currentFrame, setCurrentFrame] = useState(null)
  const [isPlaying] = useState(false)
  const [animationSpeed] = useState(700) // ms per frame
  const [overlayOpacity] = useState(0.85)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const radarCardRef = useRef(null)
  const rainLayerRef = useRef(null)
  const playIntervalRef = useRef(null)

  // Read OpenWeatherMap API key from Vite env.
  const OWM_API_KEY = import.meta.env.VITE_OWM_API_KEY || ''
  const hasOwmKey = Boolean(OWM_API_KEY)

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || lat == null || lon == null) return

    const map = L.map(mapContainerRef.current, {
      center: [lat, lon],
      zoom: 6,
      zoomControl: true,
      attributionControl: false,
    })

    // Base map (Carto Dark) for better overlay contrast
    const base = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 12,
    }).addTo(map)

    layersRef.current.base = base
    mapInstanceRef.current = map
    setMapReady(true)

    return () => {
      map.remove()
      mapInstanceRef.current = null
      layersRef.current = {}
      setMapReady(false)
    }
  }, [])

  // center/update view when lat/lon change
  useEffect(() => {
    if (mapInstanceRef.current && lat != null && lon != null) {
      mapInstanceRef.current.setView([lat, lon], 6)
    }
  }, [lat, lon])

  // handle active toggle (invalidate size so map renders properly when shown)
  useEffect(() => {
    if (active && mapInstanceRef.current) {
      const timeoutId = setTimeout(() => {
        mapInstanceRef.current.invalidateSize()
        if (lat != null && lon != null) {
          mapInstanceRef.current.setView([lat, lon], 6)
        }
      }, 650)
      return () => clearTimeout(timeoutId)
    }
  }, [active, lat, lon])

  // Load RainViewer latest radar timestamp and create tile layer
  async function ensureRainViewerLayer() {
    if (!mapInstanceRef.current) return
    if (layersRef.current.rain) return
    setRainviewerLoading(true)
    try {
      const res = await fetch('https://api.rainviewer.com/public/maps.json')
      const json = await res.json()
      const ts = json.radar?.timestamps || json?.radar?.past || []
      setTimestamps(ts)
      const lastIndex = ts.length ? ts.length - 1 : null
      setCurrentFrame(lastIndex)

      if (ts.length === 0) {
        throw new Error('RainViewer has no timestamps')
      }

      const last = lastIndex !== null ? ts[lastIndex] : null
      const tileUrl = `https://tile.rainviewer.com/v2/radar/${last}/{z}/{x}/{y}/2/1_1.png`

      const rainLayer = L.tileLayer(tileUrl, { opacity: overlayOpacity, maxZoom: 12, crossOrigin: true })
      layersRef.current.rain = rainLayer
      rainLayerRef.current = rainLayer
      rainLayer.addTo(mapInstanceRef.current)
    } catch (err) {
      console.error('RainViewer load failed or has no data', err)
      if (hasOwmKey) {
        const tile = ensureOWMLayer('precipitation')
        if (tile) {
          layersRef.current.rain = tile
          rainLayerRef.current = tile
          tile.setOpacity(overlayOpacity)
          tile.addTo(mapInstanceRef.current)
        }
      }
    } finally {
      setRainviewerLoading(false)
    }
  }

  function ensureOWMLayer(name) {
    if (!mapInstanceRef.current) return null
    if (!OWM_API_KEY) return null
    if (layersRef.current[name]) return layersRef.current[name]

    // Map names: temp_new, wind_new, precipitation_new, clouds_new
    const layerMap = {
      temperature: 'temp_new',
      wind: 'wind_new',
      precipitation: 'precipitation_new',
      clouds: 'clouds_new',
    }

    const tileName = layerMap[name]
    if (!tileName) return null

    const url = `https://tile.openweathermap.org/map/${tileName}/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`
    const tile = L.tileLayer(url, { opacity: 0.7, maxZoom: 12 })
    layersRef.current[name] = tile
    return tile
  }

  // Switch overlay
  function setOverlay(name) {
    if (!mapInstanceRef.current) return
    // remove existing overlay layers
    ['rain', 'temperature', 'wind', 'clouds'].forEach((k) => {
      const l = layersRef.current[k]
      if (l && mapInstanceRef.current.hasLayer(l)) mapInstanceRef.current.removeLayer(l)
    })

    setSelectedOverlay(name)

    if (name === 'precipitation') {
      ensureRainViewerLayer()
    } else if (name === 'temperature' || name === 'wind' || name === 'clouds') {
      const tile = ensureOWMLayer(name)
      if (tile) tile.addTo(mapInstanceRef.current)
    }
  }

  // update tile URL for rain layer when frame changes
  useEffect(() => {
    if (!mapInstanceRef.current) return
    if (selectedOverlay !== 'precipitation') return
    if (!timestamps || timestamps.length === 0) return
    if (currentFrame == null) return

    const ts = timestamps[currentFrame]
    const url = ts
      ? `https://tile.rainviewer.com/v2/radar/${ts}/{z}/{x}/{y}/2/1_1.png`
      : `https://tile.rainviewer.com/v2/radar/0/{z}/{x}/{y}/2/1_1.png`

    const rain = layersRef.current.rain || rainLayerRef.current
    if (rain) {
      // Leaflet's tileLayer supports setUrl and setOpacity
      if (typeof rain.setUrl === 'function') rain.setUrl(url)
      if (typeof rain.setOpacity === 'function') rain.setOpacity(overlayOpacity)
      if (!mapInstanceRef.current.hasLayer(rain)) rain.addTo(mapInstanceRef.current)
    }
  }, [currentFrame, timestamps, selectedOverlay, overlayOpacity])

  // play animation when isPlaying true
  useEffect(() => {
    if (!isPlaying) {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
      return
    }

    if (!timestamps || timestamps.length === 0) return
    playIntervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev == null) return 0
        return (prev + 1) % timestamps.length
      })
    }, animationSpeed)

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
    }
  }, [isPlaying, timestamps, animationSpeed])

  // update overlay opacity for non-rain layers
  useEffect(() => {
    ;['temperature', 'wind', 'clouds'].forEach((k) => {
      const l = layersRef.current[k]
      if (l && typeof l.setOpacity === 'function') l.setOpacity(overlayOpacity)
    })
    if (layersRef.current.rain && typeof layersRef.current.rain.setOpacity === 'function') {
      layersRef.current.rain.setOpacity(overlayOpacity)
    }
  }, [overlayOpacity])

// initialize default overlay once map is ready
  useEffect(() => {
    if (!mapReady) return
    setOverlay('precipitation')
  }, [mapReady])

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFullScreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange)
    }
  }, [])

  return (
    <div ref={radarCardRef} className="radar-card">
      <div className="radar-card-header">WORLD WEATHER RADAR</div>
      <div className="radar-overlay-controls">
        <button className={selectedOverlay === 'precipitation' ? 'active' : ''} onClick={() => setOverlay('precipitation')}>
          Precipitation
        </button>
        <button className={selectedOverlay === 'temperature' ? 'active' : ''} onClick={() => setOverlay('temperature')}>
          Temperature
        </button>
        <button className={selectedOverlay === 'wind' ? 'active' : ''} onClick={() => setOverlay('wind')}>
          Wind
        </button>
        <button className={selectedOverlay === 'clouds' ? 'active' : ''} onClick={() => setOverlay('clouds')}>
          Clouds
        </button>
          <button
          className={`radar-fullscreen-btn ${isFullscreen ? 'active' : ''}`}
          onClick={() => {
            if (!document.fullscreenElement) {
              radarCardRef.current?.requestFullscreen?.()
            } else {
              document.exitFullscreen?.()
            }
          }}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          ⛶
        </button>
      </div>

      <div ref={mapContainerRef} className="radar-card-map" />

      <div className="radar-card-legend">
        <span className="radar-legend-item">
          <span className="radar-legend-dot" style={{ background: '#a8d48a' }} />
          Light
        </span>
        <span className="radar-legend-item">
          <span className="radar-legend-dot" style={{ background: '#f0c419' }} />
          Moderate
        </span>
        <span className="radar-legend-item">
          <span className="radar-legend-dot" style={{ background: '#e8622c' }} />
          Heavy
        </span>
        <span className="radar-legend-item">
          <span className="radar-legend-dot" style={{ background: '#c0392b' }} />
          Severe
        </span>
        <span className="radar-legend-source">Precipitation · RainViewer · Basemap © CARTO</span>
      </div>

      <div className="radar-card-footer">
        {rainviewerLoading && <div className="radar-loading">Loading radar…</div>}
      </div>
    </div>
  )
}

export default WeatherRadarView
