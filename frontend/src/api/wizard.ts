const BASE_URL = '/api/v1/advisory/proposals';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
});

export const createProposal = async () => {
    const res = await fetch(`${BASE_URL}/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}) // creates blank draft
    });
    if (!res.ok) throw new Error('Failed to create proposal');
    return res.json();
};

export const getProposal = async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}/`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch proposal');
    return res.json();
};

export const updateProposal = async (id: number, data: any) => {
    const res = await fetch(`${BASE_URL}/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update proposal');
    return res.json();
};

export const analyzeProposal = async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}/analyze/`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Analysis failed');
    return res.json();
};

export const recommendProposal = async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}/recommend/`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Recommendation failed');
    return res.json();
};
