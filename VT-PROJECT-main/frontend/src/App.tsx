import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet's default icon URLs broken by Vite's asset handling
import markerIconPng from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadowPng,
})

// Make Leaflet globally accessible for MapView
;(window as any).L = L

import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './firebase'

import { useStore } from './store'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SOSModal from './components/SOSModal'
import AIChat from './components/AIChat'
import SaferRouteAlert from './components/SaferRouteAlert'

import HomePage from './pages/HomePage'
import SafetyMapPage from './pages/SafetyMapPage'
import NavigationPage from './pages/NavigationPage'
import InsightsPage from './pages/InsightsPage'
import ProfilePage from './pages/ProfilePage'
import CommunityReports from './components/CommunityReports'
import LoginPage from './pages/LoginPage'

import { Shield, Map, Route, FileText, User as UserIcon, Sparkles, AlertTriangle } from 'lucide-react'

function BottomNav() {
  const { currentPage, setPage } = useStore()

  const items = [
    { page: 'home' as const, icon: <Shield size={20} />, label: 'Home' },
    { page: 'map' as const, icon: <Map size={20} />, label: 'Map' },
    { page: 'navigation' as const, icon: <Route size={20} />, label: 'Routes' },
    { page: 'community' as const, icon: <FileText size={20} />, label: 'Reports' },
    { page: 'profile' as const, icon: <UserIcon size={20} />, label: 'Profile' },
  ]

  return (
    <div className="bottom-nav justify-around items-center py-2 px-4">
      {items.map((item) => (
        <button
          key={item.page}
          onClick={() => setPage(item.page)}
          className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
          style={{ color: currentPage === item.page ? '#c05070' : '#9e6878' }}
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  )
}

function FloatingAIButton() {
  const { toggleAIChat, showAIChat } = useStore()

  return (
    <button
      onClick={toggleAIChat}
      className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-30 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all hover:scale-110"
      style={{
        background: showAIChat ? '#9e6878' : 'linear-gradient(135deg, #c05070, #9e6878)',
        boxShadow: '0 8px 24px rgba(192,80,112,0.35)',
        display: showAIChat ? 'none' : 'flex',
      }}
      title="Ask SheRoute AI"
    >
      <Sparkles size={20} />
    </button>
  )
}

function FloatingSOS() {
  const { setShowSosModal } = useStore()

  return (
    <button
      onClick={() => setShowSosModal(true)}
      className="fixed bottom-24 left-4 md:bottom-6 md:left-6 z-30 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-xl transition-all hover:scale-105 md:hidden"
      style={{
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        boxShadow: '0 8px 24px rgba(239,68,68,0.35)',
      }}
    >
      <AlertTriangle size={15} />
      SOS
    </button>
  )
}

export default function App() {
  const { currentPage } = useStore()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const PAGE_MAP: Record<string, React.ReactNode> = {
    home: <HomePage />,
    map: <SafetyMapPage />,
    navigation: <NavigationPage />,
    community: <CommunityReports />,
    insights: <InsightsPage />,
    profile: <ProfilePage />,
    emergency: <ProfilePage />,
    'saved-routes': <ProfilePage />,
    notifications: <ProfilePage />,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf2f6' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 main-content">
        {PAGE_MAP[currentPage] ?? <HomePage />}
      </main>

      <Footer />

      <FloatingAIButton />
      <FloatingSOS />
      <AIChat />
      <SOSModal />
      <SaferRouteAlert />
      <BottomNav />
    </div>
  )
}

