import { useState } from 'react'
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Share, User, Bot } from 'lucide-react'
import { Button } from './ui/button'
import { toast } from 'sonner'

interface MessageProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }
}

export default function Message({ message }: MessageProps) {
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    toast.success('Message copied to clipboard')
  }

  const handleReaction = (type: 'up' | 'down') => {
    setReaction(reaction === type ? null : type)
    toast.success(`Feedback ${type === 'up' ? 'positive' : 'negative'} recorded`)
  }

  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`rounded-lg p-4 ${
          isUser 
            ? 'nelson-user-msg text-white max-w-lg' 
            : 'nelson-ai-msg text-white'
        }`}>
          {/* Message content */}
          <div className="prose prose-invert max-w-none">
            {message.content.split('\n').map((line, index) => (
              <p key={index} className="mb-2 last:mb-0">
                {line}
              </p>
            ))}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-gray-400 mt-3 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Action buttons for assistant messages */}
      {!isUser && (
        <div className="flex flex-col gap-1 mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:nelson-secondary"
            onClick={handleCopy}
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:nelson-secondary ${
              reaction === 'up' ? 'text-green-400' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleReaction('up')}
          >
            <ThumbsUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:nelson-secondary ${
              reaction === 'down' ? 'text-red-400' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleReaction('down')}
          >
            <ThumbsDown className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:nelson-secondary"
            onClick={() => toast.info('Regenerate feature coming soon')}
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:nelson-secondary"
            onClick={() => toast.info('Share feature coming soon')}
          >
            <Share className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}