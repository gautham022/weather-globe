import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ShootingStars } from '@/components/ui/shooting-stars'
import earthTexture from './textures/earth.jpg'
import WeatherRadarView from './WeatherRadarView'
import WeatherForecastPanel from './WeatherForecastPanel'
import './App.css'

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

const funnyMessages = [
  "Hmm, that city seems to be hiding from satellites.",
  "404: City ghosted us.",
  "That place doesn't exist... or you typo'd. No judgment.",
  "Even Google Maps is confused right now.",
  "Our weather balloons came back empty-handed.",
  "We searched Earth. No luck.",
  "That city is playing hide and seek.",
  "The clouds have never heard of that place.",
  "Weather report unavailable from the imaginary dimension.",
  "The pigeons delivering weather data got lost.",
  "Nice try... but we couldn't find that city.",
  "Our radar just shrugged.",
  "This city must be using stealth mode.",
  "The weather gods are scratching their heads.",
  "No weather today... because there's no city.",
  "Oops! That location escaped our database.",
  "Even Sherlock Holmes couldn't find that city.",
  "Mission failed. City not found.",
  "The GPS is questioning reality.",
  "That city is probably on another planet.",
  "Houston, we have a location problem.",
  "Our satellites are asking, 'Where?'",
  "The map just said, 'Nope.'",
  "That doesn't ring any weather bells.",
  "Looks like your keyboard went on an adventure.",
  "This city skipped geography class.",
  "Error 404: Sunshine not found.",
  "The forecast is... confusion.",
  "That location has mastered invisibility.",
  "Did you invent a new city? Impressive.",
  "We checked every cloud. Nothing there.",
  "Our weather wizard couldn't cast that spell.",
  "The forecast elves couldn't locate it.",
  "Plot twist: That city isn't on the map.",
  "Even the compass is spinning in circles.",
  "Looks like the city packed its bags and left.",
  "You unlocked the secret city... that doesn't exist.",
  "The weather server blinked twice and gave up.",
  "No city, no forecast, only mystery.",
  "That location is beyond our meteorological powers.",
  "The rain refused to fall there because it couldn't find it.",
  "Try a different spelling—we promise we're not judging.",
  "We found lots of clouds, but no city.",
  "The map is giving us the silent treatment.",
  "Weather update: 100% chance of typo.",
  "That city might exist in an alternate universe.",
  "Even the wind whispered, 'Never heard of it.'",
  "Our forecast machine is officially confused.",
  "Oops! That city is off the radar.",
  "Looks like you've discovered Atlantis... or just a typo.",
  "The clouds looked everywhere. Still nothing.",
  "The sun says that city doesn't exist.",
  "The rain can't fall where it can't find.",
  "The forecast says: Unknown with a chance of typo.",
  "The wind blew away your city name.",
  "Storms know many places. Not this one.",
  "The rainbow ends somewhere else.",
  "Lightning couldn't strike that location either.",
  "Our thermometer is as confused as we are.",
  "The forecast chickens refused to predict this one.",
]

function App() {
  const canvasRef = useRef(null)
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [popupScreenPos, setPopupScreenPos] = useState(null)
  const [popupVisible, setPopupVisible] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [placeSuggestions, setPlaceSuggestions] = useState([])
  const [newsArticles, setNewsArticles] = useState([])
  const [now, setNow] = useState(new Date())
  const [showRadar, setShowRadar] = useState(false)

  const markerRef = useRef(null)
  const targetPositionRef = useRef(null)

  useEffect(() => {
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 3

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(window.innerWidth, window.innerHeight)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.15
    controls.minDistance = 1.5
    controls.maxDistance = 6
    controls.enableZoom =false

    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(earthTexture)

    const geometry = new THREE.SphereGeometry(1, 64, 64)
    const material = new THREE.MeshStandardMaterial({ map: texture })
    const globe = new THREE.Mesh(geometry, material)
    scene.add(globe)

    const light = new THREE.DirectionalLight(0xffffff, 2)
    light.position.set(5, 3, 5)
    scene.add(light)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    function createMarkerTexture() {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext('2d')

      ctx.beginPath()
      ctx.arc(32, 32, 28, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(32, 32, 20, 0, Math.PI * 2)
      ctx.fillStyle = '#4285F4'
      ctx.fill()

      return new THREE.CanvasTexture(canvas)
    }

    const markerTexture = createMarkerTexture()
    const markerMaterial = new THREE.SpriteMaterial({
      map: markerTexture,
      depthTest: true,
      sizeAttenuation: false,
    })
    const marker = new THREE.Sprite(markerMaterial)
    marker.scale.set(0.03, 0.03, 1)
    marker.visible = false
    scene.add(marker)
    markerRef.current = marker

    function animate() {
      requestAnimationFrame(animate)
      controls.update()

      if (targetPositionRef.current) {
        camera.position.lerp(targetPositionRef.current, 0.03)
        camera.lookAt(0, 0, 0)

        if (camera.position.distanceTo(targetPositionRef.current) < 0.01) {
          targetPositionRef.current = null
        }
      }

      if (marker.visible) {
        const markerDirection = marker.position.clone().normalize()
        const cameraDirection = camera.position.clone().normalize()
        const facingDot = markerDirection.dot(cameraDirection)
        const isFacingCamera = facingDot > 0.15

        if (isFacingCamera) {
          const vector = marker.position.clone()
          vector.project(camera)
          const x = (vector.x * 0.5 + 0.5) * window.innerWidth
          const y = (-vector.y * 0.5 + 0.5) * window.innerHeight
          setPopupScreenPos({ x, y })
        } else {
          setPopupScreenPos(null)
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      renderer.dispose()
      controls.dispose()
    }
  }, [])

  useEffect(() => {
    if (!city.trim()) {
      setPlaceSuggestions([])
      return
    }

    const timeoutId = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=5`)
        .then((response) => response.json())
        .then((data) => {
          setPlaceSuggestions(data)
        })
        .catch(() => {
          setPlaceSuggestions([])
        })
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [city])

  useEffect(() => {
    fetch('https://gnews.io/api/v4/search?q=weather&lang=en&apikey=6a3d0c4ab9d0762b81d296985a2fdc5a')
      .then((response) => response.json())
      .then((data) => setNewsArticles(data.articles || []))
      .catch(() => setNewsArticles([]))
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(intervalId)
  }, [])

  function goToLocation(lat, lon) {
    const surfacePoint = latLonToVector3(lat, lon, 1)
    markerRef.current.position.copy(surfacePoint).multiplyScalar(1.01)
    markerRef.current.visible = true

    const cameraDistance = 2.2
    const cameraTarget = surfacePoint.clone().normalize().multiplyScalar(cameraDistance)
    targetPositionRef.current = cameraTarget
  }

  function fetchWeatherForCity(cityName) {
    setLoading(true)
    setError(null)
    setWeather(null)
    setPopupVisible(false)
    setShowSuggestions(false)
    setShowRadar(false)

    fetch(`http://localhost/weather/${encodeURIComponent(cityName)}`)
      .then((response) => {
        if (!response.ok) throw new Error('City not found')
        return response.json()
      })
      .then((data) => {
        setWeather(data)
        setLoading(false)
        goToLocation(data.lat, data.lon)
        setPopupVisible(false)
        setTimeout(() => setPopupVisible(true), 50)
        setRecentSearches((prev) => {
          const updated = [cityName, ...prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase())]
          return updated.slice(0, 5)
        })
      })
      .catch(() => {
        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)]
        setError(randomMessage)
        setLoading(false)
      })
  }

  function handleSearch() {
    if (!city.trim()) return
    fetchWeatherForCity(city)
  }

  function toggleWeatherHistory() {
    setShowRadar((prev) => !prev)
  }

  const formattedDate = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const formattedTime = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="app-container">
      <div className="stars-background">
        <div className="stars-glow" />
        <div className="stars-field" />
      </div>

      <div className="shooting-stars-layer">
        <ShootingStars
          starColor="#9E00FF"
          trailColor="#2EB9DF"
          minSpeed={15}
          maxSpeed={35}
          minDelay={1000}
          maxDelay={3000}
        />
        <ShootingStars
          starColor="#FF0099"
          trailColor="#FFB800"
          minSpeed={10}
          maxSpeed={25}
          minDelay={2000}
          maxDelay={4000}
        />
        <ShootingStars
          starColor="#00FF9E"
          trailColor="#00B8FF"
          minSpeed={20}
          maxSpeed={40}
          minDelay={1500}
          maxDelay={3500}
        />
      </div>

      <div className="globe-stage-wrapper">
        <div className={`globe-stage ${showRadar ? 'show-radar' : ''}`}>
          <div className="globe-layer">
            <canvas ref={canvasRef} className="globe-canvas" />
          </div>

          <div className="radar-layer">
            {weather && (
              <WeatherRadarView lat={weather.lat} lon={weather.lon} active={showRadar} />
            )}
          </div>
        </div>
      </div>

      {weather && (
        <div className="forecast-section">
          <h3 className="forecast-section-title">5 Days Weather — {weather.city}</h3>
          <WeatherForecastPanel cityName={weather.city} />
        </div>
      )}

      <div className="search-wrapper">
        <div className="search-top-row">
          <div className="search-bar">
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              placeholder="Search city..."
            />
            <button onClick={handleSearch}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <button
            className={`weather-history-btn ${showRadar ? 'active' : ''}`}
            disabled={!weather}
            onClick={toggleWeatherHistory}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            WEATHER RADAR 
          </button>
        </div>

        {showSuggestions && placeSuggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {placeSuggestions.map((place) => (
              <div
                key={place.place_id}
                className="suggestion-item"
                onMouseDown={() => {
                  const shortName = place.display_name.split(',')[0]
                  setCity(shortName)
                  fetchWeatherForCity(shortName)
                }}
              >
                <span className="pin-icon">📍</span>
                <span className="suggestion-text">{place.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {(loading || error) && (
        <div
          className="status-popup"
          style={
            canvasRef.current
              ? {
                left: canvasRef.current.getBoundingClientRect().left + canvasRef.current.offsetWidth / 2,
                top: canvasRef.current.getBoundingClientRect().top + canvasRef.current.offsetHeight / 2,
              }
              : {}
          }
        >
          {loading && <p>Loading...</p>}
          {error && <p className="error-text">{error}</p>}
        </div>
      )}

      {weather && popupScreenPos && !showRadar && (
        <div
          className={`weather-popup ${popupVisible ? 'popup-visible' : ''}`}
          style={{
            left: popupScreenPos.x + 20,
            top: popupScreenPos.y - 60,
          }}
        >
          <div className="popup-datetime">
            {formattedDate} · {formattedTime}
          </div>

          <h2>{weather.city}</h2>
          <p>{weather.temperature}°C (feels like {weather.feels_like}°C)</p>
          <p>{weather.description}</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Wind: {weather.wind_speed} m/s</p>
        </div>
      )}

      <div className="news-panel">
        <h3>World Weather News</h3>
        <div className="news-list">
          {newsArticles && newsArticles.length > 0 ? (
            newsArticles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-item"
              >
                <p className="news-title">{article.title}</p>
                <p className="news-source">{article.source?.name || article.source}</p>
              </a>
            ))
          ) : (
            <div className="news-item news-placeholder">
              <p className="news-title">No weather news available right now.</p>
              <p className="news-source">Try refreshing or check your API.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
