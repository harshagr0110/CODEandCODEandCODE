
import { useEffect, useState } from "react"
import { io } from "socket.io-client"


export function useSocket() {
  return useSocketImpl();
}

function useSocketImpl() {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL || "http://localhost:3001";
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("connect_error", () => setIsConnected(false));

    // Room/game event listeners (expand as needed)
    newSocket.on("player-joined", () => {});
    newSocket.on("player-left", () => {});
    newSocket.on("game-started", () => {});
    newSocket.on("game-ended", () => {});
    newSocket.on("submission-update", () => {});
    newSocket.on("disqualified", () => {});

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket, isConnected };
}