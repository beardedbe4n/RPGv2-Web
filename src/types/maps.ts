export interface MapConfig {
  apiKey: string;
  center: google.maps.LatLngLiteral;
  zoom: number;
}

export interface RunningPathOptions {
  startLocation: google.maps.LatLngLiteral;
  distance: number;
  useMetric: boolean;
}