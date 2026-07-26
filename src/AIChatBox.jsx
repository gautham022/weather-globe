import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, X, Loader2, Sparkles } from 'lucide-react'
import './AIChatBox.css'

function AIChatBox({ city, weather, variant = 'floating' }) {
  const isDocked = variant === 'docked'
  const [open, setOpen] = useState(isDocked ? true : false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, open])

  function handleSubmit(e) {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage = { text: trimmed, isUser: true }
    const updatedHistory = messages.map((m) => ({
      role: m.isUser ? 'user' : 'assistant',
      content: m.text,
    }))

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setError(null)
    setIsLoading(true)

    fetch('http://localhost/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: trimmed,
        city: city || null,
        weather: weather || null,
        history: updatedHistory,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then((data) => {
        setMessages((prev) => [...prev, { text: data.reply, isUser: false }])
      })
      .catch((err) => {
        console.error('Chat request failed:', err)
        setError("Couldn't reach the weather assistant. Try again in a moment.")
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <>
      {!isDocked && (
        <button
          className="ai-chat-toggle"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? 'Close weather assistant' : 'Open weather assistant'}
        >
          {open ? <X size={22} /> : <Bot size={24} />}
        </button>
      )}

      {open && (
        <div className={`ai-chatbox ${isDocked ? 'ai-chatbox--docked' : ''}`}>
          <div className="ai-chatbox__header">
            <div className="ai-chatbox__header-left">
              <Sparkles size={16} className="ai-chatbox__icon" />
              <span>Wglobe Assistant</span>
            </div>
            {city && <span className="ai-chatbox__context-chip">{city}</span>}
          </div>

          <div className="ai-chatbox__messages">
            {messages.length === 0 ? (
              <div className="ai-chatbox__empty">
                <Sparkles size={30} className="ai-chatbox__icon ai-chatbox__icon--large" />
                <p className="ai-chatbox__empty-title">Ask me about the weather</p>
                <p className="ai-chatbox__empty-sub">
                  {city
                    ? `E.g. "Will it rain tomorrow in ${city}?" or "Should I carry an umbrella?"`
                    : 'Search a city on the globe, then ask me anything about its weather.'}
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`ai-chatbox__bubble-row ${
                      msg.isUser ? 'ai-chatbox__bubble-row--user' : ''
                    }`}
                  >
                    <div
                      className={`ai-chatbox__bubble ${
                        msg.isUser ? 'ai-chatbox__bubble--user' : 'ai-chatbox__bubble--bot'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="ai-chatbox__bubble-row">
                    <div className="ai-chatbox__bubble ai-chatbox__bubble--bot ai-chatbox__typing">
                      <span className="ai-chatbox__dot" />
                      <span className="ai-chatbox__dot" />
                      <span className="ai-chatbox__dot" />
                    </div>
                  </div>
                )}
              </>
            )}
            {error && <div className="ai-chatbox__error">{error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chatbox__input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="ai-chatbox__input"
            />
            <button
              type="submit"
              className="ai-chatbox__send"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="ai-chatbox__spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default AIChatBox
