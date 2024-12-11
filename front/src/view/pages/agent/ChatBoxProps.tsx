'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: number
  sender: 'user' | 'agent'
  content: string
  timestamp: string
}

interface ChatBoxProps {
  agentName: string
}

export function ChatBox({ agentName }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'agent', content: `Hello! I'm ${agentName}. How can I assist you today?`, timestamp: '10:00 AM' },
  ])
  const [input, setInput] = useState('')

  const handleSendMessage = () => {
    if (input.trim() === '') return

    const newUserMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setInput('')

    // Simulate agent response
    setTimeout(() => {
      let responseContent = `This is a response from ${agentName}.`

      if (input.startsWith('/')) {
        switch (input) {
          case '/history':
            responseContent = 'Here is your chat history (dummy response).'
            break
          default:
            responseContent = `Unknown command: ${input}`
        }
      }

      const newAgentMessage: Message = {
        id: messages.length + 2,
        sender: 'agent',
        content: responseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prevMessages) => [...prevMessages, newAgentMessage])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-grow pr-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start mb-4 ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender === 'agent' && (
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={agentName} />
                <AvatarFallback>{agentName[0]}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`rounded-lg p-3 max-w-[70%] ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs opacity-50 mt-1 block">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="mt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center space-x-2"
        >
          <Input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

