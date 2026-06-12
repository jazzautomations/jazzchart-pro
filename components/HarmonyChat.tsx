
import React, { useState, useRef, useEffect } from 'react';
import { Song, MeasureAnnotation } from '../types';
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
    <div className="flex flex-col h-full bg-[#0c0c0e] border-l border-white/5 w-96 shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Harmony Insight</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">IA Expert Analysis</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-purple-600/10 border-purple-500/20 text-purple-400'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed font-medium ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5'}`}>
                {msg.content.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
            </div>
            
            {/* Permission Prompt for Annotations */}
            {msg.pendingAnnotations && !msg.isApplied && (
              <div className="ml-11 p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl space-y-3 w-[80%]">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Sugestão de Anotação</p>
                <p className="text-[11px] text-slate-400 italic">A IA identificou {msg.pendingAnnotations.length} movimentos harmônicos importantes. Deseja marcar no chart?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => applyAction(i)}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-purple-500 transition-all"
                  >
                    <Check className="w-3 h-3" /> Aplicar
                  </button>
                  <button 
                    onClick={() => setMessages(prev => prev.map((m, idx) => idx === i ? { ...m, pendingAnnotations: undefined } : m))}
                    className="p-2 border border-white/10 text-slate-500 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <Ban className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            
            {msg.isApplied && (
              <div className="ml-11 flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                <Check className="w-3 h-3" /> Anotações aplicadas ao chart
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white/5 p-4 rounded-2xl text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">
              Escutando os acordes...
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5">
        <div className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Analise o ii-V-I do compasso 4..."
            className="w-full bg-[#070709] border border-white/5 rounded-xl pl-4 pr-12 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all disabled:opacity-50 active:scale-90"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
