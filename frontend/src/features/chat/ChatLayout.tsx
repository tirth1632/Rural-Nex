import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { generateAdvisory, sendChatMessage } from '../../api/chat';
import ContextPanel from './ContextPanel';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import SuggestedPrompts from './SuggestedPrompts';
import AIModelModal, { AI_MODELS } from './AIModelModal';
import { Cpu, Settings2 } from 'lucide-react';

export default function ChatLayout() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<{id: string, role: 'USER'|'ASSISTANT', content: string}[]>([]);
    const [sessionId, setSessionId] = useState<number | undefined>();
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [activeModelName, setActiveModelName] = useState('Gemini 2.0 Flash');

    // Sync active model display name
    useEffect(() => {
        const storedProvider = localStorage.getItem('selected_ai_provider');
        const storedModel = localStorage.getItem('selected_ai_model');
        if (storedProvider && storedModel) {
            const found = AI_MODELS.find(m => m.provider === storedProvider && m.model === storedModel);
            if (found) setActiveModelName(found.name);
        }
    }, [isAiModalOpen]);

    // Mock initial inputs for the MVP dashboard (in a real flow, these come from previous wizard steps)
    const mockInputs = {
        lat: 28.6139,
        lng: 77.2090,
        radius: 5.0,
        category: "Retail",
        projectSize: 150000
    };

    // 1. Fetch initial report context on mount
    const { data: reportData, isLoading: isLoadingReport } = useQuery({
        queryKey: ['advisoryReport', mockInputs],
        queryFn: () => generateAdvisory(mockInputs.lat, mockInputs.lng, mockInputs.radius, mockInputs.category, mockInputs.projectSize),
        staleTime: Infinity,
    });

    useEffect(() => {
        if (reportData && messages.length === 0) {
            setMessages([{
                id: 'sys-1',
                role: 'ASSISTANT',
                content: `**Initial Analysis Complete:** ${reportData.ai_analysis?.summary || 'Feasibility analysis calculated successfully.'}\n\nI have attached your full deterministic context to this session. What would you like to know?`
            }]);
        }
    }, [reportData, messages.length]);

    // 2. Chat Mutation
    const chatMutation = useMutation({
        mutationFn: (msg: string) => sendChatMessage(msg, sessionId, reportData),
        onSuccess: (data) => {
            setSessionId(data.session_id);
            setMessages(prev => [...prev, {
                id: data.message.id,
                role: 'ASSISTANT',
                content: data.message.content
            }]);
        },
        onError: () => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ASSISTANT',
                content: "I'm sorry, I encountered an error while processing your request. Please check your AI API Keys under 'AI Models & Keys' or try again."
            }]);
        }
    });

    const handleSendMessage = (content: string) => {
        // Add user message to UI immediately
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'USER', content }]);
        // Trigger API
        chatMutation.mutate(content);
    };

    return (
        <div className="w-full h-full max-h-full min-h-0 max-w-[1600px] 2xl:max-w-[1800px] mx-auto bg-white dark:bg-black flex overflow-hidden border-x border-gray-200 dark:border-zinc-800">
            {/* Left Column: Deterministic Context Panel */}
            <div className="hidden lg:flex w-96 shrink-0 bg-gray-50 dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 relative z-10 h-full max-h-full flex-col min-h-0 overflow-hidden">
                {isLoadingReport ? (
                    <div className="p-8 space-y-4 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
                        <div className="h-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                        <div className="h-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                    </div>
                ) : (
                    <ContextPanel report={reportData} />
                )}
            </div>

            {/* Right Column: Chat Interface */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-black relative">
                <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {t('chat_title', 'AI Business Advisor')}
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1.5">
                                <Cpu size={12} /> {activeModelName}
                            </span>
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">Grounded by deterministic feasibility data</p>
                    </div>
                    <button
                        onClick={() => setIsAiModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                        title="Configure AI Model & Keys"
                    >
                        <Settings2 size={14} />
                        <span>AI Models & Keys</span>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-black">
                    <MessageList 
                        messages={messages} 
                        isLoading={chatMutation.isPending || isLoadingReport} 
                    />
                </div>
                
                <div className="shrink-0 bg-gray-50/70 dark:bg-zinc-950/80 backdrop-blur-sm border-t border-gray-200 dark:border-zinc-800 relative z-20">
                    <SuggestedPrompts 
                        category={reportData?.deterministic_data?.category || mockInputs.category}
                        onSelect={handleSendMessage} 
                        disabled={chatMutation.isPending || isLoadingReport} 
                    />
                    <MessageInput 
                        onSend={handleSendMessage} 
                        isLoading={chatMutation.isPending || isLoadingReport} 
                    />
                </div>
            </div>

            {/* AI Model & Key Manager Modal */}
            <AIModelModal 
                isOpen={isAiModalOpen} 
                onClose={() => setIsAiModalOpen(false)} 
                onSelectModel={(prov, mod) => {
                    const found = AI_MODELS.find(m => m.provider === prov && m.model === mod);
                    if (found) setActiveModelName(found.name);
                }}
            />
        </div>
    );
}
