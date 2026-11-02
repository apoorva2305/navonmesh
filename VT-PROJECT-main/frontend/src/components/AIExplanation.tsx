import { useState, useEffect } from 'react'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { AI_FACTORS } from '../data/mockData'
import { useStore } from '../store'

function FactorBar({ label, value, animated }: { label: string; value: number; animated: boolean }) {
  const isPositive = value > 0
  const width = Math.abs(value)
  const color = isPositive ? '#4caf82' : '#ef4444'
  const displayVal = isPositive ? `+${value}` : `${value}`

  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-xs w-32 text-right flex-shrink-0" style={{ color: '#5a3349' }}>{label}</span>
      <div className="flex-1 flex items-center gap-2">
        {!isPositive && (
          <div className="flex-1 flex justify-end">
            <div className="h-5 rounded-l-full flex items-center justify-end pr-1.5" style={{
              width: animated ? `${width * 5}%` : '0%',
              background: `${color}20`,
              border: `1px solid ${color}40`,
              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              minWidth: animated ? '20px' : '0',
            }}>
              <span className="text-[10px] font-semibold" style={{ color, fontFamily: 'JetBrains Mono' }}>{displayVal}</span>
            </div>
          </div>
        )}
        <div className="w-px h-4" style={{ background: 'rgba(212,113,138,0.3)' }} />
        {isPositive && (
          <div className="h-5 rounded-r-full flex items-center justify-start pl-1.5" style={{
            width: animated ? `${width * 5}%` : '0%',
            background: `${color}20`,
            border: `1px solid ${color}40`,
            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
            minWidth: animated ? '20px' : '0',
          }}>
            <span className="text-[10px] font-semibold" style={{ color, fontFamily: 'JetBrains Mono' }}>{displayVal}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIExplanation() {
  const { selectedRoute } = useStore()
  const [expanded, setExpanded] = useState(true)
  const [animated, setAnimated] = useState(false)
  const confidence = selectedRoute?.predictionConfidence ?? selectedRoute?.safetyScore ?? 0

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400)
    return () => clearTimeout(t)
  }, [selectedRoute])

  useEffect(() => {
    setAnimated(false)
    const t = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(t)
  }, [selectedRoute])

  const backendExplanation = selectedRoute?.advice?.join(' ')

  const explanation = backendExplanation || (selectedRoute?.type === 'safest'
    ? "This route is being recommended by the backend model because it combines the strongest safety indicators returned for the current trip."
    : selectedRoute?.type === 'balanced'
    ? "This route balances safety and travel time based on the live route analysis returned by the backend."
    : "This route has the weakest safety profile in the current backend results, so it should be treated as the least preferred option.")

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(192,80,112,0.12), rgba(158,104,120,0.12))' }}>
            <Sparkles size={16} style={{ color: '#c05070' }} />
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: '#2d1826' }}>Why does SheRoute recommend this?</h3>
            <p className="text-[11px]" style={{ color: '#9e6878' }}>AI-powered route reasoning</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(76,175,130,0.1)', color: '#2d8c6a', fontFamily: 'JetBrains Mono' }}>
            {Math.round(confidence)}% confident
          </span>
          {expanded ? <ChevronUp size={16} style={{ color: '#9e6878' }} /> : <ChevronDown size={16} style={{ color: '#9e6878' }} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(212,113,138,0.08)' }}>
          <p className="text-sm leading-relaxed mt-3 mb-4" style={{ color: '#5a3349' }}>
            {explanation}
          </p>

          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-3" style={{ color: '#2d1826' }}>Safety Factor Contributions</h4>
            <div className="relative">
              {AI_FACTORS.map((f, i) => (
                <FactorBar key={f.label} label={f.label} value={f.value} animated={animated} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: 'rgba(212,113,138,0.08)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#4caf82' }} />
              <span className="text-xs" style={{ color: '#9e6878' }}>
                {selectedRoute?.recommendation ?? 'Model: SheRoute Safety v2.1'}
              </span>
            </div>
            <button className="text-xs font-medium" style={{ color: '#c05070' }}>
              View Detailed Analysis →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
