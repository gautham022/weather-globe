import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function WeatherRadarView({ lat, lon, active }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || lat == null || lon == null) return

    const map = L.map(mapContainerRef.current, {
      center: [lat, lon],
      zoom: 6,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 12,
    }).addTo(map)

    L.tileLayer('http://localhost/maptile/precipitation_new/{z}/{x}/{y}', {
      opacity: 0.75,
      maxZoom: 12,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && lat != null && lon != null) {
      mapInstanceRef.current.setView([lat, lon], 6)
    }
  }, [lat, lon])

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

  return (
    <div className="radar-card">
      <div className="radar-card-header">WORLD WEATHER RADAR</div>
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
        <span className="radar-legend-source">Precipitation · OpenWeatherMap · Basemap © CARTO</span>
      </div>
    </div>
  )
}

export default WeatherRadarView
