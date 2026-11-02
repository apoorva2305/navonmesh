import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Phone, Star, Home, Briefcase, GraduationCap, Heart, Shield, Navigation } from 'lucide-react'
import { useStore } from '../store'
import type { EmergencyContact, SavedRoute, SavedPlace } from '../types'
import { auth, db} from '../firebase'
import { signOut } from 'firebase/auth'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from 'firebase/firestore'
function EmergencyContactsSection() {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    relationship: '',
    phone: '',
  })

  useEffect(() => {
    loadContacts()
  }, [])

  async function loadContacts() {
    const user = auth.currentUser
    if (!user) return

    const snapshot = await getDocs(
      collection(db, 'users', user.uid, 'emergencyContacts')
    )

    const contacts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<EmergencyContact, 'id'>),
    }))

    setEmergencyContacts(contacts)
  }

  async function save() {
    const user = auth.currentUser
    if (!user) return

    if (!form.name || !form.phone) return

    await addDoc(
      collection(db, 'users', user.uid, 'emergencyContacts'),
      {
        name: form.name,
        relationship: form.relationship,
        phone: form.phone,
        isPrimary: false,
      }
    )

    setForm({ name: '', relationship: '', phone: '' })
    setShowForm(false)
    loadContacts()
  }

  async function removeContact(id: string) {
    const user = auth.currentUser
    if (!user) return

    await deleteDoc(doc(db, 'users', user.uid, 'emergencyContacts', id))
    loadContacts()
  }

  async function setPrimary(id: string) {
    const user = auth.currentUser
    if (!user) return

    for (const contact of emergencyContacts) {
      await updateDoc(
        doc(db, 'users', user.uid, 'emergencyContacts', contact.id),
        {
          isPrimary: contact.id === id,
        }
      )
    }

    loadContacts()
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826', fontSize: '16px' }}>
          Emergency Contacts
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold"
          style={{ background: 'rgba(192,80,112,0.08)', color: '#c05070' }}
        >
          <Plus size={12} />
          Add Contact
        </button>
      </div>

      {showForm && (
        <div
          className="rounded-xl p-4 mb-4 space-y-3"
          style={{ background: 'rgba(253,242,246,0.6)', border: '1px solid rgba(212,113,138,0.15)' }}
        >
          {['name', 'relationship', 'phone'].map((field) => (
            <input
              key={field}
              value={form[field as keyof typeof form]}
              onChange={(e) =>
                setForm({ ...form, [field]: e.target.value })
              }
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={{ background: 'white', border: '1px solid rgba(212,113,138,0.2)', color: '#2d1826' }}
            />
          ))}

          <div className="flex gap-2">
            <button
              onClick={save}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: '#c05070' }}
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-xl text-xs border"
              style={{ color: '#9e6878', borderColor: 'rgba(212,113,138,0.3)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {emergencyContacts.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between py-3 border-b"
            style={{ borderColor: 'rgba(212,113,138,0.08)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{
                  background: c.isPrimary
                    ? 'linear-gradient(135deg, #c05070, #9e6878)'
                    : 'rgba(192,80,112,0.15)',
                  color: c.isPrimary ? 'white' : '#c05070',
                }}
              >
                {c.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: '#2d1826' }}>
                    {c.name}
                  </span>
                  {c.isPrimary && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(76,175,130,0.1)', color: '#4caf82' }}
                    >
                      Primary
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: '#9e6878' }}>
                  {c.relationship} · {c.phone}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {!c.isPrimary && (
                <button
                  onClick={() => setPrimary(c.id)}
                  className="p-1.5 rounded-lg"
                  style={{ color: '#f59e0b' }}
                >
                  <Star size={13} />
                </button>
              )}

              <button
                onClick={() => removeContact(c.id)}
                className="p-1.5 rounded-lg"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SavedRoutesSection() {
  const { setPage } = useStore()
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([])

  useEffect(() => {
    loadRoutes()
  }, [])

  async function loadRoutes() {
    const user = auth.currentUser
    if (!user) return

    const snapshot = await getDocs(
      collection(db, 'users', user.uid, 'savedRoutes')
    )

    const routes = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SavedRoute, 'id'>),
    }))

    setSavedRoutes(routes)
  }

  async function removeRoute(id: string) {
    const user = auth.currentUser
    if (!user) return

    await deleteDoc(
      doc(db, 'users', user.uid, 'savedRoutes', id)
    )

    loadRoutes()
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
      <h3 className="font-semibold mb-4" style={{ fontFamily: 'DM Serif Display', color: '#2d1826', fontSize: '16px' }}>
        Saved Routes
      </h3>

      {savedRoutes.length === 0 ? (
        <div className="text-sm text-center py-4" style={{ color: '#9e6878' }}>
          No saved routes yet
        </div>
      ) : (
        <div className="space-y-3">
          {savedRoutes.map((r) => (
            <div key={r.id} className="rounded-xl p-3" style={{ background: 'rgba(253,242,246,0.5)', border: '1px solid rgba(212,113,138,0.12)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#2d1826' }}>
                    {r.name}
                  </div>
                  <div className="text-xs" style={{ color: '#9e6878' }}>
                    {r.from} → {r.to}
                  </div>
                </div>

                <span className="text-sm font-bold" style={{ fontFamily: 'JetBrains Mono', color: r.safetyScore >= 85 ? '#4caf82' : '#f59e0b' }}>
                  {r.safetyScore}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: '#c9a0b2' }}>
                  {r.lastUsed} · {r.distance}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPage('navigation')}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold"
                    style={{ background: 'rgba(192,80,112,0.08)', color: '#c05070' }}
                  >
                    <Navigation size={11} />
                    Navigate
                  </button>

                  <button
                    onClick={() => removeRoute(r.id)}
                    className="p-1.5 rounded-lg"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SavedPlacesSection() {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    label: '',
    address: '',
  })

  const icons: Record<string, React.ReactNode> = {
    Home: <Home size={16} />,
    Work: <Briefcase size={16} />,
    College: <GraduationCap size={16} />,
  }

  useEffect(() => {
    loadPlaces()
  }, [])

  async function loadPlaces() {
    const user = auth.currentUser
    if (!user) return

    const snapshot = await getDocs(
      collection(db, 'users', user.uid, 'savedPlaces')
    )

    const places = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SavedPlace, 'id'>),
    }))

    setSavedPlaces(places)
  }

  async function savePlace() {
    const user = auth.currentUser
    if (!user) return

    if (!form.label || !form.address) return

    await addDoc(
      collection(db, 'users', user.uid, 'savedPlaces'),
      {
        label: form.label,
        address: form.address,
      }
    )

    setForm({ label: '', address: '' })
    setShowForm(false)
    loadPlaces()
  }

  async function removePlace(id: string) {
    const user = auth.currentUser
    if (!user) return

    await deleteDoc(
      doc(db, 'users', user.uid, 'savedPlaces', id)
    )

    loadPlaces()
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826', fontSize: '16px' }}>
          Saved Places
        </h3>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(192,80,112,0.08)', color: '#c05070' }}
        >
          <Plus size={12} />
          Add Place
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 mb-4">
          <input
            placeholder="Label (Home, Work, College)"
            value={form.label}
            onChange={(e) =>
              setForm({ ...form, label: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-xl"
          />

          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-xl"
          />

          <button
            onClick={savePlace}
            className="w-full py-2 rounded-xl text-white"
            style={{ background: '#c05070' }}
          >
            Save Place
          </button>
        </div>
      )}

      <div className="space-y-2">
        {savedPlaces.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 py-2.5 border-b"
            style={{ borderColor: 'rgba(212,113,138,0.08)' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(192,80,112,0.08)', color: '#c05070' }}
            >
              {icons[p.label] ?? <Heart size={16} />}
            </div>

            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: '#2d1826' }}>
                {p.label}
              </div>
              <div className="text-xs" style={{ color: '#9e6878' }}>
                {p.address}
              </div>
            </div>

            <button
              onClick={() => removePlace(p.id)}
              className="p-1.5 rounded-lg"
              style={{ color: '#ef4444' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function SafetyPreferences() {
  const { routePreference, setRoutePreference, avoidOptions, toggleAvoidOption, preferOptions, togglePreferOption } = useStore()

  const avoidLabels: Record<string, string> = {
    poorlyLit: 'Poorly lit roads',
    isolated: 'Isolated areas',
    highRisk: 'High-risk areas',
    recentReports: 'Roads with recent reports',
    lowActivity: 'Low-activity zones',
  }
  const preferLabels: Record<string, string> = {
    mainRoads: 'Main roads',
    highActivity: 'High-activity areas',
    nearPolice: 'Roads near police stations',
    nearHospital: 'Roads near hospitals',
    wellLit: 'Well-lit roads',
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(212,113,138,0.15)' }}>
      <h3 className="font-semibold mb-4" style={{ fontFamily: 'DM Serif Display', color: '#2d1826', fontSize: '16px' }}>Safety Preferences</h3>

      {/* Slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: '#5a3349' }}>Route Priority</span>
          <span className="text-xs font-semibold" style={{ color: '#c05070' }}>{routePreference >= 60 ? 'Safety-focused' : 'Speed-focused'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px]" style={{ color: '#f59e0b' }}>Fastest</span>
          <input
            type="range" min="0" max="100" value={routePreference}
            onChange={(e) => setRoutePreference(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: '#c05070' }}
          />
          <span className="text-[10px]" style={{ color: '#4caf82' }}>Safest</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <div className="text-xs font-semibold mb-2.5" style={{ color: '#5a3349' }}>Avoid</div>
          <div className="space-y-2">
            {Object.entries(avoidOptions).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => toggleAvoidOption(key)}
                  className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: val ? '#c05070' : 'white', border: `2px solid ${val ? '#c05070' : 'rgba(212,113,138,0.4)'}` }}
                >
                  {val && <div className="w-2 h-1 border-b-2 border-l-2 border-white rotate-[-45deg] -mt-0.5" />}
                </div>
                <span className="text-xs" style={{ color: '#5a3349' }}>{avoidLabels[key]}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold mb-2.5" style={{ color: '#5a3349' }}>Prefer</div>
          <div className="space-y-2">
            {Object.entries(preferOptions).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => togglePreferOption(key)}
                  className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: val ? '#4caf82' : 'white', border: `2px solid ${val ? '#4caf82' : 'rgba(76,175,130,0.4)'}` }}
                >
                  {val && <div className="w-2 h-1 border-b-2 border-l-2 border-white rotate-[-45deg] -mt-0.5" />}
                </div>
                <span className="text-xs" style={{ color: '#5a3349' }}>{preferLabels[key]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const user = auth.currentUser;
  const userEmail = user?.email || "No email";
const userName =
  user?.displayName ||
  (user?.email ? user.email.split("@")[0] : "SheRoute User");
const userInitial = userName.charAt(0).toUpperCase();
const memberSince = user?.metadata?.creationTime
  ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    })
  : 'Recently joined';
  const handleLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
};
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color: '#9e6878' }}>Manage your safety settings, contacts, and preferences</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl p-5 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, rgba(192,80,112,0.08), rgba(253,242,246,0.6))', border: '1px solid rgba(212,113,138,0.2)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c05070, #9e6878)' }}>
          {userInitial}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>{userName}</h2>
          <div className="text-sm" style={{ color: '#9e6878' }}>{userEmail}</div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs flex items-center gap-1" style={{ color: '#4caf82' }}><Shield size={11} />Safety Mode ON</span>
            <span className="text-xs" style={{ color: '#9e6878' }}>Member since {memberSince}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
  <button
    className="p-2 rounded-xl"
    style={{ background: 'rgba(192,80,112,0.08)', color: '#c05070' }}
  >
    <Edit2 size={15} />
  </button>

  <button
    onClick={handleLogout}
    className="px-3 py-2 rounded-xl text-sm font-semibold"
    style={{ background: '#ef4444', color: 'white' }}
  >
    Logout
  </button>
</div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <EmergencyContactsSection />
        <div className="space-y-5">
          <SavedPlacesSection />
        </div>
      </div>

      <SavedRoutesSection />
      <SafetyPreferences />
    </div>
  )
}