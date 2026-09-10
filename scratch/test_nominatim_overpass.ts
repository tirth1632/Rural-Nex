async function testLivePopulationAPI(query: string) {
  console.log(`\n--- Fetching Live Geocoding & Population Data for: "${query}" ---`);
  
  // 1. OpenStreetMap Nominatim Free Geocoding API
  const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&extratags=1&limit=1`;
  
  try {
    const res = await fetch(nomUrl, {
      headers: { 'User-Agent': 'RuralNex-Platform/1.0 (contact@ruralnex.org)' }
    });
    const nomData = await res.json();

    if (nomData && nomData.length > 0) {
      const place = nomData[0];
      console.log(`Found Location: ${place.display_name}`);
      console.log(`Coordinates: Lat ${place.lat}, Lng ${place.lon}`);
      console.log(`Place Type: ${place.type} (${place.class})`);

      const extra = place.extratags || {};
      if (extra.population) {
        console.log(`LIVE POPULATION (from OSM extra tags): ${parseInt(extra.population).toLocaleString()}`);
      } else {
        console.log(`OSM extra tags present:`, Object.keys(extra));
      }

      // 2. Query Overpass API for nearby settlement nodes with population tag
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      const opQuery = `[out:json][timeout:10];
        (
          node["place"~"village|town|city"](around:3000, ${lat}, ${lon});
        );
        out body;`;
      const opUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(opQuery)}`;
      const opRes = await fetch(opUrl);
      const opData = await opRes.json();

      if (opData.elements && opData.elements.length > 0) {
        const popElements = opData.elements.filter((el: any) => el.tags && el.tags.population);
        if (popElements.length > 0) {
          console.log(`FOUND ${popElements.length} nearby nodes with explicit OSM population tag:`);
          popElements.forEach((el: any) => {
            console.log(`  - ${el.tags.name || 'Settlement'}: Population ${parseInt(el.tags.population).toLocaleString()}`);
          });
        } else {
          console.log(`Nearby settlement elements found: ${opData.elements.length} (no explicit population tag in OSM node, using census/density dataset model).`);
        }
      }
    } else {
      console.log('No Nominatim geocoding results found.');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

async function run() {
  await testLivePopulationAPI('Bareja, Gujarat');
  await testLivePopulationAPI('Sanand, Gujarat');
  await testLivePopulationAPI('Anand, Gujarat');
  await testLivePopulationAPI('Dharmaj, Gujarat');
}

run();
