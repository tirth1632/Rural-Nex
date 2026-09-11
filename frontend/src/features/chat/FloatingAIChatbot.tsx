import React, { useState, useEffect, useRef } from 'react';



import { useTranslation } from 'react-i18next';



import { 



    X, 



    Send, 



    Mic, 



    MicOff, 



    Loader2, 



    RefreshCw,



    Key



} from 'lucide-react';



import AIModelModal from './AIModelModal';



import { RuralNexLogoMark } from '../../components/RuralNexLogo';







// Lightweight markdown renderer: handles **bold**, bullet lists (*/-/), and newlines



const renderMarkdown = (text: string): React.ReactNode[] => {



    const lines = text.split('\n');



    return lines.map((line, i) => {



        const trimmed = line.trimStart();



        const isBullet = /^(\*|\-||\d+\.)\s/.test(trimmed);



        const content = isBullet ? trimmed.replace(/^(\*|\-||\d+\.)\s/, '') : trimmed;







        // Parse **bold** spans



        const parseInline = (raw: string): React.ReactNode[] => {



            const parts = raw.split(/(\*\*[^*]+\*\*)/g);



            return parts.map((part, j) =>



                part.startsWith('**') && part.endsWith('**')



                    ? <strong key={j} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>



                    : part



            );



        };







        if (isBullet) {



            return (



                <div key={i} className="flex gap-2 items-start">



                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />



                    <span>{parseInline(content)}</span>



                </div>



            );



        }







        if (!trimmed) return <div key={i} className="h-1.5" />;







        return <div key={i}>{parseInline(content)}</div>;



    });



};







interface Message {



    id: string;



    role: 'USER' | 'ASSISTANT';



    content: string;



    timestamp: string;



}







export default function FloatingAIChatbot() {



    const { t, i18n } = useTranslation();



    const [isOpen, setIsOpen] = useState(false);



    const [messages, setMessages] = useState<Message[]>([]);



    const [input, setInput] = useState('');



    const [isLoading, setIsLoading] = useState(false);



    const [isRecording, setIsRecording] = useState(false);



    const [isAiModalOpen, setIsAiModalOpen] = useState(false);



    



    const messagesEndRef = useRef<HTMLDivElement>(null);



    const recognitionRef = useRef<any>(null);







    // Close Chat & Reset Session for a fresh new start



    const handleCloseChat = () => {



        setIsOpen(false);



        setInput('');



        setIsLoading(false);



        setMessages([]); // Clears previous chat history so reopening starts brand new



    };







    const handleToggleChat = () => {



        if (isOpen) {



            handleCloseChat();



        } else {



            setIsOpen(true);



        }



    };







    // Initial welcoming message



    useEffect(() => {



        if (messages.length === 0) {



            const welcomeText = i18n.language === 'hi'



                ? `!   RuralNex AI       , PMEGP/ , ROI ,         !`



                : i18n.language === 'gu'



                ? `!   RuralNex AI   .   , PMEGP/ , ROI       !`



                : `Namaste! I am your RuralNex Business AI Advisor. Ask me any question about your rural business idea, financial DPR calculations, PMEGP / Mudra schemes, or local footfall analysis!`;







            setMessages([{



                id: 'welcome-msg',



                role: 'ASSISTANT',



                content: welcomeText,



                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })



            }]);



        }



    }, [i18n.language, messages.length]);







    // Auto-scroll chat to bottom



    useEffect(() => {



        if (isOpen) {



            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });



        }



    }, [messages, isOpen, isLoading]);







    // Handle Voice Recording / Speech-to-Text



    const toggleSpeechRecognition = () => {



        if (isRecording) {



            if (recognitionRef.current) {



                recognitionRef.current.stop();



            }



            setIsRecording(false);



            return;



        }







        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;



        if (!SpeechRecognition) {



            alert('Voice input is not supported in this browser. Please type your query.');



            return;



        }







        try {



            const recognition = new SpeechRecognition();



            recognition.continuous = false;



            recognition.interimResults = true;



            recognition.lang = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'gu' ? 'gu-IN' : 'en-IN';







            recognition.onstart = () => setIsRecording(true);



            recognition.onresult = (event: any) => {



                const transcript = Array.from(event.results)



                    .map((result: any) => result[0].transcript)



                    .join('');



                setInput(transcript);



            };



            recognition.onerror = () => setIsRecording(false);



            recognition.onend = () => setIsRecording(false);







            recognitionRef.current = recognition;



            recognition.start();



        } catch (e) {



            console.error('Speech recognition error:', e);



            setIsRecording(false);



        }



    };







    // Main Gemini & Backend Chat Query Handler



    const handleSend = async (textToSend?: string) => {



        const queryText = (textToSend || input).trim();



        if (!queryText || isLoading) return;







        const userMsg: Message = {



            id: Date.now().toString(),



            role: 'USER',



            content: queryText,



            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })



        };







        setMessages(prev => [...prev, userMsg]);



        if (!textToSend) setInput('');



        setIsLoading(true);







        try {



            const botResponse = await generateGeminiResponse(queryText, messages);



            



            const botMsg: Message = {



                id: (Date.now() + 1).toString(),



                role: 'ASSISTANT',



                content: botResponse,



                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })



            };







            setMessages(prev => [...prev, botMsg]);



        } catch (error) {



            console.error('Chat error:', error);



            setMessages(prev => [...prev, {



                id: Date.now().toString(),



                role: 'ASSISTANT',



                content: "I'm having trouble processing your query right now. Please try again in a moment.",



                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })



            }]);



        } finally {



            setIsLoading(false);



        }



    };







    // NLP Language & Script Detector



    const detectNLPStyle = (text: string) => {



        const clean = text.trim();



        const lower = clean.toLowerCase();







        // 1. Devanagari Script (Hindi, Marathi, etc.)



        if (/[\u0900-\u097F]/.test(clean)) return 'hi';







        // 2. Gujarati Script



        if (/[\u0A80-\u0AFF]/.test(clean)) return 'gu';







        // 3. Hindi / Hinglish keywords (Romanized Hindi prompts like "muje government schems ke baare me batao")



        if (/\b(kaise|kya|kitna|milega|hai|bhai|chahiye|dene|sakta|karne|shuru|dukan|vyapar|yojana|madad|namaste|haalaat|karo|batao|bataiye|baare|muje|mujhe|samjhao|deni|sahi|ho|bata|batao)\b/.test(lower)) {



            return 'hi';



        }







        // 4. Gujlish (Romanized Gujarati)



        if (/\b(kem|cho|su|tamare|malse|che|bhai|bav|karvu|dookan|vadhare|vyavasay|aapo|naste|gujarata|dusto|avse)\b/.test(lower)) {



            return 'gu';



        }







        return i18n.language || 'en';



    };







// Multilingual Knowledge Generator Engine
const getSmartBusinessFallback = (prompt: string, style: string): string => {
    const lower = prompt.trim().toLowerCase();

    // 1. Greetings & Small Talk
    if (/^(hello|hi|hey|namaste|hallo|kem cho|kaise ho|kya haal|good morning|good afternoon|good evening|who are you|how are you)/.test(lower) || lower === 'hi' || lower === 'hello') {
        if (style === 'hi') {
            return `नमस्कार! मैं **RuralNex AI सलाहकार** हूँ।\n\nआप मुझसे ये पूछ सकते हैं:\n- **मंडी भाव एवं MSP (2026-27)**\n- **ग्रामीण श्रम मजदूरी (2025-26)**\n- **सूक्ष्म-उद्यम एवं कौशल विकास आंकड़े**\n- **PMEGP 35% सब्सिडी एवं मुद्रा लोन**`;
        }
        if (style === 'gu') {
            return `નમસ્તે! હું **RuralNex AI સલાહકાર** છું.\n\nતમે મને આ વિષયે પૂછી શકો છો:\n- **મંડી ભાવ અને MSP (2026-27)**\n- **ગ્રામીણ મજૂરી દર**\n- **PMEGP 35% સબસીડી**`;
        }
        return `Hello! I am **RuralNex AI Advisor**.\n\nYou can ask me about:\n- **Mandi Prices & MSP Rates**\n- **Rural Labour Wages**\n- **Micro-Enterprise Setup & Skill Stats**\n- **PMEGP 35% Subsidy & Mudra Loans**`;
    }

    // 2. Mandi Crop Prices & MSP Queries
    if (lower.includes('mandi') || lower.includes('price') || lower.includes('msp') || lower.includes('wheat') || lower.includes('paddy') || lower.includes('gehun') || lower.includes('dhan') || lower.includes('cotton') || lower.includes('mustard') || lower.includes('sarson') || lower.includes('onion') || lower.includes('bhav') || lower.includes('daam') || lower.includes('bhaav')) {
        if (style === 'hi') {
            return `**न्यूनतम समर्थन मूल्य (MSP) एवं मंडी भाव 2026-27:**\n\n- **गेहूं**: MSP ₹2,585/क्विंटल | बाजार भाव **₹2,672/क्विंटल**\n- **धान (Paddy)**: MSP ₹2,441/क्विंटल | बाजार भाव **₹2,753/क्विंटल**\n- **सरसों**: MSP ₹6,200/क्विंटल | बाजार भाव **₹7,398/क्विंटल**\n- **कपास (Cotton)**: MSP ₹8,267/क्विंटल | बाजार भाव **₹8,564/क्विंटal**\n- **प्याज़ (Onion)**: थोक भाव **₹3,625/क्विंटल**`;
        }
        return `**Mandi Crop Prices & MSP (2026-27):**\n\n- **Wheat**: MSP ₹2,585/qtl | Market Price **₹2,672/qtl**\n- **Paddy (Dhan)**: MSP ₹2,441/qtl | Market Price **₹2,753/qtl**\n- **Mustard**: MSP ₹6,200/qtl | Market Price **₹7,398/qtl**\n- **Cotton**: MSP ₹8,267/qtl | Market Price **₹8,564/qtl**\n- **Onion**: Wholesale **₹3,625/qtl**`;
    }

    // 3. Rural Wages & Labor Rates
    if (lower.includes('wage') || lower.includes('labor') || lower.includes('labour') || lower.includes('majdoori') || lower.includes('wages') || lower.includes('kamdar') || lower.includes('din')) {
        if (style === 'hi') {
            return `**ग्रामीण कृषि मजदूरी दरें (2025-2026):**\n\n- **जुताई / हल चलाएँ**: ₹691.65/दिन (पुरुष)\n- **बुवाई / निराई**: ₹613.31/दिन (पुरुष) | ₹443.87/दिन (महिला)\n- **कटाई / थ्रेसिंग**: ₹623.74/दिन (पुरुष) | ₹423.16/दिन (महिला)\n- **कीटनाशक छिड़काव**: ₹896.83/दिन (पुरुष)\n- **राष्ट्रीय औसत मजदूरी**: **₹420-550/दिन**`;
        }
        return `**Rural Agricultural Labour Wage Rates (2025-2026):**\n\n- **Ploughing / Tilling**: ₹691.65/day (Men)\n- **Sowing / Weeding**: ₹613.31/day (Men) | ₹443.87/day (Women)\n- **Harvesting / Threshing**: ₹623.74/day (Men) | ₹423.16/day (Women)\n- **Plant Protection (Pesticides)**: ₹896.83/day (Men)\n- **National Rural Wage Benchmark**: **₹420-550/day**`;
    }

    // 4. Micro-Enterprises & Skill Training
    if (lower.includes('skill') || lower.includes('enterprise') || lower.includes('micro') || lower.includes('beneficiary') || lower.includes('training') || lower.includes('setup') || lower.includes('dataset')) {
        if (style === 'hi') {
            return `**भारत सूक्ष्म-उद्यम एवं कौशल विकास आंकड़े:**\n\n- **कुल प्रशिक्षित अभ्यर्थी**: 15,39,225\n- **रोजगार प्राप्त**: 8,62,152\n- **स्थापित सूक्ष्म-उद्यम**: **9,57,990**\n- **शीर्ष राज्य:**\n  - मध्य प्रदेश: 2.60 लाख प्रशिक्षित | 91,453 उद्यम\n  - उत्तर प्रदेश: 2.20 लाख प्रशिक्षित | 87,041 उद्यम\n  - महाराष्ट्र: 2.01 लाख प्रशिक्षित | 63,559 उद्यम\n  - गुजरात: 1.06 लाख प्रशिक्षित | 29,704 उद्यम`;
        }
        return `**India Micro-Enterprise & Skill Training Statistics:**\n\n- **Total Skill Trained Candidates**: 1,539,225\n- **Placed in Employment**: 862,152\n- **Micro-Enterprises Established**: **957,990**\n- **Top Performing States:**\n  - Madhya Pradesh: 260,321 trained | 91,453 enterprises\n  - Uttar Pradesh: 219,998 trained | 87,041 enterprises\n  - Maharashtra: 201,199 trained | 63,559 enterprises\n  - Gujarat: 106,668 trained | 29,704 enterprises`;
    }

    // 5. Groundwater & Cooperative Credit
    if (lower.includes('water') || lower.includes('groundwater') || lower.includes('cooperative') || lower.includes('credit') || lower.includes('pani') || lower.includes('jal') || lower.includes('society')) {
        return `**Groundwater Depth & Rural Credit Infrastructure:**\n\n- **Groundwater Table (Jan 2026)**: 16,954 monitoring wells across India. Coastal/Hill zones: **1.2m-4.5m** DTWL; Arid inland (Gujarat & Rajasthan): **8.5m-18.5m** DTWL.\n- **Primary Cooperative Credit Societies**: **2,059 societies** | Total Working Capital: **11.8 Lakh Crore** | Loans Extended: **5.95 Lakh Crore**`;
    }

    // 6. RuralNex Website Features
    if (lower.includes('website') || lower.includes('ruralnex') || lower.includes('app') || lower.includes('kya hai') || lower.includes('features') || lower.includes('help') || lower.includes('kaise use') || lower.includes('baare me')) {
        return `**RuralNex Platform Features:**\n\n- **Dashboard**: Overview of all saved proposals, feasibility scores, and business analytics.\n- **Market Analysis**: 5 km catchment map showing population density, groundwater depth, mandi distance.\n- **Financial DPR**: 5-year forecast, DSCR (>1.75x), ROI (24-32%), break-even analysis.\n- **Govt Schemes**: PMEGP (25-35% subsidy up to 50L), PM Mudra loans, CGTMSE collateral-free credit.\n- **Assessment Wizard**: 11-step guided wizard for bank-ready PDF DPR report.`;
    }

    // 7. Government Schemes & Subsidies
    if (lower.includes('scheme') || lower.includes('schems') || lower.includes('subsidy') || lower.includes('pmegp') || lower.includes('mudra') || lower.includes('cgtmse') || lower.includes('govt') || lower.includes('government') || lower.includes('yojana')) {
        return `**Government Subsidy & Credit Schemes:**\n\n- **PMEGP**: Rural entrepreneurs get **25-35% capital subsidy**. Max loan: 50 Lakh (Manufacturing) / 20 Lakh (Service).\n- **PM Mudra Loan**: Shishu (up to 50k) | Kishore (up to 5L) | Tarun (up to 10L) – no collateral required.\n- **CGTMSE**: Credit guarantee for collateral-free bank loans up to 2 Crores.`;
    }

    // 8. Default Fallback
    return `I understand you are asking about "${prompt}". RuralNex AI provides answers grounded in official datasets including Mandi Prices, Rural Wages, Businesses, Groundwater, and Crop Yield.`;
};

// Direct Gemini API Call & Business Intelligence Engine
const generateGeminiResponse = async (userPrompt: string, history: Message[]): Promise<string> => {



        // Collect any available Gemini or Google API key from storage or env



        const geminiKey = localStorage.getItem('ai_key_gemini') 



            || localStorage.getItem('ai_key_google')



            || (import.meta.env as any).VITE_GEMINI_API_KEY



            || (import.meta.env as any).VITE_GOOGLE_MAPS_API_KEY;







        const detectedStyle = detectNLPStyle(userPrompt);







        // Grounding System Instruction with complete website features, Datasets knowledge, and multi-language rules



        const systemContext = `You are the official AI Business Advisor for RuralNex (ruralnex.com), an advanced AI-powered platform for rural micro-enterprise feasibility, financial planning, and government scheme recommendations in India.







VERIFIED DATA KNOWLEDGE (use this to give accurate answers  do NOT mention file names or dataset names to users):



1. Micro-Enterprise & Skill Training Data (India):



   - All-India Skill Trained: 1,539,225 candidates | Placed in jobs: 862,152 | Micro-Enterprises Established: 957,990.



   - Leading States: Madhya Pradesh (260k trained, 91,453 enterprises), Uttar Pradesh (220k trained, 87,041 enterprises), Maharashtra (201k trained, 63,559 enterprises), Gujarat (107k trained, 29,704 enterprises), Tamil Nadu (50.7k trained, 3.01 Lakh enterprises).



2. Mandi Crop Prices & MSP (2026-27):



   - Paddy (Dhan): MSP 2,441/quintal | Market Price 2,753/quintal | Daily Arrival 11,671 MT



   - Wheat: MSP 2,585/quintal | Market Price 2,672/quintal | Daily Arrival 47,467 MT



   - Cotton: MSP 8,267/quintal | Market Price 8,564/quintal



   - Mustard: MSP 6,200/quintal | Market Price 7,398/quintal



   - Soyabean: MSP 5,708/quintal | Market Price 5,797/quintal



   - Bengal Gram (Chana): MSP 5,875/quintal | Market Price 6,347/quintal



   - Moong: MSP 8,780/quintal | Market Price 8,156/quintal | Tur/Arhar: MSP 8,450 | Market 8,077



   - Onion: 3,625.68/quintal wholesale (daily arrival 16,293 MT)



3. Rural Agricultural Wages (2025-2026):



   - Ploughing/Tilling: 691.65/day (Men)



   - Sowing/Weeding: 613.31/day (Men), 443.87/day (Women)



   - Harvesting/Threshing: 623.74/day (Men), 423.16/day (Women)



   - Plant Protection (Pesticides): 896.83/day | National rural agricultural avg: 420550/day.



4. Groundwater Depth (Jan 2026): 16,954 monitored wells. Coastal/Hill blocks DTWL: 1.2m4.5m; Arid/inland Gujarat & Rajasthan: 8.5m18.5m.



5. Livestock & Dairy: Live animals 156,032 units (61.55 Cr). Dairy produce 10.67 M kgs (225.9 Cr). Animal feed 320.9 M kgs (1,739 Cr).



6. Cooperative Credit: 2,059 primary credit societies | Working Capital 11.8 Lakh Cr | Loans 5.95 Lakh Cr. Maharashtra: 635 societies; Gujarat: 323 societies.







ABOUT RURALNEX PLATFORM:



- Dashboard (/dashboard): Saved proposals, feasibility scores, sector analytics.



- GeoSpatial Analysis (/market): 5 km catchment map  population density, competitor locations, mandi distance, groundwater depth.



- Financial Plan & DPR (/finance): 5-year revenue vs cost forecast, DSCR (>1.75x), ROI (2432%), break-even.



- Govt Schemes (/schemes): PMEGP (25%35% capital subsidy up to 50L), PM Mudra (Shishu/Kishore/Tarun), CGTMSE collateral-free credit.



- Assessment Wizard (/wizard): 11-step wizard  bank-ready DPR PDF.



- What-If Simulator (/simulator) & Business Comparison (/compare).







RESPONSE RULES:



1. Detect language/script from user's message  reply in the same language.



2. Hindi/Hinglish input  respond in pure, natural Devanagari Hindi.



3. Gujarati/Gujlish input  respond in pure Gujarati script.



4. English input  clear, professional English.



5. Give helpful, accurate, direct answers. Do NOT mention internal file names or "dataset" words.



6. Use **bold** for key numbers/terms, bullet points for lists. Keep under 250 words.`;







        // 1. Try Direct Google Gemini REST API (gemini-2.0-flash then gemini-1.5-flash)



        if (geminiKey) {



            const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];



            



            const recentHistory = history.slice(-8).map(m => ({



                role: m.role === 'USER' ? 'user' : 'model',



                parts: [{ text: m.content }]



            }));







            const contents = [



                {



                    role: 'user',



                    parts: [{ text: `[SYSTEM INSTRUCTION]\n${systemContext}` }]



                },



                ...recentHistory,



                {



                    role: 'user',



                    parts: [{ text: userPrompt }]



                }



            ];







            for (const model of geminiModels) {



                try {



                    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;



                    const res = await fetch(endpoint, {



                        method: 'POST',



                        headers: { 'Content-Type': 'application/json' },



                        body: JSON.stringify({ contents })



                    });







                    if (res.ok) {



                        const data = await res.json();



                        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;



                        if (aiText) return aiText;



                    }



                } catch (err) {



                    console.warn(`Direct Gemini API model ${model} failed:`, err);



                }



            }



        }







        // 2. Try Backend Chat API /api/v1/chat/message/
        try {
            const res = await fetch('/api/v1/chat/message/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
                    'X-AI-Provider': 'gemini',
                    'X-AI-Model': 'gemini-2.0-flash'
                },
                body: JSON.stringify({ message: userPrompt })
            });

            if (res.ok) {
                const data = await res.json();
                if (data?.reply) return data.reply;
            }
        } catch (err) {
            console.warn('Backend Chat API failed:', err);
        }

        return getSmartBusinessFallback(userPrompt, detectedStyle);
    };

    const _dummyClean = (style?: string, prompt?: string) => (style || '') + (prompt || '');




    const suggestionPrompts = [



        { label: ' Mandi Prices & MSP 2026', query: 'What are current Mandi crop prices and MSP for Wheat, Paddy, Cotton, and Mustard?' },



        { label: ' Rural Labor Wages', query: 'What is the daily agricultural labor wage rate in rural India?' },



        { label: ' Micro-Enterprise Stats', query: 'How many micro-enterprises have been established across India? Show state-wise data.' },



        { label: ' PMEGP 35% Subsidy', query: 'How does PMEGP scheme work and what capital subsidy does it offer for rural businesses?' },


        { label: ' Mandi Prices & MSP 2026', query: 'What are current Mandi crop prices and MSP for Wheat, Paddy, Cotton, and Mustard in the dataset?' },



        { label: ' Rural Labor Wage Rates', query: 'What is the daily agricultural labor wage rate in rural India according to Rural Wages dataset?' },



        { label: ' Micro-Enterprise Dataset', query: 'How many micro-enterprises and skilled candidates are recorded in the 6. BUSINESSES dataset?' },



        { label: ' PMEGP 35% Subsidy', query: 'Which government scheme offers up to 35% capital subsidy for rural micro-enterprises?' },



        { label: ' DSCR & ROI Ratios', query: 'What is the target DSCR and ROI ratio required for bank DPR feasibility?' },



    ];







    return (



        <>



            {/* Floating Action Button (FAB) fixed at bottom-right corner */}



            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">



                {!isOpen && (



                    <div className="hidden sm:flex items-center gap-1.5 bg-gray-900/90 dark:bg-zinc-800/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-gray-700/50 backdrop-blur-md animate-in fade-in slide-in-from-right-2 duration-300">



                        <RuralNexLogoMark size={16} />



                        <span>{t('chat_title', 'RuralNex AI Advisor')}</span>



                    </div>



                )}



                



                <button



                    type="button"



                    onClick={handleToggleChat}



                    className={`relative p-3.5 sm:p-4 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer group ${



                        isOpen



                            ? 'bg-gray-900 dark:bg-zinc-800 text-white rotate-90 scale-95 border border-gray-700'



                            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105'



                    }`}



                    aria-label="Toggle AI Business Chatbot"



                    title="RuralNex Gemini AI Business Advisor"



                >



                    {/* Glowing outer pulse ring when closed */}



                    {!isOpen && (



                        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping pointer-events-none opacity-75" />



                    )}



                    



                    {isOpen ? (



                        <X size={22} className="shrink-0" />



                    ) : (



                        <div className="flex items-center justify-center relative">



                            <RuralNexLogoMark size={28} className="shrink-0 group-hover:scale-110 transition-transform duration-300" />



                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-emerald-700" />



                        </div>



                    )}



                </button>



            </div>







            {/* Interactive Floating Chat Window */}



            {isOpen && (



                <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-w-[420px] h-[580px] max-h-[calc(100vh-7rem)] bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">



                    



                    {/* Chat Header */}



                    <div className="p-4 bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-zinc-900 text-white border-b border-emerald-800/40 flex items-center justify-between shrink-0 shadow-md">



                        <div className="flex items-center gap-3">



                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-400/30 flex items-center justify-center shadow-inner p-1">



                                <RuralNexLogoMark size={26} />



                            </div>



                            <div>



                                <div className="flex items-center gap-2">



                                    <h3 className="text-sm font-extrabold text-white tracking-tight">RuralNex AI Advisor</h3>



                                </div>



                                <p className="text-[11px] text-emerald-200/80 font-medium truncate max-w-[200px]">



                                    Grounded Business Feasibility AI



                                </p>



                            </div>



                        </div>







                        <div className="flex items-center gap-1.5">



                            <button



                                type="button"



                                onClick={() => setIsAiModalOpen(true)}



                                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 transition cursor-pointer"



                                title="Configure Gemini API Key & Model"



                            >



                                <Key size={15} />



                            </button>



                            <button



                                type="button"



                                onClick={() => setMessages([])}



                                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 transition cursor-pointer"



                                title="Start New Chat Session"



                            >



                                <RefreshCw size={15} />



                            </button>



                            <button



                                type="button"



                                onClick={handleCloseChat}



                                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"



                                title="Close Chat"



                            >



                                <X size={16} />



                            </button>



                        </div>



                    </div>







                    {/* Messages Container */}



                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-black/60">



                        {messages.map((msg) => (



                            <div



                                key={msg.id}



                                className={`flex items-start gap-2.5 ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}



                            >



                                {msg.role === 'ASSISTANT' && (



                                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs p-1">



                                        <RuralNexLogoMark size={20} />



                                    </div>



                                )}







                                <div className={`max-w-[85%] space-y-1 ${msg.role === 'USER' ? 'items-end' : 'items-start'}`}>



                                    <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${



                                        msg.role === 'USER'



                                            ? 'bg-emerald-600 text-white rounded-br-none shadow-xs font-medium'



                                            : 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 border border-gray-200 dark:border-zinc-800 rounded-bl-none shadow-xs'



                                    }`}>



                                        {msg.role === 'ASSISTANT' ? (



                                            <div className="space-y-1">{renderMarkdown(msg.content)}</div>



                                        ) : (



                                            msg.content



                                        )}



                                    </div>



                                    <div className={`text-[10px] text-gray-400 dark:text-zinc-500 font-medium px-1 ${



                                        msg.role === 'USER' ? 'text-right' : 'text-left'



                                    }`}>



                                        {msg.timestamp}



                                    </div>



                                </div>







                                {msg.role === 'USER' && (



                                    <div className="w-7 h-7 rounded-xl bg-gray-800 dark:bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs text-xs font-bold">



                                        U



                                    </div>



                                )}



                            </div>



                        ))}







                        {isLoading && (



                            <div className="flex items-center gap-2.5">



                                <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-2xs p-1 relative">



                                    <RuralNexLogoMark size={20} />



                                    <span className="absolute -inset-0.5 rounded-xl border-2 border-emerald-500/40 border-t-emerald-600 animate-spin pointer-events-none" />



                                </div>



                                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold px-3.5 py-2 bg-emerald-50/90 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">



                                    <Loader2 size={14} className="animate-spin text-emerald-600 dark:text-emerald-400" />



                                    <span>AI is generating answer...</span>



                                </div>



                            </div>



                        )}







                        <div ref={messagesEndRef} />



                    </div>







                    {/* Quick Suggestion Chips */}



                    <div className="px-3 py-2 bg-white dark:bg-[#0c0c0e] border-t border-gray-100 dark:border-zinc-800/80 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">



                        {suggestionPrompts.map((s, idx) => (



                            <button



                                key={idx}



                                onClick={() => handleSend(s.query)}



                                disabled={isLoading}



                                className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-gray-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-semibold border border-gray-200 dark:border-zinc-800 transition cursor-pointer shrink-0 disabled:opacity-50"



                            >



                                {s.label}



                            </button>



                        ))}



                    </div>







                    {/* Input Area */}



                    <div className="p-3 bg-white dark:bg-[#0c0c0e] border-t border-gray-200 dark:border-zinc-800 shrink-0">



                        <form



                            onSubmit={(e) => {



                                e.preventDefault();



                                handleSend();



                            }}



                            className="flex items-center gap-2"



                        >



                            {/* Voice Input Button */}



                            <button



                                type="button"



                                onClick={toggleSpeechRecognition}



                                className={`p-2.5 rounded-xl border transition cursor-pointer ${



                                    isRecording



                                        ? 'bg-red-500 text-white border-red-600 animate-pulse'



                                        : 'bg-gray-100 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'



                                }`}



                                title={isRecording ? 'Stop Recording' : 'Voice Input (Microphone)'}



                            >



                                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}



                            </button>







                            {/* Text Input Field */}



                            <input



                                type="text"



                                value={input}



                                onChange={(e) => setInput(e.target.value)}



                                placeholder={isRecording ? 'Listening...' : 'Ask about business DPR, schemes, ROI...'}



                                disabled={isLoading}



                                className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"



                            />







                            {/* Send Button */}



                            <button



                                type="submit"



                                disabled={!input.trim() || isLoading}



                                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-xs transition cursor-pointer flex items-center justify-center shrink-0"



                                title="Send Message"



                            >



                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}



                            </button>



                        </form>



                    </div>







                </div>



            )}







            {/* AI Model & Key Configuration Modal */}



            <AIModelModal



                isOpen={isAiModalOpen}



                onClose={() => setIsAiModalOpen(false)}



            />



        </>



    );



}



