import { useEffect, useState } from 'react'
import { Cloud, Users, Road, FileText, Siren } from 'lucide-react'
import { useStore } from '../store'

interface StatusItem {
  icon: React.ReactNode
  label: string
  value: string
  status: 'good' | 'warning' | 'danger'
  detail: string
}

function statusColor(s: 'good' | 'warning' | 'danger') {
  return s === 'good' ? '#4caf82' : s === 'warning' ? '#f59e0b' : '#ef4444'
}

function statusBg(s: 'good' | 'warning' | 'danger') {
  return s === 'good' ? 'rgba(76,175,130,0.08)' : s === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)'
}

export default function LiveMonitor() {
  const { weather, communityReports, safetyScore, nearbyPlaces, selectedRoute } = useStore()
  const [scoreDisplay, setScoreDisplay] = useState(safetyScore)

  useEffect(() => {
    setScoreDisplay(selectedRoute?.safetyScore ?? safetyScore)
  }, [selectedRoute, safetyScore])

  const items: StatusItem[] = [
    {
      icon: <Cloud size={15} />,
      label: 'Weather',
      value: `${weather.temp}°C · ${weather.condition}`,
      status: weather.risk === 'low' ? 'good' : weather.risk === 'medium' ? 'warning' : 'danger',
      detail: `Rain: ${weather.rainProb}% · Vis: ${weather.visibility}km`,
    },
    {
      icon: <Users size={15} />,
      label: 'Human Activity',
      value: `${selectedRoute?.humanActivity ?? 0}%`,
      status: (selectedRoute?.humanActivity ?? 0) >= 70 ? 'good' : (selectedRoute?.humanActivity ?? 0) >= 45 ? 'warning' : 'danger',
      detail: 'Derived from the selected route profile',
    },
    {
      icon: <span style={{ fontSize: 14 }}>🛣️</span>,
      label: 'Road Conditions',
      value: `${selectedRoute?.roadLighting ?? 0}/100 lighting`,
      status: (selectedRoute?.roadLighting ?? 0) >= 70 ? 'good' : (selectedRoute?.roadLighting ?? 0) >= 45 ? 'warning' : 'danger',
      detail: 'Based on route lighting score',
    },
    {
      icon: <FileText size={15} />,
      label: 'Community Reports',
      value: `${communityReports.filter((r) => r.status === 'active').length} active`,
      status: communityReports.filter((r) => r.status === 'active' && r.severity === 'high').length > 0 ? 'warning' : 'good',
      detail: 'Within 2km of your route',
    },
    {
      icon: <Siren size={15} />,
      label: 'Emergency Services',
      value: `${nearbyPlaces.filter((p) => p.type === 'police').length} police · ${nearbyPlaces.filter((p) => p.type === 'hospital').length} hospitals`,
      status: nearbyPlaces.length > 0 ? 'good' : 'warning',
      detail: 'Nearby services from backend',
    },
  ]

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(212,113,138,0.1)' }}>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: '#2d1826' }}>Live Safety Monitor</h3>
          <p className="text-[11px] mt-0.5" style={{ color: '#9e6878' }}>Real-time conditions along your route</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full live-badge" style={{ background: '#ef4444' }} />
          <span className="text-[10px] font-bold" style={{ color: '#ef4444', fontFamily: 'JetBrains Mono' }}>LIVE</span>
        </div>
      </div>

      {/* Current score */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(212,113,138,0.08)', background: 'rgba(76,175,130,0.04)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: '#5a3349' }}>Current Safety Score</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: scoreDisplay >= 85 ? '#4caf82' : '#f59e0b', fontFamily: 'JetBrains Mono' }}>
              {scoreDisplay}
            </span>
            <span className="text-xs" style={{ color: '#9e6878' }}>/100</span>
          </div>
        </div>
        <div className="mt-1.5 text-[11px] px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', color: '#9a6800' }}>
          ℹ️ Live panel reflects the current backend route analysis.
        </div>
      </div>

      <div className="divide-y" style={{ '--tw-divide-opacity': 0.5 } as any}>
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: statusBg(item.status), color: statusColor(item.status) }}>
                {item.icon}
              </div>
              <div>
                <div className="text-xs font-medium" style={{ color: '#2d1826' }}>{item.label}</div>
                <div className="text-[10px]" style={{ color: '#9e6878' }}>{item.detail}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-right" style={{ color: '#5a3349' }}>{item.value}</span>
              <div className="w-2 h-2 rounded-full" style={{ background: statusColor(item.status) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
