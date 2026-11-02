import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Bot } from 'lucide-react'
import { useStore } from '../store'

interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
  timestamp: string
}

const QUICK_QUESTIONS = [
  'Why is this route safer?',
  'Is it safe to travel at night?',
  'What are the safest roads nearby?',
  'Why did my safety score change?',
  'Find a safer route',
]

const AI_RESPONSES: Record<string, string> = {
  'Why is this route safer?': "The recommended route scores 94/100 because it maintains high pedestrian density (92%) throughout, has functioning streetlights for 95% of its length, and keeps you within 500m of a police station for 70% of the journey. There's also only 1 recent safety report vs. 6 on the fastest route.",
  'Is it safe to travel at night?': "Currently, the safest route remains relatively safe even at night (score: 78/100) because the main road sections are well-lit and have 24/7 police presence. However, I recommend avoiding the stretch after Linking Road after 10 PM, as pedestrian activity drops significantly.",
  'What are the safest roads nearby?': "The safest roads in your current area are: (1) Hill Road, Bandra West – high activity, well-lit, police chowky nearby. (2) Linking Road – commercial stretch with shops open late. (3) Turner Road – residential but well-monitored. Avoid the lane near Mehboob Studio at night.",
  'Why did my safety score change?': "Your route safety score changed because: a new community report was submitted 0.3km from your route 15 minutes ago (suspicious activity near Turner Road). This reduced the score by -4 points. Additionally, human activity on one stretch dropped by 8% as evening began.",
  'Find a safer route': "Based on current conditions, I recommend switching to the Safest Route (Score: 94/100, 24 min). It adds 8 minutes but keeps you on better-lit main roads with significantly lower crime risk. Would you like me to update your navigation?",
}

function getAIResponse(question: string): string {
  const match = Object.keys(AI_RESPONSES).find((k) => question.toLowerCase().includes(k.toLowerCase().split(' ')[0]))
  return match
    ? AI_RESPONSES[match]
    : "I'm analyzing safety conditions along your route. Based on current data: pedestrian activity is high (87%), all police stations within 1km are active, and weather conditions are favorable. Your current route safety score is 94/100 – this is excellent for this time of day."
}

export default function AIChat() {
  const { showAIChat, toggleAIChat } = useStore()
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'ai', text: "Hi! I'm SheRoute AI. Ask me anything about your route safety, nearby hazards, or how to improve your safety score.", timestamp: 'Now' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage(text: string = input) {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: 'Now' }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: getAIResponse(text), timestamp: 'Now' }
      setMessages((prev) => [...prev, aiMsg])
      setLoading(false)
    }, 1000)
  }

  if (!showAIChat) return null

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 w-80 md:w-96 z-40 flex flex-col rounded-2xl overflow-hidden shadow-2xl" style={{ height: 480, background: 'white', border: '1px solid rgba(212,113,138,0.2)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(192,80,112,0.08), rgba(158,104,120,0.08))', borderColor: 'rgba(212,113,138,0.15)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c05070, #9e6878)' }}>
            <Sparkles size={15} style={{ color: 'white' }} />
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#2d1826' }}>Ask SheRoute AI</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full live-badge" style={{ background: '#4caf82' }} />
              <span className="text-[10px]" style={{ color: '#4caf82' }}>AI Online</span>
            </div>
          </div>
        </div>
        <button onClick={toggleAIChat} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,113,138,0.1)', color: '#9e6878' }}>
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #c05070, #9e6878)' }}>
                <Bot size={12} style={{ color: 'white' }} />
              </div>
            )}
            <div
              className="max-w-[80%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed"
              style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg, #c05070, #9e6878)' : 'rgba(253,242,246,0.8)',
                color: msg.role === 'user' ? 'white' : '#2d1826',
                borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: msg.role === 'ai' ? 4 : 16,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #c05070, #9e6878)' }}>
              <Bot size={12} style={{ color: 'white' }} />
            </div>
            <div className="px-3 py-2.5 rounded-2xl flex items-center gap-1.5" style={{ background: 'rgba(253,242,246,0.8)' }}>
              {[0,1,2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#c05070', animation: `live-pulse 1s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="px-3 pb-2 flex-shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {QUICK_QUESTIONS.slice(0, 3).map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="flex-shrink-0 text-[10px] px-2.5 py-1.5 rounded-full whitespace-nowrap"
              style={{ background: 'rgba(192,80,112,0.08)', color: '#c05070', border: '1px solid rgba(192,80,112,0.2)' }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 pb-3 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your route safety..."
          className="flex-1 px-3 py-2 rounded-xl text-xs"
          style={{ background: 'rgba(253,242,246,0.8)', border: '1px solid rgba(212,113,138,0.2)', color: '#2d1826', outline: 'none' }}
        />
        <button
          onClick={() => sendMessage()}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #c05070, #9e6878)' }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
