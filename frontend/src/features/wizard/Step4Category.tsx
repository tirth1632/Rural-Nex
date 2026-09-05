import { useState, useEffect } from 'react';
import { Store, CheckCircle2 } from 'lucide-react';

export default function Step4Category({ data, onNext, onBack }: any) {
    const [categories, setCategories] = useState<any[]>([]);
    const [selected, setSelected] = useState<number | null>(data.category_id || null);

    useEffect(() => {
        fetch('/api/v1/advisory/categories/')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error(err));
    }, []);

    const handleContinue = () => {
        onNext({ category_id: selected });
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">What kind of business?</h2>
                <p className="text-gray-500 mt-2">Select the primary category for your proposed business.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((cat) => {
                    const isSelected = selected === cat.id;
                    return (
                        <div 
                            key={cat.id}
                            onClick={() => setSelected(cat.id)}
                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                                isSelected 
                                    ? 'border-primary bg-primary/5 shadow-md' 
                                    : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    <Store size={24} />
                                </div>
                                {isSelected && <CheckCircle2 className="text-primary" size={24} />}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{cat.description || "Start a business in this sector."}</p>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between pt-6">
                <button onClick={onBack} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Back</button>
                <button 
                    onClick={handleContinue}
                    disabled={!selected}
                    className="px-8 py-3 bg-primary text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-md"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
