
import { useEffect, useState } from "react";
import * as socketClient from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = "http://localhost:3001";
    const newSocket = socketClient.connect(socketUrl);
    setSocket(newSocket);
    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("connect_error", () => console.log("Socket connection failed"));
    return () => { newSocket.disconnect(); };
  }, []);

  return { socket, isConnected };
}