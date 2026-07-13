import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import earthTexture from './textures/earth.jpg'

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

function ThreeTest() {
  const canvasRef = useRef(null)
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [popupScreenPos, setPopupScreenPos] = useState(null)

  const cameraRef = useRef(null)
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
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current })
    renderer.setSize(window.innerWidth, window.innerHeight)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 1.5
    controls.maxDistance = 6

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

  function goToLocation(lat, lon) {
    const surfacePoint = latLonToVector3(lat, lon, 1)

    markerRef.current.position.copy(surfacePoint).multiplyScalar(1.01)
    markerRef.current.visible = true

    const cameraDistance = 2.2
    const cameraTarget = surfacePoint.clone().normalize().multiplyScalar(cameraDistance)
    targetPositionRef.current = cameraTarget
  }

  function handleSearch() {
    if (!city.trim()) return

    setLoading(true)
    setError(null)
    setWeather(null)

    fetch(`http://localhost/weather/${encodeURIComponent(city)}`)
      .then((response) => {
        if (!response.ok) throw new Error('City not found')
        return response.json()
      })
      .then((data) => {
        setWeather(data)
        setLoading(false)
        goToLocation(data.lat, data.lon)
      })
      .catch(() => {
        setError("Hmm, couldn't find that city.")
        setLoading(false)
      })
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          display: 'flex',
          gap: 8,
        }}
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch()
          }}
          placeholder="Search city..."
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: 'none',
            fontSize: 15,
            width: 200,
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#4285F4',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>

      {(loading || error) && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(0,0,0,0.75)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: 12,
            fontFamily: 'system-ui, sans-serif',
            minWidth: 220,
          }}
        >
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
        </div>
      )}

      {weather && popupScreenPos && (
        <div
          style={{
            position: 'absolute',
            left: popupScreenPos.x + 20,
            top: popupScreenPos.y - 60,
            background: 'rgba(0,0,0,0.75)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: 12,
            fontFamily: 'system-ui, sans-serif',
            minWidth: 220,
            pointerEvents: 'none',
          }}
        >
          <h2 style={{ margin: '0 0 8px' }}>{weather.city}</h2>
          <p style={{ margin: '4px 0' }}>{weather.temperature}°C (feels like {weather.feels_like}°C)</p>
          <p style={{ margin: '4px 0' }}>{weather.description}</p>
          <p style={{ margin: '4px 0' }}>Humidity: {weather.humidity}%</p>
          <p style={{ margin: '4px 0' }}>Wind: {weather.wind_speed} m/s</p>
        </div>
      )}
    </div>
  )
}

export default ThreeTest
