import React from 'react';
import { Wifi } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wifi className="h-8 w-8 mr-3" />
            <h1 className="text-2xl font-bold">WiFi Setup</h1>
          </div>
          <div className="text-sm opacity-80">
            Powered by Dione Protocol
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;