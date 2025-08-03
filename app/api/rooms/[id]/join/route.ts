
import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getRoom, joinRoom } from "@/lib/room-manager"
import { io } from "socket.io-client"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const room = getRoom(id)
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }
    if (room.participants.length >= room.maxPlayers) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 })
    }
    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Room is not accepting players" }, { status: 400 })
    }
    if (room.participants.some((p) => p.id === user.id)) {
      return NextResponse.json({ message: "Already in room" })
    }
    joinRoom(id, { id: user.id, username: user.username })

    // Emit player-joined event to the external socket server
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL || "http://localhost:3001", {
      transports: ["websocket"],
      forceNew: true,
    })
    socket.emit("join-room", { roomId: id, userId: user.id })
    socket.emit("player-joined", { roomId: id, userId: user.id })
    socket.disconnect()

    return NextResponse.json({ message: "Joined room successfully" })
  } catch (error) {
    console.error("Error joining room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
}
