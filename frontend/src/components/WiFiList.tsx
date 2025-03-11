import React from 'react';
import { WiFiNetwork } from '../types';
import { Wifi, WifiOff, Lock } from 'lucide-react';

interface WiFiListProps {
  networks: WiFiNetwork[];
  onSelect: (network: WiFiNetwork) => void;
  isScanning: boolean;
}

const WiFiList: React.FC<WiFiListProps> = ({ networks, onSelect, isScanning }) => {
  // Sort networks by signal strength (RSSI)
  const sortedNetworks = [...networks].sort((a, b) => b.rssi - a.rssi);

  // Convert RSSI to signal strength bars (0-4)
  const getSignalStrength = (rssi: number): number => {
    if (rssi >= -50) return 4;
    if (rssi >= -65) return 3;
    if (rssi >= -75) return 2;
    if (rssi >= -85) return 1;
    return 0;
  };

  // Render signal strength bars
  const renderSignalStrength = (strength: number) => {
    return (
      <div className="flex h-4 space-x-0.5">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded-sm ${bar <= strength ? 'bg-primary-500' : 'bg-gray-700'}`}
            style={{ height: `${bar * 3 + 4}px` }}
          ></div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-dark-200 rounded-lg shadow-lg overflow-hidden border border-gray-800">
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-6 py-4">
        <h2 className="text-white text-lg font-semibold">Available Networks</h2>
      </div>

      {isScanning ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Scanning for networks...</p>
        </div>
      ) : networks.length === 0 ? (
        <div className="p-6 text-center">
          <WifiOff className="h-10 w-10 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400">No networks found</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-800">
          {sortedNetworks.map((network) => (
            <li
              key={network.ssid}
              className="px-6 py-4 hover:bg-dark-300 cursor-pointer transition-colors duration-150"
              onClick={() => onSelect(network)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wifi className="h-5 w-5 text-primary-500 mr-3" />
                  <span className="font-medium text-gray-200">{network.ssid}</span>
                  {network.secure && <Lock className="h-4 w-4 text-gray-500 ml-2" />}
                </div>
                <div className="flex items-center">
                  {renderSignalStrength(getSignalStrength(network.rssi))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default WiFiList;
