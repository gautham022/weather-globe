import { useMemo } from 'react';
import { ShootingStars } from './shooting-stars';
import './SpaceBackground.css';

const PLANETS = [
  { name: 'mercury', size: 6, orbit: 70, duration: 6, color: '#b1a89e' },
  { name: 'venus', size: 9, orbit: 100, duration: 10, color: '#e0b989' },
  { name: 'earth', size: 10, orbit: 135, duration: 14, color: '#4d8fd6' },
  { name: 'mars', size: 7, orbit: 165, duration: 18, color: '#c1543a' },
  { name: 'jupiter', size: 16, orbit: 205, duration: 26, color: '#d8a86f' },
  { name: 'saturn', size: 14, orbit: 245, duration: 34, color: '#e3c98f' },
];

const SHIP_PATHS = ['drift1', 'drift2', 'drift3', 'drift4'];

function Spaceship({ index }) {
  const style = useMemo(() => {
    const path = SHIP_PATHS[index % SHIP_PATHS.length];
    const duration = 18 + Math.random() * 14; // 18s - 32s
    const delay = Math.random() * 10;
    const top = Math.random() * 80 + 5; // 5% - 85%
    const left = Math.random() * 80 + 5;
    const scale = 0.7 + Math.random() * 0.6;
    return {
      animationName: path,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      top: `${top}%`,
      left: `${left}%`,
      transform: `scale(${scale})`,
    };
  }, [index]);

  return (
    <svg
      className="spaceship"
      style={style}
      viewBox="0 0 64 64"
      width="32"
      height="32"
    >
      <g>
        <path
          d="M32 4 C40 16 42 30 32 46 C22 30 24 16 32 4 Z"
          fill="#cbd5e1"
        />
        <circle cx="32" cy="20" r="5" fill="#38bdf8" />
        <path d="M32 46 L24 58 L32 52 L40 58 Z" fill="#f97316" />
        <path d="M20 34 L10 44 L22 40 Z" fill="#94a3b8" />
        <path d="M44 34 L54 44 L42 40 Z" fill="#94a3b8" />
      </g>
    </svg>
  );
}

export default function SpaceBackground() {
  return (
    <div className="space-background">
      <div className="stars-layer" />

      <div className="solar-system-wrapper">
        <div className="solar-system">
          <div className="sun" />
          {PLANETS.map((p) => (
            <div
              key={p.name}
              className="orbit"
              style={{
                width: `${p.orbit * 2}px`,
                height: `${p.orbit * 2}px`,
                animationDuration: `${p.duration}s`,
              }}
            >
              <div
                className="planet"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: p.color,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {[0, 1, 2].map((i) => (
        <Spaceship key={i} index={i} />
      ))}

      <ShootingStars />
    </div>
  );
}