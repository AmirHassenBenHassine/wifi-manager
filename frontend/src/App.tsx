import React, { useState, useEffect } from 'react';
import { useMQTT } from './hooks/useMQTT';
import { WiFiNetwork } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import WiFiList from './components/WiFiList';
import WiFiForm from './components/WiFiForm';
import ConnectionStatus from './components/ConnectionStatus';
import { RefreshCw } from 'lucide-react';

function App() {
  const { 
    isConnected, 
    wifiNetworks, 
    scanNetworks, 
    connectToWifi, 
    connectionStatus, 
    statusMessage,
    isScanning
  } = useMQTT();
  
  const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | null>(null);

  // Scan for networks when first connected
  useEffect(() => {
    if (isConnected) {
      scanNetworks();
    }
  }, [isConnected, scanNetworks]);

  const handleNetworkSelect = (network: WiFiNetwork) => {
    setSelectedNetwork(network);
  };

  const handleConnect = (ssid: string, password: string) => {
    connectToWifi(ssid, password);
  };

  const handleCancel = () => {
    setSelectedNetwork(null);
  };

  const handleRefresh = () => {
    scanNetworks();
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-100 text-gray-100">
      <ConnectionStatus isConnected={isConnected} />
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-2xl mx-auto">
          {!selectedNetwork ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">WiFi Networks</h2>
                <button 
                  onClick={handleRefresh}
                  disabled={isScanning || !isConnected}
                  className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <WiFiList 
                networks={wifiNetworks} 
                onSelect={handleNetworkSelect} 
                isScanning={isScanning}
              />
              <div className="mt-4 text-sm text-gray-400 text-center">
                <p>Select a network to connect</p>
              </div>
            </>
          ) : (
            <WiFiForm 
              selectedNetwork={selectedNetwork}
              onConnect={handleConnect}
              onCancel={handleCancel}
              connectionStatus={connectionStatus}
              statusMessage={statusMessage}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;