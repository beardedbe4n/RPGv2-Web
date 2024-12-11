import React from 'react';

interface MapProps {
  className?: string;
}

export const Map: React.FC<MapProps> = ({ className = '' }) => {
  return (
    <div 
      id="map" 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};