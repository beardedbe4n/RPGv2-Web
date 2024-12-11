import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { initializeMap, getCurrentLocation, generateRunningPath } from './utils/mapUtils';
import ErrorBoundary from './components/ErrorBoundary';
import { Menu } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-blue-600 z-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">
          Running Path Generator by BG
        </h1>
        <div className="animate-pulse mt-4">
          <div className="w-16 h-16 border-t-4 border-white rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [startLocation, setStartLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [distance, setDistance] = useState(2.0);
  const [useMetric, setUseMetric] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Handle splash screen timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Initialize map
  useEffect(() => {
    if (showSplash) return;

    const initMap = async () => {
      if (!mapContainerRef.current) {
        console.error('Map container not found');
        return;
      }

      try {
        setIsLoading(true);
        let initialLocation: google.maps.LatLngLiteral = { lat: 40.7128, lng: -74.0060 }; // Default to NYC

        const newMap = await initializeMap({
          center: initialLocation,
          zoom: 14,
          mapElement: mapContainerRef.current
        });

        setMap(newMap);
        const renderer = new google.maps.DirectionsRenderer({
          map: newMap,
          suppressMarkers: false
        });
        setDirectionsRenderer(renderer);
        
        // Try to get user's location after map is initialized
        try {
          const location = await getCurrentLocation();
          setStartLocation(location);
          newMap.setCenter(location);
        } catch (error) {
          console.warn('Could not get initial location:', error);
        }
      } catch (error) {
        console.error('Map initialization error:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize map');
      } finally {
        setIsLoading(false);
      }
    };

    initMap();
  }, [showSplash]);

  // Handle window resize
  useEffect(() => {
    if (!map) return;

    const handleResize = () => {
      google.maps.event.trigger(map, 'resize');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  const handleCurrentLocation = useCallback(async () => {
    try {
      setIsGettingLocation(true);
      const location = await getCurrentLocation();
      setStartLocation(location);
      map?.setCenter(location);
      map?.setZoom(15); // Zoom in slightly when location is found
    } catch (error) {
      console.error('Error getting current location:', error);
      alert(error instanceof Error ? error.message : 'Unable to get current location');
    } finally {
      setIsGettingLocation(false);
    }
  }, [map]);

  const handleAddressSelect = useCallback((location: google.maps.LatLngLiteral) => {
    setStartLocation(location);
    map?.setCenter(location);
    map?.setZoom(15);
  }, [map]);

  const handleGeneratePath = useCallback(async () => {
    if (!map || !startLocation || !directionsRenderer) {
      alert('Please select a starting location first.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await generateRunningPath(map, startLocation, distance, useMetric);
      directionsRenderer.setDirections(result);
      // Removed the auto-hide controls for mobile
    } catch (error) {
      console.error('Error generating path:', error);
      alert(error instanceof Error ? error.message : 'Unable to generate path');
    } finally {
      setIsLoading(false);
    }
  }, [map, startLocation, directionsRenderer, distance, useMetric]);

  const handleReset = useCallback(() => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
  }, [directionsRenderer]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="relative h-screen w-full flex flex-col md:flex-row">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="md:hidden fixed top-4 right-4 z-20 bg-white p-2 rounded-full shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Map Container */}
      <div className="w-full md:w-3/4 h-[60vh] md:h-full relative">
        <div 
          ref={mapContainerRef}
          className="absolute inset-0"
        />
        {(isLoading || isGettingLocation) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600">
                {isGettingLocation ? 'Getting your location...' : 'Loading...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div 
        className={`
          ${showControls ? 'translate-y-0' : 'translate-y-full'} 
          md:translate-y-0
          transition-transform duration-300 ease-in-out
          fixed bottom-0 left-0 right-0
          md:relative md:w-1/4
          h-[40vh] md:h-full
          bg-white md:bg-gray-50
          shadow-lg md:shadow-none
          rounded-t-3xl md:rounded-none
          z-10
          md:border-l md:border-gray-200
          overflow-hidden
        `}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-4 md:hidden" />
        <ControlPanel
          distance={distance}
          useMetric={useMetric}
          onDistanceChange={setDistance}
          onUnitToggle={() => setUseMetric(!useMetric)}
          onCurrentLocation={handleCurrentLocation}
          onAddressSelect={handleAddressSelect}
          onGeneratePath={handleGeneratePath}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};

const AppWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
};

export default AppWithErrorBoundary;