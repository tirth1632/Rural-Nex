export const generateAdvisory = async (
    lat: number, lng: number, radius: number, category: string, projectSize: number, financialData?: any
) => {
    const res = await fetch(`/api/v1/advisory/generate/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ lat, lng, radius, category, project_size: projectSize, financial_data: financialData })
    });
    
    if (!res.ok) throw new Error('Failed to generate advisory');
    return res.json();
};

export const sendChatMessage = async (
    message: string, sessionId?: number, context?: any
) => {
    const res = await fetch(`/api/v1/chat/message/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ message, session_id: sessionId, context })
    });
    
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const res = await fetch(`/api/v1/advisory/voice/transcribe/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            // Note: Don't set Content-Type here, let the browser set it with the boundary
        },
        body: formData
    });
    
    if (!res.ok) throw new Error('Failed to transcribe audio');
    const data = await res.json();
    return data.text;
};

export const synthesizeText = async (text: string): Promise<Blob> => {
    const res = await fetch(`/api/v1/advisory/voice/synthesize/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ text })
    });
    
    if (!res.ok) throw new Error('Failed to synthesize text');
    return res.blob();
};
