import { useEffect, useState } from 'react'

const STORAGE_KEY = 'weatherGlobeSavedPlaces_v1'

function loadSavedPlaces() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSavedPlaces(places) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(places))
  } catch {
    // ignore storage errors
  }
}

function formatCityDateTime(timezoneOffsetSeconds) {
  const now = new Date();

  // Convert current time to UTC
  const utcTime =
    now.getTime() + now.getTimezoneOffset() * 60 * 1000;

  // Apply city's timezone offset
  const cityTime = new Date(
    utcTime + timezoneOffsetSeconds * 1000
  );

  return cityTime.toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function PlacesPanel() {
  const [places, setPlaces] = useState(() => loadSavedPlaces())
  const [placeData, setPlaceData] = useState({})
  const [inputValue, setInputValue] = useState('')
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    saveSavedPlaces(places)
  }, [places])

  useEffect(() => {
    places.forEach((cityName) => {
      if (placeData[cityName]?.status === 'loaded' || placeData[cityName]?.status === 'loading') return

      setPlaceData((prev) => ({
        ...prev,
        [cityName]: { status: 'loading' },
      }))

      fetch(`http://localhost/weather/${encodeURIComponent(cityName)}`)
        .then((response) => {
          if (!response.ok) throw new Error('not found')
          return response.json()
        })
        .then((data) => {
          setPlaceData((prev) => ({
            ...prev,
            [cityName]: { status: 'loaded', data },
          }))
        })
        .catch(() => {
          setPlaceData((prev) => ({
            ...prev,
            [cityName]: { status: 'error' },
          }))
        })
    })
  }, [places])

  function handleAddPlace() {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const alreadyExists = places.some((p) => p.toLowerCase() === trimmed.toLowerCase())
    if (alreadyExists) {
      setAddError('Already in your list')
      return
    }

    setPlaces((prev) => [...prev, trimmed])
    setInputValue('')
    setAddError(null)
  }

  function handleRemovePlace(cityName) {
    setPlaces((prev) => prev.filter((p) => p !== cityName))
    setPlaceData((prev) => {
      const next = { ...prev }
      delete next[cityName]
      return next
    })
  }
  
  return (
    <div className="places-panel">
      <h3>My Places</h3>

      <div className="add-place-row">
        <input
          type="text"
          className="add-place-input"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setAddError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddPlace()
          }}
          placeholder="Add a city..."
        />
        <button className="add-place-btn" onClick={handleAddPlace}>
          Add
        </button>
      </div>

      {addError && <div className="add-place-error">{addError}</div>}

      <div className="places-list">
        {places.length === 0 ? (
          <div className="place-card places-empty">
            <p className="news-source">No saved places yet — add one above.</p>
          </div>
        ) : (
          places.map((cityName) => {
            const entry = placeData[cityName]

            return (
              <div key={cityName} className="place-card">
                <button
                  className="place-remove-btn"
                  onClick={() => handleRemovePlace(cityName)}
                  aria-label={`Remove ${cityName}`}
                >
                  ×
                </button>

                {!entry || entry.status === 'loading' ? (
                  <p className="place-status">Loading {cityName}...</p>
                ) : entry.status === 'error' ? (
                  <p className="place-status place-status-error">Couldn't find "{cityName}"</p>
                ) : (
                  <>
                    <div className="place-datetime">
                      {formatCityDateTime(entry.data.timezone)}
                    </div>
                    <h4 className="place-city">{entry.data.city}</h4>
                    <p className="place-temp">
                      {entry.data.temperature}°C (feels like {entry.data.feels_like}°C)
                    </p>
                    <p className="place-desc">{entry.data.description}</p>
                    <p className="place-stat">Humidity: {entry.data.humidity}%</p>
                    <p className="place-stat">Wind: {entry.data.wind_speed} m/s</p>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default PlacesPanel