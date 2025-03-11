import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-200 text-white py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} Dione Protocol. All rights reserved.</p>
        <p className="mt-1 text-gray-400">Local WiFi Configuration Interface</p>
      </div>
    </footer>
  );
};

export default Footer;