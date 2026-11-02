export type Page = 'home' | 'map' | 'navigation' | 'community' | 'insights' | 'profile' | 'emergency' | 'saved-routes' | 'notifications'

export interface Location {
  lat: number
  lng: number
  name: string
  address?: string
}

export interface Route {
  id: string
  type: 'safest' | 'balanced' | 'fastest'
  label: string
  safetyScore: number
  eta: number
  distance: string
  humanActivity: number
  roadLighting: number
  policeProximity: number
  hospitalProximity: number
  crimeRisk: number
  weatherRisk: number
  communityReports: number
  coordinates: [number, number][]
  color: string
  riskLevel?: string
  recommendation?: string
  advice?: string[]
  predictionLabel?: string
  predictionConfidence?: number
}

export interface SafetyFactor {
  name: string
  score: number
  impact: number
  label: string
}

export interface CommunityReport {
  id: string
  type: string
  location: string
  lat: number
  lng: number
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
  status: 'active' | 'resolved'
  confirmed: number
  category: string
}

export interface NearbyPlace {
  id: string
  type: 'police' | 'hospital' | 'transport' | 'shop' | 'school' | 'streetlight' | 'public'
  name: string
  distance: string
  lat: number
  lng: number
  open?: boolean
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  isPrimary: boolean
}

export interface SavedRoute {
  id: string
  name: string
  from: string
  to: string
  safetyScore: number
  distance: string
  lastUsed: string
}

export interface SavedPlace {
  id: string
  label: 'Home' | 'Work' | 'College' | string
  name: string
  address: string
  icon: string
}

export interface Notification {
  id: string
  type: 'safety-change' | 'safer-route' | 'community-report' | 'weather' | 'zone-warning'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface WeatherData {
  condition: string
  temp: number
  rainProb: number
  visibility: number
  wind: number
  risk: 'low' | 'medium' | 'high'
  icon: string
}
