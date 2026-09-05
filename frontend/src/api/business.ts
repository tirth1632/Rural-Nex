export const fetchCategories = async () => {
    const res = await fetch('/api/v1/business/categories/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
};

export const fetchBusinessTypes = async (categoryId: number) => {
    const res = await fetch(`/api/v1/business/types/?category=${categoryId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch business types');
    return res.json();
};

export const fetchProducts = async (typeId: number) => {
    const res = await fetch(`/api/v1/business/products/?business_type=${typeId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
};
