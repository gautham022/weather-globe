import { useEffect, useState } from 'react'

function groupForecastByDay(forecastArray) {
  const days = {}

  forecastArray.forEach((entry) => {
    const dateOnly = entry['date/time'].slice(0, 10)
    if (!days[dateOnly]) days[dateOnly] = []
    days[dateOnly].push(entry)
  })

  return Object.entries(days)
    .map(([date, entries]) => {
      const temps = entries.map((e) => e.temperature)
      const high = Math.max(...temps)
      const low = Math.min(...temps)
      const midday =
        entries.find((e) => e['date/time'].includes('12:00:00')) ||
        entries[Math.floor(entries.length / 2)]

      return {
        date,
        high,
        low,
        description: midday.description,
        humidity: midday.humidity,
        windSpeed: midday.wind_speed,
        slots: entries,
      }
    })
    .slice(0, 5)
}

function getWeatherEmoji(description) {
  const d = description.toLowerCase()
  if (d.includes('thunder')) return '⛈️'
  if (d.includes('snow')) return '❄️'
  if (d.includes('rain') || d.includes('drizzle')) return '🌧️'
  if (d.includes('overcast')) return '☁️'
  if (d.includes('cloud')) return '⛅'
  if (d.includes('clear')) return '☀️'
  if (d.includes('mist') || d.includes('fog') || d.includes('haze')) return '🌫️'
  return '🌡️'
}

function formatDayLabel(dateStr, index) {
  if (index === 0) return 'Today'
  const parsed = new Date(`${dateStr}T00:00:00`)
  return parsed.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatSlotTime(dateTimeStr) {
  const parsed = new Date(dateTimeStr.replace(' ', 'T'))
  return parsed.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function WeatherForecastPanel({ cityName }) {
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedDate, setExpandedDate] = useState(null)

  useEffect(() => {
    if (!cityName) return

    setLoading(true)
    setError(null)
    setExpandedDate(null)

    fetch(`http://localhost/forecast/${encodeURIComponent(cityName)}`)
      .then((response) => {
        if (!response.ok) throw new Error('Forecast unavailable')
        return response.json()
      })
      .then((data) => {
        setDays(groupForecastByDay(data.forecast || []))
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load forecast')
        setLoading(false)
      })
  }, [cityName])

  if (loading) {
    return <div className="panel-placeholder">Loading forecast...</div>
  }

  if (error) {
    return <div className="panel-placeholder">{error}</div>
  }

  if (days.length === 0) {
    return <div className="panel-placeholder">No forecast data</div>
  }

  return (
    <div className="forecast-list">
      {days.map((day, index) => {
        const isExpanded = expandedDate === day.date

        return (
          <div
            key={day.date}
            className={`forecast-day-card ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setExpandedDate(isExpanded ? null : day.date)}
          >
            <div className="forecast-day-top">
              <span className="forecast-day-label">{formatDayLabel(day.date, index)}</span>
              <span className="forecast-emoji">{getWeatherEmoji(day.description)}</span>
              <span className="forecast-description">{day.description}</span>
              <span className="forecast-temps">
                <span className="forecast-high">{Math.round(day.high)}°</span>
                <span className="forecast-low">{Math.round(day.low)}°</span>
              </span>
              <span className="forecast-expand-arrow">{isExpanded ? '▲' : '▼'}</span>
            </div>

            <div className="forecast-day-bottom">
              <span className="forecast-stat">💧 {day.humidity}%</span>
              <span className="forecast-stat">💨 {day.windSpeed} m/s</span>
            </div>

            {isExpanded && (
              <div className="forecast-slot-list" onClick={(e) => e.stopPropagation()}>
                {day.slots.map((slot) => (
                  <div key={slot['date/time']} className="forecast-slot-row">
                    <span className="slot-time">{formatSlotTime(slot['date/time'])}</span>
                    <span className="forecast-emoji slot-emoji">{getWeatherEmoji(slot.description)}</span>
                    <span className="slot-description">{slot.description}</span>
                    <span className="slot-temp">{Math.round(slot.temperature)}°</span>
                    <span className="slot-feels">feels {Math.round(slot.feels_like)}°</span>
                    <span className="slot-stat">💧 {slot.humidity}%</span>
                    <span className="slot-stat">💨 {slot.wind_speed} m/s</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default WeatherForecastPanel