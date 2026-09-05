import { useState } from 'react';

export default function Step6Details({ data, onNext, onBack }: any) {
    const [details, setDetails] = useState({
        expected_scale: data.expected_scale || '',
        available_shop: data.available_shop || false,
        experience_years: data.experience_years || 0,
        number_of_workers: data.number_of_workers || 1,
        target_customers: data.target_customers || '',
        products: data.products || ''
    });

    const handleChange = (field: string, value: any) => {
        setDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleContinue = () => {
        onNext(details);
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Optional Details</h2>
                <p className="text-gray-500 mt-2">Help the AI Advisor give you better recommendations by providing a few more details about your operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Expected Scale</label>
                    <select 
                        value={details.expected_scale}
                        onChange={(e) => handleChange('expected_scale', e.target.value)}
                        className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary outline-none"
                    >
                        <option value="">Select scale...</option>
                        <option value="Micro">Micro (Self-employed)</option>
                        <option value="Small">Small (2-5 employees)</option>
                        <option value="Medium">Medium (5+ employees)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Experience in this field (Years)</label>
                    <input 
                        type="number" 
                        min="0"
                        value={details.experience_years}
                        onChange={(e) => handleChange('experience_years', parseInt(e.target.value) || 0)}
                        className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>

                <div className="space-y-2 md:col-span-2 flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        id="shop"
                        checked={details.available_shop}
                        onChange={(e) => handleChange('available_shop', e.target.checked)}
                        className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="shop" className="text-sm font-medium text-gray-700">I already have a shop or land available</label>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Specific Products / Services</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Milk, Paneer, Ghee"
                        value={details.products}
                        onChange={(e) => handleChange('products', e.target.value)}
                        className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <button onClick={onBack} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Back</button>
                <button 
                    onClick={handleContinue}
                    className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                >
                    Run Full Analysis
                </button>
            </div>
        </div>
    );
}
