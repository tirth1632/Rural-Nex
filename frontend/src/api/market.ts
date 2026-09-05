export const fetchCompetitors = async (lat: number, lng: number, radiusKm: number, category?: string) => {
    let url = `/api/v1/market/competitors/?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
    if (category) url += `&category=${category}`;
    
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch competitors');
    return res.json();
};

export const fetchDensity = async (lat: number, lng: number, radiusKm: number, category?: string) => {
    let url = `/api/v1/market/density/?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
    if (category) url += `&category=${category}`;
    
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch market density');
    return res.json();
};

export const fetchObservations = async (lat: number, lng: number, radiusKm: number, category?: string) => {
    let url = `/api/v1/market/observations/?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
    if (category) url += `&category=${category}`;
    
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch external observations');
    return res.json();
};
