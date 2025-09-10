"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function JoinByCode() {
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setLoading(true)
    const response = await fetch("/api/rooms/join-by-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode: joinCode.trim().toUpperCase() })
    })
    const data = await response.json()
    if (!response.ok) return setLoading(false)
    router.push(`/rooms/${data.roomId}`)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join by Code</CardTitle>
        <CardDescription>Enter a room code to join an existing game</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoinByCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="joinCode">Room Code</Label>
            <Input
              id="joinCode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="ABC123"
              autoComplete="off"
              maxLength={6}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
