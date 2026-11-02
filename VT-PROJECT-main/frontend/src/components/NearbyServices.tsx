import { useStore } from '../store'
import type { NearbyPlace } from '../types'

const TYPE_META: Record<string, { emoji: string; color: string; label: string }> = {
  police: { emoji: '🚔', color: '#3b82f6', label: 'Police' },
  hospital: { emoji: '🏥', color: '#ef4444', label: 'Hospital' },
  transport: { emoji: '🚉', color: '#8b5cf6', label: 'Transport' },
  shop: { emoji: '🛒', color: '#f59e0b', label: 'Shop' },
  school: { emoji: '🎓', color: '#06b6d4', label: 'School' },
  public: { emoji: '🌳', color: '#4caf82', label: 'Public' },
}

export default function NearbyServices() {
  const { nearbyPlaces } = useStore()
  const priorityTypes = ['police', 'hospital', 'transport']
  const places = nearbyPlaces.filter((p: NearbyPlace) => priorityTypes.includes(p.type)).slice(0, 6)

  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
      <h3 className="font-semibold text-sm mb-3" style={{ color: '#2d1826' }}>Nearby Safety Services</h3>
      <div className="space-y-2">
        {places.map((place: NearbyPlace) => {
          const meta = TYPE_META[place.type]
          return (
            <div key={place.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(212,113,138,0.08)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: `${meta.color}15` }}>
                  {meta.emoji}
                </div>
                <div>
                  <div className="text-xs font-medium" style={{ color: '#2d1826' }}>{place.name}</div>
                  <div className="text-[10px]" style={{ color: '#9e6878' }}>{meta.label}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: '#4caf82', fontFamily: 'JetBrains Mono' }}>{place.distance}</span>
                {place.open && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(76,175,130,0.1)', color: '#4caf82' }}>Open</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
