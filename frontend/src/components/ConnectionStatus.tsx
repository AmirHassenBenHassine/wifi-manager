import React from 'react';
import { WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  if (isConnected) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-dark-200 p-6 rounded-lg shadow-lg max-w-md w-full border border-gray-800">
        <div className="flex flex-col items-center">
          <div className="bg-red-900 bg-opacity-30 p-3 rounded-full mb-4">
            <WifiOff className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-white">Connection Error</h2>
          <p className="text-gray-400 text-center mb-4">
            Unable to connect to the MQTT broker. Please ensure the ESP32 is powered on and accessible on the network.
          </p>
          <div className="animate-pulse flex space-x-2 items-center">
            <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
            <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
            <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
            <span className="text-sm text-primary-400 ml-1">Reconnecting...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;