import { useEffect, useState } from 'react'

function formatTime(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getAqiLabel(aqi) {
  const labels = { 1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Very poor' }
  return labels[aqi] || 'Unknown'
}

function getAqiColorClass(aqi) {
  if (aqi <= 2) return 'aqi-good'
  if (aqi === 3) return 'aqi-moderate'
  return 'aqi-poor'
}

function SidePanels({ weather }) {
  const [airQuality, setAirQuality] = useState(null)
  const [aqiLoading, setAqiLoading] = useState(false)

  useEffect(() => {
    if (!weather) return

    setAqiLoading(true)
    fetch(`http://localhost/air-quality/${weather.lat}/${weather.lon}`)
      .then((response) => {
        if (!response.ok) throw new Error('failed')
        return response.json()
      })
      .then((data) => {
        setAirQuality(data)
        setAqiLoading(false)
      })
      .catch(() => {
        setAirQuality(null)
        setAqiLoading(false)
      })
  }, [weather])

  if (!weather) return null

  const hasSunData = weather.sunrise != null && weather.sunset != null
  const windDeg = weather.wind_deg != null ? weather.wind_deg : 0

  return (
    <div className="side-panels">
      <div className="side-card">
        <div className="side-card-header">
          <span className="side-card-icon">☀️</span>
          <span>Sunrise &amp; sunset</span>
        </div>
        {hasSunData ? (
          <>
            <svg viewBox="0 0 220 90" className="sun-arc-svg">
              <path
                d="M 10 80 A 100 100 0 0 1 210 80"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="2"
                strokeDasharray="3 4"
              />
              <circle cx="110" cy="34" r="6" fill="#f0c419" />
            </svg>
            <div className="sun-times-row">
              <div>
                <div className="sun-label">Sunrise</div>
                <div className="sun-value">{formatTime(weather.sunrise)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="sun-label">Sunset</div>
                <div className="sun-value">{formatTime(weather.sunset)}</div>
              </div>
            </div>
          </>
        ) : (
          <p className="side-card-empty">Sun data unavailable</p>
        )}
      </div>

      <div className="side-card">
        <div className="side-card-header">
          <span className="side-card-icon">🌬️</span>
          <span>Air quality</span>
        </div>
        {aqiLoading ? (
          <p className="side-card-empty">Loading...</p>
        ) : airQuality ? (
          <>
            <div className="aqi-value-row">
              <span className="aqi-number">{airQuality.aqi * 20 <= 100 ? airQuality.aqi * 20 : 100}</span>
              <span className={`aqi-badge ${getAqiColorClass(airQuality.aqi)}`}>
                {getAqiLabel(airQuality.aqi)}
              </span>
            </div>
            <div className="aqi-stat-row">
              <span>PM2.5</span>
              <span>{airQuality.pm2_5.toFixed(1)} µg/m³</span>
            </div>
            <div className="aqi-stat-row">
              <span>PM10</span>
              <span>{airQuality.pm10.toFixed(1)} µg/m³</span>
            </div>
            <div className="aqi-stat-row">
              <span>O₃</span>
              <span>{airQuality.o3.toFixed(1)} µg/m³</span>
            </div>
          </>
        ) : (
          <p className="side-card-empty">Air quality unavailable</p>
        )}
      </div>

      <div className="side-card">
        <div className="side-card-header">
          <span className="side-card-icon">🧭</span>
          <span>Wind compass</span>
        </div>
        <div className="compass-wrapper">
          <svg viewBox="0 0 100 100" className="compass-svg">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x="50" y="14" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">N</text>
            <text x="88" y="53" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">E</text>
            <text x="50" y="92" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">S</text>
            <text x="12" y="53" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">W</text>
            <g transform={`rotate(${windDeg}, 50, 50)`}>
              <line x1="50" y1="50" x2="50" y2="18" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" />
              <circle cx="50" cy="50" r="3" fill="#4285F4" />
            </g>
          </svg>
        </div>
        <div className="wind-value-row">
          <span className="sun-value">{weather.wind_speed} m/s</span>
        </div>
      </div>
    </div>
  )
}

export default SidePanels