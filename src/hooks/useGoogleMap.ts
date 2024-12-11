import { useState, useEffect } from 'react';
import { initializeMap, getCurrentLocation } from '../utils/mapUtils';

export const useGoogleMap = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeWithLocation = async () => {
      try {
        setIsLoading(true);
        let initialLocation;

        try {
          initialLocation = await getCurrentLocation();
        } catch (locationError) {
          console.warn('Could not get current location, falling back to default:', locationError);
          initialLocation = { lat: 40.7128, lng: -74.0060 }; // New York City
        }

        const newMap = await initializeMap({
          center: initialLocation,
          zoom: 14
        });

        setMap(newMap);
        
        const renderer = new google.maps.DirectionsRenderer({
          map: newMap,
          suppressMarkers: false
        });
        
        setDirectionsRenderer(renderer);
        setError(null);
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to initialize map. Please check your internet connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeWithLocation();
  }, []);

  return {
    map,
    directionsRenderer,
    isLoading,
    error
  };
};