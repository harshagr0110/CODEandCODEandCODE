import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getRoom } from "@/lib/room-manager"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const room = getRoom(id)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const playerCount = room.participants.length + 1 // +1 for room creator
    const hasActiveGame = room.status === "in_progress"
    // @ts-expect-error: challengeTitle may not be typed on Room, but is expected at runtime
    const gameStarted = hasActiveGame && room.challengeTitle !== "Waiting for challenge..."

    return NextResponse.json({
      status: room.status,
      playerCount,
      maxPlayers: room.maxPlayers,
      gameStarted,
    })
  } catch (error) {
    console.error("Error checking room status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
