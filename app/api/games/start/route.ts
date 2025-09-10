import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      roomId, 
      difficulty = "medium", 
      durationSeconds, 
      mode = "normal",
      tier = "beginner"
    } = await request.json()

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    // Get room and verify user is the host
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.hostId !== user.id) {
      return NextResponse.json({ error: "Only the room host can start the game" }, { status: 403 })
    }

    if (room.status !== "waiting" && room.status !== "active") {
      return NextResponse.json({ error: "Room is not available for a new game. It may already be finished or in progress." }, { status: 400 })
    }

    // Parse participants from JSON field
    let participants: any[] = [];
    try {
      participants = Array.isArray(room.participants) 
        ? room.participants as any[]
        : JSON.parse(room.participants as unknown as string);
    } catch (e) {
      participants = [];
    }

    if (participants.length < 2) {
      return NextResponse.json({ error: "Need at least 2 players to start" }, { status: 400 })
    }

    // Get a random question from the database based on difficulty
    const questions = await prisma.question.findMany({
      where: {
        difficulty: difficulty,
        questionType: "normal",
      },
    })

    if (questions.length === 0) {
      return NextResponse.json({ 
        error: `No ${difficulty} questions available. Please add some questions first.` 
      }, { status: 400 })
    }

    // Select a random question
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
    
    // Current timestamp for game start
    const startedAt = new Date();

    // Store game data directly in the room record
    // First, let's prepare the extra data we need to store
    const roomData: any = {
      status: "in_progress",
      // Since questionId isn't in our schema, we'll store it in a JSON field
      // along with other game-related data
      participants: JSON.stringify([
        ...participants,
        {
          _gameData: {
            questionId: randomQuestion.id,
            startedAt: startedAt,
            difficulty: difficulty,
            mode: mode,
            tier: tier,
            durationSeconds: durationSeconds || 300
          }
        }
      ])
    };
    
    // Don't store questionId directly - it's already in the _gameData object in participants
    
    // Update the room with the game data
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: roomData,
    })
    
    // Create a game record
    const game = await prisma.game.create({
      data: {
        roomId: roomId,
        winnerId: '', // Will be populated when game ends
        winnerName: '',
        players: JSON.parse(JSON.stringify(participants)), // Ensure valid JSON format
      }
    })

    // Use a room manager or other in-memory storage to track game info
    // This would typically be done with the socket server or a room manager class
    try {
      // For simplicity, we'll make a request to an in-memory room manager API
      await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/rooms/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          questionId: randomQuestion.id,
          difficulty,
          startedAt,
          durationSeconds: durationSeconds || 300,
          mode,
          gameId: game.id
        })
      })
    } catch (e) {
      console.error("Failed to update room manager:", e)
      // Not critical if this fails as we can recover from DB
    }

    return NextResponse.json({
      message: "Game started successfully",
      game: {
        ...updatedRoom,
        questionId: randomQuestion.id,
        difficulty,
        startedAt,
        durationSeconds: durationSeconds || 300,
        mode,
        tier,
        gameId: game.id
      },
      participants,
    })
  } catch (error: unknown) {
    console.error("Error starting game:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined,
      },
      { status: 500 },
    )
  }
}
