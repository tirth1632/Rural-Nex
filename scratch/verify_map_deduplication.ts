import { geoService } from '../frontend/src/services/geoService';

async function testMapDeduplication() {
  console.log('--- Testing GIS Map Spatial Deduplication & Density Capping ---');
  
  // Test Ahmedabad center point (urban zone where overlap was heaviest)
  const ahmedabadLat = 23.0225;
  const ahmedabadLng = 72.5714;
  const radiusKm = 25;

  const features = await geoService.getLayersData(
    ahmedabadLat,
    ahmedabadLng,
    radiusKm,
    'Ahmedabad',
    'Dairy Farming',
    'Dairy Processing Unit',
    'Sarkhej',
    'GJ'
  );

  console.log(`Total layer features returned: ${features.length}`);
  
  const competitors = features.filter(f => f.category === 'competitor');
  const similar = features.filter(f => f.category === 'similar');
  const pois = features.filter(f => f.category === 'poi');
  const markets = features.filter(f => f.category === 'market');

  console.log(`- Direct Competitors: ${competitors.length}`);
  console.log(`- Similar Businesses: ${similar.length}`);
  console.log(`- Key POIs: ${pois.length}`);
  console.log(`- Target Markets: ${markets.length}`);

  // Verify distance separation between any 2 features of same category
  let minDistanceFound = Infinity;
  for (let i = 0; i < features.length; i++) {
    for (let j = i + 1; j < features.length; j++) {
      const f1 = features[i];
      const f2 = features[j];
      if (f1.category === f2.category) {
        const dLat = (f1.lat - f2.lat) * 111;
        const dLng = (f1.lng - f2.lng) * 111 * Math.cos((ahmedabadLat * Math.PI) / 180);
        const dist = Math.hypot(dLat, dLng);
        if (dist < minDistanceFound) minDistanceFound = dist;
      }
    }
  }

  console.log(`Minimum spatial distance separation between markers of same category: ${minDistanceFound.toFixed(3)} km`);
}

testMapDeduplication().catch(console.error);
