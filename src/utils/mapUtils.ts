import { loader } from './googleMapsLoader';

interface MapConfig {
  center: google.maps.LatLngLiteral;
  zoom: number;
  mapElement: HTMLElement;
}

export const initializeMap = async (config: MapConfig): Promise<google.maps.Map> => {
  console.log('Starting map initialization...');
  
  try {
    console.log('Loading Google Maps API...');
    const google = await loader.load();
    console.log('Google Maps API loaded successfully');

    console.log('Creating map instance...');
    const map = new google.maps.Map(config.mapElement, {
      center: config.center,
      zoom: config.zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'greedy' // Makes it easier to handle on mobile
    });
    
    console.log('Map instance created successfully');
    return map;
  } catch (error) {
    console.error('Error in initializeMap:', error);
    throw error;
  }
};

export const getCurrentLocation = (): Promise<google.maps.LatLngLiteral> => {
  console.log('Getting current location...');
  
  return new Promise((resolve, reject) => {
    // Check for HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      reject(new Error('Geolocation requires a secure HTTPS connection'));
      return;
    }

    // Check for geolocation support
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,  // Request best possible position
      timeout: 10000,            // Wait 10 seconds maximum
      maximumAge: 0              // Don't use cached position
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('Current location obtained:', location);
        resolve(location);
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location access denied. Please enable location services in your device settings.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Unable to get location. Please check your device settings.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out. Please try again.'));
            break;
          default:
            reject(new Error('Unable to get location. Please try again.'));
        }
      },
      options
    );
  });
};

export const generateRunningPath = async (
  map: google.maps.Map,
  startLocation: google.maps.LatLngLiteral,
  distance: number,
  useMetric: boolean
): Promise<google.maps.DirectionsResult> => {
  console.log('Generating running path...', { startLocation, distance, useMetric });
  
  const directionsService = new google.maps.DirectionsService();
  // Convert to meters and adjust for round trip
  const distanceInMeters = (useMetric ? distance * 1000 : distance * 1609.34) / 2;
  const attempts = 3;
  
  for (let i = 0; i < attempts; i++) {
    try {
      const numWaypoints = 2;
      const waypoints: google.maps.DirectionsWaypoint[] = [];
      
      for (let j = 0; j < numWaypoints; j++) {
        const angle = (2 * Math.PI * (j + 1)) / (numWaypoints + 1) + (Math.random() * Math.PI / 4);
        const waypointRadius = distanceInMeters / (numWaypoints + 1);
        
        const waypointLat = startLocation.lat + (waypointRadius / 111320) * Math.cos(angle);
        const waypointLng = startLocation.lng + (waypointRadius / (111320 * Math.cos(startLocation.lat * Math.PI / 180))) * Math.sin(angle);
        
        waypoints.push({
          location: new google.maps.LatLng(waypointLat, waypointLng),
          stopover: false
        });
      }

      const request: google.maps.DirectionsRequest = {
        origin: startLocation,
        destination: startLocation,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.WALKING,
        optimizeWaypoints: true
      };

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            console.log('Route generated successfully');
            resolve(result);
          } else {
            console.error('Route generation failed:', status);
            reject(new Error(`Unable to generate route. Please try a different location or distance.`));
          }
        });
      });

      return result;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === attempts - 1) throw error;
    }
  }

  throw new Error('Unable to generate a suitable route. Please try again.');
};