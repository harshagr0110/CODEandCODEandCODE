"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"

export function LeaveRoomButton({ roomId }: { roomId: string }) {
  const router = useRouter()
  const { socket, isConnected } = useSocket()
  
  const handleLeave = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/leave`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to leave room")
      
      // Emit leave-room event via socket for real-time update
      if (socket && isConnected) {
        socket.emit("leave-room", { roomId })
      }
      
      router.push("/rooms")
    } catch (err) {
      // Silent fail
    }
  }
  
  return (
    <Button onClick={handleLeave} variant="outline">
      <LogOut className="h-4 w-4 mr-2" />
      Leave Room
    </Button>
  )
}