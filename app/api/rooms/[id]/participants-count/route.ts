import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await context.params;
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  let count = 0;
  if (room && room.participants) {
    try {
      const participants = Array.isArray(room.participants)
        ? room.participants
        : JSON.parse(room.participants as unknown as string);
      count = participants.length;
    } catch {
      count = 0;
    }
  }
  return NextResponse.json({ count });
} 