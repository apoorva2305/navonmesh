import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import { INSIGHTS_DATA } from '../data/mockData'
import { TrendingUp, Shield, Route, FileText, MapPin, Award } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-lg" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.2)', fontFamily: 'Outfit' }}>
      <div className="font-semibold mb-1" style={{ color: '#2d1826' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

const RADAR_DATA = [
  { factor: 'Crime Risk', value: 92 },
  { factor: 'Lighting', value: 85 },
  { factor: 'Activity', value: 88 },
  { factor: 'Police', value: 78 },
  { factor: 'Weather', value: 90 },
  { factor: 'Reports', value: 76 },
]

export default function InsightsPage() {
  const d = INSIGHTS_DATA

  const stats = [
    { label: 'Avg Safety Score', value: `${d.avgSafetyScore}/100`, icon: <Shield size={16} />, color: '#4caf82', change: `+${d.safetyImprovement}% this month` },
    { label: 'Routes Taken', value: d.routesTaken, icon: <Route size={16} />, color: '#c05070', change: 'This month' },
    { label: 'Reports Submitted', value: d.reportsSubmitted, icon: <FileText size={16} />, color: '#f59e0b', change: 'Community contributions' },
    { label: 'Safer Routes Chosen', value: d.saferRoutesChosen, icon: <Award size={16} />, color: '#4caf82', change: `${Math.round((d.saferRoutesChosen / d.routesTaken) * 100)}% of all routes` },
    { label: 'Total Distance', value: `${d.totalDistance} km`, icon: <MapPin size={16} />, color: '#8b5cf6', change: 'Safe travel logged' },
    { label: 'Safety Improvement', value: `+${d.safetyImprovement}%`, icon: <TrendingUp size={16} />, color: '#4caf82', change: 'vs last month' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>Safety Insights</h1>
        <p className="text-sm mt-1" style={{ color: '#9e6878' }}>Your personal safety analytics and travel patterns</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${s.color}12`, color: s.color }}>{s.icon}</div>
              <TrendingUp size={12} style={{ color: '#4caf82' }} />
            </div>
            <div className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'JetBrains Mono', color: '#2d1826' }}>{s.value}</div>
            <div className="text-xs font-medium" style={{ color: '#5a3349' }}>{s.label}</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#9e6878' }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Weekly score */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: '#2d1826' }}>Weekly Safety Score</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={d.weeklyData}>
              <defs>
                <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c05070" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#c05070" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,113,138,0.08)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9e6878', fontFamily: 'Outfit' }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: '#9e6878' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#c05070" strokeWidth={2} fill="url(#weekGrad)" name="Safety Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Routes per day */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: '#2d1826' }}>Routes Per Day</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,113,138,0.08)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9e6878', fontFamily: 'Outfit' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9e6878' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="routes" fill="rgba(192,80,112,0.7)" radius={[4, 4, 0, 0]} name="Routes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: '#2d1826' }}>6-Month Safety Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={d.monthlyData}>
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4caf82" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4caf82" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,113,138,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9e6878', fontFamily: 'Outfit' }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: '#9e6878' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#4caf82" strokeWidth={2} fill="url(#monthGrad)" name="Safety Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Safety radar */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: '#2d1826' }}>Safety Factor Coverage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(212,113,138,0.15)" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10, fill: '#9e6878', fontFamily: 'Outfit' }} />
              <Radar name="Safety" dataKey="value" stroke="#c05070" fill="rgba(192,80,112,0.15)" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
