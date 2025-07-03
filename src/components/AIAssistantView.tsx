
import React, { useState, useEffect, useRef } from 'react';
import { Drug, Transaction } from '../types';
import { getAIChatResponse } from '../services/geminiService';
import { SparklesIcon } from './icons/Icons';

interface AIAssistantViewProps {
    drugs: Drug[];
    transactions: Transaction[];
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AIAssistantView: React.FC<AIAssistantViewProps> = ({ drugs, transactions }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: 'สวัสดีค่ะ ฉันคือ "กาหลง AI" ผู้ช่วยจัดการคลังยาของคุณ มีอะไรให้ช่วยไหมคะ? ลองถามเกี่ยวกับสต็อกยาหรือประวัติการทำรายการได้เลยค่ะ' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMessage = input.trim();
        if (!userMessage || isLoading) return;

        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await getAIChatResponse(userMessage, drugs, transactions);
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { sender: 'ai', text: 'ขออภัยค่ะ เกิดข้อผิดพลาดบางอย่าง' }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const AiMessageBubble: React.FC<{text: string}> = ({text}) => (
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <SparklesIcon className="w-6 h-6" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3 max-w-lg">
                <p className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }}></p>
            </div>
        </div>
    );
    
    const UserMessageBubble: React.FC<{text: string}> = ({text}) => (
        <div className="flex justify-end">
             <div className="bg-blue-600 text-white rounded-lg p-3 max-w-lg">
                <p className="text-sm">{text}</p>
            </div>
        </div>
    );


    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">ผู้ช่วย AI (กาหลง AI)</h2>
                <p className="text-sm text-gray-500">สอบถามข้อมูลคลังยาด้วยภาษาที่คุณคุ้นเคย</p>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                   msg.sender === 'ai' 
                    ? <AiMessageBubble key={index} text={msg.text} /> 
                    : <UserMessageBubble key={index} text={msg.text} />
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3 max-w-lg">
                           <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="พิมพ์คำถามของคุณที่นี่..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center w-24"
                    >
                        {isLoading ? 'กำลังส่ง...' : 'ส่ง'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIAssistantView;
