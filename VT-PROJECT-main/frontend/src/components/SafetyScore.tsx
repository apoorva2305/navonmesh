import { useEffect, useRef, useState } from 'react'
import { Shield, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { useStore } from '../store'

function CircularScore({ score, size = 140 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(0)
  const radius = size * 0.38
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (animated / 100) * circumference

  const color = score >= 85 ? '#4caf82' : score >= 70 ? '#f59e0b' : '#ef4444'
  const label = score >= 85 ? 'Very Safe' : score >= 70 ? 'Safe' : score >= 50 ? 'Moderate' : 'High Risk'

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 200)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(212,113,138,0.12)"
          strokeWidth={size * 0.08}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.08}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-bold leading-none" style={{ fontFamily: 'JetBrains Mono', color, fontSize: size * 0.22 }}>
          {animated}
        </div>
        <div className="text-center" style={{ fontSize: size * 0.09, color: '#9e6878', marginTop: 2 }}>/100</div>
        <div className="font-semibold text-center mt-1" style={{ fontSize: size * 0.1, color }}>
          {label}
        </div>
      </div>
    </div>
  )
}

function BreakdownBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 300)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs flex items-center gap-1.5" style={{ color: '#5a3349' }}>
          <span>{icon}</span>{label}
        </span>
        <span className="text-xs font-semibold" style={{ color, fontFamily: 'JetBrains Mono' }}>{value}/100</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(212,113,138,0.1)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${animated}%`, background: color, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
    </div>
  )
}

export default function SafetyScore() {
  const { selectedRoute } = useStore()
  const score = selectedRoute?.safetyScore ?? 0
  const predictionLabel = selectedRoute?.predictionLabel
  const predictionConfidence = selectedRoute?.predictionConfidence

  const breakdown = [
    { label: 'Human Activity', value: selectedRoute?.humanActivity ?? 0, icon: '👥', color: '#4caf82' },
    { label: 'Road Lighting', value: selectedRoute?.roadLighting ?? 0, icon: '💡', color: '#f59e0b' },
    { label: 'Police Proximity', value: selectedRoute?.policeProximity ?? 0, icon: '🚔', color: '#4caf82' },
    { label: 'Hospital Proximity', value: selectedRoute?.hospitalProximity ?? 0, icon: '🏥', color: '#4caf82' },
    { label: 'Crime Risk', value: 100 - (selectedRoute?.crimeRisk ?? 100), icon: '⚠️', color: score >= 85 ? '#4caf82' : '#ef4444' },
    { label: 'Weather Risk', value: 100 - (selectedRoute?.weatherRisk ?? 100), icon: '🌤️', color: '#4caf82' },
    { label: 'Community Reports', value: Math.max(0, 100 - (selectedRoute?.communityReports ?? 0) * 15), icon: '📋', color: '#4caf82' },
  ]

  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(192,80,112,0.1)' }}>
          <Shield size={16} style={{ color: '#c05070' }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: '#2d1826' }}>AI Safety Score</h3>
          <p className="text-[11px]" style={{ color: '#9e6878' }}>Computed from backend route analysis</p>
        </div>
      </div>

      <div className="flex items-center justify-center mb-5">
        <CircularScore score={score} size={150} />
      </div>

      <div className="space-y-2.5">
        {breakdown.map((b) => (
          <BreakdownBar key={b.label} {...b} />
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: 'rgba(76,175,130,0.08)', border: '1px solid rgba(76,175,130,0.2)' }}>
        <div className="flex items-start gap-2">
          <TrendingUp size={14} style={{ color: '#4caf82', marginTop: 1 }} />
          <div style={{ color: '#2d8c6a' }}>
            This route score is driven by the model output and live route factors returned by the backend.
          </div>
        </div>
      </div>

      {predictionLabel && (
        <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: 'rgba(192,80,112,0.08)', border: '1px solid rgba(192,80,112,0.2)' }}>
          <div className="flex items-center justify-between" style={{ color: '#5a3349' }}>
            <span>ML prediction: <strong>{predictionLabel}</strong></span>
            <span>{predictionConfidence ? `${predictionConfidence.toFixed(1)}% confidence` : 'Confidence unavailable'}</span>
          </div>
        </div>
      )}
    </div>
  )
}
