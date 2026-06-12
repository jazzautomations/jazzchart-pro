
import React from 'react';
import { 
  Music, Sparkles, Camera, PlayCircle, Layers, 
  Cpu, Users, CheckCircle2, ChevronRight, Zap,
  Star, Trophy, ShieldCheck
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="font-black tracking-tighter text-lg uppercase">JAZZCHART <span className="text-blue-500">PRO</span></span>
        </div>
        <button 
          onClick={onStart}
          className="bg-white text-black px-6 py-2 rounded-full font-black text-xs hover:bg-blue-500 hover:text-white transition-all active:scale-95"
        >
          ACESSAR STUDIO
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase animate-pulse">
            <Zap className="w-3 h-3" /> A Nova Era do Estudo de Jazz
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] uppercase">
            Sua Harmonia, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-400">Sem Limites.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            O primeiro ecossistema musical que une Backing Tracks inteligentes, 
            Visão Computacional e IA Generativa para elevar sua performance.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={onStart}
              className="w-full md:w-auto px-10 py-5 bg-blue-600 rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 group"
            >
              COMEÇAR AGORA <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-slate-500 text-sm font-bold">Incluso: Studio Engine v11 & Gemini AI Vision</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 bg-black/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Cpu className="w-8 h-8 text-blue-500" />}
              title="Walking Bass Inteligente"
              description="Esqueça o baixo robótico. Nosso motor utiliza condução de voz e aproximações cromáticas para um feeling de clube de jazz real."
            />
            <FeatureCard 
              icon={<Camera className="w-8 h-8 text-emerald-500" />}
              title="Vision Import (OCR)"
              description="Tire foto de qualquer partitura ou PDF. Nossa IA transcreve a harmonia instantaneamente para o seu grid editável."
            />
            <FeatureCard 
              icon={<Sparkles className="w-8 h-8 text-purple-500" />}
              title="Auditória Harmônica"
              description="Dúvida em um acorde? Peça à IA sugestões de rearmonização, substituições tritônicas e análise teórica profunda."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section (The Offer) */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-black/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Escolha seu <span className="text-blue-500">Nível</span></h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">Pare de brigar com softwares legados</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-8 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase">Standard</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">R$ 0</span>
                  <span className="text-slate-500 text-xs font-bold">/sempre</span>
                </div>
                <p className="text-slate-400 text-sm">Perfeito para quem está começando a ler as primeiras cifras.</p>
                <div className="h-[1px] bg-white/10 w-full" />
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><CheckCircle2 className="w-4 h-4 text-slate-500" /> Acesso a 5 Standards</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><CheckCircle2 className="w-4 h-4 text-slate-500" /> Engine de Áudio Básica</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-300"><CheckCircle2 className="w-4 h-4 text-slate-500" /> Editor Manual</li>
                </ul>
              </div>
              <button onClick={onStart} className="w-full py-4 rounded-xl border border-white/20 font-black text-xs uppercase hover:bg-white/5 transition-all">Começar Grátis</button>
            </div>

            {/* Pro Tier (The Real Offer) */}
            <div className="p-1 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-400 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
              <div className="bg-[#0c0c0e] p-8 rounded-[1.4rem] space-y-8 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">Mais Popular</div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase text-blue-400 flex items-center gap-2">Pioneer Studio <Star className="w-5 h-5 fill-current" /></h3>
                  <div className="flex flex-col">
                    <span className="text-slate-500 line-through text-xs font-bold uppercase">De R$ 197,00</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-white">R$ 47</span>
                      <span className="text-slate-500 text-xs font-bold">,90/mês</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm font-medium">Acesso total à IA e ao motor de áudio ultra-realista v11.</p>
                  <div className="h-[1px] bg-white/10 w-full" />
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-xs font-bold text-blue-100"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Standards Ilimitados</li>
                    <li className="flex items-center gap-2 text-xs font-bold text-blue-100"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Gemini AI Vision (Importação de PDF)</li>
                    <li className="flex items-center gap-2 text-xs font-bold text-blue-100"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Walking Bass v11 (Feeling Real)</li>
                    <li className="flex items-center gap-2 text-xs font-bold text-blue-100"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Auditória e Substituições via IA</li>
                    <li className="flex items-center gap-2 text-xs font-bold text-blue-100"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Backup em Nuvem & Comunidade</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <button onClick={onStart} className="w-full py-5 bg-blue-600 rounded-xl font-black text-sm uppercase shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all active:scale-95">Quero ser Pioneer</button>
                  <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> 7 dias de garantia ou seu dinheiro de volta
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 bg-blue-600/5 border border-blue-500/20 p-6 rounded-2xl max-w-2xl mx-auto flex items-center gap-6">
             <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Trophy className="text-white w-8 h-8" />
             </div>
             <div>
                <h4 className="font-black uppercase text-sm">Oferta Limitada para os Primeiros 100 Usuários</h4>
                <p className="text-xs text-slate-400 font-medium">Os 100 primeiros a assinar o plano Pioneer ganharão o pacote de voicings "Bill Evans Essentials" gratuitamente.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Interactive Showcase - Mockup style */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <h2 className="text-5xl font-black tracking-tighter leading-none uppercase">
              O Studio está nas suas mãos.
            </h2>
            <ul className="space-y-4">
              {[
                "Transposição instantânea em todos os tons",
                "Controle total de mixagem (Piano, Baixo, Bateria)",
                "Editor de grades ultra-rápido estilo Lead Sheet",
                "Comunidade e histórico de versões integrados"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full aspect-video rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl cursor-pointer group-hover:scale-110 transition-transform">
                   <PlayCircle className="w-10 h-10 fill-current" />
                </div>
             </div>
             <div className="absolute bottom-4 left-4 right-4 h-12 glass-panel rounded-xl border border-white/10 flex items-center px-4 gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                   <div className="w-1/3 h-full bg-blue-500" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">01:42 / 04:15</span>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">
            Pronto para soar <br /> como um <span className="text-blue-500 underline decoration-4 underline-offset-8">PRO</span>?
          </h2>
          <button 
            onClick={onStart}
            className="px-16 py-6 bg-white text-black rounded-full font-black text-2xl hover:bg-blue-500 hover:text-white transition-all transform hover:-translate-y-1 shadow-[0_20px_60px_rgba(255,255,255,0.1)]"
          >
            ENTRAR NO STUDIO AGORA
          </button>
          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">150+</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Jazz Standards</span>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">2.5k</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Cifras via OCR</span>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">Zero</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Robotic Feel</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5 bg-black/60 text-center text-slate-600 font-bold text-xs tracking-widest uppercase">
        © 2025 JazzChart Pro Studio • Made for those who hear the changes.
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all hover:bg-white/[0.07] group">
    <div className="mb-6 p-4 rounded-2xl bg-black/40 w-fit group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-black mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-400 leading-relaxed font-medium">{description}</p>
  </div>
);
