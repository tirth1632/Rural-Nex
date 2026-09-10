const BASE_URL = '/api/v1/advisory/proposals';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
});

const PROPOSALS_STORAGE_KEY = 'ruralnex_saved_proposals';

export const getLocalProposals = (): any[] => {
    try {
        const raw = localStorage.getItem(PROPOSALS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const saveLocalProposal = (proposal: any) => {
    try {
        const list = getLocalProposals();
        const idx = list.findIndex(p => p.id === proposal.id);
        if (idx >= 0) {
            list[idx] = { ...list[idx], ...proposal };
        } else {
            list.push(proposal);
        }
        localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
        console.warn('Could not save local proposal', e);
    }
};

export const createProposal = async () => {
    try {
        const res = await fetch(`${BASE_URL}/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({}) // creates blank draft
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || err.error || 'Failed to create proposal');
        }
        const created = await res.json();
        saveLocalProposal(created);
        return created;
    } catch (error: any) {
        console.warn('createProposal fallback mode:', error);
        const list = getLocalProposals();
        const maxId = list.reduce((m, p) => Math.max(m, Number(p.id) || 100), 101);
        const newProposal = { 
            id: maxId + 1, 
            current_step: 1, 
            created_at: new Date().toISOString() 
        };
        saveLocalProposal(newProposal);
        return newProposal;
    }
};

export const getProposal = async (id: number) => {
    try {
        const res = await fetch(`${BASE_URL}/${id}/`, {
            headers: getAuthHeaders(),
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (error: any) {
        console.warn('getProposal fallback mode:', error);
    }
    const list = getLocalProposals();
    const found = list.find(p => p.id === id);
    return found || { id, current_step: 1 };
};

export const updateProposal = async (id: number, data: any) => {
    let result = { id, ...data };
    try {
        // Strip non-backend fields if present
        const payload = { ...data };
        if (typeof payload.category_id !== 'number' || payload.category_id > 100) {
            delete payload.category_id;
        }

        const res = await fetch(`${BASE_URL}/${id}/`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            result = await res.json();
        }
    } catch (error: any) {
        console.warn('updateProposal fallback mode:', error);
    }
    saveLocalProposal(result);
    return result;
};

export const analyzeProposal = async (id: number) => {
    try {
        const res = await fetch(`${BASE_URL}/${id}/analyze/`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.warn('analyzeProposal API returned error:', err);
            return { status: 'success', fallback: true };
        }
        return await res.json();
    } catch (error: any) {
        console.warn('analyzeProposal network error, proceeding with fallback:', error);
        return { status: 'success', fallback: true };
    }
};

export const recommendProposal = async (id: number) => {
    try {
        const res = await fetch(`${BASE_URL}/${id}/recommend/`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.warn('recommendProposal API returned error:', err);
            return { status: 'success', fallback: true };
        }
        return await res.json();
    } catch (error: any) {
        console.warn('recommendProposal network error, proceeding with fallback:', error);
        return { status: 'success', fallback: true };
    }
};

