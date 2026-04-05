import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        // Enforce joining the strict employer room as defined in Step 8
        newSocket.emit('join_employer_room', user._id);
      });

      newSocket.on('application_received', (data) => {
        toast.success(`New Application received for your job: ${data.jobTitle}!`, {
            duration: 5000,
            icon: '👋'
        });
      });

      newSocket.on('job_approved', (data) => {
        toast.success(`Success! Your job "${data.jobTitle}" has been approved by admin!`, {
            duration: 6000,
            icon: '✅'
        });
      });

      newSocket.on('interview_status_changed', (data) => {
        toast.success(`Heads up! Interview ${data.interviewId} status updated to: ${data.status}`, {
            duration: 5000,
            icon: '📅'
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
