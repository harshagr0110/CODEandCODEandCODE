import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  // Only return rooms that are not finished (active)
  const rooms = await prisma.room.findMany({ where: { status: { not: "finished" } } })
  // Parse participants JSON for each room
  const parsedRooms = rooms.map((room: any) => ({ ...room, participants: JSON.parse(room.participants) }))
  return NextResponse.json({ rooms: parsedRooms })
}
