import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const room = await prisma.room.findUnique({ where: { id } })
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }
    let participants: any[] = []
    try {
      participants = Array.isArray(room.participants)
        ? (room.participants as unknown as any[])
        : JSON.parse(room.participants as unknown as string)
    } catch {
      participants = []
    }
    const maxPlayers = (room as any).maxPlayers ?? 10
    if (participants.length >= maxPlayers) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 })
    }
    if (room.status !== "waiting") {
      return NextResponse.json({ error: "Room is not accepting players" }, { status: 400 })
    }
    const alreadyInRoom = participants.some((p: any) => p.id === user.id)
    if (alreadyInRoom) {
      return NextResponse.json({ message: "Already in room" })
    }
    participants.push({ id: user.id, username: user.username })
    await prisma.room.update({ where: { id }, data: { participants: JSON.stringify(participants) } })
    return NextResponse.json({ message: "Joined room successfully" })
  } catch (error) {
    console.error("Error joining room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const room = await prisma.room.findUnique({ where: { id } })
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }
    
    // Parse participants
    let participants: any[] = []
    let gameData = null
    
    try {
      participants = Array.isArray(room.participants)
        ? (room.participants as unknown as any[])
        : JSON.parse(room.participants as unknown as string)
      
      // Extract game data if it exists in the participants array
      const gameDataEntry = participants.find(p => p._gameData)
      if (gameDataEntry) {
        gameData = gameDataEntry._gameData
        // Remove the game data entry from participants for cleaner UI
        participants = participants.filter(p => !p._gameData)
      }
    } catch (e) {
      console.error("Error parsing participants:", e)
      participants = []
    }
    
    // Check if user is in the room
    const isParticipant = participants.some((p: any) => p.id === user.id)
    const isHost = room.hostId === user.id
    
    // Get the most recent game record
    const recentGame = await prisma.game.findFirst({
      where: { roomId: id },
      orderBy: { endedAt: 'desc' }
    });
    
    // Determine if we need to fetch question data
    let questionId = null;
    let questionData = null;
    
    // Simplify question ID finding logic
    if (gameData && gameData.questionId) {
      questionId = gameData.questionId;
    } else if ((room as any).questionId) {
      questionId = (room as any).questionId;
    } else if (recentGame && (recentGame as any).questionId) {
      questionId = (recentGame as any).questionId;
    }
    
    // If we found a question ID, fetch the question data
    if (questionId) {
      try {
        const question = await prisma.question.findUnique({
          where: { id: questionId }
        });
        if (question) {
          questionData = question;
        }
      } catch (e) {
        // Silent fail
      }
    }
    
    // Return room data with participant info and game data (simplified)
    return NextResponse.json({ 
      ...room, 
      participants,
      questionId: questionId || gameData?.questionId,
      difficulty: gameData?.difficulty,
      mode: gameData?.mode,
      startedAt: gameData?.startedAt,
      durationSeconds: gameData?.durationSeconds,
      isParticipant,
      isHost,
      question: questionData
    })
  } catch (error) {
    console.error("Error fetching room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const room = await prisma.room.findUnique({ where: { id } })
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }
    if (room.hostId !== user.id) {
      return NextResponse.json({ error: "Only the room host can delete the room" }, { status: 403 })
    }
    await prisma.room.delete({ where: { id } })
    return NextResponse.json({ message: "Room deleted successfully" })
  } catch (error) {
    console.error("Error deleting room:", error)
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 })
  }
}
