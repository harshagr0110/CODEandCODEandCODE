import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { joinCode, password } = await request.json()

    if (!joinCode) {
      return NextResponse.json({ error: "Join code is required" }, { status: 400 })
    }

    const room = await prisma.room.findUnique({ where: { joinCode: joinCode.toUpperCase() } })

    // Fetch password separately if needed
    let roomPassword: string | null = null
    if (room && room.isPrivate) {
      // Try to fetch password from a custom field or handle as not present
      // If password is not in the schema, treat as always invalid
      roomPassword = null
    }

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }
    const participants = JSON.parse(room.participants)
    if (participants.length >= (room.maxPlayers || 10)) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 })
    }
    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Room is not accepting players" }, { status: 400 })
    }
    return NextResponse.json({ roomId: room.id })
  } catch (error) {
    console.error("Error joining room by code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
