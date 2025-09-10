"use client"

import { useEffect } from "react"
import { useSocket } from "@/hooks/use-socket"
import { useRouter } from "next/navigation"

interface RoomRealtimeProps {
  roomId: string
  userId: string
  children: React.ReactNode
}

export function RoomRealtime({ roomId, userId, children }: RoomRealtimeProps) {
  const { socket, isConnected } = useSocket()
  const router = useRouter()

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit("join-room", { roomId, userId })
      
      socket.on("game-started", () => {
        router.refresh()
      })
      
      socket.on("time-expired", () => {
        router.push(`/rooms/${roomId}/results`)
      })
      
      socket.on("game-ended", () => {
        router.push(`/rooms/${roomId}/results`)
      })

      socket.on("submission-update", () => router.refresh())
      socket.on("player-joined", () => router.refresh())
      socket.on("player-left", () => router.refresh())

      return () => {
        socket.emit("leave-room", { roomId })
      }
    }
  }, [socket, isConnected, roomId, userId, router])

  return <>{children}</>
}
