import React, { useEffect, useState } from 'react'
import './Footer.css'

const ACCENT = '#4A90FF'

function IconGitHub() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.79 8.205 11.387.6.11.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.833 2.807 1.304 3.492.997.108-.776.418-1.305.76-1.605-2.665-.303-5.466-1.333-5.466-5.93 0-1.31.468-2.382 1.235-3.222-.124-.303-.535-1.524.117-3.176 0 0 1.007-.322 3.3 1.23A11.5 11.5 0 0112 5.8c1.02.005 2.045.138 3.003.404 2.29-1.553 3.295-1.23 3.295-1.23.655 1.653.244 2.874.12 3.176.77.84 1.233 1.913 1.233 3.222 0 4.61-2.805 5.625-5.476 5.92.43.369.815 1.096.815 2.21 0 1.595-.014 2.88-.014 3.273 0 .32.216.694.825.576C20.565 21.788 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path fill="currentColor" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.268c-.966 0-1.75-.804-1.75-1.792 0-.99.784-1.792 1.75-1.792s1.75.802 1.75 1.792c0 .988-.784 1.792-1.75 1.792zm13.5 10.268h-3v-4.985c0-1.188-.425-1.999-1.487-1.999-.811 0-1.295.548-1.508 1.078-.078.188-.097.45-.097.714v5.192h-3s.04-8.425 0-9.295h3v1.316c.399-.616 1.111-1.49 2.703-1.49 1.974 0 3.456 1.29 3.456 4.064v5.405z" />
    </svg>
  )
}

export default function Footer() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.pageYOffset > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const features = [
    'Current Weather',
    '5-Day Forecast',
    'Interactive 3D Globe',
    'Weather Radar',
    'World Weather News',
    'City Search',
    'Live Temperature',
    'Humidity',
    'Wind Speed',
    'Feels Like',
    'Cloud Coverage',
    'Sunrise & Sunset',
    'Air Quality Index',
    'Wind Compass',
    'Saved Places',
    'Responsive Design',
  ]

  const tech = [
    'React',
    'FastAPI',
    'Python',
    'Three.js',
    'JavaScript',
    'HTML5',
    'CSS3',
    'Git',
    'GitHub',
    'OpenWeather API',
    'Leaflet',
    'OpenStreetMap',
  ]

  const comingSoon = [
    'UV Index',
    'Moon Phase',
    'Hourly Forecast',
    'Weather Alerts',
    'Satellite Layers',
    'Pollen Data',
    'Historical Weather',
    'Climate Statistics',
    'Dark Mode Toggle',
  ]

  return (
    <footer className="wg-footer" role="contentinfo">
      <div className="wg-footer-inner">
        <div className="wg-footer-grid">
          
          <div className="wg-about card">
            <h4 className="wg-section-title">ABOUT THE PROJECT</h4>
            <div className="wg-title">Weather Globe</div>
            <p className="wg-desc">Weather Globe is an interactive weather forecasting platform built using modern web technologies. Users can search any city, explore the 3D Earth, view live weather conditions, 5-day forecasts, interactive weather radar, and global weather news in one place.</p>
            <div className="wg-about-stats">
              <div className="about-stat-item">
                <strong>15+</strong>
                <span>Features</span>
              </div>
              <div className="about-stat-item">
                <strong>Jul 2026</strong>
                <span>Built</span>
              </div>
              <div className="about-stat-item">
                <strong>Open</strong>
                <span>Source</span>
              </div>
            </div>
          </div>

          <div className="wg-features card">
            <h4 className="wg-section-title">FEATURES</h4>
            <ul className="wg-features-list">
              {features.map((f) => (
                <li key={f}><a href="#" className="wg-link feature-link">{f}</a></li>
              ))}
            </ul>
          </div>

          <div className="wg-tech card">
            <h4 className="wg-section-title">TECH STACK</h4>
            <div className="wg-tech-list">
              {tech.map((t) => (
                <span key={t} className="tech-badge">{t}</span>
              ))}
            </div>
            <p className="wg-tech-note">{tech.length} tools powering this project, end to end.</p>
          </div>

          <div className="wg-developer card">
            <h4 className="wg-section-title">Developer</h4>
            <div className="dev-name">Gautham Balaji V.P.S</div>
            <div className="dev-role">B.Tech Electronics and Computer Engineering Student</div>
            <div className="dev-college">B. S. Abdur Rahman Crescent Institute of Science and Technology</div>
            <div className="dev-intern">Software Development Engineer Intern — TwoSpoon.ai</div>
            <p className="dev-desc">Passionate about building modern web applications, interactive user interfaces, visualization using Three.js, and scalable backend systems using FastAPI.</p>
            <div className="dev-socials">
              <a className="social" href="https://github.com/gautham022" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <IconGitHub />
              </a>
              <a className="social" href="https://www.linkedin.com/in/gautham-balaji-3b9a87356/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <IconLinkedIn />
              </a>
            </div>
          </div>

          <div className="wg-status card">
            <h4 className="wg-section-title">PROJECT STATUS</h4>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Version</span>
                <strong className="status-value">v1.0.0</strong>
              </div>
              <div className="status-item">
                <span className="status-label">Status</span>
                <strong className="status-value">Active Development</strong>
              </div>
              <div className="status-item">
                <span className="status-label">Last Updated</span>
                <strong className="status-value">July 2026</strong>
              </div>
            </div>
          </div>

          <div className="wg-coming card">
            <h4 className="wg-section-title">COMING SOON</h4>
            <div className="coming-list">
              {comingSoon.map((c) => (
                <span key={c} className="coming-chip">{c}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="wg-divider" />

        <div className="wg-bottom-row">
          <div className="wg-bottom-left">© 2026 Gautham Balaji V.P.S</div>
          <div className="wg-bottom-center">Built with React • Three.js • FastAPI • OpenWeather API</div>
          <div className="wg-bottom-right">Designed &amp; Developed by<br/>Gautham Balaji V.P.S</div>
        </div>
      </div>

      <button
        className={`wg-back-top ${showTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ⤴
      </button>

      <div className="wg-stars" aria-hidden />
    </footer>
  )
}
