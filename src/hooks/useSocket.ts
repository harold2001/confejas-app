import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { IUser } from '../interfaces/user.interface';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const useSocket = (onAttendanceUpdate?: (user: IUser) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      // Socket connected successfully
    });

    socket.on('disconnect', () => {
      // Socket disconnected
    });

    socket.on('connect_error', () => {
      // Socket connection error
    });

    // Listen for attendance updates
    if (onAttendanceUpdate) {
      socket.on('attendance:updated', onAttendanceUpdate);
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('attendance:updated');
        socket.disconnect();
      }
    };
  }, [onAttendanceUpdate]);

  return socketRef.current;
};
