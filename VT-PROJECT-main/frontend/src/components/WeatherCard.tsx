import { Cloud, Wind, Eye, Droplets } from 'lucide-react'
import { useStore } from '../store'

export default function WeatherCard() {
  const { weather } = useStore()

  const riskColor = weather.risk === 'low' ? '#4caf82' : weather.risk === 'medium' ? '#f59e0b' : '#ef4444'
  const riskLabel = weather.risk === 'low' ? 'Low Weather Risk' : weather.risk === 'medium' ? 'Moderate Risk' : 'High Risk'

  return (
    <div className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{weather.icon}</span>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#2d1826' }}>{weather.condition}</div>
            <div className="text-xs" style={{ color: '#9e6878' }}>Current route area</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#2d1826' }}>{weather.temp}°</div>
          <div className="text-[11px] font-semibold" style={{ color: riskColor }}>{riskLabel}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <Droplets size={13} />, label: 'Rain', value: `${weather.rainProb}%` },
          { icon: <Eye size={13} />, label: 'Visibility', value: `${weather.visibility}km` },
          { icon: <Wind size={13} />, label: 'Wind', value: `${weather.wind}km/h` },
        ].map((item) => (
          <div key={item.label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(253,242,246,0.6)' }}>
            <div className="flex items-center justify-center mb-1" style={{ color: '#9e6878' }}>{item.icon}</div>
            <div className="text-xs font-semibold" style={{ color: '#2d1826' }}>{item.value}</div>
            <div className="text-[10px]" style={{ color: '#9e6878' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
