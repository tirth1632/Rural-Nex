const GOOGLE_MAPS_API_KEY = 'AIzaSyC0EMn8kBc9Hcji1n7qGcob4Ol2TnRZ4L8';

async function testGoogleGeocodingAPI() {
  console.log('--- Testing Google Maps Geocoding & Places API ---');
  
  const address = 'Bareja, Daskroi, Gujarat, India';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await fetch(url);
    console.log('Geocoding HTTP Status:', res.status);
    const data = await res.json();
    console.log('Geocoding API Status:', data.status);
    if (data.results && data.results.length > 0) {
      const first = data.results[0];
      console.log('Formatted Address:', first.formatted_address);
      console.log('Coordinates:', first.geometry.location);
    } else {
      console.log('No geocoding results:', data);
    }
  } catch (err) {
    console.error('Geocoding fetch error:', err);
  }
}

testGoogleGeocodingAPI().catch(console.error);
