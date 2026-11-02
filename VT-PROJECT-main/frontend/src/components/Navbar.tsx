import { useState } from 'react'
import {
  Shield, MapPin, Navigation, Map, Users, BarChart3,
  Bell, User, ChevronDown, Menu, X, LogOut, Settings,
  Bookmark, FileText, AlertTriangle, UserCircle, Route
} from 'lucide-react'
import { useStore } from '../store'
import type { Page } from '../types'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

const NAV_LINKS: { label: string; page: Page; icon: React.ReactNode }[] = [
  { label: 'Home', page: 'home', icon: <Shield size={15} /> },
  { label: 'Find Safe Route', page: 'home', icon: <Route size={15} /> },
  { label: 'Live Navigation', page: 'navigation', icon: <Navigation size={15} /> },
  { label: 'Safety Map', page: 'map', icon: <Map size={15} /> },
  { label: 'Community', page: 'community', icon: <Users size={15} /> },
  { label: 'Safety Insights', page: 'insights', icon: <BarChart3 size={15} /> },
]

const PROFILE_ITEMS: { label: string; page?: Page; icon: React.ReactNode }[] = [
  { label: 'My Profile', page: 'profile', icon: <UserCircle size={15} /> },
  { label: 'Emergency Contacts', page: 'emergency', icon: <AlertTriangle size={15} /> },
  { label: 'Saved Routes', page: 'saved-routes', icon: <Bookmark size={15} /> },
  { label: 'Report History', page: 'community', icon: <FileText size={15} /> },
  { label: 'Settings', page: 'profile', icon: <Settings size={15} /> },
  { label: 'Logout', icon: <LogOut size={15} /> },
]

export default function Navbar() {
  const {
    currentPage, setPage,
    safetyModeOn, toggleSafetyMode,
    showProfileDropdown, toggleProfileDropdown,
    showMobileMenu, toggleMobileMenu,
    notifications, toggleNotifications, showNotifications,
    setSosActive, setShowSosModal,
  } = useStore()
  const user = auth.currentUser

const userName =
  user?.displayName ||
  (user?.email ? user.email.split('@')[0] : 'User')

const userEmail = user?.email || 'No email'

const userInitial = userName.charAt(0).toUpperCase()

  const unread = notifications.filter((n) => !n.read).length

  return (
    <nav className="sticky top-0 z-50 w-full" style={{ background: 'rgba(253,242,246,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(212,113,138,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <button onClick={() => setPage('home')} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c05070 0%, #9e6878 100%)' }}>
            <span className="text-white text-sm font-bold" style={{ fontFamily: 'JetBrains Mono' }}>S</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-base leading-tight" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>
              SheRoute <span style={{ color: '#c05070' }}>AI</span>
            </div>
            <div className="text-[10px] leading-none" style={{ color: '#9e6878', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>
              safe navigation
            </div>
          </div>
        </button>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => setPage(link.page)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-200"
              style={{
                color: currentPage === link.page ? '#c05070' : '#5a3349',
                background: currentPage === link.page ? 'rgba(192,80,112,0.08)' : 'transparent',
              }}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Safety Mode */}
          <button
            onClick={toggleSafetyMode}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: safetyModeOn ? 'rgba(76,175,130,0.12)' : 'rgba(239,68,68,0.1)',
              color: safetyModeOn ? '#2d8c6a' : '#ef4444',
              border: `1px solid ${safetyModeOn ? 'rgba(76,175,130,0.3)' : 'rgba(239,68,68,0.25)'}`,
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${safetyModeOn ? 'bg-green-500' : 'bg-red-400'} live-badge`} />
            Safety Mode {safetyModeOn ? 'ON' : 'OFF'}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-rose-50"
              style={{ color: '#5a3349' }}
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: '#c05070' }}>
                  {unread}
                </span>
              )}
            </button>
            {showNotifications && <NotificationDropdown />}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-all hover:bg-rose-50"
            >
              <div
  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
  style={{ background: 'linear-gradient(135deg, #c05070, #9e6878)' }}
>
  {userInitial}
</div>
<span className="hidden sm:block text-sm font-medium" style={{ color: '#2d1826' }}>
  {userName}
</span>
            <ChevronDown size={14} style={{ color: '#9e6878' }} />
            </button>
            {showProfileDropdown && <ProfileDropdownMenu />}
          </div>

          {/* SOS button */}
          <button
            onClick={() => setShowSosModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 2px 8px rgba(239,68,68,0.35)' }}
          >
            SOS
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl"
            style={{ color: '#5a3349' }}
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden px-4 pb-4 border-t" style={{ borderColor: 'rgba(212,113,138,0.15)' }}>
          <div className="flex flex-col gap-1 pt-3">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => setPage(link.page)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left"
                style={{
                  color: currentPage === link.page ? '#c05070' : '#5a3349',
                  background: currentPage === link.page ? 'rgba(192,80,112,0.08)' : 'transparent',
                }}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
            <button
              onClick={() => setShowSosModal(true)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold mt-2"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
            >
              <AlertTriangle size={15} />
              Emergency SOS
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

function NotificationDropdown() {
  const { notifications, markNotificationRead, clearAllNotifications } = useStore()
  const icons: Record<string, string> = {
    'safer-route': '🛡️',
    'community-report': '📍',
    'weather': '🌧️',
    'safety-change': '📊',
    'zone-warning': '⚠️',
  }
  return (
    <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-xl z-50 overflow-hidden" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.2)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(212,113,138,0.1)' }}>
        <span className="font-semibold text-sm" style={{ color: '#2d1826' }}>Notifications</span>
        <button onClick={clearAllNotifications} className="text-xs" style={{ color: '#c05070' }}>Clear all</button>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-rose-50 transition-colors border-b"
            style={{ borderColor: 'rgba(212,113,138,0.06)', background: n.read ? 'white' : 'rgba(253,242,246,0.6)' }}
          >
            <span className="text-lg mt-0.5">{icons[n.type] || '🔔'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold" style={{ color: '#2d1826' }}>{n.title}</div>
              <div className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9e6878' }}>{n.message}</div>
              <div className="text-[10px] mt-1" style={{ color: '#c9a0b2', fontFamily: 'JetBrains Mono' }}>{n.timestamp}</div>
            </div>
            {!n.read && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#c05070' }} />}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProfileDropdownMenu() {
  const { setPage, toggleProfileDropdown } = useStore()

  const user = auth.currentUser

  const userName =
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : 'User')

  const userEmail = user?.email || 'No email'

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toggleProfileDropdown()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div
      className="absolute right-0 top-12 w-52 rounded-2xl shadow-xl z-50 overflow-hidden"
      style={{ background: 'white', border: '1px solid rgba(212,113,138,0.2)' }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'rgba(212,113,138,0.1)' }}
      >
        <div className="font-semibold text-sm" style={{ color: '#2d1826' }}>
          {userName}
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#9e6878' }}>
          {userEmail}
        </div>
      </div>

      {PROFILE_ITEMS.map((item) => (
        <button
          key={item.label}
          onClick={async () => {
            if (item.label === 'Logout') {
              await handleLogout()
            } else if (item.page) {
              setPage(item.page)
            }
            toggleProfileDropdown()
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-rose-50 transition-colors"
          style={{ color: item.label === 'Logout' ? '#ef4444' : '#5a3349' }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  )
}