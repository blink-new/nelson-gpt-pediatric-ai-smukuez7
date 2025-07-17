import { useState, useEffect } from 'react'
import { createClient } from '@blinkdotnew/sdk'
import ChatInterface from './components/ChatInterface'
import { Toaster } from 'sonner'

// Initialize Blink client
const blink = createClient({
  projectId: 'nelson-gpt-pediatric-ai-smukuez7',
  authRequired: true
})

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="h-screen nelson-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-sm">Loading Nelson-GPT...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen nelson-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-w-md px-6">
          <div className="text-4xl font-bold text-white mb-2">Nelson-GPT</div>
          <div className="text-lg text-gray-300 mb-4">
            Pediatric AI Assistant powered by Nelson Textbook of Pediatrics
          </div>
          <button 
            onClick={() => blink.auth.login()}
            className="nelson-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Sign in to Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dark">
      <ChatInterface user={user} blink={blink} />
      <Toaster theme="dark" />
    </div>
  )
}

export default App