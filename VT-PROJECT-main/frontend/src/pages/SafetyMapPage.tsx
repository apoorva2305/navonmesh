import { useState } from 'react'
import MapView from '../components/MapView'

const TIME_FILTERS = ['Now', 'Morning', 'Afternoon', 'Evening', 'Night']
const LAYER_FILTERS = [
  { key: 'crime', label: 'Crime Risk', color: '#ef4444' },
  { key: 'activity', label: 'Human Activity', color: '#4caf82' },
  { key: 'lighting', label: 'Street Lighting', color: '#f59e0b' },
  { key: 'reports', label: 'Community Reports', color: '#c05070' },
  { key: 'police', label: 'Police Availability', color: '#3b82f6' },
  { key: 'weather', label: 'Weather', color: '#8b5cf6' },
]

const LEGEND = [
  { color: '#4caf82', label: 'Low Risk (Safe)' },
  { color: '#f59e0b', label: 'Moderate Risk' },
  { color: '#f97316', label: 'Elevated Risk' },
  { color: '#ef4444', label: 'High Risk' },
]

export default function SafetyMapPage() {
  const [selectedTime, setSelectedTime] = useState('Now')
  const [activeLayers, setActiveLayers] = useState<string[]>(['crime', 'activity'])

  function toggleLayer(key: string) {
    setActiveLayers((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>Safety Map</h1>
        <p className="text-sm mt-1" style={{ color: '#9e6878' }}>Explore safety conditions across your city with our live heatmap</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(212,113,138,0.2)' }}>
          {TIME_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTime(t)}
              className="px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: selectedTime === t ? 'rgba(192,80,112,0.9)' : 'white',
                color: selectedTime === t ? 'white' : '#5a3349',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {LAYER_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => toggleLayer(f.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeLayers.includes(f.key) ? `${f.color}15` : 'white',
                border: `1px solid ${activeLayers.includes(f.key) ? f.color + '60' : 'rgba(212,113,138,0.2)'}`,
                color: activeLayers.includes(f.key) ? f.color : '#5a3349',
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: activeLayers.includes(f.key) ? f.color : '#d4a0b0' }} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <MapView height="580px" showControls={true} />

      {/* Legend + info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: '#2d1826' }}>Safety Risk Legend</h3>
          <div className="space-y-2">
            {LEGEND.map((l) => (
              <div key={l.label} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg flex-shrink-0" style={{ background: l.color + '25', border: `2px solid ${l.color}50` }} />
                <span className="text-xs" style={{ color: '#5a3349' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: '#2d1826' }}>Area Safety Summary</h3>
          <div className="space-y-2">
            {[
              { label: 'Bandra West', score: 87, level: 'Safe' },
              { label: 'Khar Road', score: 79, level: 'Moderate' },
              { label: 'Santacruz West', score: 83, level: 'Safe' },
              { label: 'Juhu', score: 91, level: 'Very Safe' },
              { label: 'Bandstand', score: 72, level: 'Moderate' },
            ].map((area) => (
              <div key={area.label} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#5a3349' }}>{area.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(212,113,138,0.12)' }}>
                    <div className="h-full rounded-full" style={{ width: `${area.score}%`, background: area.score >= 85 ? '#4caf82' : '#f59e0b' }} />
                  </div>
                  <span className="text-[10px] font-semibold w-12 text-right" style={{ fontFamily: 'JetBrains Mono', color: area.score >= 85 ? '#4caf82' : '#f59e0b' }}>
                    {area.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
