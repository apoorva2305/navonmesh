import { useState } from 'react'
import { Navigation, Pause, AlertTriangle, ArrowRight, ArrowUpRight, MapPin, Clock, Shield } from 'lucide-react'
import { useStore } from '../store'
import MapView from '../components/MapView'
import { auth, db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'

export default function NavigationPage() {
  const { navigating, setNavigating, selectedRoute, setShowSosModal } = useStore()
  const [paused, setPaused] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)

  const route = selectedRoute
  const saveRoute = async () => {
    if (!route) {
      alert('Search for a route first')
      return
    }

    const user = auth.currentUser

  if (!user) {
    alert('Please login first')
    return
  }

  try {
    await addDoc(
      collection(db, 'users', user.uid, 'savedRoutes'),
      {
        name: route.label,
        from: 'Current Location',
        to: 'Destination',
        safetyScore: route.safetyScore,
        distance: route.distance,
        eta: route.eta,
        lastUsed: new Date().toLocaleDateString('en-IN'),
      }
    )

    alert('Route saved successfully!')
  } catch (error) {
    console.error(error)
    alert('Failed to save route')
  }
}

  if (!navigating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-2" style={{ background: 'rgba(192,80,112,0.1)' }}>
          <Navigation size={36} style={{ color: '#c05070' }} />
        </div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>Live Navigation</h1>
        <p className="text-sm max-w-sm" style={{ color: '#9e6878' }}>
          Start navigation to get real-time safety updates, turn-by-turn directions, and live safety monitoring throughout your journey.
        </p>
        {route ? (
          <div className="rounded-2xl p-4 w-64" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.2)' }}>
            <div className="text-sm font-semibold mb-1" style={{ color: '#2d1826' }}>{route.label}</div>
            <div className="flex items-center justify-center gap-3 text-xs" style={{ color: '#9e6878' }}>
              <span><Clock size={11} className="inline mr-1" />{route.eta} min</span>
              <span><MapPin size={11} className="inline mr-1" />{route.distance}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs" style={{ color: '#c9a0b2' }}>Search for a destination on the Home page to load a live route</p>
        )}
        <button
  onClick={saveRoute}
  disabled={!route}
  className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-semibold border mt-3"
  style={{
    color: '#c05070',
    borderColor: 'rgba(212,113,138,0.3)',
    background: route ? 'white' : 'rgba(253,242,246,0.8)',
  }}
>
  <MapPin size={16} />
  Save Route
</button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Active navigation */}
      <div className="relative rounded-2xl overflow-hidden mb-4" style={{ height: 450 }}>
        <MapView height="450px" showControls={false} />
        {/* Nav overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10">
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,113,138,0.2)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(76,175,130,0.1)' }}>
              <ArrowUpRight size={20} style={{ color: '#4caf82' }} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold" style={{ color: '#9e6878' }}>Live route</div>
              <div className="font-bold text-sm" style={{ color: '#2d1826' }}>{route?.recommendation ?? 'No route selected yet'}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#4caf82' }}>{route?.safetyScore ?? '--'}</div>
              <div className="text-[10px]" style={{ color: '#9e6878' }}>Safety</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'ETA', value: `${route.eta} min`, icon: <Clock size={14} /> },
          { label: 'Distance', value: route.distance, icon: <MapPin size={14} /> },
          { label: 'Safety Score', value: `${route.safetyScore}`, icon: <Shield size={14} /> },
          { label: 'Next Turn', value: '200m', icon: <ArrowRight size={14} /> },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
            <div className="flex items-center justify-center mb-1" style={{ color: '#c05070' }}>{s.icon}</div>
            <div className="text-sm font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#2d1826' }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: '#9e6878' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setPaused(!paused)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border transition-all"
          style={{ color: '#5a3349', borderColor: 'rgba(212,113,138,0.3)', background: paused ? 'rgba(253,242,246,0.8)' : 'white' }}
        >
          <Pause size={16} />
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={() => { setReportSubmitted(true); setTimeout(() => setReportSubmitted(false), 2000) }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border transition-all"
          style={{ color: reportSubmitted ? '#4caf82' : '#5a3349', borderColor: reportSubmitted ? 'rgba(76,175,130,0.4)' : 'rgba(212,113,138,0.3)', background: 'white' }}
        >
          <AlertTriangle size={16} />
          {reportSubmitted ? 'Reported!' : 'Report'}
        </button>
        <button
          onClick={() => setShowSosModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
        >
          <AlertTriangle size={16} />
          SOS
        </button>
        <button
          onClick={() => setNavigating(false)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border"
          style={{ color: '#9e6878', borderColor: 'rgba(212,113,138,0.3)', background: 'white' }}
        >
          End
        </button>
      </div>
    </div>
  )
}
