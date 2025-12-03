"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface Message {
  _id: string
  senderId: string
  receiverId: string
  body: string
  createdAt: string
}

export default function InvestorChatPage() {
  const params = useParams()
  const businessId = params.id as string
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")

  const fetchMessages = async () => {
    const res = await fetch(`/api/messages?businessId=${businessId}`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data.data)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [businessId])

  const send = async () => {
    if (!text.trim()) return
    const res = await fetch(`/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, receiverId: "owner", body: text }),
    })
    if (res.ok) {
      setText("")
      fetchMessages()
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-4">Messages</h1>
      <div className="border rounded-lg p-4 bg-white space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-600">No messages yet</p>
        ) : (
          messages.map((m) => (
            <div key={m._id} className="text-sm">
              <span className="text-gray-500">{new Date(m.createdAt).toLocaleString()}: </span>
              <span className="text-gray-900">{m.body}</span>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button onClick={send} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Send
        </button>
      </div>
    </div>
  )
}

