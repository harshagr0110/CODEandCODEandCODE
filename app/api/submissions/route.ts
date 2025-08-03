import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getRoom } from "@/lib/room-manager"
import { executeCode } from "@/lib/piston"
import io from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'http://localhost:3001')

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { roomId, code, language = "javascript", feedback, isCorrect } = await request.json()
    if (!roomId || !code) return NextResponse.json({ error: "Room ID and code are required" }, { status: 400 })

    const room = getRoom(roomId)
    if (!room || room.status !== "in_progress")
      return NextResponse.json({ error: "Room not found or game not active" }, { status: 400 })
    if (!room.submissions) room.submissions = []
    const existingSubmission = room.submissions.find((sub: any) => sub.userId === user.id)
    if (existingSubmission)
      return NextResponse.json({ error: "You have already submitted a solution" }, { status: 400 })
    if (!room.question) {
      return NextResponse.json({ error: "No question associated with this room" }, { status: 400 })
    }

    let evaluation
    if (feedback === 'disqualified') {
      evaluation = {
        isCorrect: false,
        feedback: 'disqualified',
        executionTime: 0,
        memoryUsed: 0,
        testResults: [],
      }
    } else {
      // Ensure testCases is properly parsed from JSON if needed
      const testCases = Array.isArray(room.question.testCases) 
        ? room.question.testCases 
        : JSON.parse(room.question.testCases as string)
      
      evaluation = await executeCode(code, language, testCases).catch(() => ({
        isCorrect: false,
        feedback: "Code execution failed. Please try again.",
        executionTime: 0,
        memoryUsed: 0,
        testResults: [],
      }))
    }

    // Calculate score based on correctness and execution time
    let score = 0
    if (evaluation.isCorrect) {
      score = 100
      // Bonus points for faster execution (up to 20 extra points)
      if (evaluation.executionTime < 1000) { // Less than 1 second
        score += Math.max(0, 20 - Math.floor(evaluation.executionTime / 50))
      }
    }

    // In-memory submission creation
    const submission = {
      id: crypto.randomUUID(),
      roomId,
      userId: user.id,
      code: code.trim(),
      language,
      isCorrect: evaluation.isCorrect,
      feedback: evaluation.feedback,
      executionTime: evaluation.executionTime,
      memoryUsed: evaluation.memoryUsed,
      score: score,
    }
    room.submissions.push(submission)

    // In-memory game logic for all modes
    const allUserIds = [room.hostId, ...room.participants.filter((p: any) => p.id !== room.hostId).map((p: any) => p.id)]
    const mode = room.mode || 'normal'
    const submissionCount = room.submissions.length

    if (mode === 'normal') {
      // Everyone solves the same question, fastest correct wins
      if (submissionCount === allUserIds.length) {
        room.status = "finished"
        room.endedAt = new Date()
        socket.emit('game-ended', { roomId, gameId: roomId })
      } else {
        socket.emit('submission-update', {
          newSubmission: { userId: user.id, result: evaluation, timestamp: new Date() },
        })
      }
    } else if (mode === 'shortest') {
      // Shortest code wins (code golf)
      if (submissionCount === allUserIds.length) {
        const correctSubs = room.submissions.filter((s: any) => s.isCorrect)
        let winnerId = null
        let minLen = Infinity
        for (const sub of correctSubs) {
          if (sub.code.length < minLen) {
            minLen = sub.code.length
            winnerId = sub.userId
          }
        }
        room.status = "finished"
        room.endedAt = new Date()
        room.winnerId = winnerId
        socket.emit('game-ended', { roomId, gameId: roomId })
      } else {
        socket.emit('submission-update', {
          newSubmission: { userId: user.id, result: evaluation, timestamp: new Date() },
        })
      }
    } else if (mode === 'debugging') {
      // Debugging mode: all players get a buggy code, must fix it
      // Mark as finished when all have submitted, winner is first correct or all correct
      if (submissionCount === allUserIds.length) {
        const correctSubs = room.submissions.filter((s: any) => s.isCorrect)
        let winnerId = null
        if (correctSubs.length > 0) {
          // Winner is the first correct submission
          winnerId = correctSubs[0].userId
        }
        room.status = "finished"
        room.endedAt = new Date()
        room.winnerId = winnerId
        socket.emit('game-ended', { roomId, gameId: roomId })
      } else {
        socket.emit('submission-update', {
          newSubmission: { userId: user.id, result: evaluation, timestamp: new Date() },
        })
      }
    } else if (mode === 'escape') {
      // Escape the Room: multi-stage challenge
      // Stage logic should be handled in gameData, here we just check for completion
      // For now, mark as finished when all have completed all stages (stub)
      if (submissionCount === allUserIds.length) {
        room.status = "finished"
        room.endedAt = new Date()
        // Optionally, determine winner based on gameData
        socket.emit('game-ended', { roomId, gameId: roomId })
      } else {
        socket.emit('submission-update', {
          newSubmission: { userId: user.id, result: evaluation, timestamp: new Date() },
        })
      }
    }

    return NextResponse.json({
      message: "Submission evaluated successfully",
      submission,
    })
  }catch (error) {
    console.error("Error executing code:", error);
    return NextResponse.json(
      { 
        error: "Code execution failed",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}
