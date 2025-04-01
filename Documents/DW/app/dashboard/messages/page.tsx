"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Briefcase, Calendar, Clock, DollarSign, Home, MessageSquare, Search, Send, Settings, User } from "lucide-react"
import { pusherClient } from "@/lib/pusher"
import { formatDistanceToNow } from "date-fns"

interface Message {
  _id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  read: boolean
  createdAt: string
}

interface Conversation {
  _id: string
  participants: string[]
  lastMessage?: string
  lastMessageDate?: string
  createdAt: string
  updatedAt: string
  otherUser: {
    name: string
    image?: string
  }
  messages?: Message[]
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch user ID and conversations
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // In a real app, this would fetch the user from the session
        // For now, we'll use a mock user ID
        setUserId("user123")

        const response = await fetch("/api/conversations")
        const data = await response.json()

        if (data.conversations) {
          setConversations(data.conversations)
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/messages?conversationId=${selectedConversation._id}`)
          const data = await response.json()

          if (data.messages) {
            setMessages(data.messages)
          }
        } catch (error) {
          console.error("Error fetching messages:", error)
        }
      }

      fetchMessages()

      // Subscribe to Pusher channel for real-time updates
      const channel = pusherClient.subscribe(`private-conversation-${selectedConversation._id}`)

      channel.bind("new-message", (newMessage: Message) => {
        setMessages((prevMessages) => [...prevMessages, newMessage])

        // Update conversation list
        setConversations((prevConversations) => {
          return prevConversations.map((conversation) => {
            if (conversation._id === selectedConversation._id) {
              return {
                ...conversation,
                lastMessage: newMessage.content,
                lastMessageDate: newMessage.createdAt,
              }
            }
            return conversation
          })
        })
      })

      return () => {
        pusherClient.unsubscribe(`private-conversation-${selectedConversation._id}`)
      }
    }
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !userId) return

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          content: newMessage,
          receiverId: selectedConversation.participants.find((id) => id !== userId),
        }),
      })

      if (response.ok) {
        // Message will be added via Pusher
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // For demo purposes, we'll use mock data if the API calls fail
  useEffect(() => {
    if (!isLoading && conversations.length === 0) {
      // Mock conversations
      setConversations([
        {
          _id: "1",
          participants: ["user123", "user456"],
          lastMessage: "That sounds great! I'll see you tomorrow at 9 AM.",
          lastMessageDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          otherUser: {
            name: "Jane Smith",
            image: null,
          },
        },
        {
          _id: "2",
          participants: ["user123", "user789"],
          lastMessage: "Thanks for your application. Are you available for an interview?",
          lastMessageDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          otherUser: {
            name: "John Doe",
            image: null,
          },
        },
        {
          _id: "3",
          participants: ["user123", "user101"],
          lastMessage: "The job has been completed successfully. Thank you!",
          lastMessageDate: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
          createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          otherUser: {
            name: "Sarah Johnson",
            image: null,
          },
        },
      ])
    }
  }, [isLoading, conversations])

  // Mock messages for selected conversation
  useEffect(() => {
    if (selectedConversation && messages.length === 0) {
      if (selectedConversation._id === "1") {
        setMessages([
          {
            _id: "msg1",
            conversationId: "1",
            senderId: "user456",
            receiverId: "user123",
            content: "Hi there! I'm interested in hiring you for the moving job this weekend.",
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          },
          {
            _id: "msg2",
            conversationId: "1",
            senderId: "user123",
            receiverId: "user456",
            content:
              "Hello! I'd be happy to help with your move. Can you provide more details about what needs to be moved?",
            read: true,
            createdAt: new Date(Date.now() - 86400000 + 900000).toISOString(), // 15 min later
          },
          {
            _id: "msg3",
            conversationId: "1",
            senderId: "user456",
            receiverId: "user123",
            content:
              "I have a one-bedroom apartment and need help moving a couch, bed, dresser, and about 10 boxes to my new place about 2 miles away.",
            read: true,
            createdAt: new Date(Date.now() - 86400000 + 1800000).toISOString(), // 30 min later
          },
          {
            _id: "msg4",
            conversationId: "1",
            senderId: "user123",
            receiverId: "user456",
            content: "That sounds manageable. I'm available this Saturday from 9 AM to 5 PM. Would that work for you?",
            read: true,
            createdAt: new Date(Date.now() - 86400000 + 2700000).toISOString(), // 45 min later
          },
          {
            _id: "msg5",
            conversationId: "1",
            senderId: "user456",
            receiverId: "user123",
            content: "That sounds great! I'll see you tomorrow at 9 AM.",
            read: false,
            createdAt: new Date().toISOString(), // Today
          },
        ])
      } else if (selectedConversation._id === "2") {
        setMessages([
          {
            _id: "msg6",
            conversationId: "2",
            senderId: "user789",
            receiverId: "user123",
            content: "Thanks for your application to the Event Staff position.",
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          },
          {
            _id: "msg7",
            conversationId: "2",
            senderId: "user789",
            receiverId: "user123",
            content: "Are you available for an interview this week?",
            read: false,
            createdAt: new Date(Date.now() - 86400000 + 60000).toISOString(), // 1 min later
          },
        ])
      } else if (selectedConversation._id === "3") {
        setMessages([
          {
            _id: "msg8",
            conversationId: "3",
            senderId: "user123",
            receiverId: "user101",
            content: "I've finished the gardening work as requested.",
            read: true,
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
          },
          {
            _id: "msg9",
            conversationId: "3",
            senderId: "user101",
            receiverId: "user123",
            content: "The job has been completed successfully. Thank you!",
            read: true,
            createdAt: new Date(Date.now() - 5 * 86400000 + 1800000).toISOString(), // 30 min later
          },
        ])
      }
    }
  }, [selectedConversation, messages])

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If yesterday, show "Yesterday"
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    // Otherwise, show date
    return date.toLocaleDateString()
  }

  const formatConversationDate = (dateString: string) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const now = new Date()

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If within the last week, show day name
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(now.getDate() - 7)
    if (date > oneWeekAgo) {
      return date.toLocaleDateString([], { weekday: "short" })
    }

    // Otherwise, show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold tracking-tight transition-transform hover:scale-105">
              DayWork
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-muted/40 lg:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard/jobs">
                <Briefcase className="h-5 w-5" />
                <span>Find Jobs</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard/applications">
                <Clock className="h-5 w-5" />
                <span>Applications</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 bg-accent" asChild>
              <Link href="/dashboard/messages">
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard/calendar">
                <Calendar className="h-5 w-5" />
                <span>Calendar</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard/earnings">
                <DollarSign className="h-5 w-5" />
                <span>Earnings</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <div className="flex h-[calc(100vh-4rem)]">
            {/* Conversations list */}
            <div className="w-full border-r md:w-80">
              <div className="p-4 border-b">
                <h1 className="text-xl font-bold mb-4">Messages</h1>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search conversations..." className="w-full pl-8" />
                </div>
              </div>
              <div className="overflow-auto h-[calc(100vh-10rem)]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">Loading conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const isSelected = selectedConversation?._id === conversation._id
                    const isUnread = messages.some(
                      (msg) => msg.conversationId === conversation._id && msg.receiverId === userId && !msg.read,
                    )

                    return (
                      <div
                        key={conversation._id}
                        className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-accent transition-colors ${
                          isSelected ? "bg-accent" : ""
                        } ${isUnread ? "font-medium" : ""}`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          {/* Online indicator would go here in a real app */}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-medium truncate">{conversation.otherUser.name}</h3>
                            <span className="text-xs text-muted-foreground">
                              {formatConversationDate(conversation.lastMessageDate || conversation.updatedAt)}
                            </span>
                          </div>
                          <p className="text-sm truncate text-muted-foreground">
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                        </div>
                        {isUnread && <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary"></span>}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="hidden md:flex flex-1 flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {/* Online indicator would go here in a real app */}
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedConversation.otherUser.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {/* Online status would go here in a real app */}
                          Last active:{" "}
                          {formatDistanceToNow(new Date(selectedConversation.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No messages yet</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.senderId === userId ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.senderId === userId ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === userId ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}
                            >
                              {formatMessageDate(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button size="icon" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No conversation selected</h3>
                    <p className="text-muted-foreground">Select a conversation from the list to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

