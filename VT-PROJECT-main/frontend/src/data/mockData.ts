import type { Route, CommunityReport, NearbyPlace, EmergencyContact, SavedRoute, SavedPlace, Notification, WeatherData } from '../types'

// Mumbai coordinates as default center
export const DEFAULT_CENTER: [number, number] = [19.076, 72.877]

export const MOCK_ROUTES: Route[] = [
  {
    id: 'safest',
    type: 'safest',
    label: 'Safest Route',
    safetyScore: 94,
    eta: 24,
    distance: '8.2 km',
    humanActivity: 92,
    roadLighting: 95,
    policeProximity: 88,
    hospitalProximity: 85,
    crimeRisk: 8,
    weatherRisk: 12,
    communityReports: 1,
    color: '#4caf82',
    coordinates: [
      [19.076, 72.877],
      [19.082, 72.880],
      [19.088, 72.876],
      [19.092, 72.882],
      [19.098, 72.888],
      [19.104, 72.884],
    ],
  },
  {
    id: 'balanced',
    type: 'balanced',
    label: 'Balanced Route',
    safetyScore: 82,
    eta: 19,
    distance: '6.8 km',
    humanActivity: 78,
    roadLighting: 80,
    policeProximity: 72,
    hospitalProximity: 76,
    crimeRisk: 22,
    weatherRisk: 15,
    communityReports: 3,
    color: '#f59e0b',
    coordinates: [
      [19.076, 72.877],
      [19.080, 72.874],
      [19.085, 72.870],
      [19.090, 72.875],
      [19.097, 72.882],
      [19.104, 72.884],
    ],
  },
  {
    id: 'fastest',
    type: 'fastest',
    label: 'Fastest Route',
    safetyScore: 68,
    eta: 16,
    distance: '5.9 km',
    humanActivity: 55,
    roadLighting: 60,
    policeProximity: 52,
    hospitalProximity: 61,
    crimeRisk: 38,
    weatherRisk: 20,
    communityReports: 6,
    color: '#ef4444',
    coordinates: [
      [19.076, 72.877],
      [19.078, 72.871],
      [19.083, 72.866],
      [19.090, 72.869],
      [19.098, 72.876],
      [19.104, 72.884],
    ],
  },
]

export const AI_FACTORS: { label: string; value: number; color: string }[] = [
  { label: 'Human Activity', value: 18, color: '#4caf82' },
  { label: 'Low Crime Risk', value: 16, color: '#4caf82' },
  { label: 'Road Lighting', value: 14, color: '#4caf82' },
  { label: 'Police Proximity', value: 12, color: '#4caf82' },
  { label: 'Weather', value: 5, color: '#4caf82' },
  { label: 'Recent Reports', value: -2, color: '#ef4444' },
]

export const NEARBY_PLACES: NearbyPlace[] = [
  { id: '1', type: 'police', name: 'Bandra Police Station', distance: '0.4 km', lat: 19.054, lng: 72.842, open: true },
  { id: '2', type: 'hospital', name: 'Lilavati Hospital', distance: '0.7 km', lat: 19.051, lng: 72.824, open: true },
  { id: '3', type: 'police', name: 'Khar Police Chowky', distance: '1.1 km', lat: 19.071, lng: 72.838, open: true },
  { id: '4', type: 'hospital', name: 'Holly Family Hospital', distance: '1.3 km', lat: 19.064, lng: 72.845, open: true },
  { id: '5', type: 'transport', name: 'Bandra Station', distance: '0.6 km', lat: 19.055, lng: 72.839, open: true },
  { id: '6', type: 'transport', name: 'Khar Road Station', distance: '1.4 km', lat: 19.070, lng: 72.836, open: true },
  { id: '7', type: 'shop', name: 'D-Mart Supermarket', distance: '0.3 km', lat: 19.056, lng: 72.835, open: true },
  { id: '8', type: 'public', name: 'Carter Road Promenade', distance: '0.8 km', lat: 19.060, lng: 72.821, open: true },
  { id: '9', type: 'school', name: 'St. Andrews College', distance: '0.9 km', lat: 19.059, lng: 72.843, open: true },
]

export const COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: '1',
    type: 'Broken Streetlight',
    category: 'Infrastructure',
    location: 'Hill Road, Bandra West',
    lat: 19.057,
    lng: 72.836,
    description: 'Streetlight has been broken for 3 days. Very dark at night.',
    timestamp: '2 hours ago',
    severity: 'medium',
    status: 'active',
    confirmed: 8,
  },
  {
    id: '2',
    type: 'Suspicious Activity',
    category: 'Safety',
    location: 'Turner Road, near Mehboob Studio',
    lat: 19.063,
    lng: 72.831,
    description: 'Group of people loitering late at night, making women uncomfortable.',
    timestamp: '5 hours ago',
    severity: 'high',
    status: 'active',
    confirmed: 14,
  },
  {
    id: '3',
    type: 'Poor Road Condition',
    category: 'Infrastructure',
    location: 'Linking Road, Khar',
    lat: 19.071,
    lng: 72.832,
    description: 'Large pothole causing traffic diversion. Poorly lit at night.',
    timestamp: '1 day ago',
    severity: 'low',
    status: 'resolved',
    confirmed: 22,
  },
  {
    id: '4',
    type: 'Isolated Area',
    category: 'Safety',
    location: 'Bandstand Pathway, night',
    lat: 19.050,
    lng: 72.817,
    description: 'This path is very isolated after 9 PM. Avoid if traveling alone.',
    timestamp: '3 days ago',
    severity: 'high',
    status: 'active',
    confirmed: 31,
  },
  {
    id: '5',
    type: 'Waterlogging',
    category: 'Infrastructure',
    location: 'SV Road, Santacruz',
    lat: 19.080,
    lng: 72.848,
    description: 'Heavy waterlogging after rain. Road difficult to navigate.',
    timestamp: '6 hours ago',
    severity: 'medium',
    status: 'active',
    confirmed: 5,
  },
]

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: '1', name: 'Mom', relationship: 'Mother', phone: '+91 98765 43210', isPrimary: true },
  { id: '2', name: 'Priya Sharma', relationship: 'Best Friend', phone: '+91 87654 32109', isPrimary: false },
  { id: '3', name: 'Dad', relationship: 'Father', phone: '+91 76543 21098', isPrimary: false },
]

export const SAVED_ROUTES: SavedRoute[] = [
  { id: '1', name: 'Home to Office', from: 'Bandra West', to: 'BKC, Mumbai', safetyScore: 88, distance: '7.2 km', lastUsed: 'Today, 9:15 AM' },
  { id: '2', name: 'College Route', from: 'Andheri West', to: 'SNDT College, Juhu', safetyScore: 91, distance: '3.8 km', lastUsed: 'Yesterday, 8:45 AM' },
  { id: '3', name: 'Night Market Route', from: 'Bandra Station', to: 'Hill Road Market', safetyScore: 76, distance: '1.4 km', lastUsed: '3 days ago' },
]

export const SAVED_PLACES: SavedPlace[] = [
  { id: '1', label: 'Home', name: 'My Home', address: '12, Palm Beach Rd, Bandra West, Mumbai', icon: '🏠' },
  { id: '2', label: 'Work', name: 'Office', address: 'G Block, BKC, Bandra Kurla Complex, Mumbai', icon: '💼' },
  { id: '3', label: 'College', name: 'SNDT University', address: 'Juhu, Mumbai 400049', icon: '🎓' },
]

export const NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'safer-route', title: 'Safer Route Available', message: 'A safer route has been found for your current destination. Safety score: 94 vs 78.', timestamp: '2 min ago', read: false },
  { id: '2', type: 'community-report', title: 'New Report Nearby', message: 'A new safety report has been submitted 0.3 km from your route.', timestamp: '15 min ago', read: false },
  { id: '3', type: 'weather', title: 'Weather Update', message: 'Rain expected in 30 minutes. Safety score adjusted to account for visibility changes.', timestamp: '1 hour ago', read: false },
  { id: '4', type: 'safety-change', title: 'Safety Score Updated', message: 'Your current route safety score changed from 86 to 82 due to a new incident report.', timestamp: '2 hours ago', read: true },
  { id: '5', type: 'zone-warning', title: 'Low Activity Zone Ahead', message: 'You are approaching a low human activity zone. Consider the safer alternate route.', timestamp: '3 hours ago', read: true },
]

export const WEATHER: WeatherData = {
  condition: 'Partly Cloudy',
  temp: 28,
  rainProb: 35,
  visibility: 7.2,
  wind: 18,
  risk: 'low',
  icon: '⛅',
}

export const ACTIVITY_DATA = [
  { time: 'Morning', activity: 72, safety: 85 },
  { time: 'Afternoon', activity: 91, safety: 92 },
  { time: 'Evening', activity: 88, safety: 84 },
  { time: 'Night', activity: 42, safety: 56 },
]

export const INSIGHTS_DATA = {
  avgSafetyScore: 88,
  routesTaken: 47,
  reportsSubmitted: 12,
  saferRoutesChosen: 38,
  totalDistance: 284,
  safetyImprovement: 14,
  weeklyData: [
    { day: 'Mon', score: 84, routes: 3 },
    { day: 'Tue', score: 91, routes: 4 },
    { day: 'Wed', score: 87, routes: 2 },
    { day: 'Thu', score: 94, routes: 5 },
    { day: 'Fri', score: 82, routes: 3 },
    { day: 'Sat', score: 88, routes: 2 },
    { day: 'Sun', score: 90, routes: 1 },
  ],
  monthlyData: [
    { month: 'Feb', score: 79 },
    { month: 'Mar', score: 82 },
    { month: 'Apr', score: 85 },
    { month: 'May', score: 87 },
    { month: 'Jun', score: 86 },
    { month: 'Jul', score: 88 },
  ],
}

export const REPORT_CATEGORIES = [
  'Broken Streetlight',
  'Suspicious Activity',
  'Road Blockage',
  'Isolated Area',
  'Unsafe Location',
  'Poor Road Condition',
  'Waterlogging',
  'Other',
]
