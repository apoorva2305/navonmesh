import { useEffect, useState } from 'react'
import { X, AlertTriangle, Phone, MapPin, Share2, CheckCircle } from 'lucide-react'
import { useStore } from '../store'
import { auth, db } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

export default function SOSModal() {
  const { showSosModal, setShowSosModal, sosActive, setSosActive } = useStore()
  const [countdown, setCountdown] = useState(5)
  const [sharing, setSharing] = useState(false)
const [location, setLocation] = useState<{
  latitude: number
  longitude: number
} | null>(null)
const [emergencyContacts, setEmergencyContacts] = useState<any[]>([])

  useEffect(() => {
  if (!showSosModal) {
    setCountdown(5)
    return
  }

  loadContacts()
}, [showSosModal])
  useEffect(() => {
  if (showSosModal && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        console.error(error)
      }
    )
  }
}, [showSosModal])
const loadContacts = async () => {
  const user = auth.currentUser
  if (!user) return

  const snapshot = await getDocs(
    collection(db, 'users', user.uid, 'emergencyContacts')
  )

  const contacts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))

  setEmergencyContacts(contacts)
}

const activateSOS = async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("Please login first");
    return;
  }

  if (!navigator.geolocation) {
    alert("Geolocation is not supported");
    return;
  }

  setSharing(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        // Fetch this user's emergency contacts
        const contactsSnapshot = await getDocs(
          collection(db, "users", user.uid, "emergencyContacts")
        );

        const contacts = contactsSnapshot.docs.map(doc => doc.data());
        setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        })
        // Save SOS alert
        await addDoc(collection(db, "sos_alerts"), {
          userId: user.uid,
          email: user.email,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          mapsLink: `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
          accuracy: position.coords.accuracy,
          contacts,
          status: "active",
          createdAt: serverTimestamp(),
        });

        setSosActive(true);
        setSharing(false);
        alert("SOS alert sent successfully!");
      } catch (error) {
        console.error(error);
        setSharing(false);
        alert("Failed to send SOS");
      }
    },
    (error) => {
      console.error(error);
      setSharing(false);
      alert("Unable to get your location");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

  function deactivate() {
    setSosActive(false)
    setShowSosModal(false)
  }

  if (!showSosModal) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(45,24,38,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background: 'white', boxShadow: '0 24px 80px rgba(45,24,38,0.3)' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center" style={{ background: sosActive ? 'rgba(239,68,68,0.06)' : 'white' }}>
          {sosActive ? (
            <>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <CheckCircle size={32} style={{ color: '#ef4444' }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: '#ef4444', fontFamily: 'DM Serif Display' }}>SOS Activated</h2>
              <p className="text-sm mt-1" style={{ color: '#9e6878' }}>Your location has been shared with your emergency contacts</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center live-badge" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <AlertTriangle size={32} style={{ color: '#ef4444' }} />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'DM Serif Display', color: '#2d1826' }}>Emergency SOS</h2>
              <p className="text-sm mt-1" style={{ color: '#9e6878' }}>This will share your live location with your emergency contacts</p>
            </>
          )}
        </div>

        <div className="px-6 pb-6">
          {/* Current location */}
          <div className="flex items-start gap-3 p-3 rounded-xl mb-4" style={{ background: 'rgba(253,242,246,0.8)' }}>
            <MapPin size={16} style={{ color: '#c05070', marginTop: 2 }} />
            <div>
              <div className="text-xs font-semibold" style={{ color: '#2d1826' }}>Your Current Location</div>
              {location ? (
  <>
    <div className="text-xs mt-0.5" style={{ color: '#9e6878' }}>
      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
    </div>

    <a
      href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
      target="_blank"
      rel="noreferrer"
      className="text-[10px] underline mt-1 inline-block"
      style={{ color: '#c05070' }}
    >
      Open in Google Maps
    </a>
  </>
) : (
  <div className="text-xs mt-0.5" style={{ color: '#9e6878' }}>
    Detecting your live location...
  </div>
)}
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full live-badge" style={{ background: sosActive ? '#ef4444' : '#4caf82' }} />
                <span className="text-[10px]" style={{ color: sosActive ? '#ef4444' : '#4caf82', fontFamily: 'JetBrains Mono' }}>
                  {sosActive ? 'LIVE SHARING' : 'GPS Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency contacts */}
          <div className="mb-4">
            <div className="text-xs font-semibold mb-2" style={{ color: '#5a3349' }}>Will notify:</div>
            {emergencyContacts.length === 0 ? (
  <div
    className="text-sm text-center py-3"
    style={{ color: '#9e6878' }}
  >
    No emergency contacts added
  </div>
) : (
  emergencyContacts.map((c) => (
    <div
      key={c.id}
      className="flex items-center justify-between py-2 border-b"
      style={{ borderColor: 'rgba(212,113,138,0.1)' }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #c05070, #9e6878)' }}
        >
          {c.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <div
            className="text-xs font-semibold"
            style={{ color: '#2d1826' }}
          >
            {c.name}
          </div>
          <div
            className="text-[10px]"
            style={{ color: '#9e6878' }}
          >
            {c.relationship}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Phone size={12} style={{ color: '#4caf82' }} />
        <span
          className="text-[10px]"
          style={{ color: '#9e6878', fontFamily: 'JetBrains Mono' }}
        >
          {c.phone}
        </span>
      </div>
    </div>
  ))
)}
          </div>

          {sosActive ? (
            <div className="space-y-3">
              <div className="text-xs text-center py-2 rounded-xl font-semibold" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                🔴 Live location sharing ACTIVE
              </div>
              <button
                onClick={deactivate}
                className="w-full py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: '#ef4444', color: 'white', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
              >
                Deactivate SOS
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setShowSosModal(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all border"
                style={{ color: '#5a3349', borderColor: 'rgba(212,113,138,0.3)', background: 'white' }}
              >
                Cancel
              </button>
              <button
                onClick={activateSOS}
                disabled={sharing}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.35)', opacity: sharing ? 0.8 : 1 }}
              >
                {sharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    Activate SOS
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {!sosActive && (
          <button onClick={() => setShowSosModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,113,138,0.1)', color: '#9e6878' }}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
