'use client';

import { useChat } from '@ai-sdk/react';
import React, { useEffect, useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { saveChatMessages, loadChatMessages} from '@/utils/supabase/chatSupabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * @module ChatAstrologico
 * @description A client component that renders a visually styled chat interface
 * for interacting with an AI astrologer. It uses the `@ai-sdk/react` `useChat` hook
 * to manage chat state and communication with the backend API.
 * The component includes a scrollable message history, styled user and assistant messages,
 * a loading indicator, and a themed input form.
 */
export default function ChatAstrologico() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false);
    const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);

    // Helper functions for localStorage
    const saveMessagesToLocalStorage = (chatId: string, msgs: UIMessage[]) => {
        localStorage.setItem(`chat-${chatId}`, JSON.stringify(msgs));
    };

    const loadMessagesFromLocalStorage = (chatId: string): UIMessage[] => {
        const storedMessages = localStorage.getItem(`chat-${chatId}`);
        return storedMessages ? JSON.parse(storedMessages) : [];
    };

    const clearMessagesFromLocalStorage = (chatId: string) => {
        localStorage.removeItem(`chat-${chatId}`);
    };

    const saveLastActiveChatId = (chatId: string) => {
        localStorage.setItem('lastActiveChatId', chatId);
    };

    const loadLastActiveChatId = (): string | null => {
        return localStorage.getItem('lastActiveChatId');
    };

    /**
     * Extrae texto legible de un mensaje devuelto por el SDK.
     * Acepta múltiples formatos (string, { content }, { text }, parts[]),
     * y devuelve siempre un string seguro para renderizar.
     * @param msg Mensaje en crudo proporcionado por el SDK
     * @returns Texto plano extraído del mensaje
     */
    const extractMessageText = (msg: unknown): string => {
        if (msg == null) return "";
        if (typeof msg === 'string') return msg;
        const m = msg as Record<string, unknown>;
        // content suele ser string en muchos providers
        if (typeof m.content === 'string') return m.content;
        // some providers use 'text'
        if (typeof m.text === 'string') return m.text;
        // parts puede ser un array de fragmentos
        if (Array.isArray(m.parts)) {
            return (m.parts as unknown[]).map(p => {
                if (typeof p === 'string') return p;
                if (p && typeof p === 'object') {
                    const pp = p as Record<string, unknown>;
                    if (typeof pp.text === 'string') return pp.text;
                }
                return '';
            }).join('');
        }
        // content como objeto con propiedades internas
        if (m.content && typeof m.content === 'object') {
            // content puede ser un objeto o un array de fragmentos
            const cont = m.content as unknown;
            if (Array.isArray(cont)) {
                const first = cont[0];
                if (typeof first === 'string') return first;
                if (first && typeof first === 'object') {
                    const f = first as Record<string, unknown>;
                    if (typeof f.text === 'string') return f.text;
                }
            } else if (typeof cont === 'object') {
                const cObj = cont as Record<string, unknown>;
                if (typeof cObj.text === 'string') return cObj.text;
            }
            return '';
        }
        return '';
    };

    useEffect(() => {
        const fetchUserAndChatId = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);

            const chatIdFromUrl = searchParams.get('id');
            if (!chatIdFromUrl) {
                const lastActive = loadLastActiveChatId();
                if (lastActive) {
                    router.replace(`/?id=${lastActive}`);
                    setCurrentChatId(lastActive);
                } else {
                    const newChatId = uuidv4();
                    router.replace(`/?id=${newChatId}`);
                    setCurrentChatId(newChatId);
                    saveLastActiveChatId(newChatId);
                }
            } else {
                setCurrentChatId(chatIdFromUrl);
                saveLastActiveChatId(chatIdFromUrl);
            }
        };
        fetchUserAndChatId();
    }, [router, searchParams]); // Depend on router and searchParams

    const { messages, sendMessage, status, setMessages } = useChat({
        id: currentChatId || undefined, // Pass chat ID to useChat
        messages: initialMessages, // Pass initial messages
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
        onFinish: async (result) => {
            if (currentChatId && result.messages.length > 0) {
                const allMessages = result.messages; // Usar el array completo de mensajes del resultado
                saveMessagesToLocalStorage(currentChatId, allMessages);
                if (userId) {
                    await saveChatMessages({ chat_id: currentChatId, messages: allMessages, user_id: userId });
                }
            }
        },
    });
    const [input, setInput] = useState('');
    const isLoading = status !== 'ready';
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadInitialChat = async () => {
            if (currentChatId && !initialMessagesLoaded) {
                let loadedMsgs: UIMessage[] = [];
                if (userId) {
                    // User is logged in, try to load from Supabase
                    const supabaseMessages = await loadChatMessages(currentChatId, userId);
                    if (supabaseMessages && supabaseMessages.length > 0) {
                        loadedMsgs = supabaseMessages;
                        clearMessagesFromLocalStorage(currentChatId); // Supabase prevails, clear local
                    } else {
                        // No Supabase messages, check localStorage
                        const localMessages = loadMessagesFromLocalStorage(currentChatId);
                        if (localMessages.length > 0) {
                            loadedMsgs = localMessages;
                            // Upload local messages to Supabase if user is logged in
                            await saveChatMessages({ chat_id: currentChatId, messages: localMessages, user_id: userId });
                            clearMessagesFromLocalStorage(currentChatId); // Clear local after uploading
                        }
                    }
                } else {
                    // User not logged in, load from localStorage
                    loadedMsgs = loadMessagesFromLocalStorage(currentChatId);
                }

                if (loadedMsgs.length > 0) {
                    setInitialMessages(loadedMsgs);
                    setMessages(loadedMsgs); // Update useChat's internal messages
                }
                setInitialMessagesLoaded(true);
            }
        };
        loadInitialChat();
    }, [userId, currentChatId, initialMessagesLoaded, setMessages]); // Add setMessages to dependencies

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return;
        // Cast a unknown->UIMessage para cumplir la firma tipada del SDK
        sendMessage({ role: 'user', content: input.trim() } as unknown as UIMessage);
        setInput('');
    };

    return (
        <div className="w-full flex flex-col h-[75vh] bg-white rounded-2xl shadow-2xl border border-gray-200">
            {/* Encabezado del Chat */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-center text-gray-800">
                    Consulta con la Astróloga Xiomara
                </h2>
            </div>

            {/* Contenedor de Mensajes */}
            <div
                ref={chatContainerRef}
                className="flex-1 p-6 overflow-y-auto space-y-6"
            >
                {messages.length > 0 ? (
                    // Tratar messages como array de registros desconocidos y extraer de forma segura
                    (messages as unknown as Record<string, unknown>[]).map((m: Record<string, unknown>) => {
                        const role = (m.role as string) ?? 'assistant';
                        const text = extractMessageText(m);
                        return (
                            <div
                                key={(m.id as string) ?? Math.random()}
                                className={`w-full flex gap-3 ${role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {role !== 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold flex-shrink-0">
                                        Xio
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] p-3 rounded-2xl text-black whitespace-pre-wrap shadow-md ${role === 'user'
                                            ? 'bg-violet-300 rounded-br-none'
                                            : 'bg-violet-200 rounded-bl-none'
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap">{text || <span className="text-gray-500">[sin contenido]</span>}</div>
                                </div>
                                {role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                                        Tú
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="w-full text-center text-gray-500 h-full flex flex-col justify-center items-center">
                        <p className="text-lg">
                            Mi enfoque como astróloga psicológica no es decirte qué pasará, sino ayudarte a comprender quién eres.
                        </p>
                        <p className="text-base mt-2">
                            ¿Cuál es el desafío que buscas comprender más profundamente en tu vida ahora mismo?
                        </p>
                    </div>
                )}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="w-full flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold flex-shrink-0">
                            Xio
                        </div>
                        <div className="max-w-lg p-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none shadow-md">
                            <div className="flex items-center justify-center gap-2">
                                <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Formulario de Envío */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
                    <input
                        id="chat-input"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-black transition-shadow duration-200"
                        value={input}
                        placeholder="Escribe tu pregunta aquí..."
                        onChange={e => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-300 disabled:cursor-not-allowed transition-transform duration-200 active:scale-95"
                        disabled={isLoading || !input.trim()}
                        aria-label="Enviar mensaje"
                    >
                        <SendHorizontal size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}