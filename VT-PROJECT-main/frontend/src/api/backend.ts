import type { CommunityReport, NearbyPlace, Route, WeatherData } from "../types"

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "")

type SafeRouteRequest = {
  start_lat: number
  start_lon: number
  end_lat: number
  end_lon: number
}

type Coordinates = [number, number]

type BackendPlace = {
  name: string
  distance?: number | null
  latitude?: number | null
  longitude?: number | null
}

type BackendRoute = {
  route_id: number
  distance_meters: number
  duration_seconds: number
  route_points: [number, number][]
  safety_score: number
  risk_level: string
  recommendation: string
  factors: {
    crime_score: number
    lighting_score: number
    police_score: number
    hospital_score: number
  }
  model_features: {
    nearby_crime_cases: number
    high_severity_cases: number
    police_station_count: number
    nearest_police_distance?: number | null
    hospital_count: number
    nearest_hospital_distance?: number | null
    predicted_safety_label?: string | null
    prediction_confidence?: number | null
  }
  advice: string[]
}

type BackendSafeRouteResponse = {
  weather: string
  current_time: string
  nearby_police_stations: BackendPlace[]
  nearby_hospitals: BackendPlace[]
  routes: BackendRoute[]
}

type BackendNearbyReportsResponse = {
  success: boolean
  reports: Array<{
    id: number
    title: string
    description: string
    category: string
    risk_level: string
    verified_count: number
    latitude: number
    longitude: number
    created_at: string
  }>
}

type BackendCommunityCreateResponse = {
  success: boolean
  report: {
    id: number
    title: string
    description: string | null
    category: string
    latitude: number
    longitude: number
    risk_level: string
    verified_count: number
    created_at: string
  }
}

function distanceToKm(distanceMeters?: number | null): string {
  if (!distanceMeters || distanceMeters <= 0) return "-"
  return `${(distanceMeters / 1000).toFixed(1)} km`
}

function mapRiskToSeverity(risk: string): "low" | "medium" | "high" {
  const normalized = risk.toLowerCase()
  if (normalized === "high") return "high"
  if (normalized === "medium") return "medium"
  return "low"
}

function mapWeather(condition: string): WeatherData {
  const normalized = condition.toLowerCase()
  const isRainy = normalized.includes("rain") || normalized.includes("storm")
  const isFoggy = normalized.includes("mist") || normalized.includes("fog") || normalized.includes("haze")

  let risk: WeatherData["risk"] = "low"
  if (isRainy) risk = "high"
  else if (isFoggy || normalized.includes("cloud")) risk = "medium"

  const icon = isRainy ? "🌧️" : normalized.includes("cloud") ? "⛅" : "☀️"

  return {
    condition,
    temp: 28,
    rainProb: isRainy ? 75 : normalized.includes("cloud") ? 40 : 15,
    visibility: isFoggy ? 3.5 : 7.2,
    wind: isRainy ? 24 : 14,
    risk,
    icon,
  }
}

function withRouteTypes(routes: Route[]): Route[] {
  const sorted = [...routes].sort((a, b) => b.safetyScore - a.safetyScore)

  return sorted.map((route, index) => {
    const isLast = index === sorted.length - 1
    const type: Route["type"] = index === 0 ? "safest" : isLast ? "fastest" : "balanced"
    const color = type === "safest" ? "#4caf82" : type === "balanced" ? "#f59e0b" : "#ef4444"

    return {
      ...route,
      type,
      color,
      label: type === "safest" ? "Safest Route" : type === "balanced" ? "Balanced Route" : "Fastest Route",
    }
  })
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Request failed (${response.status}): ${message}`)
  }

  return response.json() as Promise<T>
}

export async function fetchSafeRouteData(payload: SafeRouteRequest): Promise<{
  routes: Route[]
  weather: WeatherData
  nearbyPlaces: NearbyPlace[]
  bestScore: number
}> {
  const data = await fetchJson<BackendSafeRouteResponse>("/location/safe-route", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  const weatherInfo = mapWeather(data.weather)
  const weatherRisk = weatherInfo.risk === "high" ? 60 : weatherInfo.risk === "medium" ? 35 : 12

  const mappedRoutes = data.routes.map((route): Route => {
    const crimeRisk = Math.max(0, Math.min(100, Math.round(100 - route.factors.crime_score)))

    return {
      id: String(route.route_id),
      type: "balanced",
      label: "Route",
      safetyScore: route.safety_score,
      eta: Math.round(route.duration_seconds / 60),
      distance: `${(route.distance_meters / 1000).toFixed(1)} km`,
      humanActivity: Math.max(0, Math.min(100, 100 - crimeRisk)),
      roadLighting: Math.round(route.factors.lighting_score),
      policeProximity: Math.round(route.factors.police_score),
      hospitalProximity: Math.round(route.factors.hospital_score),
      crimeRisk,
      weatherRisk,
      communityReports: route.model_features.high_severity_cases,
      coordinates: route.route_points,
      color: "#f59e0b",
      riskLevel: route.risk_level,
      recommendation: route.recommendation,
      advice: route.advice,
      predictionLabel: route.model_features.predicted_safety_label ?? undefined,
      predictionConfidence: route.model_features.prediction_confidence ?? undefined,
    }
  })

  const typedRoutes = withRouteTypes(mappedRoutes)

  const nearbyPlaces: NearbyPlace[] = [
    ...data.nearby_police_stations.map((place, index) => ({
      id: `police-${index}`,
      type: "police" as const,
      name: place.name,
      distance: distanceToKm(place.distance),
      lat: place.latitude ?? 0,
      lng: place.longitude ?? 0,
      open: true,
    })),
    ...data.nearby_hospitals.map((place, index) => ({
      id: `hospital-${index}`,
      type: "hospital" as const,
      name: place.name,
      distance: distanceToKm(place.distance),
      lat: place.latitude ?? 0,
      lng: place.longitude ?? 0,
      open: true,
    })),
  ]

  return {
    routes: typedRoutes,
    weather: weatherInfo,
    nearbyPlaces,
    bestScore: typedRoutes[0]?.safetyScore ?? 0,
  }
}

export async function resolveLocationCoordinates(query: string): Promise<Coordinates | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  const coordinateMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
  if (coordinateMatch) {
    const lat = Number(coordinateMatch[1])
    const lon = Number(coordinateMatch[2])
    if (!Number.isNaN(lat) && !Number.isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return [lat, lon]
    }
  }

  const searchUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(trimmed)}`
  const response = await fetch(searchUrl, {
    headers: {
      "Accept": "application/json",
    },
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as Array<{ lat: string; lon: string }>
  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  const lat = Number(data[0].lat)
  const lon = Number(data[0].lon)

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return null
  }

  return [lat, lon]
}

export async function fetchNearbyCommunityReports(lat: number, lon: number): Promise<CommunityReport[]> {
  const data = await fetchJson<BackendNearbyReportsResponse>(`/community/nearby?lat=${lat}&lon=${lon}&radius=3000`)

  return data.reports.map((report) => ({
    id: String(report.id),
    type: report.title,
    category: report.category,
    location: "Nearby Area",
    lat: report.latitude,
    lng: report.longitude,
    description: report.description,
    timestamp: "Recently",
    severity: mapRiskToSeverity(report.risk_level),
    status: "active",
    confirmed: report.verified_count,
  }))
}

export async function createCommunityReport(payload: {
  user_id?: number | null
  title: string
  description?: string
  category: string
  latitude: number
  longitude: number
  risk_level: "Low" | "Medium" | "High"
}): Promise<CommunityReport> {
  const data = await fetchJson<BackendCommunityCreateResponse>("/community/report", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return {
    id: String(data.report.id),
    type: data.report.title,
    category: data.report.category,
    location: "Reported location",
    lat: data.report.latitude,
    lng: data.report.longitude,
    description: data.report.description ?? "",
    timestamp: "Just now",
    severity: mapRiskToSeverity(data.report.risk_level),
    status: "active",
    confirmed: data.report.verified_count,
  }
}

export async function verifyCommunityReport(reportId: number): Promise<void> {
  await fetchJson(`/community/verify/${reportId}`, {
    method: "POST",
  })
}
