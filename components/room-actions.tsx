"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, LogOut } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"

interface RoomActionsProps {
  roomId: string
  isHost?: boolean
  variant?: "inRoom" | "card"
  onActionComplete?: () => void
}

export function RoomActions({ 
  roomId, 
  isHost = false, 
  variant = "inRoom",
  onActionComplete 
}: RoomActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { socket, isConnected } = useSocket()
  
  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete room")
      }
      
      if (onActionComplete) {
        onActionComplete()
      } else {
        router.push("/rooms")
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting room:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleLeave = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/rooms/${roomId}/leave`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to leave room")
      
      // Emit leave-room event via socket for real-time update
      if (socket && isConnected) {
        socket.emit("leave-room", { roomId })
      }
      
      router.push("/rooms")
      router.refresh()
    } catch (error) {
      console.error("Error leaving room:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // If host, show delete button, otherwise show leave button
  if (isHost) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant={variant === "card" ? "destructive" : "outline"} 
            size={variant === "card" ? "sm" : "default"}
            className={variant === "card" ? "px-2 h-8" : ""}
          >
            <Trash2 className={variant === "card" ? "h-4 w-4" : "h-4 w-4 mr-2"} />
            {variant !== "card" && "Delete Room"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this room
              and remove all participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  } else {
    return (
      <Button 
        onClick={handleLeave} 
        variant="outline"
        disabled={isLoading}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isLoading ? "Leaving..." : "Leave Room"}
      </Button>
    )
  }
}
