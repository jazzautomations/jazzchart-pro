import React, { useState, useRef, useEffect } from 'react';
import { Song } from '../types';
import { chatWithHarmony } from '../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles, X, Check, Ban } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
  pendingAnnotations?: { measureIndex: number, color?: string, label?: string, scale?: string }[];
  isApplied?: boolean;
}

interface HarmonyChatProps {
  song: Song;
  onClose: () => void;
  onApplyAnnotations: (annotations: any[]) => void;
}

export const HarmonyChat: React.FC<HarmonyChatProps> = ({ song, onClose, onApplyAnnotations }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: `Olá! Eu sou o seu consultor harmônico. Posso te ajudar a analisar o chart de **${song.title}**. O que você gostaria de saber sobre esses acordes?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const response = await chatWithHarmony(song, userMsg, history);
      
      let pendingAnn = undefined;
      if (response.functionCalls && response.functionCalls.length > 0) {
        pendingAnn = response.functionCalls[0].args.annotations;
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        content: response.text || "Análise preparada. Deseja visualizar no chart?", 
        pendingAnnotations: pendingAnn 
      }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Desculpe, tive um problema ao processar sua análise harmônica. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyAction = (index: number) => {
    const msg = messages[index];
    if (msg.pendingAnnotations) {
      onApplyAnnotations(msg.pendingAnnotations);
      setMessages(prev => prev.map((m, i) => i === index ? { ...m, isApplied: true } : m));
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Harmony AI</h3>
            <p className="text-[10px] text-zinc-500">Análise harmônica</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                {msg.content.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
            </div>
            
            {msg.pendingAnnotations && !msg.isApplied && (
              <div className="ml-8 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2 w-[80%]">
                <p className="text-[10px] font-bold text-purple-400 uppercase">Sugestão de Anotação</p>
                <p className="text-[11px] text-zinc-400">A IA identificou {msg.pendingAnnotations.length} movimentos harmônicos. Marcar no chart?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => applyAction(i)}
                    className="flex-1 py-1.5 bg-purple-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-purple-400"
                  >
                    <Check className="w-3 h-3" /> Aplicar
                  </button>
                  <button 
                    onClick={() => setMessages(prev => prev.map((m, idx) => idx === i ? { ...m, pendingAnnotations: undefined } : m))}
                    className="p-1.5 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800"
                  >
                    <Ban className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            
            {msg.isApplied && (
              <div className="ml-8 flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <Check className="w-3 h-3" /> Aplicado ao chart
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Loader2 className="w-3 h-3 animate-spin" />
            </div>
            <div className="bg-zinc-800 p-3 rounded-2xl text-[10px] text-zinc-500 animate-pulse">
              Analisando...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800 shrink-0">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Analise o ii-V-I do compasso 4..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-4 pr-10 py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
