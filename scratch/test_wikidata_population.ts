async function searchAndFetchLivePopulation(locationQuery: string) {
  const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(locationQuery)}&language=en&format=json`;
  try {
    const sRes = await fetch(searchUrl, { headers: { 'User-Agent': 'RuralNex/1.0' } });
    const sData = await sRes.json();
    const matches = sData.search;

    if (!matches || matches.length === 0) {
      console.log(`No Wikidata matches for "${locationQuery}"`);
      return null;
    }

    const firstMatch = matches[0];
    const qid = firstMatch.id;
    const label = firstMatch.label;
    const desc = firstMatch.description;

    // Fetch entity claim P1082 (Population)
    const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=claims&format=json`;
    const eRes = await fetch(entityUrl, { headers: { 'User-Agent': 'RuralNex/1.0' } });
    const eData = await eRes.json();
    const entity = eData.entities?.[qid];

    let pop: number | null = null;
    const popClaims = entity?.claims?.P1082;
    if (popClaims && popClaims.length > 0) {
      const amountStr = popClaims[popClaims.length - 1]?.mainsnak?.datavalue?.value?.amount;
      if (amountStr) {
        pop = parseInt(amountStr.replace('+', ''), 10);
      }
    }

    console.log(`Query: "${locationQuery}" => Match: ${label} (${qid}) - ${desc} => LIVE POPULATION: ${pop ? pop.toLocaleString('en-IN') : 'Census Data Pending'}`);
    return { label, qid, population: pop };
  } catch (e) {
    console.error('Wikidata search error:', e);
    return null;
  }
}

async function run() {
  console.log('=== Live Dynamic Wikidata Census Population Engine ===\n');

  await searchAndFetchLivePopulation('Anand Gujarat');
  await searchAndFetchLivePopulation('Sanand Gujarat');
  await searchAndFetchLivePopulation('Dholka Gujarat');
  await searchAndFetchLivePopulation('Viramgam Gujarat');
  await searchAndFetchLivePopulation('Petlad Gujarat');
  await searchAndFetchLivePopulation('Bavla Gujarat');
  await searchAndFetchLivePopulation('Surat Gujarat');
  await searchAndFetchLivePopulation('Rajkot Gujarat');
  await searchAndFetchLivePopulation('Wayanad Kerala');
}

run();
