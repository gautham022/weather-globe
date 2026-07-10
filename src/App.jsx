import { useState, useRef, useEffect } from 'react'
import './App.css'

function SearchBar({ city, setCity, onSearch }) {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  return (
    <div className="search-bar">
      <input
        ref={inputRef}
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch()
          }
        }}
        placeholder="Enter city name"
      />
      <button onClick={onSearch}>Search</button>
    </div>
  )
}

function WeatherCard({ weather }) {
  return (
    <div className="weather-card">
      <h2>{weather.city}</h2>
      <p>{weather.temperature}°C (feels like {weather.feels_like}°C)</p>
      <p>{weather.description}</p>
      <p>Humidity: {weather.humidity}%</p>
      <p>Wind: {weather.wind_speed} m/s</p>
    </div>
  )
}

function RecentSearches({ searches, onSelect, onClear }) {
  if (searches.length === 0) return null

  return (
    <div className="recent-searches">
      <h3>Recent Searches</h3>
      <ul>
        {searches.map((s, index) => (
          <li key={index}>
            <button onClick={() => onSelect(s)}>{s}</button>
          </li>
        ))}
      </ul>
      <button className="clear-btn" onClick={onClear}>Clear History</button>
    </div>
  )
}

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recentSearches, setRecentSearches] = useState([])

  function fetchWeather(cityName) {
    setLoading(true)
    setError(null)
    setWeather(null)

    fetch(`http://localhost/weather/${cityName}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('City not found')
        }
        return response.json()
      })
      .then((data) => {
        setWeather(data)
        setLoading(false)
        setRecentSearches((prev) => {
          const updated = [cityName, ...prev.filter((c) => c !== cityName)]
          return updated.slice(0, 5)
        })
      })
      .catch(() => {
        setError("Hmm, that city seems to be hiding from satellites.")
        setLoading(false)
      })
  }

  function handleSearch() {
    fetchWeather(city)
  }

  return (
    <div className="app">
      <h1>Weather</h1>
      <SearchBar city={city} setCity={setCity} onSearch={handleSearch} />

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {weather && <WeatherCard weather={weather} />}

      <RecentSearches
        searches={recentSearches}
        onSelect={fetchWeather}
        onClear={() => setRecentSearches([])}
      />
    </div>
  )
}

export default App
