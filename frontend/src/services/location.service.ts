/** Location service — wraps /api/locations/ hierarchy endpoints */

const BASE = '/api/locations';

export interface GeoItem {
  id: number;
  name: string;
}

export interface StateItem extends GeoItem {
  code: string;
}

/** GET /api/locations/states/ */
export async function fetchStates(): Promise<StateItem[]> {
  const res = await fetch(`${BASE}/states/`);
  if (!res.ok) throw new Error('Failed to fetch states');
  return res.json();
}

/** GET /api/locations/districts/?state=<id> */
export async function fetchDistricts(stateId: number): Promise<GeoItem[]> {
  const res = await fetch(`${BASE}/districts/?state=${stateId}`);
  if (!res.ok) throw new Error('Failed to fetch districts');
  return res.json();
}

/** GET /api/locations/blocks/?district=<id> */
export async function fetchBlocks(districtId: number): Promise<GeoItem[]> {
  const res = await fetch(`${BASE}/blocks/?district=${districtId}`);
  if (!res.ok) throw new Error('Failed to fetch blocks');
  return res.json();
}

/** GET /api/locations/villages/?block=<id> */
export async function fetchVillages(blockId: number): Promise<GeoItem[]> {
  const res = await fetch(`${BASE}/villages/?block=${blockId}`);
  if (!res.ok) throw new Error('Failed to fetch villages');
  return res.json();
}
