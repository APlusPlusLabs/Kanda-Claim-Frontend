"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2, User, Bot, PhoneCall, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatbot } from "./chatbot-provider"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatbotFAQ } from "./chatbot-faq"

export function Chatbot() {
  const {
    isOpen,
    toggleChat,
    messages,
    currentInput,
    setCurrentInput,
    sendMessage,
    isTyping,
    portalType,
    escalateToLiveSupport,
    isLiveSupport,
    endLiveSupport,
  } = useChatbot()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<string>("chat")

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 z-50"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[350px] h-[500px] shadow-xl z-50 flex flex-col">
      <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Kanda Claim Assistant</h3>
          {isLiveSupport && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Live Support</span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 px-3 pt-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
          <ScrollArea className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.isUser ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.isUser ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {!message.isUser && <Bot className="h-4 w-4" />}
                      {message.isUser && <User className="h-4 w-4" />}
                      <span className="text-xs opacity-70">{message.isUser ? "You" : "Assistant"}</span>
                    </div>
                    <div className="whitespace-pre-line">{message.content}</div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted max-w-[80%] rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <CardFooter className="p-3 pt-0 border-t mt-auto">
            {isLiveSupport ? (
              <div className="w-full space-y-2">
                <form onSubmit={handleSubmit} className="flex space-x-2 w-full">
                  <Input
                    ref={inputRef}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!currentInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <Button variant="outline" size="sm" className="w-full" onClick={endLiveSupport}>
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Live Support
                </Button>
              </div>
            ) : (
              <div className="w-full space-y-2">
                <form onSubmit={handleSubmit} className="flex space-x-2 w-full">
                  <Input
                    ref={inputRef}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!currentInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <Button variant="outline" size="sm" className="w-full" onClick={escalateToLiveSupport}>
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Connect to Live Support
                </Button>
              </div>
            )}
          </CardFooter>
        </TabsContent>

        <TabsContent value="faq" className="flex-1 p-0 m-0">
          <ChatbotFAQ portalType={portalType} />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
