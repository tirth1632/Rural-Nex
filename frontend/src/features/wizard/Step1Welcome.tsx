import { Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Step1Welcome({ onNext }: { onNext: () => void }) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 mt-12">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Rocket className="text-primary w-12 h-12" />
            </div>
            
            <div className="space-y-4 max-w-lg">
                <h2 className="text-3xl font-bold text-gray-900">{t('wizard_step1_title')}</h2>
                <p className="text-gray-600 leading-relaxed">
                    {t('wizard_step1_desc')}
                </p>
            </div>

            <button 
                onClick={onNext}
                className="px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                {t('wizard_next')}
            </button>
        </div>
    );
}
