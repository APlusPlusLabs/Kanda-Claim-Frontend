"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  FileText,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { format } from "date-fns"

export default function InsurerMessages() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentChat, setCurrentChat] = useState(null)
  const [messageText, setMessageText] = useState("")

  // In a real app, you would fetch this data from an API
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Mugisha Nkusi",
      role: "Customer",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "When will my claim be processed?",
      timestamp: "2025-03-15T10:30:00",
      unread: 2,
      messages: [
        {
          id: 1,
          sender: "Mugisha Nkusi",
          text: "Hello, I submitted a claim yesterday (CL-2025-001) for my Toyota RAV4.",
          timestamp: "2025-03-15T10:15:00",
          isMe: false,
        },
        {
          id: 2,
          sender: "Mugisha Nkusi",
          text: "When will my claim be processed?",
          timestamp: "2025-03-15T10:30:00",
          isMe: false,
        },
      ],
    },
    {
      id: 2,
      name: "Habimana Jean",
      role: "Assessor",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Assessment for claim CL-2025-002 has been completed",
      timestamp: "2025-03-14T14:20:00",
      unread: 1,
      messages: [
        {
          id: 1,
          sender: "Habimana Jean",
          text: "Hello, I've completed the assessment for claim CL-2025-002 (Suzuki Swift).",
          timestamp: "2025-03-14T14:15:00",
          isMe: false,
        },
        {
          id: 2,
          sender: "Habimana Jean",
          text: "Assessment for claim CL-2025-002 has been completed. The report is available in the system.",
          timestamp: "2025-03-14T14:20:00",
          isMe: false,
        },
      ],
    },
    {
      id: 3,
      name: "Kigali Auto Center",
      role: "Garage",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Repairs for Honda Civic (CL-2025-003) are complete",
      timestamp: "2025-03-10T16:45:00",
      unread: 0,
      messages: [
        {
          id: 1,
          sender: "Kigali Auto Center",
          text: "We've completed the repairs for the Honda Civic (CL-2025-003).",
          timestamp: "2025-03-10T16:40:00",
          isMe: false,
        },
        {
          id: 2,
          sender: "Kigali Auto Center",
          text: "Repairs for Honda Civic (CL-2025-003) are complete. The customer has been notified for pickup.",
          timestamp: "2025-03-10T16:45:00",
          isMe: false,
        },
        {
          id: 3,
          sender: "Marie Uwase",
          text: "Thank you for the update. I'll process the payment right away.",
          timestamp: "2025-03-10T17:00:00",
          isMe: true,
        },
      ],
    },
  ])

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentChat) return

    const newMessage = {
      id: currentChat.messages.length + 1,
      sender: "Marie Uwase",
      text: messageText,
      timestamp: new Date().toISOString(),
      isMe: true,
    }

    const updatedConversations = conversations.map((conversation) => {
      if (conversation.id === currentChat.id) {
        return {
          ...conversation,
          messages: [...conversation.messages, newMessage],
          lastMessage: messageText,
          timestamp: new Date().toISOString(),
          unread: 0,
        }
      }
      return conversation
    })

    setConversations(updatedConversations)
    setCurrentChat({
      ...currentChat,
      messages: [...currentChat.messages, newMessage],
      lastMessage: messageText,
      timestamp: new Date().toISOString(),
      unread: 0,
    })
    setMessageText("")
  }

  const handleChatSelect = (conversation) => {
    // Mark as read
    const updatedConversations = conversations.map((c) => {
      if (c.id === conversation.id) {
        return { ...c, unread: 0 }
      }
      return c
    })
    setConversations(updatedConversations)
    setCurrentChat(conversation)
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Marie Uwase",
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/insurer/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/insurer/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/insurer/profile", icon: <User className="h-5 w-5" /> },
      ]}
      actions={[{ name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }]}
    >
      <div className="h-[calc(100vh-120px)] flex flex-col">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="flex-1 flex overflow-hidden border rounded-lg">
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search conversations..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="flex-1 flex flex-col">
              <div className="px-4 pt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">
                    Unread
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="flex-1 overflow-auto p-0 m-0">
                <ScrollArea className="h-full">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                          currentChat?.id === conversation.id ? "bg-muted" : ""
                        }`}
                        onClick={() => handleChatSelect(conversation)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <img
                              src={conversation.avatar || "/placeholder.svg"}
                              alt={conversation.name}
                              className="w-10 h-10 rounded-full"
                            />
                            {conversation.unread > 0 && (
                              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-medium truncate">{conversation.name}</h3>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(conversation.timestamp), "h:mm a")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                            {conversation.role && (
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{conversation.role}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">No conversations found</div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="unread" className="flex-1 overflow-auto p-0 m-0">
                <ScrollArea className="h-full">
                  {filteredConversations.filter((c) => c.unread > 0).length > 0 ? (
                    filteredConversations
                      .filter((c) => c.unread > 0)
                      .map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                            currentChat?.id === conversation.id ? "bg-muted" : ""
                          }`}
                          onClick={() => handleChatSelect(conversation)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <img
                                src={conversation.avatar || "/placeholder.svg"}
                                alt={conversation.name}
                                className="w-10 h-10 rounded-full"
                              />
                              {conversation.unread > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unread}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline">
                                <h3 className="font-medium truncate">{conversation.name}</h3>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(conversation.timestamp), "h:mm a")}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                              {conversation.role && (
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{conversation.role}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">No unread messages</div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          <div className="w-2/3 flex flex-col">
            {currentChat ? (
              <>
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={currentChat.avatar || "/placeholder.svg"}
                      alt={currentChat.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium">{currentChat.name}</h3>
                      {currentChat.role && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{currentChat.role}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Info className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {currentChat.messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p>{message.text}</p>
                          <div
                            className={`text-xs mt-1 ${
                              message.isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(message.timestamp), "h:mm a")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={!messageText.trim()}>
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Conversation Selected</h3>
                  <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
