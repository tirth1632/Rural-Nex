import { geoService } from '../frontend/src/services/geoService';

function testNavigationMapping() {
  console.log('--- Testing Financial Plan ➔ GIS Map Navigation URL Resolver ---');

  const testCases = [
    { state: 'Andhra Pradesh', district: 'Visakhapatnam', block: 'Gajuwaka Industrial Belt', village: 'Gajuwaka Industrial Belt Gram Panchayat' },
    { state: 'Gujarat', district: 'Ahmedabad', block: 'Sanand Taluka', village: 'Changodar Industrial Village' },
    { state: 'Kerala', district: 'Wayanad', block: 'Mananthavady Block', village: 'Kattikulam Village' },
    { state: 'Maharashtra', district: 'Pune', block: 'Baramati Taluka', village: 'Baramati Village' }
  ];

  for (const tc of testCases) {
    const stObj = geoService.getStates().find(s => s.name.toLowerCase() === tc.state.toLowerCase());
    const stateId = stObj ? stObj.id : 'AP';

    const dists = geoService.getDistricts(stateId);
    const distObj = dists.find(d => d.name.toLowerCase() === tc.district.toLowerCase());
    const districtId = distObj ? distObj.id : (dists[0]?.id || 'AP_VSKP');

    const targetLat = distObj?.lat || stObj?.lat || 17.6868;
    const targetLng = distObj?.lng || stObj?.lng || 83.2185;

    const locName = tc.village || tc.block || tc.district;
    const url = `/market?stateId=${stateId}&districtId=${districtId}&lat=${targetLat}&lng=${targetLng}&locName=${encodeURIComponent(locName)}&districtName=${encodeURIComponent(tc.district)}`;

    console.log(`Input: ${tc.state} > ${tc.district} > ${tc.village}`);
    console.log(`Generated URL: ${url}`);
    console.log(`Resolved: State ID=${stateId}, District ID=${districtId}, Coords=(${targetLat}, ${targetLng})\n`);
  }
}

testNavigationMapping();
