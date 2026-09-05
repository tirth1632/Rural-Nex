import { useState } from 'react';
import { IndianRupee } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Step3Margin({ data, onNext, onBack }: any) {
    const { t } = useTranslation();
    const [margin, setMargin] = useState<string>(data.margin_capital?.toString() || '');

    const handleContinue = () => {
        onNext({ margin_capital: parseFloat(margin) });
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">{t('wizard_step3_title')}</h2>
                <p className="text-gray-500 mt-2">{t('wizard_step3_desc')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('wizard_step3_label')}</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <IndianRupee className="text-gray-400" size={24} />
                    </div>
                    <input
                        type="number"
                        min="0"
                        value={margin}
                        onChange={(e) => setMargin(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary transition-colors outline-none"
                        placeholder="e.g. 50000"
                    />
                </div>
                
                {parseFloat(margin) > 0 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm text-green-800">
                            <strong>Note:</strong> Under rural schemes, a margin of ₹{parseFloat(margin).toLocaleString('en-IN')} could potentially unlock a project cost up to ₹{(parseFloat(margin) * 10).toLocaleString('en-IN')}!
                        </p>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-6">
                <button onClick={onBack} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">{t('wizard_back')}</button>
                <button 
                    onClick={handleContinue}
                    disabled={!margin || parseFloat(margin) <= 0}
                    className="px-8 py-3 bg-primary text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-md"
                >
                    {t('wizard_next')}
                </button>
            </div>
        </div>
    );
}
