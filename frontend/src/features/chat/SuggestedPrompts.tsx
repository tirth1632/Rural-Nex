import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';

interface SuggestedPromptsProps {
    onSelect: (prompt: string) => void;
    disabled: boolean;
    category?: string;
}

export default function SuggestedPrompts({ onSelect, disabled, category }: SuggestedPromptsProps) {
    const { t } = useTranslation();
    const catLower = (category || '').toLowerCase();
    
    let prompts: string[] = [];

    if (catLower.includes('agri') || catLower.includes('dairy') || catLower.includes('crop') || catLower.includes('farm')) {
        prompts = [
            `Is ${category || 'dairy'} profitable in my area?`,
            "Which mandi offers the best price?",
            "How much PMEGP subsidy can I get?",
            "What are seasonal labor & water risks?",
            "What cold storage machinery is needed?"
        ];
    } else if (catLower.includes('retail') || catLower.includes('kirana') || catLower.includes('store') || catLower.includes('shop')) {
        prompts = [
            `How to increase footfall for ${category || 'retail'}?`,
            "What stock inventory capital is needed?",
            "What loan schemes apply to retail?",
            "How does competitor density affect sales?",
            "What is the average profit margin?"
        ];
    } else if (catLower.includes('manufacturing') || catLower.includes('factory') || catLower.includes('workshop')) {
        prompts = [
            `What machinery is needed for ${category || 'manufacturing'}?`,
            "What statutory licenses (GST/PCB) do I need?",
            "What is the break-even period?",
            "How sensitive are margins to wage rates?",
            "How much working capital loan can I get?"
        ];
    } else {
        prompts = [
            `How feasible is ${category || 'this enterprise'} here?`,
            "How much bank loan & subsidy can I get?",
            "What statutory licenses do I need?",
            "What are my biggest market risks?",
            "How can I optimize startup costs?"
        ];
    }

    return (
        <div className="px-4 pt-2 pb-2 max-w-4xl mx-auto w-full overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                <HelpCircle size={13} />
                <span>{t('chat_suggested', 'Suggested Questions')}</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
                {prompts.map((prompt, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(prompt)}
                        disabled={disabled}
                        className="shrink-0 px-3.5 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary rounded-full text-xs text-gray-700 dark:text-zinc-300 transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
}
