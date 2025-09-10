import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await (context.params as any);
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get room details
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Find the latest game for this room
    const game = await prisma.game.findFirst({
      where: { roomId: roomId }
    });

    if (!game) {
      return NextResponse.json({ error: "No game found for this room" }, { status: 404 });
    }

    // Since our schema doesn't track submissions with roomId directly,
    // we'll create mock submissions based on players data in the game
    let submissions = [];
    try {
      const gamePlayers = Array.isArray(game.players) 
        ? game.players as any[] 
        : JSON.parse(game.players?.toString() || '[]');
      
      // Convert player data to submissions format
      submissions = gamePlayers.map((player: any) => ({
        id: player.id || `player-${Math.random().toString(36).substring(2, 9)}`,
        userId: player.id,
        username: player.username || 'Player',
        language: player.language || 'javascript',
        isCorrect: player.isCorrect || false,
        executionTime: player.executionTime || null,
        code: player.code || '',
        submittedAt: new Date(player.submittedAt || game.endedAt)
      }));
    } catch (error) {
      console.error("Error parsing game players:", error);
      submissions = [];
    }

    // We already have our submissions formatted from the game players
    // Just need to ensure we have the correct data structure
    
    return NextResponse.json({
      room: {
        id: room.id,
        joinCode: room.joinCode,
        status: room.status,
        hostId: room.hostId,
      },
      game: {
        id: game.id,
        winnerId: game.winnerId,
        winnerName: game.winnerName,
        endedAt: game.endedAt,
      },
      submissions: submissions,
    });
  } catch (error) {
    console.error("Error fetching game results:", error);
    return NextResponse.json(
      { error: "Failed to fetch game results" },
      { status: 500 }
    );
  }
}
