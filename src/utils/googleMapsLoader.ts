import { Loader } from '@googlemaps/js-api-loader';

console.log('Creating Google Maps loader...');

export const loader = new Loader({
  apiKey: 'AIzaSyABUgCkWoLM5DrAnh7BeF0rzNbCXak7hv0',
  version: 'weekly',
  libraries: ['places', 'geometry'],
  id: '__googleMapsScriptId'
});

console.log('Google Maps loader created');