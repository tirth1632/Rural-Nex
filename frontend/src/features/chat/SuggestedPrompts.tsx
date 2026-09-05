import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';

interface SuggestedPromptsProps {
    onSelect: (prompt: string) => void;
    disabled: boolean;
}

export default function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
    const { t } = useTranslation();
    
    // The prompts as requested by the user
    const prompts = [
        "Is dairy a good business in my area?",
        "What business has lower competition?",
        "How much loan can I get?",
        "What are my biggest risks?",
        "Why is my feasibility score low?",
        "How can I reduce my startup cost?",
        "Compare dairy and grocery."
    ];

    return (
        <div className="p-4 flex flex-col gap-3 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <HelpCircle size={16} />
                <span>{t('chat.suggestedQuestions', 'Suggested Questions')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {prompts.map((prompt, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(prompt)}
                        disabled={disabled}
                        className="px-4 py-2 bg-white border border-gray-200 hover:border-primary hover:text-primary rounded-full text-sm text-gray-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
}
