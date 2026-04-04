import { useEffect, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

interface User {
  id: string;
  name: string;
  email: string | null;
  isGuest: boolean;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loginToken = localStorage.getItem("token");
    let guestId = localStorage.getItem("guestId");
    
    if (!guestId) {
      guestId = `guest_${crypto.randomUUID()}`;
      localStorage.setItem("guestId", guestId);
    }

    const token = loginToken || guestId;
    const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "user_info") {
        setUser(message.payload.user);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      setSocket(null);
      setUser(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { socket, user };
};
