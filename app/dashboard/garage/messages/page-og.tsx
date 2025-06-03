"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { PaperPlaneIcon, PlusCircledIcon } from "@radix-ui/react-icons"

// Mock data for conversations
const conversations = [
  {
    id: "1",
    with: "Sanlam Alianz Insurance",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "We need additional photos of the damage to process your claim.",
    timestamp: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    with: "John Smith (Assessor)",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I'll be at your location tomorrow at 10 AM for the assessment.",
    timestamp: "Yesterday",
    unread: false,
  },
  {
    id: "3",
    with: "Kigali Auto Repair",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Your vehicle repairs are 75% complete. Expected completion by Friday.",
    timestamp: "3 days ago",
    unread: false,
  },
]

// Mock data for messages in a conversation
const mockMessages = [
  {
    id: "1",
    sender: "Sanlam Alianz Insurance",
    content: "Hello, we've received your claim #CL-2023-0042. We need some additional information to proceed.",
    timestamp: "10:30 AM",
    isMe: false,
  },
  {
    id: "2",
    sender: "Me",
    content: "Hi, what additional information do you need?",
    timestamp: "10:35 AM",
    isMe: true,
  },
  {
    id: "3",
    sender: "Sanlam Alianz Insurance",
    content:
      "We need additional photos of the damage to process your claim. Please send clear photos of all damaged areas.",
    timestamp: "10:40 AM",
    isMe: false,
  },
  {
    id: "4",
    sender: "Me",
    content: "I'll take some photos and send them right away.",
    timestamp: "10:45 AM",
    isMe: true,
  },
]

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState(mockMessages)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: `${messages.length + 1}`,
      sender: "Me",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages</h1>
        <Button>
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Your recent message threads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-start space-x-4 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors ${activeConversation.id === conversation.id ? "bg-muted" : ""}`}
                  onClick={() => setActiveConversation(conversation)}
                >
                  <Avatar>
                    <AvatarImage src={conversation.avatar} alt={conversation.with} />
                    <AvatarFallback>{conversation.with.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{conversation.with}</p>
                      <p className="text-xs text-muted-foreground">{conversation.timestamp}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={activeConversation.avatar} alt={activeConversation.with} />
                <AvatarFallback>{activeConversation.with.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{activeConversation.with}</CardTitle>
                <CardDescription>Claim #CL-2023-0042</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 h-[400px] overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${message.isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{message.sender}</span>
                      <span className="text-xs opacity-70">{message.timestamp}</span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="flex w-full items-center space-x-2">
              <Textarea
                placeholder="Type your message..."
                className="flex-1 min-h-[60px]"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <PaperPlaneIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
