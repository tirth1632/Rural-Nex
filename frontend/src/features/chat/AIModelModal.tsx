import { useState, useEffect } from 'react';
import { Key, Check, X, ShieldCheck, Sparkles, Cpu } from 'lucide-react';

export interface AIModelOption {
    id: string;
    name: string;
    provider: string;
    model: string;
    badge?: string;
    description: string;
}

export const AI_MODELS: AIModelOption[] = [
    {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        badge: 'Recommended',
        description: 'Ultra-fast Google AI model tuned for high performance business analysis.'
    },
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'gemini',
        model: 'gemini-1.5-pro',
        description: 'Google’s long-context reasoning powerhouse for complex financial insights.'
    },
    {
        id: 'gpt-4o',
        name: 'OpenAI GPT-4o',
        provider: 'openai',
        model: 'gpt-4o',
        badge: 'Popular',
        description: 'Flagship multimodal model by OpenAI for precision analytical advice.'
    },
    {
        id: 'gpt-4o-mini',
        name: 'OpenAI GPT-4o Mini',
        provider: 'openai',
        model: 'gpt-4o-mini',
        description: 'Lightweight & cost-efficient model with high speed.'
    },
    {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        badge: 'High Reasoning',
        description: 'Anthropic state-of-the-art model for nuanced business reasoning.'
    },
    {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
        description: 'Instant response model built for sub-second responses.'
    },
    {
        id: 'deepseek-v3',
        name: 'DeepSeek V3 Chat',
        provider: 'deepseek',
        model: 'deepseek-chat',
        badge: 'Trending',
        description: 'High-performing open-weights model fine-tuned for structured advice.'
    },
    {
        id: 'deepseek-r1',
        name: 'DeepSeek R1 Reasoner',
        provider: 'deepseek',
        model: 'deepseek-reasoner',
        badge: 'Reasoning',
        description: 'Chain-of-thought deep reasoning engine for financial modeling.'
    },
    {
        id: 'groq-llama-3.3',
        name: 'Groq Llama 3.3 70B',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        badge: 'Sub-second',
        description: 'Ultra-low latency inference engine powering Meta Llama 3.3.'
    },
    {
        id: 'openrouter-auto',
        name: 'OpenRouter Auto',
        provider: 'openrouter',
        model: 'openrouter/auto',
        description: 'Unified router supporting hundreds of open and commercial LLMs.'
    },
    {
        id: 'grok-2',
        name: 'xAI Grok 2',
        provider: 'grok',
        model: 'grok-2-latest',
        description: 'xAI frontier model with real-world synthesis capabilities.'
    },
    {
        id: 'multi_fallback',
        name: 'Auto Multi-Fallback (Default)',
        provider: 'multi_fallback',
        model: 'default',
        badge: 'Resilient',
        description: 'Automatically attempts pre-configured keys in sequence with zero-downtime mock fallback.'
    }
];

interface AIModelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectModel?: (provider: string, model: string) => void;
}

export default function AIModelModal({ isOpen, onClose, onSelectModel }: AIModelModalProps) {
    const [selectedId, setSelectedId] = useState<string>('gemini-2.0-flash');
    const [envProviders, setEnvProviders] = useState<Record<string, boolean>>({});
    const [customKeys, setCustomKeys] = useState<Record<string, string>>({
        gemini: '',
        openai: '',
        anthropic: '',
        deepseek: '',
        groq: '',
        openrouter: '',
        grok: ''
    });
    const [savedStatus, setSavedStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const storedProvider = localStorage.getItem('selected_ai_provider');
        const storedModel = localStorage.getItem('selected_ai_model');

        if (storedProvider && storedModel) {
            const found = AI_MODELS.find(m => m.provider === storedProvider && m.model === storedModel);
            if (found) setSelectedId(found.id);
        }

        // Fetch server env configured providers
        fetch('/api/v1/advisory/ai-status/')
            .then(res => res.json())
            .then(data => {
                if (data.configured_providers) {
                    setEnvProviders(data.configured_providers);
                }
            })
            .catch(() => {
                // Fallback assume gemini/openrouter/grok are present
                setEnvProviders({ gemini: true, openrouter: true, grok: true });
            });

        // Load existing custom keys
        const providers = ['gemini', 'openai', 'anthropic', 'deepseek', 'groq', 'openrouter', 'grok'];
        const keysObj: Record<string, string> = {};
        providers.forEach(p => {
            keysObj[p] = localStorage.getItem(`ai_key_${p}`) || '';
        });
        setCustomKeys(keysObj);
    }, [isOpen]);

    if (!isOpen) return null;

    const currentModelObj = AI_MODELS.find(m => m.id === selectedId) || AI_MODELS[0];
    const currentProvider = currentModelObj.provider;
    const isEnvConfigured = envProviders[currentProvider];
    const isCustomSet = Boolean(customKeys[currentProvider]?.trim());

    const handleSave = () => {
        // Save selected provider and model
        localStorage.setItem('selected_ai_provider', currentModelObj.provider);
        localStorage.setItem('selected_ai_model', currentModelObj.model);

        // Save custom keys
        Object.entries(customKeys).forEach(([prov, val]) => {
            if (val.trim()) {
                localStorage.setItem(`ai_key_${prov}`, val.trim());
            } else {
                localStorage.removeItem(`ai_key_${prov}`);
            }
        });

        if (onSelectModel) {
            onSelectModel(currentModelObj.provider, currentModelObj.model);
        }

        setSavedStatus(`Keys & ${currentModelObj.name} model active!`);
        setTimeout(() => {
            setSavedStatus(null);
            onClose();
        }, 900);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-950/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                AI Model & Key Manager
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-zinc-400">Pre-configured .env keys active & custom API key manager</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    
                    {/* Status Alert */}
                    {savedStatus && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                            <Check size={16} /> {savedStatus}
                        </div>
                    )}

                    {/* Model Grid */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-primary" /> Select Active AI Model
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {AI_MODELS.map((m) => {
                                const isSelected = m.id === selectedId;
                                const isKeyActive = envProviders[m.provider] || Boolean(customKeys[m.provider]?.trim()) || m.provider === 'multi_fallback';
                                
                                return (
                                    <div
                                        key={m.id}
                                        onClick={() => setSelectedId(m.id)}
                                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                                            isSelected 
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs' 
                                            : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                                                {m.name}
                                                {m.badge && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                                                        {m.badge}
                                                    </span>
                                                )}
                                                {isKeyActive && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                                        <ShieldCheck size={10} /> Ready
                                                    </span>
                                                )}
                                            </span>
                                            {isSelected && <Check size={16} className="text-primary shrink-0 ml-1" />}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                            {m.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom API Key Input for current provider */}
                    {currentProvider !== 'multi_fallback' && (
                        <div className="p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <label className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                                    <Key size={14} className="text-amber-500" />
                                    API Key for {currentProvider.toUpperCase()}
                                </label>
                                {(isEnvConfigured || isCustomSet) && (
                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                        <ShieldCheck size={13} /> {isCustomSet ? 'Custom Key Active' : 'Pre-configured in .env Active'}
                                    </span>
                                )}
                            </div>
                            
                            <div className="relative">
                                <input
                                    type="password"
                                    value={customKeys[currentProvider] || ''}
                                    onChange={(e) => setCustomKeys({ ...customKeys, [currentProvider]: e.target.value })}
                                    placeholder={isEnvConfigured ? `Pre-configured key found in .env (Type here to override...)` : `Enter custom ${currentProvider.toUpperCase()} API key...`}
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                                {isEnvConfigured 
                                ? '✓ Pre-configured key from backend .env file is currently active. Any custom key entered above will override it.'
                                : 'Keys entered here are saved locally in your browser and passed securely to AI sessions.'}
                            </p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                        <Check size={14} /> Save & Apply Model
                    </button>
                </div>

            </div>
        </div>
    );
}
