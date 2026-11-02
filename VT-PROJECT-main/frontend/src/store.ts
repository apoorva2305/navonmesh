import { create } from 'zustand'
import type { Route, EmergencyContact, SavedRoute, SavedPlace, Notification, CommunityReport, NearbyPlace } from './types'
import { EMERGENCY_CONTACTS, SAVED_ROUTES, SAVED_PLACES, NOTIFICATIONS, COMMUNITY_REPORTS, WEATHER, NEARBY_PLACES } from './data/mockData'
import type { WeatherData } from './types'
import type { Page } from './types'

interface AppStore {
  currentPage: Page
  setPage: (page: Page) => void

  origin: string
  destination: string
  setOrigin: (v: string) => void
  setDestination: (v: string) => void

  routes: Route[]
  selectedRoute: Route | null
  setSelectedRoute: (r: Route) => void
  setRoutes: (routes: Route[]) => void

  safetyModeOn: boolean
  toggleSafetyMode: () => void

  sosActive: boolean
  setSosActive: (v: boolean) => void
  showSosModal: boolean
  setShowSosModal: (v: boolean) => void

  navigating: boolean
  setNavigating: (v: boolean) => void

  showSaferAlert: boolean
  setShowSaferAlert: (v: boolean) => void
  dismissSaferAlert: () => void

  showAIChat: boolean
  toggleAIChat: () => void

  showProfileDropdown: boolean
  toggleProfileDropdown: () => void

  showMobileMenu: boolean
  toggleMobileMenu: () => void

  showReportModal: boolean
  setShowReportModal: (v: boolean) => void

  showNotifications: boolean
  toggleNotifications: () => void

  emergencyContacts: EmergencyContact[]
  addEmergencyContact: (c: EmergencyContact) => void
  removeEmergencyContact: (id: string) => void
  setPrimaryContact: (id: string) => void

  savedRoutes: SavedRoute[]
  savedPlaces: SavedPlace[]

  notifications: Notification[]
  unreadCount: number
  markNotificationRead: (id: string) => void
  clearAllNotifications: () => void

  communityReports: CommunityReport[]
  setCommunityReports: (reports: CommunityReport[]) => void
  addCommunityReport: (r: CommunityReport) => void
  confirmReport: (id: string) => void

  weather: WeatherData
  setWeather: (weather: WeatherData) => void

  nearbyPlaces: NearbyPlace[]
  setNearbyPlaces: (places: NearbyPlace[]) => void

  safetyScore: number
  setSafetyScore: (score: number) => void
  safetyMode: 'safe' | 'moderate' | 'risky'
  mapFilters: Record<string, boolean>
  toggleMapFilter: (key: string) => void

  routePreference: number
  setRoutePreference: (v: number) => void
  avoidOptions: Record<string, boolean>
  toggleAvoidOption: (key: string) => void
  preferOptions: Record<string, boolean>
  togglePreferOption: (key: string) => void
}

export const useStore = create<AppStore>((set, get) => ({
  currentPage: 'home',
  setPage: (page) => set({ currentPage: page, showProfileDropdown: false, showMobileMenu: false }),

  origin: '',
  destination: '',
  setOrigin: (v) => set({ origin: v }),
  setDestination: (v) => set({ destination: v }),

  routes: [],
  selectedRoute: null,
  setSelectedRoute: (r) => set({ selectedRoute: r }),
  setRoutes: (routes) => set({ routes, selectedRoute: routes[0] ?? null }),

  safetyModeOn: true,
  toggleSafetyMode: () => set((s) => ({ safetyModeOn: !s.safetyModeOn })),

  sosActive: false,
  setSosActive: (v) => set({ sosActive: v }),
  showSosModal: false,
  setShowSosModal: (v) => set({ showSosModal: v }),

  navigating: false,
  setNavigating: (v) => set({ navigating: v }),

  showSaferAlert: false,
  setShowSaferAlert: (v) => set({ showSaferAlert: v }),
  dismissSaferAlert: () => set({ showSaferAlert: false }),

  showAIChat: false,
  toggleAIChat: () => set((s) => ({ showAIChat: !s.showAIChat })),

  showProfileDropdown: false,
  toggleProfileDropdown: () => set((s) => ({ showProfileDropdown: !s.showProfileDropdown, showMobileMenu: false })),

  showMobileMenu: false,
  toggleMobileMenu: () => set((s) => ({ showMobileMenu: !s.showMobileMenu, showProfileDropdown: false })),

  showReportModal: false,
  setShowReportModal: (v) => set({ showReportModal: v }),

  showNotifications: false,
  toggleNotifications: () => set((s) => ({ showNotifications: !s.showNotifications, showProfileDropdown: false })),

  emergencyContacts: EMERGENCY_CONTACTS,
  addEmergencyContact: (c) => set((s) => ({ emergencyContacts: [...s.emergencyContacts, c] })),
  removeEmergencyContact: (id) => set((s) => ({ emergencyContacts: s.emergencyContacts.filter((c) => c.id !== id) })),
  setPrimaryContact: (id) => set((s) => ({
    emergencyContacts: s.emergencyContacts.map((c) => ({ ...c, isPrimary: c.id === id })),
  })),

  savedRoutes: SAVED_ROUTES,
  savedPlaces: SAVED_PLACES,

  notifications: NOTIFICATIONS,
  get unreadCount() { return get().notifications.filter((n) => !n.read).length },
  markNotificationRead: (id) => set((s) => ({
    notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
  })),
  clearAllNotifications: () => set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
  })),

  communityReports: COMMUNITY_REPORTS,
  setCommunityReports: (reports) => set({ communityReports: reports }),
  addCommunityReport: (r) => set((s) => ({ communityReports: [r, ...s.communityReports] })),
  confirmReport: (id) => set((s) => ({
    communityReports: s.communityReports.map((r) => r.id === id ? { ...r, confirmed: r.confirmed + 1 } : r),
  })),

  weather: WEATHER,
  setWeather: (weather) => set({ weather }),

  nearbyPlaces: NEARBY_PLACES,
  setNearbyPlaces: (places) => set({ nearbyPlaces: places }),

  safetyScore: 94,
  setSafetyScore: (score) => set({ safetyScore: score }),
  safetyMode: 'safe',

  mapFilters: {
    police: true,
    hospitals: true,
    shops: false,
    transport: true,
    reports: true,
    streetlights: false,
    public: false,
  },
  toggleMapFilter: (key) => set((s) => ({
    mapFilters: { ...s.mapFilters, [key]: !s.mapFilters[key] },
  })),

  routePreference: 70,
  setRoutePreference: (v) => set({ routePreference: v }),
  avoidOptions: {
    poorlyLit: true,
    isolated: true,
    highRisk: true,
    recentReports: false,
    lowActivity: false,
  },
  toggleAvoidOption: (key) => set((s) => ({
    avoidOptions: { ...s.avoidOptions, [key]: !s.avoidOptions[key] },
  })),
  preferOptions: {
    mainRoads: true,
    highActivity: true,
    nearPolice: true,
    nearHospital: false,
    wellLit: true,
  },
  togglePreferOption: (key) => set((s) => ({
    preferOptions: { ...s.preferOptions, [key]: !s.preferOptions[key] },
  })),
}))
