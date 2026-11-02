import { useEffect } from 'react'
import { Shield, X, ArrowRight } from 'lucide-react'
import { useStore } from '../store'

export default function SaferRouteAlert() {
  const { showSaferAlert, dismissSaferAlert, setSelectedRoute, routes } = useStore()

  // Auto-dismiss after 12 seconds
  useEffect(() => {
    if (!showSaferAlert) return
    const t = setTimeout(dismissSaferAlert, 12000)
    return () => clearTimeout(t)
  }, [showSaferAlert, dismissSaferAlert])

  if (!showSaferAlert) return null

  if (routes.length < 2) return null

  const currentRoute = routes[routes.length - 1]
  const saferRoute = routes[0]

  return (
    <div
      className="fixed top-20 right-4 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden slide-in-right"
      style={{ background: 'white', border: '2px solid rgba(76,175,130,0.4)' }}
    >
      <div className="px-4 py-3" style={{ background: 'rgba(76,175,130,0.08)' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(76,175,130,0.15)' }}>
              <Shield size={16} style={{ color: '#4caf82' }} />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: '#2d1826' }}>Safer Route Available</div>
              <div className="text-[11px]" style={{ color: '#9e6878' }}>New safety report detected nearby</div>
            </div>
          </div>
          <button onClick={dismissSaferAlert} className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,113,138,0.1)', color: '#9e6878' }}>
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 rounded-xl p-2 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="text-xs text-gray-500 mb-0.5">Current Route</div>
            <div className="text-lg font-bold" style={{ color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>{currentRoute.safetyScore}</div>
            <div className="text-[10px]" style={{ color: '#9e6878' }}>Safety Score</div>
          </div>
          <ArrowRight size={16} style={{ color: '#9e6878' }} />
          <div className="flex-1 rounded-xl p-2 text-center" style={{ background: 'rgba(76,175,130,0.08)', border: '1px solid rgba(76,175,130,0.25)' }}>
            <div className="text-xs text-gray-500 mb-0.5">Safer Route</div>
            <div className="text-lg font-bold" style={{ color: '#4caf82', fontFamily: 'JetBrains Mono' }}>{saferRoute.safetyScore}</div>
            <div className="text-[10px]" style={{ color: '#2d8c6a' }}>+{saferRoute.safetyScore - currentRoute.safetyScore} safer</div>
          </div>
        </div>

        <div className="text-xs mb-3" style={{ color: '#9e6878' }}>
          Adds {saferRoute.eta - currentRoute.eta} min but significantly safer with better lighting and lower crime risk.
        </div>

        <div className="flex gap-2">
          <button
            onClick={dismissSaferAlert}
            className="flex-1 py-2 rounded-xl text-xs font-medium border"
            style={{ color: '#5a3349', borderColor: 'rgba(212,113,138,0.3)', background: 'white' }}
          >
            Keep Current
          </button>
          <button
            onClick={() => { setSelectedRoute(saferRoute); dismissSaferAlert() }}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #4caf82, #2d8c6a)', boxShadow: '0 4px 12px rgba(76,175,130,0.3)' }}
          >
            Switch Route
          </button>
        </div>
      </div>
    </div>
  )
}
