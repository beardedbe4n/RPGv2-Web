import React, { useState } from 'react';
import { AddressSearch } from './AddressSearch';
import { MapPin, RotateCcw, Play, Search } from 'lucide-react';

interface ControlPanelProps {
  distance: number;
  useMetric: boolean;
  onDistanceChange: (distance: number) => void;
  onUnitToggle: () => void;
  onCurrentLocation: () => void;
  onAddressSelect: (location: google.maps.LatLngLiteral) => void;
  onGeneratePath: () => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  distance,
  useMetric,
  onDistanceChange,
  onUnitToggle,
  onCurrentLocation,
  onAddressSelect,
  onGeneratePath,
  onReset
}) => {
  const [showAddressSearch, setShowAddressSearch] = useState(false);

  return (
    <div className="h-full overflow-auto p-4 md:p-6">
      <div className="space-y-4 md:space-y-6 max-w-sm mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-left">Running Path Generator</h2>
        
        {/* Mobile View */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {/* Address Search Button & Current Location */}
            <button
              onClick={() => setShowAddressSearch(true)}
              className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <Search size={18} />
              <span className="ml-2">Search</span>
            </button>
            
            <button
              onClick={onCurrentLocation}
              className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <MapPin size={18} />
            </button>
          </div>

          {/* Distance Input and Unit Toggle */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            <div className="col-span-3">
              <input
                type="number"
                value={distance}
                onChange={(e) => onDistanceChange(parseFloat(e.target.value) || 0)}
                min="0.0"
                max="50"
                step="0.25"
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Distance (${useMetric ? 'km' : 'mi'})`}
              />
            </div>
            <button
              onClick={onUnitToggle}
              className="bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
            >
              {useMetric ? 'km' : 'mi'}
            </button>
          </div>

          {/* Generate and Reset Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={onGeneratePath}
              className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <Play size={18} />
            </button>
            <button
              onClick={onReset}
              className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Desktop View - Unchanged */}
        <div className="hidden md:block space-y-2">
          <div className="space-y-2 md:space-y-3">
            <label className="block text-sm font-medium text-gray-700">Starting Location</label>
            <AddressSearch onAddressSelect={onAddressSelect} />
            <button
              onClick={onCurrentLocation}
              className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <MapPin size={18} />
              <span>Use Current Location</span>
            </button>
          </div>

          <div className="space-y-2 md:space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Distance ({useMetric ? 'km' : 'miles'})
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => onDistanceChange(parseFloat(e.target.value) || 0)}
              min="0.0"
              max="50"
              step="0.25"
              className="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={onUnitToggle}
              className="w-full bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Switch to {useMetric ? 'miles' : 'km'}
            </button>
          </div>

          <div className="space-y-2 md:space-y-3 pt-2">
            <button
              onClick={onGeneratePath}
              className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={18} />
              <span>Generate Path</span>
            </button>
            <button
              onClick={onReset}
              className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Address Search Modal */}
      {showAddressSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 md:hidden">
          <div className="bg-white w-full max-w-sm rounded-lg p-4">
            <AddressSearch onAddressSelect={(location) => {
              onAddressSelect(location);
              setShowAddressSearch(false);
            }} />
            <button
              onClick={() => setShowAddressSearch(false)}
              className="w-full mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};