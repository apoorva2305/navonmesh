import { useState, useEffect } from 'react'
import { MapPin, Navigation, Search, Locate, ChevronRight, Shield, Users, Building, FileText, Cloud } from 'lucide-react'
import { useStore } from '../store'
import { fetchNearbyCommunityReports, fetchSafeRouteData, resolveLocationCoordinates } from '../api/backend'
import MapView from '../components/MapView'
import RouteCards, { RouteComparison } from '../components/RouteCards'
import SafetyScore from '../components/SafetyScore'
import AIExplanation from '../components/AIExplanation'
import LiveMonitor from '../components/LiveMonitor'
import HumanActivity from '../components/HumanActivity'
import WeatherCard from '../components/WeatherCard'
import NearbyServices from '../components/NearbyServices'
import CommunityReports from '../components/CommunityReports'

const HOW_IT_WORKS = [
  { step: '01', title: 'Enter Destination', desc: 'Type your destination or pick from saved places', icon: <Search size={18} /> },
  { step: '02', title: 'AI Analyzes Routes', desc: 'Our AI evaluates 7+ safety factors across all routes', icon: <span className="text-lg">🧠</span> },
  { step: '03', title: 'Compare Safety Factors', desc: 'See detailed comparisons with visual safety scores', icon: <span className="text-lg">📊</span> },
  { step: '04', title: 'Choose Safer Route', desc: 'Select the route that best balances safety and time', icon: <Shield size={18} /> },
  { step: '05', title: 'Stay Protected', desc: 'Get live safety updates throughout your journey', icon: <Navigation size={18} /> },
]

const SAFETY_FACTORS = [
  { icon: '🚔', title: 'Crime Patterns', desc: 'Historical crime data weighted by time of day and recency' },
  { icon: '🌤️', title: 'Weather', desc: 'Real-time weather affecting visibility and road safety' },
  { icon: '🕐', title: 'Time of Day', desc: 'Safety shifts dramatically between day and night' },
  { icon: '💡', title: 'Road Lighting', desc: 'Streetlight coverage and quality along the route' },
  { icon: '👥', title: 'Human Activity', desc: 'Pedestrian density from nearby places and land-use' },
  { icon: '🚔', title: 'Police Proximity', desc: 'Distance from police stations and patrol routes' },
  { icon: '🏥', title: 'Hospital Proximity', desc: 'Access to emergency medical services' },
  { icon: '📋', title: 'Community Reports', desc: 'Verified safety reports from other women' },
  { icon: '🛣️', title: 'Road Type', desc: 'Main roads vs isolated lanes and back alleys' },
]

function QuickDashboard() {
  const { communityReports, weather, nearbyPlaces, safetyScore } = useStore()
  const [score, setScore] = useState(0)
  const [activityIdx, setActivityIdx] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setScore(safetyScore), 300)
    const t2 = setTimeout(() => setActivityIdx(Math.max(0, Math.min(100, Math.round((score || safetyScore) * 0.92)))), 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [safetyScore, score])

  const nearbyPoliceCount = nearbyPlaces.filter((place) => place.type === 'police').length

  const cards = [
    { label: 'Current Safety Score', value: score, suffix: '/100', color: '#4caf82', icon: <Shield size={16} />, detail: 'Your area' },
    { label: 'Human Activity Index', value: activityIdx, suffix: '%', color: '#c05070', icon: <Users size={16} />, detail: 'From route analysis' },
    { label: 'Nearby Police Stations', value: nearbyPoliceCount, suffix: '', color: '#3b82f6', icon: <Building size={16} />, detail: 'From live backend data' },
    { label: 'Recent Reports', value: communityReports.filter((r) => r.status === 'active').length, suffix: '', color: '#f59e0b', icon: <FileText size={16} />, detail: 'Active reports' },
    { label: 'Weather Risk', value: weather.rainProb, suffix: '% rain', color: weather.risk === 'low' ? '#4caf82' : '#f59e0b', icon: <Cloud size={16} />, detail: weather.condition },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${card.color}15`, color: card.color }}>
              {card.icon}
            </div>
          </div>
          <div className="text-xl font-bold" style={{ fontFamily: 'JetBrains Mono', color: card.color }}>
            {card.value}
            <span className="text-xs font-normal ml-0.5" style={{ color: '#9e6878' }}>{card.suffix}</span>
          </div>
          <div className="text-[11px] font-medium mt-0.5" style={{ color: '#5a3349' }}>{card.label}</div>
          <div className="text-[10px] mt-0.5" style={{ color: '#9e6878' }}>{card.detail}</div>
        </div>
      ))}
    </div>
  )
}

function Hero() {
  const {
    origin,
    destination,
    setOrigin,
    setDestination,
    setPage,
    setShowSaferAlert,
    setRoutes,
    setWeather,
    setNearbyPlaces,
    setSafetyScore,
    setCommunityReports,
  } = useStore()
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  function fillCurrentLocation() {
    if (!navigator.geolocation) {
      setSearchError('Browser geolocation is not available in this environment.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setOrigin(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        setSearchError(null)
      },
      () => {
        setSearchError('Unable to read your current location. Please allow location access or type coordinates manually.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  useEffect(() => {
    if (!origin) {
      fillCurrentLocation()
    }
    // Only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function findRoute() {
    if (!destination) return

    setSearchError(null)
    setSearching(true)

    try {
      const resolvedStart = origin ? await resolveLocationCoordinates(origin) : null
      const resolvedEnd = await resolveLocationCoordinates(destination)

      if (!resolvedEnd) {
        setSearchError('Destination could not be located. Please enter a clearer place name or coordinates.')
        return
      }

      const start = resolvedStart
        ?? await new Promise<[number, number]>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation unavailable'))
            return
          }

          navigator.geolocation.getCurrentPosition(
            (position) => resolve([position.coords.latitude, position.coords.longitude]),
            () => reject(new Error('Unable to get current location')),
            { enableHighAccuracy: true, timeout: 10000 },
          )
        }).catch(() => null)

      if (!start) {
        setSearchError('Set your current location first, then search again.')
        setSearching(false)
        return
      }

      const end = resolvedEnd

      const response = await fetchSafeRouteData({
        start_lat: start[0],
        start_lon: start[1],
        end_lat: end[0],
        end_lon: end[1],
      })

      setRoutes(response.routes)
      setWeather(response.weather)
      setNearbyPlaces(response.nearbyPlaces)
      setSafetyScore(response.bestScore)

      const reports = await fetchNearbyCommunityReports(start[0], start[1])
      if (reports.length > 0) {
        setCommunityReports(reports)
      }

      setTimeout(() => setShowSaferAlert(true), 3000)
    } catch (error) {
      console.error(error)
      setSearchError('Unable to fetch dynamic routes from backend. Verify backend is running and API keys are configured.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(192,80,112,0.08) 0%, rgba(158,104,120,0.08) 50%, rgba(253,242,246,0.5) 100%)', border: '1px solid rgba(212,113,138,0.15)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(192,80,112,0.3) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(158,104,120,0.3) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 px-6 py-10 md:py-14 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: 'rgba(76,175,130,0.1)', border: '1px solid rgba(76,175,130,0.25)' }}>
          <span className="w-1.5 h-1.5 rounded-full live-badge" style={{ background: '#4caf82' }} />
          <span className="text-xs font-semibold" style={{ color: '#2d8c6a' }}>AI-Powered Safety Navigation · Live</span>
        </div>

        <h1 className="text-4xl md:text-5xl leading-tight mb-3" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>
          Navigate safer.<br />
          <em style={{ color: '#c05070' }}>Travel smarter.</em>
        </h1>

        <p className="text-sm md:text-base leading-relaxed mb-6 max-w-lg" style={{ color: '#5a3349' }}>
          SheRoute AI analyzes crime patterns, road conditions, human activity, weather, nearby emergency services, and community reports to help you choose safer routes — not just faster ones.
        </p>

        {/* Search inputs */}
        <div className="rounded-2xl p-4 space-y-3 mb-4" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,113,138,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#4caf82' }} />
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Current Location"
              className="flex-1 text-sm py-1"
              style={{ background: 'transparent', border: 'none', color: '#2d1826', outline: 'none' }}
            />
            <button
              onClick={fillCurrentLocation}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
              style={{ background: 'rgba(192,80,112,0.08)', color: '#c05070' }}
            >
              <Locate size={11} />Use My Location
            </button>
          </div>
          <div className="w-full h-px" style={{ background: 'rgba(212,113,138,0.12)' }} />
          <div className="flex items-center gap-3">
            <MapPin size={16} style={{ color: '#c05070', flexShrink: 0 }} />
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where are you going?"
              className="flex-1 text-sm py-1"
              style={{ background: 'transparent', border: 'none', color: '#2d1826', outline: 'none' }}
              onKeyDown={(e) => e.key === 'Enter' && findRoute()}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={findRoute}
            disabled={!destination || searching}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{
              background: destination ? 'linear-gradient(135deg, #c05070, #9e6878)' : 'rgba(212,113,138,0.3)',
              boxShadow: destination ? '0 6px 20px rgba(192,80,112,0.35)' : 'none',
            }}
          >
            {searching ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</>
            ) : (
              <><Shield size={16} />Find Safest Route</>
            )}
          </button>
          <button
            onClick={() => setPage('map')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold border transition-all hover:bg-white"
            style={{ color: '#5a3349', borderColor: 'rgba(212,113,138,0.3)', background: 'rgba(255,255,255,0.7)' }}
          >
            <span>🗺️</span>Explore Safety Map
          </button>
        </div>

        {searchError && (
          <p className="text-xs mt-3" style={{ color: '#ef4444' }}>
            {searchError}
          </p>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Hero />
      <QuickDashboard />

      {/* Map + Route Panel */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <MapView height="520px" showControls={true} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <RouteCards />
        </div>
      </div>

      {/* Route Comparison */}
      <RouteComparison />

      {/* Safety analysis grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        <SafetyScore />
        <AIExplanation />
        <HumanActivity />
      </div>

      {/* Live Monitor + Weather + Nearby */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        <LiveMonitor />
        <div className="space-y-5">
          <WeatherCard />
          <NearbyServices />
        </div>
        {/* Quick stats */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: '#2d1826' }}>Your Safety Profile</h3>
          {[
            { label: 'Routes Taken', value: '47', icon: '🛣️' },
            { label: 'Avg Safety Score', value: '88/100', icon: '🛡️' },
            { label: 'Reports Submitted', value: '12', icon: '📋' },
            { label: 'Safer Routes Chosen', value: '38', icon: '✅' },
            { label: 'Distance Traveled', value: '284 km', icon: '📏' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: 'rgba(212,113,138,0.08)' }}>
              <span className="text-xs flex items-center gap-2" style={{ color: '#5a3349' }}><span>{item.icon}</span>{item.label}</span>
              <span className="text-xs font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#c05070' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Community Reports */}
      <CommunityReports />

      {/* How It Works */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>How SheRoute Works</h2>
          <p className="text-sm" style={{ color: '#9e6878' }}>Five simple steps to safer navigation</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} className="flex-1 rounded-2xl p-4 text-center relative" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
              <div className="text-[10px] font-bold mb-2" style={{ color: '#c05070', fontFamily: 'JetBrains Mono' }}>{step.step}</div>
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: 'rgba(192,80,112,0.08)', color: '#c05070' }}>
                {step.icon}
              </div>
              <div className="font-semibold text-xs mb-1" style={{ color: '#2d1826' }}>{step.title}</div>
              <div className="text-[11px] leading-relaxed" style={{ color: '#9e6878' }}>{step.desc}</div>
              {i < HOW_IT_WORKS.length - 1 && (
                <ChevronRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10" size={16} style={{ color: '#c9a0b2' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Safety Factors */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>Safety Factors We Analyze</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {SAFETY_FACTORS.map((f) => (
            <div key={f.title} className="rounded-2xl p-4 text-center hover:shadow-md transition-all" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.12)' }}>
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-xs font-semibold mb-1" style={{ color: '#2d1826' }}>{f.title}</div>
              <div className="text-[10px] leading-relaxed" style={{ color: '#9e6878' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
