import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client";
import { ReactNode } from "react";

interface SocketContextType {
  socket: Socket | null;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken"); // todo: use auth context
    const socket = io(`${import.meta.env.VITE_API_BASE_URL}/general`, {
      auth: {
        token,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionAttempts: 10,
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = (room: string) => {
    socket?.emit("join_room", room);
  };

  const leaveRoom = (room: string) => {
    socket?.emit("leave_room", room);
  };

  return (
    <SocketContext.Provider value={{ socket, joinRoom, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
