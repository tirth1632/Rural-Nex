import { locationDataService } from '../frontend/src/services/locationDataService';

async function testDynamicLocationIntelligence() {
  console.log('=== Testing Dynamic Location Intelligence Metrics ===\n');

  const loc1 = await locationDataService.getLocationIntelligence('Gujarat', 'Ahmedabad', 'Daskroi Taluka', 'Bareja Gram Panchayat');
  console.log('Location 1: Gujarat > Ahmedabad > Daskroi > Bareja Gram Panchayat');
  console.log(loc1);
  console.log('--------------------------------------------------\n');

  const loc2 = await locationDataService.getLocationIntelligence('Gujarat', 'Ahmedabad', 'Sanand Taluka', 'Changodar Industrial Village');
  console.log('Location 2: Gujarat > Ahmedabad > Sanand > Changodar Industrial Village');
  console.log(loc2);
  console.log('--------------------------------------------------\n');

  const loc3 = await locationDataService.getLocationIntelligence('Gujarat', 'Anand', 'Petlad Taluka', 'Dharmaj NRI Heritage Village');
  console.log('Location 3: Gujarat > Anand > Petlad > Dharmaj NRI Heritage Village');
  console.log(loc3);
  console.log('--------------------------------------------------\n');

  const loc4 = await locationDataService.getLocationIntelligence('Kerala', 'Wayanad', 'Mananthavady Block', 'Kattikulam Village');
  console.log('Location 4: Kerala > Wayanad > Mananthavady > Kattikulam Village');
  console.log(loc4);
  console.log('--------------------------------------------------\n');

  const loc5 = await locationDataService.getLocationIntelligence('Rajasthan', 'Banaskantha', 'Palanpur Block', 'Arid Belt Village');
  console.log('Location 5: Rajasthan > Banaskantha > Palanpur > Arid Belt Village');
  console.log(loc5);
}

testDynamicLocationIntelligence().catch(console.error);
