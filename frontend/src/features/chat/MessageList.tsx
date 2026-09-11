import { User, Volume2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { synthesizeText } from '../../api/chat';
import { RuralNexLogoMark } from '../../components/RuralNexLogo';

interface Message {
    id: number | string;
    role: 'USER' | 'ASSISTANT';
    content: string;
}

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
    const [playingId, setPlayingId] = useState<string | number | null>(null);

    const playAudio = async (msgId: string | number, text: string) => {
        if (playingId === msgId) return; // Prevent double clicking
        
        try {
            setPlayingId(msgId);
            const audioBlob = await synthesizeText(text);
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
                setPlayingId(null);
                URL.revokeObjectURL(audioUrl);
            };
            
            audio.onerror = () => {
                console.error("Audio playback error");
                setPlayingId(null);
                URL.revokeObjectURL(audioUrl);
            };

            await audio.play();
        } catch (err) {
            console.error("TTS generation failed:", err);
            setPlayingId(null);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y p-4 space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.role === 'USER' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'USER' ? 'bg-primary text-white' : 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-500/30'
                    }`}>
                        {msg.role === 'USER' ? <User size={16} /> : <RuralNexLogoMark size={20} />}
                    </div>
                    
                    <div className={`p-4 rounded-2xl relative group ${
                        msg.role === 'USER' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.content}
                        </div>
                        
                        {msg.role === 'ASSISTANT' && (
                            <button
                                onClick={() => playAudio(msg.id, msg.content)}
                                disabled={playingId === msg.id}
                                className="absolute -right-10 top-2 p-2 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-100"
                                title="Play Audio"
                            >
                                {playingId === msg.id ? <Loader2 size={16} className="animate-spin text-primary" /> : <Volume2 size={16} />}
                            </button>
                        )}
                    </div>
                </div>
            ))}
            
            {isLoading && (
                <div className="flex gap-4 max-w-3xl">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950 border border-emerald-500/30">
                        <RuralNexLogoMark size={20} />
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-100 text-gray-800 rounded-tl-none flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                </div>
            )}
        </div>
    );
}
