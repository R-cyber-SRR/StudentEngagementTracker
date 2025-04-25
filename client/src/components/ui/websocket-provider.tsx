import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { WebSocketMessage, EngagementUpdate, AlertEvent } from '@/types';

type WebSocketContextType = {
  sendMessage: (message: any) => void;
  isConnected: boolean;
  error: string | null;
};

const WebSocketContext = createContext<WebSocketContextType>({
  sendMessage: () => {},
  isConnected: false,
  error: null
});

export const useWebSocketContext = () => useContext(WebSocketContext);

type WebSocketProviderProps = {
  children: ReactNode;
  onEngagementUpdate?: (data: EngagementUpdate) => void;
  onAlertReceived?: (data: AlertEvent) => void;
};

export function WebSocketProvider({ 
  children, 
  onEngagementUpdate,
  onAlertReceived
}: WebSocketProviderProps) {
  const handleMessage = useCallback((data: WebSocketMessage) => {
    // Handle different message types
    switch (data.type) {
      case 'engagementUpdate':
        onEngagementUpdate?.(data);
        break;
      case 'alert':
        onAlertReceived?.(data);
        break;
      // Add more message type handlers as needed
    }
  }, [onEngagementUpdate, onAlertReceived]);

  const { sendMessage, isConnected, error } = useWebSocket(handleMessage);

  return (
    <WebSocketContext.Provider value={{ sendMessage, isConnected, error }}>
      {children}
    </WebSocketContext.Provider>
  );
}
