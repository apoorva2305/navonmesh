import { useState } from 'react'
import { Plus, ThumbsUp, AlertCircle, CheckCircle, X, MapPin, Clock, Upload } from 'lucide-react'
import { useStore } from '../store'
import { REPORT_CATEGORIES } from '../data/mockData'
import type { CommunityReport } from '../types'
import { createCommunityReport, verifyCommunityReport } from '../api/backend'

const SEVERITY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  high: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'High Risk' },
  medium: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Moderate' },
  low: { bg: 'rgba(76,175,130,0.1)', color: '#4caf82', label: 'Low Risk' },
}

function ReportCard({ report }: { report: CommunityReport }) {
  const { confirmReport } = useStore()
  const sev = SEVERITY_STYLE[report.severity]

  async function onConfirm() {
    const numericId = Number(report.id)
    if (!Number.isNaN(numericId)) {
      try {
        await verifyCommunityReport(numericId)
      } catch (error) {
        console.error(error)
      }
    }
    confirmReport(report.id)
  }

  return (
    <div className="rounded-2xl p-4 transition-all hover:shadow-md" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.12)' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: sev.bg, color: sev.color }}>
            {sev.label}
          </span>
          {report.status === 'resolved' && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(76,175,130,0.08)', color: '#4caf82' }}>
              ✓ Resolved
            </span>
          )}
        </div>
        <span className="text-[10px] flex items-center gap-1" style={{ color: '#9e6878', fontFamily: 'JetBrains Mono' }}>
          <Clock size={10} />{report.timestamp}
        </span>
      </div>

      <h4 className="font-semibold text-sm mb-1" style={{ color: '#2d1826' }}>{report.type}</h4>
      <p className="text-xs leading-relaxed mb-2" style={{ color: '#5a3349' }}>{report.description}</p>

      <div className="flex items-center gap-1 text-xs mb-3" style={{ color: '#9e6878' }}>
        <MapPin size={11} />{report.location}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onConfirm}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all hover:bg-rose-50"
          style={{ color: '#c05070', border: '1px solid rgba(192,80,112,0.2)' }}
        >
          <ThumbsUp size={12} />
          Confirm ({report.confirmed})
        </button>
        <div className="text-xs" style={{ color: '#9e6878' }}>
          {report.category}
        </div>
      </div>
    </div>
  )
}

function ReportModal() {
  const { setShowReportModal, addCommunityReport } = useStore()
  const [form, setForm] = useState({ category: '', location: '', description: '', severity: 'medium' as 'low' | 'medium' | 'high' })
  const [submitted, setSubmitted] = useState(false)

  async function submit() {
    if (!form.category || !form.description) return

    const lat = 19.076 + (Math.random() - 0.5) * 0.02
    const lng = 72.877 + (Math.random() - 0.5) * 0.02
    const riskLevel = form.severity === 'high' ? 'High' : form.severity === 'medium' ? 'Medium' : 'Low'

    try {
      const newReport = await createCommunityReport({
        title: form.category,
        category: 'User Report',
        description: form.description,
        latitude: lat,
        longitude: lng,
        risk_level: riskLevel,
      })

      addCommunityReport({
        ...newReport,
        location: form.location || newReport.location,
      })
    } catch (error) {
      console.error(error)
      const fallbackReport: CommunityReport = {
        id: Date.now().toString(),
        type: form.category,
        category: 'User Report',
        location: form.location || 'Near your location',
        lat,
        lng,
        description: form.description,
        timestamp: 'Just now',
        severity: form.severity,
        status: 'active',
        confirmed: 1,
      }
      addCommunityReport(fallbackReport)
    }

    setSubmitted(true)
    setTimeout(() => setShowReportModal(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(45,24,38,0.6)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{ background: 'white', boxShadow: '0 24px 80px rgba(45,24,38,0.25)' }}>
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(76,175,130,0.1)' }}>
              <CheckCircle size={32} style={{ color: '#4caf82' }} />
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>Report Submitted!</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#9e6878' }}>
              Thank you! Your report helps improve safety for the community and future route recommendations.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(212,113,138,0.12)' }}>
              <h3 className="font-semibold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826', fontSize: '18px' }}>Report Safety Issue</h3>
              <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,113,138,0.1)', color: '#9e6878' }}>
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#5a3349' }}>Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setForm({ ...form, category: cat })}
                      className="text-xs px-3 py-2 rounded-xl text-left transition-all"
                      style={{
                        background: form.category === cat ? 'rgba(192,80,112,0.1)' : 'rgba(253,242,246,0.6)',
                        border: `1px solid ${form.category === cat ? 'rgba(192,80,112,0.4)' : 'rgba(212,113,138,0.15)'}`,
                        color: form.category === cat ? '#c05070' : '#5a3349',
                        fontWeight: form.category === cat ? '600' : '400',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5a3349' }}>Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Describe the location..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgba(253,242,246,0.6)', border: '1px solid rgba(212,113,138,0.2)', color: '#2d1826' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5a3349' }}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the safety issue..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                  style={{ background: 'rgba(253,242,246,0.6)', border: '1px solid rgba(212,113,138,0.2)', color: '#2d1826' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#5a3349' }}>Severity</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm({ ...form, severity: s })}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                      style={{
                        background: form.severity === s ? SEVERITY_STYLE[s].bg : 'rgba(253,242,246,0.4)',
                        color: form.severity === s ? SEVERITY_STYLE[s].color : '#9e6878',
                        border: `1px solid ${form.severity === s ? SEVERITY_STYLE[s].color + '40' : 'rgba(212,113,138,0.15)'}`,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-3 rounded-xl cursor-pointer" style={{ background: 'rgba(253,242,246,0.6)', border: '1px dashed rgba(212,113,138,0.3)' }}>
                <Upload size={16} style={{ color: '#9e6878' }} />
                <span className="text-xs" style={{ color: '#9e6878' }}>Upload photo (optional)</span>
              </div>
            </div>

            <div className="px-6 pb-5">
              <button
                onClick={submit}
                disabled={!form.category || !form.description}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all"
                style={{
                  background: form.category && form.description ? 'linear-gradient(135deg, #c05070, #9e6878)' : 'rgba(212,113,138,0.3)',
                  boxShadow: form.category && form.description ? '0 4px 16px rgba(192,80,112,0.3)' : 'none',
                }}
              >
                Submit Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function CommunityReports() {
  const { communityReports, showReportModal, setShowReportModal } = useStore()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>Community Reports</h2>
          <p className="text-sm mt-0.5" style={{ color: '#9e6878' }}>Safety reports from the community near your area</p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #c05070, #9e6878)', boxShadow: '0 4px 12px rgba(192,80,112,0.3)' }}
        >
          <Plus size={15} />
          Report Issue
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {communityReports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {showReportModal && <ReportModal />}
    </div>
  )
}
