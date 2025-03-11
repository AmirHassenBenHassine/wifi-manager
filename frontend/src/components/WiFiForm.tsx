import React, { useState } from 'react';
import { WiFiNetwork } from '../types';
import { Wifi, Lock, Eye, EyeOff } from 'lucide-react';

interface WiFiFormProps {
  selectedNetwork: WiFiNetwork | null;
  onConnect: (ssid: string, password: string) => void;
  onCancel: () => void;
  connectionStatus: 'idle' | 'connecting' | 'success' | 'error';
  statusMessage: string;
}

const WiFiForm: React.FC<WiFiFormProps> = ({ 
  selectedNetwork, 
  onConnect, 
  onCancel,
  connectionStatus,
  statusMessage
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNetwork) {
      onConnect(selectedNetwork.ssid, password);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connecting': return 'text-primary-400';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return '';
    }
  };

  return (
    <div className="bg-dark-200 rounded-lg shadow-lg overflow-hidden border border-gray-800">
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-6 py-4">
        <h2 className="text-white text-lg font-semibold">Connect to Network</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Wifi className="h-5 w-5 text-primary-500 mr-2" />
            <label className="block text-sm font-medium text-gray-300">Network Name</label>
          </div>
          <input
            type="text"
            value={selectedNetwork?.ssid || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-700 rounded-md bg-dark-300 text-gray-300"
          />
        </div>
        
        {selectedNetwork?.secure && (
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Lock className="h-5 w-5 text-primary-500 mr-2" />
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-dark-300 text-gray-200"
                placeholder="Enter network password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        )}
        
        {connectionStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-md bg-dark-300 ${getStatusColor()}`}>
            {connectionStatus === 'connecting' && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                <p>{statusMessage}</p>
              </div>
            )}
            {connectionStatus !== 'connecting' && <p>{statusMessage}</p>}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-dark-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={connectionStatus === 'connecting'}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-md hover:opacity-90 disabled:opacity-50"
          >
            Connect
          </button>
        </div>
      </form>
    </div>
  );
};

export default WiFiForm;