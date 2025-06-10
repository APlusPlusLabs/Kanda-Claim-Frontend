"use client"

import { useState, useEffect } from "react"
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
  Car,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { format } from "date-fns"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ChatBubbleIcon, PaperPlaneIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { useLanguage } from "@/lib/language-context";

interface Message {
  id: string | number;
  sender: string;
  content: string;
  timestamp: string;
  is_me: boolean;
}
interface Participant {
  id: string;
  name: string;
  role: string;
}

interface Conversation {
  id: string;
  claim_id: string;
  with: string;
  last_message: string;
  timestamp: string;
  code: string;
  unread: boolean;
  unread_count: number;
  participants: Participant[];
  messages: Message[];
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function MessagesPage() {
  const { user, apiRequest } = useAuth();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("")
  const [currentChat, setCurrentChat] = useState<Conversation>()
  const [messageText, setMessageText] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch conversations from the backend
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        const response = await apiRequest(`${API_URL}messages/threads/${user?.id}`, "GET")
        setConversations(response.data)
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  // Filter conversations by search term
  const filteredConversations = conversations.filter((conversation) =>
    conversation.claim_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.participants.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentChat) return

    const newMessage = {
      thread_id: currentChat.id,
      content: messageText,
    }

    try {
      const response = await apiRequest(`${API_URL}messages/${user?.id}`, "POST", newMessage)
      const updatedMessage = response.data

      const updatedConversations = conversations.map((conversation) => {
        if (conversation.id === currentChat.id) {
          return {
            ...conversation,
            messages: [...conversation.messages, updatedMessage],
            last_message: messageText,
            timestamp: new Date().toISOString(),
            unread_count: 0,
          }
        }
        return conversation
      })

      setConversations(updatedConversations)
      setCurrentChat({
        ...currentChat,
        messages: [...currentChat.messages, updatedMessage],
        last_message: messageText,
        timestamp: new Date().toISOString(),
        unread_count: 0,
      })
      setMessageText("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Handle selecting a conversation
  const handleChatSelect = async (conversation) => {
    try {
      // Mark messages as read
      await apiRequest(`${API_URL}messages/threads/${conversation.id}/read/${user?.id}`, 'PATCH')
      const updatedConversations = conversations.map((c) => {
        if (c.id === conversation.id) {
          return { ...c, unread_count: 0 }
        }
        return c
      })
      setConversations(updatedConversations)
      setCurrentChat(conversation)
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  return (
    <DashboardLayout
      user={{
        name: user?.name ? `${user.name} ` : "User name",
        role: user?.role.name,
        avatar: user?.avatar ? user?.avatar : "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        {
          name: `Kanda Claim - ${t("nav.dashboard")}`,
          href: "/dashboard/driver",
          icon: <Car className="h-5 w-5" />,
          translationKey: "nav.dashboard",
        },
        {
          name: t("nav.claims"),
          href: "/dashboard/driver/claims",
          icon: <FileText className="h-5 w-5" />,
          translationKey: "nav.claims",
        },
        {
          name: t("nav.messages"),
          href: "/dashboard/driver/messages",
          icon: <MessageSquare className="h-5 w-5" />,
          translationKey: "nav.messages",
        },
        {
          name: t("nav.notifications"),
          href: "/dashboard/driver/notifications",
          icon: <Bell className="h-5 w-5" />,
          translationKey: "nav.notifications",
        },
        {
          name: t("nav.profile"),
          href: "/dashboard/driver/profile",
          icon: <User className="h-5 w-5" />,
          translationKey: "nav.profile",
        }, { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }
      ]}
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
                  placeholder="Search by claim ID or participant..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="flex-1 flex flex-col">
              <div className="px-4 pt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="flex-1 overflow-auto p-0 m-0">
                <ScrollArea className="h-full">
                  {loading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading...</div>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${currentChat?.id === conversation.id ? "bg-muted" : ""
                          }`}
                        onClick={() => handleChatSelect(conversation)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                          <div className="relative">
                            <img
                              src={"/placeholder.svg"}
                              alt={conversation.claim_id}
                              className="w-10 h-10 rounded-full"
                            />
                            {/* {conversation.unread && ( */}
                              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unread_count}
                              </span>
                            {/* )} */}
                          </div>
                            {conversation.unread_count > 0 && (
                              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-medium truncate">Claim {conversation.claim_id}</h3>
                              <span className="text-xs text-muted-foreground">
                                {conversation.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{conversation.last_message}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {conversation.participants.map((p) => (
                                <span key={p.id} className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.role}</span>
                              ))}
                            </div>
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
                  {loading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading...</div>
                  ) : filteredConversations.filter((c) => c.unread_count > 0).length > 0 ? (
                    filteredConversations
                      .filter((c) => c.unread_count > 0)
                      .map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${currentChat?.id === conversation.id ? "bg-muted" : ""
                            }`}
                          onClick={() => handleChatSelect(conversation)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <MessageSquare className="h-5 w-5" />
                              </div>
                              {conversation.unread_count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline">
                                <h3 className="font-medium truncate">Claim {conversation.claim_id}</h3>
                                <span className="text-xs text-muted-foreground">
                                  {conversation.timestamp}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{conversation.last_message}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {conversation.participants.map((p) => (
                                  <span key={p.id} className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.role}</span>
                                ))}
                              </div>
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
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Claim {currentChat.claim_id}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentChat.participants.map((p) => (
                          <span key={p.id} className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.role}</span>
                        ))}
                      </div>
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
                      <div key={message.id} className={`flex ${message.is_me ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${message.is_me ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                        >
                          <p>{message.content}</p>
                          <div
                            className={`text-xs mt-1 ${message.is_me ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}
                          >
                            <small>  {message.sender} - {message.timestamp}</small>
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