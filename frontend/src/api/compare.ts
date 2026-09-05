export const compareBusinesses = async (
    lat: number, lng: number, radius: number, marginCapital: number, categories: string[]
) => {
    const res = await fetch(`/api/v1/advisory/feasibility/compare/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
            lat, 
            lng, 
            radius, 
            margin_capital: marginCapital,
            categories 
        })
    });
    
    if (!res.ok) throw new Error('Failed to compare businesses');
    return res.json();
};
