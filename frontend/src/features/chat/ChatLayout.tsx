import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { generateAdvisory, sendChatMessage } from '../../api/chat';
import ContextPanel from './ContextPanel';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import SuggestedPrompts from './SuggestedPrompts';

export default function ChatLayout() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<{id: string, role: 'USER'|'ASSISTANT', content: string}[]>([]);
    const [sessionId, setSessionId] = useState<number | undefined>();

    // Mock initial inputs for the MVP dashboard (in a real flow, these come from previous wizard steps)
    const mockInputs = {
        lat: 28.6139,
        lng: 77.2090,
        radius: 5.0,
        category: "Retail",
        projectSize: 150000
    };

    // 1. Fetch initial report context on mount
    const { data: reportData, isLoading: isLoadingReport, isError: isReportError } = useQuery({
        queryKey: ['advisoryReport', mockInputs],
        queryFn: () => generateAdvisory(mockInputs.lat, mockInputs.lng, mockInputs.radius, mockInputs.category, mockInputs.projectSize),
        staleTime: Infinity,
    });

    useEffect(() => {
        if (reportData && messages.length === 0) {
            setMessages([{
                id: 'sys-1',
                role: 'ASSISTANT',
                content: `**Initial Analysis Complete:** ${reportData.ai_analysis?.summary}\n\nI have attached your full deterministic context to this session. What would you like to know?`
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
                content: "I'm sorry, I encountered an error while processing your request. Please try again."
            }]);
        }
    });

    const handleSendMessage = (content: string) => {
        // Add user message to UI immediately
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'USER', content }]);
        // Trigger API
        chatMutation.mutate(content);
    };

    if (isReportError) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 text-red-500">
                Failed to load the business context. Please ensure the backend is running and you are authenticated.
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] max-w-[1400px] mx-auto bg-white dark:bg-black flex overflow-hidden border-x border-gray-200 dark:border-zinc-800">
            {/* Left Column: Deterministic Context Panel */}
            <div className="hidden lg:block w-96 shrink-0 bg-gray-50 dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 relative z-10">
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
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('chat_title', 'AI Business Advisor')}</h1>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">Grounded by deterministic feasibility data</p>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-black">
                    <MessageList 
                        messages={messages} 
                        isLoading={chatMutation.isPending || isLoadingReport} 
                    />
                </div>
                
                <div className="shrink-0 bg-gray-50/70 dark:bg-zinc-950/80 backdrop-blur-sm border-t border-gray-200 dark:border-zinc-800 relative z-20">
                    <SuggestedPrompts 
                        onSelect={handleSendMessage} 
                        disabled={chatMutation.isPending || isLoadingReport} 
                    />
                    <MessageInput 
                        onSend={handleSendMessage} 
                        isLoading={chatMutation.isPending || isLoadingReport} 
                    />
                </div>
            </div>
        </div>
    );
}
