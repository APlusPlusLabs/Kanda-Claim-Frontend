"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ChatBubbleIcon, PaperPlaneIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { useAuth } from "@/lib/auth-provider";
import DashboardLayout from "@/components/dashboard-layout";
import { Bell, BellIcon, Car, FileText, LogOut, MessageSquare, User } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface Message {
  id: string | number;
  sender: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

interface Conversation {
  id: string | number;
  with: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  code: string;
}

interface Claim {
  id: string | number;
  code: string;
  participants: { id: string | number; name: string; type: "assessor" | "insurer" | "garage" }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";

export default function MessagesPage() {
  const { user, apiRequest } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await apiRequest(`${API_URL}conversations/${user?.id}`, "GET");
        setConversations(response);
        if (response.length > 0) {
          setActiveConversation(response[0]);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages when activeConversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const messagesResponse = await apiRequest(
          `${API_URL}conversations/${activeConversation.id}/messages/${user?.id}`,
          "GET"
        );
        setMessages(messagesResponse);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    fetchMessages();
  }, [activeConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const message = await apiRequest(`${API_URL}conversations/${activeConversation.id}/messages/${user?.id}`, "POST", {
        content: newMessage,
      });
      setMessages([...messages, message]);
      setNewMessage("");

      // Update conversation's last message and timestamp
      setConversations(
        conversations.map((conv) =>
          conv.id === activeConversation.id
            ? { ...conv, lastMessage: message.content, timestamp: message.timestamp, unread: false }
            : conv
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleNewConversation = async () => {
    try {
      // Fetch claims with participants
      const claims = await apiRequest(`${API_URL}get-claims/${user?.id}`, "GET");
      if (claims.length === 0) {
        console.error("No claims available");
        return;
      }
      // Placeholder: Select the first claim and participant
      const selectedClaim = claims[0];
      const selectedParticipant = selectedClaim.participants[0];
      if (!selectedParticipant) {
        console.error("No participants available for claim");
        return;
      }
      // Create a new thread
      // const threadData = {
      //   claim_id: selectedClaim.id,
      //   participant_id: selectedParticipant.id,
      //   user_id: user?.id,
      //   tenant_id: user?.tenant_id,
      // };
      const formData = new FormData();
      formData.append('claim_id', selectedClaim.id);
      formData.append('user_id', user?.id + "");
      formData.append('tenant_id', user?.tenant_id + "");
      formData.append('participant_id', selectedParticipant.id + "");
      const threadResponse = await apiRequest(`${API_URL}create-threads`, "POST", formData);
      // Send an initial message
      const message = await apiRequest(`${API_URL}conversations/${threadResponse.id}/messages/${user?.id}`, "POST", {
        content: `Starting conversation with ${selectedParticipant.name} for claim #${selectedClaim.code}`,
      });
      // Refresh conversations
      const response = await apiRequest(`${API_URL}conversations/${user?.id}`, "GET");
      setConversations(response);
      setActiveConversation(response.find((conv: any) => conv.id === threadResponse.id) || null);
      setMessages([message]);
    } catch (error) {
      console.error("Failed to start new conversation:", error);
    }
  };

  return (
    <DashboardLayout
      user={{
        name: user?.name ?? "Unknown",
        role: "Driver",
        avatar: "/placeholder.svg?height=40&width=40",
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
      <div className="container space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Messages</h1>
          <Button onClick={handleNewConversation}>
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
                    className={`p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors ${activeConversation?.id === conversation.id ? "bg-muted" : ""
                      }`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{conversation.with}</p>
                      <p className="text-xs text-muted-foreground">{conversation.timestamp}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{conversation.lastMessage}</p>
                    {conversation.unread && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="border-b">
              {activeConversation && (
                <div>
                  <CardTitle>{activeConversation.with}</CardTitle>
                  <CardDescription>Claim #{activeConversation.code}</CardDescription>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 h-[400px] overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${message.isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
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
                      e.preventDefault();
                      handleSendMessage();
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
    </DashboardLayout>
  );
}