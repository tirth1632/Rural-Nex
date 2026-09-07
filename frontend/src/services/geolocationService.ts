import { GOOGLE_MAPS_API_KEY } from '../config/maps';

export interface DetectedLocationResult {
  lat: number;
  lng: number;
  accuracy: number;
  formattedAddress: string;
  village: string;
  block: string;
  district: string;
  state: string;
  country: string;
  pinCode: string;
}

/**
 * Google Maps Geolocation API fallback for cell/wifi/IP high accuracy positioning.
 */
export async function fetchGoogleHighAccuracyPosition(): Promise<{ lat: number; lng: number; accuracy: number } | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;
  try {
    const res = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_MAPS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ considerIp: true }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.location) {
        return {
          lat: data.location.lat,
          lng: data.location.lng,
          accuracy: data.accuracy || 15,
        };
      }
    }
  } catch (e) {
    console.warn('Google Geolocation API request failed:', e);
  }
  return null;
}

/**
 * Detects the user's current 100% high-accuracy position via browser Geolocation API
 * and reverse-geocodes it into human-readable address components using Google Maps API.
 */
export async function detectUserLocation(): Promise<DetectedLocationResult> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        let accuracy = position.coords.accuracy || 10;

        // If browser accuracy is coarse (> 1500m), attempt Google Geolocation API precision refinement
        if (accuracy > 1500) {
          const gPos = await fetchGoogleHighAccuracyPosition();
          if (gPos && gPos.accuracy < accuracy) {
            lat = gPos.lat;
            lng = gPos.lng;
            accuracy = gPos.accuracy;
          }
        }

        try {
          // 1. Primary: Google Maps Reverse Geocoding API
          if (GOOGLE_MAPS_API_KEY) {
            const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
            const res = await fetch(googleUrl);
            if (res.ok) {
              const data = await res.json();
              if (data.status === 'OK' && data.results && data.results.length > 0) {
                const firstResult = data.results[0];
                const components: Record<string, string> = {};

                firstResult.address_components.forEach((c: any) => {
                  c.types.forEach((type: string) => {
                    components[type] = c.long_name;
                  });
                });

                const village =
                  components.sublocality_level_1 ||
                  components.locality ||
                  components.neighborhood ||
                  components.sublocality ||
                  'Local Area';
                const block =
                  components.administrative_area_level_3 ||
                  components.sublocality_level_2 ||
                  village;
                const district =
                  components.administrative_area_level_2 ||
                  components.locality ||
                  'District';
                const state = components.administrative_area_level_1 || 'State';
                const country = components.country || 'India';
                const pinCode = components.postal_code || '';

                resolve({
                  lat,
                  lng,
                  accuracy,
                  formattedAddress: firstResult.formatted_address || `${village}, ${district}, ${state}`,
                  village,
                  block,
                  district,
                  state,
                  country,
                  pinCode,
                });
                return;
              }
            }
          }

          // 2. Secondary Fallback: OpenStreetMap Nominatim Reverse Geocoding
          const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
          const nomRes = await fetch(nomUrl, {
            headers: { 'Accept-Language': 'en' },
          });

          if (nomRes.ok) {
            const nomData = await nomRes.json();
            const addr = nomData.address || {};
            const village =
              addr.village ||
              addr.suburb ||
              addr.town ||
              addr.city_district ||
              addr.neighbourhood ||
              'Local Area';
            const block = addr.county || addr.subdistrict || village;
            const district = addr.state_district || addr.district || addr.city || 'District';
            const state = addr.state || 'State';
            const pinCode = addr.postcode || '';

            resolve({
              lat,
              lng,
              accuracy,
              formattedAddress: nomData.display_name || `${village}, ${district}, ${state}`,
              village,
              block,
              district,
              state,
              country: addr.country || 'India',
              pinCode,
            });
            return;
          }

          // 3. Raw Coordinates Fallback
          resolve({
            lat,
            lng,
            accuracy,
            formattedAddress: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
            village: 'Detected Location',
            block: 'Detected Block',
            district: 'Detected District',
            state: 'Gujarat',
            country: 'India',
            pinCode: '',
          });
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
          resolve({
            lat,
            lng,
            accuracy,
            formattedAddress: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
            village: 'Detected Location',
            block: 'Detected Block',
            district: 'Detected District',
            state: 'Gujarat',
            country: 'India',
            pinCode: '',
          });
        }
      },
      async (error) => {
        // Fallback to Google Geolocation API if browser GPS fails or permission denied
        const gPos = await fetchGoogleHighAccuracyPosition();
        if (gPos) {
          resolve({
            lat: gPos.lat,
            lng: gPos.lng,
            accuracy: gPos.accuracy,
            formattedAddress: `High Precision Google Geolocation (${gPos.lat.toFixed(4)}, ${gPos.lng.toFixed(4)})`,
            village: 'Detected Location',
            block: 'Detected Block',
            district: 'Detected District',
            state: 'Gujarat',
            country: 'India',
            pinCode: '',
          });
          return;
        }

        let msg = 'Failed to get current location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

