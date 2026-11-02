import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useStore } from '../store'
import type { NearbyPlace } from '../types'

const FILTER_TYPES: Record<string, string> = {
  police: 'police',
  hospitals: 'hospital',
  shops: 'shop',
  transport: 'transport',
  reports: 'report',
  streetlights: 'streetlight',
  public: 'public',
}

function placeEmoji(type: string) {
  const map: Record<string, string> = {
    police: '🚔',
    hospital: '🏥',
    transport: '🚉',
    shop: '🛒',
    school: '🎓',
    streetlight: '💡',
    public: '🌳',
  }
  return map[type] || '📍'
}

function routeColor(type: string) {
  if (type === 'safest') return '#4caf82'
  if (type === 'balanced') return '#f59e0b'
  return '#ef4444'
}

export default function MapView({ height = '520px', showControls = true }: { height?: string; showControls?: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polylinesRef = useRef<any[]>([])

  const { selectedRoute, routes, mapFilters, communityReports, nearbyPlaces } = useStore()

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [20, 78],
      zoom: 13,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update routes on map
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!L || !map) return

    polylinesRef.current.forEach((p) => map.removeLayer(p))
    polylinesRef.current = []

    if (routes.length > 0) {
      const routePoints = routes.flatMap((route) => route.coordinates)
      if (routePoints.length > 1) {
        map.fitBounds(routePoints, { padding: [40, 40] })
      }
    }

    routes.forEach((route) => {
      const isSelected = selectedRoute?.id === route.id
      const polyline = L.polyline(route.coordinates, {
        color: routeColor(route.type),
        weight: isSelected ? 6 : 3,
        opacity: isSelected ? 0.9 : 0.4,
        dashArray: isSelected ? undefined : '8 6',
      }).addTo(map)

      if (isSelected) {
        const startPoint = route.coordinates[0]
        const endPoint = route.coordinates[route.coordinates.length - 1]

        if (startPoint) {
          L.marker(startPoint, {
            icon: L.divIcon({
              html: `<div style="background:#4caf82;color:white;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:600;box-shadow:0 4px 12px rgba(76,175,130,0.25);">Start</div>`,
              className: '',
              iconSize: [50, 28],
              iconAnchor: [25, 28],
            }),
          }).addTo(map)
        }

        if (endPoint) {
          L.marker(endPoint, {
            icon: L.divIcon({
              html: `<div style="background:#2d1826;color:white;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:600;box-shadow:0 4px 12px rgba(45,24,38,0.3);">Destination</div>`,
              className: '',
              iconSize: [88, 28],
              iconAnchor: [44, 28],
            }),
          }).addTo(map)
        }

        polyline.bindPopup(`
          <div style="font-family:Outfit,sans-serif;min-width:160px;">
            <div style="font-weight:700;font-size:13px;color:#2d1826;margin-bottom:4px;">${route.label}</div>
            <div style="color:#4caf82;font-weight:600;">Safety: ${route.safetyScore}/100</div>
            <div style="color:#9e6878;font-size:12px;">${route.eta} min · ${route.distance}</div>
          </div>
        `)
      }

      polylinesRef.current.push(polyline)
    })
  }, [routes, selectedRoute])

  // Update place markers
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!L || !map) return

    markersRef.current.forEach((m) => map.removeLayer(m))
    markersRef.current = []

    const activeTypes = Object.entries(FILTER_TYPES)
      .filter(([key]) => mapFilters[key])
      .map(([, type]) => type)

    nearbyPlaces.filter((p: NearbyPlace) => activeTypes.includes(p.type)).forEach((place) => {
      const icon = L.divIcon({
        html: `<div style="background:white;border:2px solid rgba(212,113,138,0.4);border-radius:8px;padding:3px 6px;font-size:13px;box-shadow:0 2px 8px rgba(45,24,38,0.12);">${placeEmoji(place.type)}</div>`,
        className: '',
        iconSize: [36, 28],
        iconAnchor: [18, 14],
      })
      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(map)
        .bindPopup(`<div style="font-family:Outfit,sans-serif;"><b>${place.name}</b><br><span style="color:#9e6878;font-size:12px;">${place.distance} away</span></div>`)
      markersRef.current.push(marker)
    })

    if (mapFilters.reports) {
      communityReports.forEach((report) => {
        const icon = L.divIcon({
          html: `<div style="background:${report.severity === 'high' ? '#fef2f2' : report.severity === 'medium' ? '#fffbeb' : '#f0fdf4'};border:2px solid ${report.severity === 'high' ? '#fca5a5' : report.severity === 'medium' ? '#fcd34d' : '#86efac'};border-radius:8px;padding:3px 6px;font-size:12px;box-shadow:0 2px 8px rgba(45,24,38,0.12);">⚠️</div>`,
          className: '',
          iconSize: [32, 28],
          iconAnchor: [16, 14],
        })
        const marker = L.marker([report.lat, report.lng], { icon })
          .addTo(map)
          .bindPopup(`<div style="font-family:Outfit,sans-serif;max-width:200px;"><b>${report.type}</b><br><span style="color:#9e6878;font-size:12px;">${report.location}</span><br><span style="color:#c05070;font-size:11px;">${report.timestamp}</span></div>`)
        markersRef.current.push(marker)
      })
    }
  }, [mapFilters, communityReports, nearbyPlaces])

  const filterLabels: Record<string, string> = {
    police: '🚔 Police',
    hospitals: '🏥 Hospitals',
    shops: '🛒 Shops',
    transport: '🚉 Transport',
    reports: '⚠️ Reports',
    streetlights: '💡 Lights',
    public: '🌳 Public',
  }

  const { toggleMapFilter } = useStore()

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ height, border: '1px solid rgba(212,113,138,0.15)' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {showControls && (
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-xs">
          {Object.entries(filterLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleMapFilter(key)}
              className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
              style={{
                background: mapFilters[key] ? 'rgba(192,80,112,0.9)' : 'rgba(255,255,255,0.9)',
                color: mapFilters[key] ? 'white' : '#5a3349',
                border: `1px solid ${mapFilters[key] ? 'transparent' : 'rgba(212,113,138,0.3)'}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Route legend */}
      <div className="absolute bottom-3 right-3 z-10 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,113,138,0.15)' }}>
        <div className="text-[10px] font-semibold mb-1.5" style={{ color: '#5a3349', fontFamily: 'JetBrains Mono' }}>ROUTES</div>
        {[{ color: '#4caf82', label: 'Safest' }, { color: '#f59e0b', label: 'Balanced' }, { color: '#ef4444', label: 'Fastest' }].map((r) => (
          <div key={r.label} className="flex items-center gap-1.5 mb-1">
            <div className="w-6 h-1.5 rounded-full" style={{ background: r.color }} />
            <span className="text-[10px]" style={{ color: '#5a3349' }}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
