import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users } from 'lucide-react'
import { ACTIVITY_DATA } from '../data/mockData'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-lg" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.2)', fontFamily: 'Outfit, sans-serif' }}>
      <div className="font-semibold mb-1" style={{ color: '#2d1826' }}>{label}</div>
      <div style={{ color: '#c05070' }}>Activity: {payload[0]?.value}%</div>
      <div style={{ color: '#4caf82' }}>Safety: {payload[1]?.value}%</div>
    </div>
  )
}

export default function HumanActivity() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setScore(87), 300)
    return () => clearTimeout(t)
  }, [])

  const hour = new Date().getHours()
  const currentPeriod = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 21 ? 'Evening' : 'Night'

  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(192,80,112,0.1)' }}>
            <Users size={16} style={{ color: '#c05070' }} />
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: '#2d1826' }}>Human Activity Index</h3>
            <p className="text-[11px]" style={{ color: '#9e6878' }}>Derived from nearby places & land-use</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#4caf82' }}>{score}</div>
          <div className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(76,175,130,0.1)', color: '#2d8c6a' }}>High Activity</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {['Shops', 'Restaurants', 'Transport', 'Schools', 'Parks', 'Offices'].map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(192,80,112,0.08)', color: '#c05070' }}>
            {tag}
          </span>
        ))}
      </div>

      <div style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ACTIVITY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c05070" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#c05070" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="safetyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4caf82" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4caf82" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,113,138,0.1)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9e6878', fontFamily: 'Outfit' }} />
            <YAxis tick={{ fontSize: 9, fill: '#9e6878' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="activity" stroke="#c05070" strokeWidth={2} fill="url(#activityGrad)" />
            <Area type="monotone" dataKey="safety" stroke="#4caf82" strokeWidth={2} fill="url(#safetyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ background: '#c05070' }} />
          <span className="text-[10px]" style={{ color: '#9e6878' }}>Activity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ background: '#4caf82' }} />
          <span className="text-[10px]" style={{ color: '#9e6878' }}>Safety</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold" style={{ color: '#c05070' }}>Now: {currentPeriod}</span>
        </div>
      </div>
    </div>
  )
}
