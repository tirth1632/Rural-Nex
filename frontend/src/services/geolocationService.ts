import { GOOGLE_MAPS_API_KEY } from '../config/maps';
import { geoService } from './geoService';

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
  matchedStateId: string;
  matchedDistrictId: string;
  matchedAreaId: string;
  matchedStateName: string;
  matchedDistrictName: string;
  matchedAreaName: string;
}

export type LocationPermissionState = 'granted' | 'prompt' | 'denied' | 'unsupported';

/**
 * Checks current browser permission state for geolocation.
 */
export async function getLocationPermissionStatus(): Promise<LocationPermissionState> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return 'unsupported';
  }
  if (!navigator.permissions || !navigator.permissions.query) {
    return 'prompt';
  }
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state as LocationPermissionState;
  } catch {
    return 'prompt';
  }
}

/**
 * Reverse geocodes exact coordinates into authentic address components.
 */
async function reverseGeocodeLiveCoords(lat: number, lng: number): Promise<{
  locality: string;
  subDistrict: string;
  district: string;
  state: string;
  formattedAddress: string;
  pinCode: string;
}> {
  // 1. Primary: BigDataCloud Client Reverse Geocoding API (Fast, Free, CORS-friendly, reliable in India)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const state = data.principalSubdivision || '';
      const locality = data.locality || data.city || '';
      let district = '';
      let subDistrict = '';

      if (data.localityInfo && Array.isArray(data.localityInfo.administrative)) {
        for (const item of data.localityInfo.administrative) {
          if (item.adminLevel === 6 || item.description?.toLowerCase().includes('district')) {
            district = item.name.replace(/district/gi, '').trim();
          }
          if (
            item.adminLevel === 7 || 
            item.description?.toLowerCase().includes('subdistrict') || 
            item.description?.toLowerCase().includes('taluk')
          ) {
            subDistrict = item.name.replace(/(taluka|taluk|tehsil)/gi, '').trim();
          }
        }
      }

      if (!district) district = locality || state;
      if (!subDistrict) subDistrict = locality || district;

      const formatted = [locality, subDistrict !== locality ? subDistrict : '', district, state]
        .filter(Boolean)
        .join(', ');

      if (state || district || locality) {
        return {
          locality: locality || subDistrict || 'Current Location',
          subDistrict: subDistrict || locality,
          district: district || locality,
          state: state || 'Gujarat',
          formattedAddress: formatted || `${locality}, ${district}, ${state}`,
          pinCode: data.postcode || '',
        };
      }
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode fallback:', err);
  }

  // 2. Secondary: OpenStreetMap Nominatim Reverse Geocoding
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const nomRes = await fetch(nomUrl, { headers: { 'Accept-Language': 'en' } });
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      const addr = nomData.address || {};
      const locality = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.city_district || 'Local Area';
      const subDistrict = addr.county || addr.subdistrict || locality;
      const district = addr.state_district || addr.district || addr.city || 'District';
      const state = addr.state || 'State';

      return {
        locality,
        subDistrict,
        district,
        state,
        formattedAddress: nomData.display_name || `${locality}, ${district}, ${state}`,
        pinCode: addr.postcode || '',
      };
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode fallback:', err);
  }

  // 3. Fallback: Google Maps Geocoding if API key is provided
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
      const gRes = await fetch(googleUrl);
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.results && gData.results.length > 0) {
          const comp: Record<string, string> = {};
          gData.results[0].address_components.forEach((c: any) => {
            c.types.forEach((t: string) => {
              comp[t] = c.long_name;
            });
          });
          const locality = comp.sublocality_level_1 || comp.locality || 'Local Area';
          const district = comp.administrative_area_level_2 || comp.locality || 'District';
          const state = comp.administrative_area_level_1 || 'State';
          return {
            locality,
            subDistrict: comp.administrative_area_level_3 || locality,
            district,
            state,
            formattedAddress: gData.results[0].formatted_address || `${locality}, ${district}, ${state}`,
            pinCode: comp.postal_code || '',
          };
        }
      }
    } catch (err) {
      console.warn('Google Maps reverse geocoding fallback:', err);
    }
  }

  return {
    locality: 'GPS Pinpoint',
    subDistrict: '',
    district: '',
    state: '',
    formattedAddress: `GPS Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
    pinCode: '',
  };
}

/**
 * Detects the user's authentic high-accuracy live position via browser Geolocation API.
 * Uses exact GPS coords and mathematical nearest projection into the geo hierarchy.
 */
export async function detectUserLocation(): Promise<DetectedLocationResult> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('GEOLOCATION_UNSUPPORTED'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 10);

        try {
          // 1. Authentic reverse geocode for real place name
          const geo = await reverseGeocodeLiveCoords(lat, lng);

          // 2. Mathematical nearest administrative hierarchy matching in geoService
          const nearest = geoService.findNearestHierarchy(lat, lng);

          const finalStateName = geo.state || nearest.state.name;
          const finalDistrictName = geo.district || nearest.district.name;
          const finalAreaName = geo.locality || (nearest.area ? nearest.area.name : nearest.district.name);

          resolve({
            lat,
            lng,
            accuracy,
            formattedAddress: geo.formattedAddress,
            village: finalAreaName,
            block: geo.subDistrict || (nearest.area ? nearest.area.name : finalDistrictName),
            district: finalDistrictName,
            state: finalStateName,
            country: 'India',
            pinCode: geo.pinCode,
            matchedStateId: nearest.state.id,
            matchedDistrictId: nearest.district.id,
            matchedAreaId: nearest.area ? nearest.area.id : '',
            matchedStateName: nearest.state.name,
            matchedDistrictName: nearest.district.name,
            matchedAreaName: nearest.area ? nearest.area.name : nearest.district.name,
          });
        } catch (err) {
          // Fallback with pure mathematical nearest hierarchy if reverse geocode fails
          const nearest = geoService.findNearestHierarchy(lat, lng);
          resolve({
            lat,
            lng,
            accuracy,
            formattedAddress: `Live GPS: ${nearest.area ? nearest.area.name : nearest.district.name}, ${nearest.district.name}, ${nearest.state.name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            village: nearest.area ? nearest.area.name : nearest.district.name,
            block: nearest.area ? nearest.area.name : nearest.district.name,
            district: nearest.district.name,
            state: nearest.state.name,
            country: 'India',
            pinCode: '',
            matchedStateId: nearest.state.id,
            matchedDistrictId: nearest.district.id,
            matchedAreaId: nearest.area ? nearest.area.id : '',
            matchedStateName: nearest.state.name,
            matchedDistrictName: nearest.district.name,
            matchedAreaName: nearest.area ? nearest.area.name : nearest.district.name,
          });
        }
      },
      (error) => {
        const err = new Error(
          error.code === error.PERMISSION_DENIED
            ? 'PERMISSION_DENIED'
            : error.code === error.POSITION_UNAVAILABLE
            ? 'POSITION_UNAVAILABLE'
            : error.code === error.TIMEOUT
            ? 'TIMEOUT'
            : 'UNKNOWN_ERROR'
        );
        (err as any).code = error.code;
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}
