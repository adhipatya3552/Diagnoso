import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, reconnect } = useChat();
  const [showStatus, setShowStatus] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  // Show status when connection changes
  useEffect(() => {
    if (!isConnected) {
      setShowStatus(true);
    } else {
      // Hide after a delay when connected
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected]);
  
  const handleReconnect = () => {
    setIsReconnecting(true);
    reconnect();
    
    // Reset reconnecting state after a timeout
    setTimeout(() => {
      setIsReconnecting(false);
    }, 3000);
  };
  
  if (!showStatus && isConnected) return null;
  
  return (
    <div 
      className={`
        absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full flex items-center space-x-2
        transition-all duration-300 shadow-lg backdrop-blur-lg
        ${isConnected 
          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
          : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }
      `}
    >
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-medium">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-xs font-medium">Disconnected</span>
          <button
            onClick={handleReconnect}
            disabled={isReconnecting}
            className="p-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isReconnecting ? 'animate-spin' : ''}`} />
          </button>
        </>
      )}
    </div>
  );
};