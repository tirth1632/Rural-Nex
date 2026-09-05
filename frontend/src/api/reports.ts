const BASE_URL = '/api/v1/advisory/reports';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
});

export const triggerReportGeneration = async (proposalId: number) => {
    const res = await fetch(`${BASE_URL}/${proposalId}/generate/`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    
    if (!res.ok) {
        throw new Error('Failed to generate report');
    }
    return res.json(); // returns { status: "ready", download_url: "..." }
};

export const downloadReport = async (proposalId: number) => {
    const res = await fetch(`${BASE_URL}/${proposalId}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });

    if (!res.ok) {
        throw new Error('Failed to download report');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RuralNex_Feasibility_Report_${proposalId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};
