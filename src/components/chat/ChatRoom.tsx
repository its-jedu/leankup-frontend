import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, MessageCircle, X, ExternalLink, Phone } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/lib/toast'

interface Message {
  id: number
  sender: number
  sender_username: string
  content: string
  created_at: string
}

interface ChatRoomProps {
  taskId: number
  taskTitle: string
  otherUserId: number
  otherUsername: string
  onClose: () => void
}

const ChatRoom = ({ taskId, taskTitle, otherUserId, otherUsername, onClose }: ChatRoomProps) => {
  const { user } = useAuth()
  const [newMessage, setNewMessage] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Fetch other user's profile to get WhatsApp number
  const { data: otherUserProfile } = useQuery({
    queryKey: ['user-profile', otherUserId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/users/${otherUserId}/profile/`)
      return response.data
    },
    enabled: !!otherUserId,
  })

  useEffect(() => {
    if (otherUserProfile?.whatsapp_number) {
      setWhatsappNumber(otherUserProfile.whatsapp_number)
    }
  }, [otherUserProfile])

  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['chat-messages', taskId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/tasks/${taskId}/messages/`)
      return response.data || []
    },
    refetchInterval: 3000, // Poll every 3 seconds
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      axiosInstance.post(`/tasks/${taskId}/send-message/`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', taskId] })
      setNewMessage('')
    },
    onError: (error: any) => {
      showToast.error('Failed to send message', {
        description: error.response?.data?.error || 'Please try again'
      })
    },
  })

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage)
    }
  }

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getInitials = (name: string) => {
    return name?.slice(0, 2).toUpperCase() || 'U'
  }

  // WhatsApp link
  const getWhatsAppLink = () => {
    if (whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/\D/g, '')
      return `https://wa.me/${cleanNumber}?text=Hi! I'm interested in discussing the task: ${taskTitle}`
    }
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 sm:w-96 h-96 shadow-2xl z-50 flex flex-col border-border">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium text-foreground">Chat: {taskTitle}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          {getWhatsAppLink() && (
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-muted rounded transition"
              title="Continue on WhatsApp"
            >
              <Phone className="h-4 w-4 text-green-500" />
            </a>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : messages?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
            {!getWhatsAppLink() && (
              <p className="text-xs text-muted-foreground mt-2">
                Tip: Ask the other user to add their WhatsApp number in Settings for easier chat
              </p>
            )}
          </div>
        ) : (
          messages?.map((msg: Message) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${msg.sender === user?.id ? 'flex-row-reverse' : ''}`}>
                {msg.sender !== user?.id && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(msg.sender_username)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg px-3 py-2 ${
                  msg.sender === user?.id 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-foreground'
                }`}>
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-background border-border text-foreground"
        />
        <Button 
          size="icon" 
          onClick={handleSend} 
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
        >
          {sendMessageMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {getWhatsAppLink() && (
        <div className="p-2 border-t border-border bg-muted/30 text-center">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Continue chat on WhatsApp
          </a>
        </div>
      )}
    </Card>
  )
}

export default ChatRoom