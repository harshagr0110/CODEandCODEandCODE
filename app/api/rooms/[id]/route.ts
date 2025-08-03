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
    const participants = JSON.parse(room.participants)
    if (participants.length >= (room.maxPlayers || 10)) {
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
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const room = await prisma.room.findUnique({ where: { id } })
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }
  const participants = JSON.parse(room.participants)
  const isParticipant = participants.some((p: any) => p.id === user.id)
  if (!isParticipant && user.id !== room.hostId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return NextResponse.json({ ...room, participants })
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
