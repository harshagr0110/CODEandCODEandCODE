// In-memory room manager for team mode

export type RoomMode = "normal" | "shortest" | "debugging" | "escape";

export interface Room {
  id: string;
  name: string;
  joinCode: string;
  maxPlayers: number;
  mode: RoomMode;
  status: "waiting" | "in_progress" | "finished";
  hostId: string;
  participants: Array<{ id: string; username: string }>;
  questionId?: string;
  question?: any; // In-memory question object
  submissions: any[]; // In-memory submissions
  createdAt: number;
  endedAt?: Date;
  winnerId?: string;
  gameData?: any; // For storing mode-specific data
}

const rooms = new Map<string, Room>();

export function createRoom({
  name,
  joinCode,
  maxPlayers,
  mode,
  hostId,
  hostUsername,
}: {
  name: string;
  joinCode: string;
  maxPlayers: number;
  mode: RoomMode;
  hostId: string;
  hostUsername: string;
}): Room {
  const id = crypto.randomUUID();
  const room: Room = {
    id,
    name,
    joinCode,
    maxPlayers,
    mode,
    status: "waiting",
    hostId,
    participants: [{ id: hostId, username: hostUsername }],
    createdAt: Date.now(),
    submissions: [],
  };
  rooms.set(id, room);
  return room;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function getRoomByCode(joinCode: string): Room | undefined {
  return Array.from(rooms.values()).find((r) => r.joinCode === joinCode);
}

export function listRooms(): Room[] {
  return Array.from(rooms.values());
}

export function joinRoom(id: string, user: { id: string; username: string }): boolean {
  const room = rooms.get(id);
  if (!room) return false;
  if (room.participants.length >= room.maxPlayers) return false;
  if (room.participants.some((p) => p.id === user.id)) return true;
  room.participants.push(user);
  return true;
}

export function leaveRoom(id: string, userId: string): boolean {
  const room = rooms.get(id);
  if (!room) return false;
  room.participants = room.participants.filter((p) => p.id !== userId);
  if (room.participants.length === 0) {
    rooms.delete(id);
  }
  return true;
}

export function deleteRoom(id: string): void {
  rooms.delete(id);
}

export function updateRoom(id: string, data: Partial<Room>): Room | undefined {
  const room = rooms.get(id);
  if (!room) return undefined;
  Object.assign(room, data);
  return room;
}
