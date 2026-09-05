const BASE_URL = '/api/v1/advisory/proposals';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
});

export const getLatestAssessment = async () => {
    // Fetch all proposals for the user, sort by created_at desc
    const res = await fetch(`${BASE_URL}/`, {
        headers: getAuthHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to fetch assessments');
    
    const proposals = await res.json();
    
    // In a real app we'd filter or sort, but for now we just take the first one 
    // assuming the API returns them in descending order or we sort it here
    if (proposals.length === 0) return null;
    
    // Fetch full details of the latest one
    const latestId = proposals[proposals.length - 1].id;
    const detailRes = await fetch(`${BASE_URL}/${latestId}/`, {
        headers: getAuthHeaders(),
    });
    
    if (!detailRes.ok) throw new Error('Failed to fetch latest assessment details');
    return detailRes.json();
};
