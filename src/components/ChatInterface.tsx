import { useState, useRef, useEffect } from 'react'
import { Send, Menu, Plus, Settings, Book, Calculator, TrendingUp, MessageSquare } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './ui/sheet'
import { Separator } from './ui/separator'
import Message from './Message'
import { useIsMobile } from '../hooks/use-mobile'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  user: any
  blink: any
}

export default function ChatInterface({ user, blink }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsStreaming(true)

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      // Stream response from Blink AI
      await blink.ai.streamText(
        {
          prompt: `You are Nelson-GPT, a pediatric AI assistant powered by Nelson Textbook of Pediatrics. You provide evidence-based medical information for pediatric healthcare professionals. 

User question: ${inputValue}

Please provide a comprehensive, medically accurate response focused on pediatric medicine. Include relevant clinical insights, diagnostic considerations, and treatment approaches where appropriate.`,
          model: 'gpt-4o-mini',
          maxTokens: 1000
        },
        (chunk: string) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          )
        }
      )
    } catch (error) {
      console.error('Error streaming response:', error)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: 'I apologize, but I encountered an error. Please try again.' }
            : msg
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const sidebarContent = (
    <div className="h-full nelson-bg flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <Book className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold">Nelson-GPT</span>
        </div>
        <Button 
          className="w-full nelson-secondary text-white hover:nelson-accent"
          onClick={() => {
            setMessages([])
            setSidebarOpen(false)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          <div className="text-gray-400 text-sm font-medium mb-2">Medical Tools</div>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:nelson-secondary">
            <TrendingUp className="w-4 h-4 mr-2" />
            Growth Charts
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:nelson-secondary">
            <Calculator className="w-4 h-4 mr-2" />
            Drug Calculator
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:nelson-secondary">
            <Book className="w-4 h-4 mr-2" />
            Reference Library
          </Button>
        </div>
        
        <Separator className="my-4 bg-gray-700" />
        
        <div className="space-y-2">
          <div className="text-gray-400 text-sm font-medium mb-2">Recent Chats</div>
          {messages.length > 0 && (
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:nelson-secondary">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="truncate">
                {messages[0]?.content.substring(0, 30)}...
              </span>
            </Button>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="truncate">{user.email}</span>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-300 hover:text-white hover:nelson-secondary"
          onClick={() => setSidebarOpen(false)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  )

  return (
    <div className="h-screen nelson-bg flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 border-r border-gray-700">
          {sidebarContent}
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 nelson-secondary border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:nelson-secondary">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </SheetHeader>
                  {sidebarContent}
                </SheetContent>
              </Sheet>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Book className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold">Nelson-GPT</h1>
                <p className="text-gray-400 text-xs">Pediatric AI Assistant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto py-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Book className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Welcome to Nelson-GPT
                  </h2>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Your AI-powered pediatric assistant based on Nelson Textbook of Pediatrics. 
                    Ask me about pediatric conditions, treatments, or diagnostic approaches.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    <Button 
                      variant="outline" 
                      className="text-left p-4 h-auto border-gray-700 hover:border-gray-600"
                      onClick={() => setInputValue('What are the signs and symptoms of respiratory distress in infants?')}
                    >
                      <div className="text-white font-medium">Respiratory Assessment</div>
                      <div className="text-gray-400 text-sm">Signs of distress in infants</div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-left p-4 h-auto border-gray-700 hover:border-gray-600"
                      onClick={() => setInputValue('What is the recommended vaccination schedule for a 2-month-old baby?')}
                    >
                      <div className="text-white font-medium">Vaccination Schedule</div>
                      <div className="text-gray-400 text-sm">2-month-old recommendations</div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-left p-4 h-auto border-gray-700 hover:border-gray-600"
                      onClick={() => setInputValue('How do I calculate pediatric drug dosages for a 5-year-old?')}
                    >
                      <div className="text-white font-medium">Drug Dosage</div>
                      <div className="text-gray-400 text-sm">Pediatric calculations</div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-left p-4 h-auto border-gray-700 hover:border-gray-600"
                      onClick={() => setInputValue('What are the developmental milestones for a 12-month-old?')}
                    >
                      <div className="text-white font-medium">Development</div>
                      <div className="text-gray-400 text-sm">12-month milestones</div>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <Message key={message.id} message={message} />
                  ))}
                  {isStreaming && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Nelson-GPT is thinking...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Nelson-GPT about pediatric medicine..."
                  className="flex-1 nelson-secondary border-gray-700 text-white placeholder-gray-400"
                  disabled={isStreaming}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isStreaming}
                  className="nelson-accent text-white hover:nelson-accent-hover"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Nelson-GPT can make mistakes. Verify important medical information.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}