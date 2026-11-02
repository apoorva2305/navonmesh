import { useStore } from '../store'
import type { Page } from '../types'

const LINKS: { label: string; page?: Page; href?: string }[] = [
  { label: 'About', page: 'home' },
  { label: 'How It Works', page: 'home' },
  { label: 'Safety', page: 'map' },
  { label: 'Community', page: 'community' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Contact', href: '#' },
]

export default function Footer() {
  const { setPage } = useStore()
  return (
    <footer className="mt-20 py-12 border-t" style={{ borderColor: 'rgba(212,113,138,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c05070, #9e6878)' }}>
                <span className="text-white text-sm font-bold" style={{ fontFamily: 'JetBrains Mono' }}>S</span>
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>
                SheRoute <span style={{ color: '#c05070' }}>AI</span>
              </span>
            </div>
            <p className="text-sm" style={{ color: '#9e6878' }}>Your route. Your safety. Your choice.</p>
            <p className="text-xs mt-1 max-w-xs" style={{ color: '#c9a0b2' }}>AI-powered navigation that finds safer routes, not just faster ones.</p>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {['𝕏', '📸', '💼', '▶'].map((icon, i) => (
              <button key={i} className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all hover:scale-110" style={{ background: 'rgba(192,80,112,0.08)', color: '#c05070' }}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
          {LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => link.page && setPage(link.page)}
              className="text-xs hover:text-rose-400 transition-colors"
              style={{ color: '#9e6878' }}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="text-center pt-6 border-t" style={{ borderColor: 'rgba(212,113,138,0.1)' }}>
          <div className="text-xs mb-1" style={{ color: '#c9a0b2' }}>
            The fastest route isn't always the safest route.
          </div>
          <div className="text-[11px]" style={{ color: '#d4a0b8', fontFamily: 'JetBrains Mono' }}>
            © 2025 SheRoute AI · Built for safety, powered by intelligence
          </div>
        </div>
      </div>
    </footer>
  )
}
