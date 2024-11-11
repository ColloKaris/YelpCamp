declare module '@mapbox/mapbox-sdk/services/geocoding-v6.js' {
  import { GeocodingService } from '@mapbox/mapbox-sdk/services/geocoding';
  export default function geocoding(options: { accessToken: string }): GeocodingService;
}
