import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchBusinessTypes, fetchProducts } from '../../api/business';
import { useNavigate } from 'react-router-dom';
import { Store, Tractor, Truck, Scissors, ShoppingBasket, Plug, Milk, Factory, Wheat, Smartphone, Gem, Shirt, Cake, Search } from 'lucide-react';

// Simple icon map based on the slugs from the backend
const iconMap: Record<string, React.ReactNode> = {
    'dairy': <Milk size={32} />,
    'agriculture': <Wheat size={32} />,
    'retail': <Store size={32} />,
    'grocery': <ShoppingBasket size={32} />,
    'textiles': <Shirt size={32} />,
    'bakery': <Cake size={32} />,
    'handicrafts': <Gem size={32} />,
    'mobile_repair': <Smartphone size={32} />,
    'electrical_services': <Plug size={32} />,
    'transportation': <Truck size={32} />,
    'beauty': <Scissors size={32} />,
    'manufacturing': <Factory size={32} />,
    'livestock': <Tractor size={32} />,
    'other': <Store size={32} />
};

export default function BusinessSelection() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedType, setSelectedType] = useState<any>(null);

    const { data: categories = [], isLoading: loadingCats } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories
    });

    const { data: types = [], isLoading: loadingTypes } = useQuery({
        queryKey: ['types', selectedCategory?.id],
        queryFn: () => fetchBusinessTypes(selectedCategory.id),
        enabled: !!selectedCategory
    });

    const { data: products = [], isLoading: loadingProducts } = useQuery({
        queryKey: ['products', selectedType?.id],
        queryFn: () => fetchProducts(selectedType.id),
        enabled: !!selectedType
    });

    const filteredCategories = categories.filter((c: any) => 
        t(`categories.${c.name}`, c.name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleContinue = () => {
        // In a real flow, this would save the selection to context or backend
        // For now, move to the next logical step (e.g., location or finance)
        navigate('/finance/calculator');
    };

    return (
        <div className="max-w-5xl mx-auto mt-8 p-4">
            <h1 className="text-3xl font-bold text-primary mb-8">{t('businessSelection.title')}</h1>

            {!selectedCategory ? (
                <>
                    <div className="relative mb-6 max-w-md">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2 border rounded-full outline-none focus:ring-2 focus:ring-primary"
                            placeholder={t('businessSelection.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loadingCats ? (
                        <div className="text-gray-500">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredCategories.map((cat: any) => (
                                <button 
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat)}
                                    className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md hover:border-primary transition-all flex flex-col items-center justify-center gap-3 text-center"
                                >
                                    <div className="text-primary bg-primary/10 p-4 rounded-full">
                                        {iconMap[cat.icon_slug] || <Store size={32} />}
                                    </div>
                                    <span className="font-semibold text-gray-800">
                                        {t(`categories.${cat.name}`, cat.name)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : !selectedType ? (
                <div className="bg-white p-6 rounded-lg shadow border max-w-2xl">
                    <button onClick={() => setSelectedCategory(null)} className="text-sm text-gray-500 hover:text-primary mb-4">
                        ← {t('businessSelection.back')}
                    </button>
                    <h2 className="text-2xl font-bold mb-4">{t('businessSelection.selectType')} - {t(`categories.${selectedCategory.name}`)}</h2>
                    
                    {loadingTypes ? <p>Loading...</p> : types.length === 0 ? (
                        <p className="text-gray-500">No specific types found. You can continue.</p>
                    ) : (
                        <div className="space-y-3">
                            {types.map((type: any) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type)}
                                    className="w-full text-left p-4 rounded border hover:bg-gray-50 focus:ring-2 focus:ring-primary"
                                >
                                    <span className="font-semibold">{type.name}</span>
                                    {type.description && <p className="text-sm text-gray-500 mt-1">{type.description}</p>}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleContinue} className="bg-primary text-white px-6 py-2 rounded">
                            {t('businessSelection.next')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow border max-w-2xl">
                    <button onClick={() => setSelectedType(null)} className="text-sm text-gray-500 hover:text-primary mb-4">
                        ← {t('businessSelection.back')}
                    </button>
                    <h2 className="text-2xl font-bold mb-2">{t('businessSelection.selectProduct')}</h2>
                    <p className="text-gray-500 mb-6">{selectedType.name}</p>

                    {loadingProducts ? <p>Loading...</p> : products.length === 0 ? (
                         <p className="text-gray-500">No predefined products for this business type.</p>
                    ) : (
                        <div className="space-y-2 mb-6">
                            {products.map((product: any) => (
                                <label key={product.id} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                                    <input type="checkbox" className="w-5 h-5 text-primary rounded border-gray-300" />
                                    <div>
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-xs text-gray-500">Sold by: {product.base_unit}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button onClick={handleContinue} className="bg-primary text-white px-6 py-2 rounded font-medium">
                            {t('businessSelection.next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
