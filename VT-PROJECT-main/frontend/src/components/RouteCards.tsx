import { useState } from 'react'
import { Shield, Clock, MapPin, Zap, Moon, Car, AlertTriangle, Cloud, Users, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import type { Route } from '../types'

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(212,113,138,0.12)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%`, background: color }}
      />
    </div>
  )
}

function RouteCard({ route, isSelected, onSelect }: { route: Route; isSelected: boolean; onSelect: () => void }) {
  const [expanded, setExpanded] = useState(false)

  const scoreColor = route.safetyScore >= 85 ? '#4caf82' : route.safetyScore >= 70 ? '#f59e0b' : '#ef4444'
  const bgColor = isSelected
    ? route.type === 'safest' ? 'rgba(76,175,130,0.06)' : route.type === 'balanced' ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)'
    : 'white'

  const badge = route.type === 'safest' ? { label: '★ Recommended', bg: 'rgba(76,175,130,0.12)', color: '#2d8c6a' } : null

  const details = [
    { icon: <Users size={12} />, label: 'Human Activity', value: route.humanActivity, suffix: '/100' },
    { icon: <Moon size={12} />, label: 'Road Lighting', value: route.roadLighting, suffix: '/100' },
    { icon: <Shield size={12} />, label: 'Police Proximity', value: route.policeProximity, suffix: '/100' },
    { icon: <Car size={12} />, label: 'Hospital Proximity', value: route.hospitalProximity, suffix: '/100' },
    { icon: <AlertTriangle size={12} />, label: 'Crime Risk', value: route.crimeRisk, suffix: '/100', invert: true },
    { icon: <Cloud size={12} />, label: 'Weather Risk', value: route.weatherRisk, suffix: '/100', invert: true },
  ]

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 cursor-pointer ${isSelected ? (route.type === 'safest' ? 'glow-safe' : '') : ''}`}
      style={{
        background: bgColor,
        borderColor: isSelected ? route.color : 'rgba(212,113,138,0.15)',
        borderWidth: isSelected ? '2px' : '1px',
      }}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-sm" style={{ color: '#2d1826' }}>{route.label}</span>
              {badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#9e6878' }}>
              <span className="flex items-center gap-1"><Clock size={11} />{route.eta} min</span>
              <span className="flex items-center gap-1"><MapPin size={11} />{route.distance}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: scoreColor, fontFamily: 'JetBrains Mono' }}>
              {route.safetyScore}
            </div>
            <div className="text-[10px]" style={{ color: '#9e6878' }}>/ 100</div>
          </div>
        </div>

        <ScoreBar value={route.safetyScore} color={route.color} />

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-xs" style={{ color: '#9e6878' }}>
            <span style={{ color: '#ef4444' }}>⚠ {route.communityReports} reports</span>
            <span style={{ color: '#4caf82' }}>👥 {route.humanActivity}% active</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="flex items-center gap-1 text-xs font-medium transition-all"
            style={{ color: '#c05070' }}
          >
            Details <ChevronRight size={12} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2.5" style={{ borderColor: 'rgba(212,113,138,0.1)' }}>
            {details.map((d) => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] flex items-center gap-1" style={{ color: '#9e6878' }}>{d.icon}{d.label}</span>
                  <span className="text-[10px] font-mono font-semibold" style={{ color: d.invert ? (d.value > 30 ? '#ef4444' : '#4caf82') : (d.value > 60 ? '#4caf82' : '#f59e0b') }}>
                    {d.value}{d.suffix}
                  </span>
                </div>
                <ScoreBar
                  value={d.value}
                  color={d.invert ? (d.value > 30 ? '#ef4444' : '#4caf82') : (d.value > 60 ? '#4caf82' : '#f59e0b')}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function RouteCards() {
  const { routes, selectedRoute, setSelectedRoute } = useStore()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826', fontSize: '18px' }}>Available Routes</h3>
        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(192,80,112,0.08)', color: '#c05070' }}>
          Fastest ≠ Safest
        </span>
      </div>
      {routes.length === 0 ? (
        <div className="rounded-2xl p-5 text-sm" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)', color: '#5a3349' }}>
          Enter a destination and run route search to load live backend recommendations.
        </div>
      ) : routes.map((route) => (
        <RouteCard
          key={route.id}
          route={route}
          isSelected={selectedRoute?.id === route.id}
          onSelect={() => setSelectedRoute(route)}
        />
      ))}
    </div>
  )
}

export function RouteComparison() {
  const { routes, selectedRoute, setSelectedRoute } = useStore()

  if (routes.length === 0) {
    return (
      <div className="rounded-2xl p-5 text-sm" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)', color: '#5a3349' }}>
        Route comparison will appear here after you search for a destination.
      </div>
    )
  }

  const metrics = [
    { key: 'safetyScore', label: 'Safety Score', format: (v: number) => `${v}/100`, color: (v: number) => v >= 85 ? '#4caf82' : v >= 70 ? '#f59e0b' : '#ef4444' },
    { key: 'eta', label: 'ETA', format: (v: number) => `${v} min`, color: () => '#9e6878' },
    { key: 'humanActivity', label: 'Human Activity', format: (v: number) => `${v}%`, color: (v: number) => v >= 70 ? '#4caf82' : '#f59e0b' },
    { key: 'roadLighting', label: 'Road Lighting', format: (v: number) => `${v}%`, color: (v: number) => v >= 70 ? '#4caf82' : '#f59e0b' },
    { key: 'policeProximity', label: 'Police Proximity', format: (v: number) => `${v}%`, color: (v: number) => v >= 70 ? '#4caf82' : '#f59e0b' },
    { key: 'crimeRisk', label: 'Crime Risk', format: (v: number) => `${v}%`, color: (v: number) => v > 30 ? '#ef4444' : '#4caf82', invert: true },
    { key: 'communityReports', label: 'Safety Reports', format: (v: number) => `${v}`, color: (v: number) => v === 0 ? '#4caf82' : v <= 3 ? '#f59e0b' : '#ef4444', invert: true },
  ]

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'rgba(212,113,138,0.1)' }}>
        <h3 className="font-semibold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826', fontSize: '18px' }}>Route Comparison</h3>
        <p className="text-xs mt-0.5" style={{ color: '#9e6878' }}>Click a column to select that route</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(253,242,246,0.6)' }}>
              <th className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: '#9e6878' }}>Metric</th>
              {routes.map((r) => (
                <th
                  key={r.id}
                  className="px-4 py-2.5 text-center text-xs font-semibold cursor-pointer transition-all"
                  style={{ color: selectedRoute?.id === r.id ? r.color : '#5a3349', background: selectedRoute?.id === r.id ? `${r.color}10` : 'transparent' }}
                  onClick={() => setSelectedRoute(r)}
                >
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => (
              <tr key={m.key} style={{ borderTop: '1px solid rgba(212,113,138,0.06)', background: i % 2 === 0 ? 'white' : 'rgba(253,242,246,0.3)' }}>
                <td className="px-4 py-2.5 text-xs" style={{ color: '#5a3349' }}>{m.label}</td>
                {routes.map((r) => {
                  const val = r[m.key as keyof Route] as number
                  return (
                    <td key={r.id} className="px-4 py-2.5 text-center cursor-pointer" onClick={() => setSelectedRoute(r)}>
                      <span className="text-xs font-semibold" style={{ color: m.color(val), fontFamily: 'JetBrains Mono' }}>
                        {m.format(val)}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
