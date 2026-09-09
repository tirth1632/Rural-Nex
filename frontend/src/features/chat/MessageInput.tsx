import { Send, Mic, Square, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { transcribeAudio } from '../../api/chat';

interface MessageInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
}

export default function MessageInput({ onSend, isLoading }: MessageInputProps) {
    const { t } = useTranslation();
    const [input, setInput] = useState('');
    
    // Voice State
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading && !isTranscribing) {
            onSend(input.trim());
            setInput('');
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            // Stop recording
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                chunksRef.current = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    // Stop all tracks to release microphone
                    stream.getTracks().forEach(track => track.stop());
                    
                    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                    setIsTranscribing(true);
                    
                    try {
                        const transcribedText = await transcribeAudio(audioBlob);
                        if (transcribedText) {
                            setInput(transcribedText);
                            // Optionally, auto-send here
                            // onSend(transcribedText); 
                        }
                    } catch (err) {
                        console.error('Transcription failed:', err);
                        alert("Could not transcribe audio. Please try typing instead.");
                    } finally {
                        setIsTranscribing(false);
                    }
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error('Microphone access denied:', err);
                alert("Microphone access is required for voice input. Please check your browser permissions.");
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="p-3 px-4 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800">
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto items-center">
                <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={isLoading || isTranscribing}
                    className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                        isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50'
                    }`}
                    title="Voice Input"
                >
                    {isRecording ? <Square size={18} /> : <Mic size={18} />}
                </button>
                
                <input
                    type="text"
                    value={isTranscribing ? t('chat_transcribing', 'Transcribing...') : input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isRecording ? t('chat_listening', 'Listening...') : t('chat_placeholder', 'Ask a question about your business plan, schemes, or local market...')}
                    disabled={isLoading || isRecording || isTranscribing}
                    className={`flex-1 px-4 py-3 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        isRecording || isTranscribing 
                        ? 'bg-gray-100 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400' 
                        : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white'
                    }`}
                />
                
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading || isRecording || isTranscribing}
                    title={t('chat_send', 'Send')}
                    className="w-11 h-11 shrink-0 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-xs"
                >
                    {isTranscribing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                </button>
            </form>
        </div>
    );
}
