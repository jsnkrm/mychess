import { useEffect, useRef, useState } from "react";
import {
  USER_INFO,
  OPPONENT_DISCONNECTED,
  OPPONENT_RECONNECTED,
  GAME_OVER,
} from "../constants";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

export interface OpponentStatus {
  disconnected: boolean;
  expiresAt?: number;
}

interface User {
  id: string;
  name: string;
  email: string | null;
  isGuest: boolean;
}

const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [opponentStatus, setOpponentStatus] = useState<OpponentStatus>({
    disconnected: false,
  });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectFnRef = useRef<() => void>(() => {});

  const scheduleReconnect = () => {
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptRef.current),
      MAX_RECONNECT_DELAY
    );
    reconnectAttemptRef.current += 1;
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectFnRef.current();
    }, delay);
  };

  useEffect(() => {
    const doConnect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
        return;
      }

      setIsConnecting(true);
      
      const loginToken = localStorage.getItem("token");
      let guestId = localStorage.getItem("guestId");
      
      if (!guestId) {
        guestId = `guest_${crypto.randomUUID()}`;
        localStorage.setItem("guestId", guestId);
      }

      const token = loginToken || guestId;
      const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setSocket(ws);
        setIsConnecting(false);
        setIsReconnecting(false);
        reconnectAttemptRef.current = 0;
      };

      const handleMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.type === USER_INFO) {
          setUser(message.payload.user);
        } else if (message.type === OPPONENT_DISCONNECTED) {
          setOpponentStatus({
            disconnected: true,
            expiresAt: message.payload.expiresAt,
          });
        } else if (message.type === OPPONENT_RECONNECTED) {
          setOpponentStatus({ disconnected: false });
        } else if (message.type === GAME_OVER) {
          setOpponentStatus({ disconnected: false });
        }
      };

      ws.addEventListener("message", handleMessage);

      ws.onclose = (event) => {
        setSocket(null);
        setUser(null);
        wsRef.current = null;

        if (!event.wasClean) {
          setIsReconnecting(true);
          scheduleReconnect();
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    reconnectFnRef.current = doConnect;
    doConnect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { socket, user, isConnecting, isReconnecting, opponentStatus };
};