import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, ShieldCheck, ChevronRight } from 'lucide-react';
import { useSystemStore } from '../store/useSystemStore';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useSystemStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      addToast({ type: 'WARNING', title: 'Weak Access Key', message: 'Access Key must be at least 6 characters for core encryption.' });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        addToast({ type: 'SUCCESS', title: 'System Access Granted', message: 'Core matrix synchronization established.' });
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) throw error;

        if (data.user && data.session) {
          addToast({ type: 'SUCCESS', title: 'Enlistment Complete', message: 'Welcome to the core, Hunter.' });
        } else {
          addToast({ type: 'INFO', title: 'Transmission Sent', message: 'Check your terminal (email) to verify synchronization link.' });
        }
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      let msg = error.message || 'Anomalous auth error detected.';
      
      if (error.status === 429 || msg.includes('rate limit')) {
        msg = 'Transmission frequency exceeded. Please wait before re-attempting core sync or check Supabase dashboard settings.';
      } else if (msg.includes('Signup is disabled')) {
        msg = 'System Registration is currently locked in the dashboard.';
      }
      
      addToast({ type: 'ERROR', title: 'Link Failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-monolith flex items-center justify-center p-6 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,210,255,0.2) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="scanline absolute inset-0 opacity-10 pointer-events-none" />
      
      <div className="max-w-[440px] w-full relative animate-in fade-in zoom-in-95 duration-700">
        {/* Tactical Corner Accents */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-ethereal-blue/40" />
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-ethereal-blue/40" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-ethereal-blue/40" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-ethereal-blue/40" />

        <div className="glass-panel p-8 md:p-12 relative overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-ethereal-blue/20 blur-xl rounded-full" />
                <div className="relative w-16 h-16 rounded-2xl bg-monolith border-2 border-ethereal-blue/30 flex items-center justify-center transform rotate-45 group hover:rotate-0 transition-transform duration-700">
                    <ShieldCheck className="text-ethereal-blue transform -rotate-45 group-hover:rotate-0 transition-transform duration-700" size={32} />
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black tracking-[0.15em] text-white uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  {isLogin ? 'Access Core' : 'Register Hunter'}
              </h2>
              <div className="flex items-center space-x-2 mt-3">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-ethereal-blue/40" />
                <p className="text-gray-500 text-[8px] font-mono tracking-[0.4em] uppercase">
                    [System Auth v4.0.2]
                </p>
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-ethereal-blue/40" />
              </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                  <Mail size={10} className="mr-1.5 text-ethereal-blue" /> Terminal ID
                </label>
              </div>
              <input
                type="email"
                required
                className="w-full bg-monolith/80 border border-white/10 rounded-xl py-3.5 px-4 text-white font-medium focus:border-ethereal-blue/50 focus:bg-monolith transition-all outline-none text-sm placeholder:text-gray-700"
                placeholder="hunter@system.grid"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                  <Lock size={10} className="mr-1.5 text-ethereal-blue" /> Access Key
                </label>
                {!isLogin && <span className="text-[8px] text-gray-600 font-mono italic">Min 6 chars</span>}
              </div>
              <input
                type="password"
                required
                className="w-full bg-monolith/80 border border-white/10 rounded-xl py-3.5 px-4 text-white font-medium focus:border-ethereal-blue/50 focus:bg-monolith transition-all outline-none text-sm placeholder:text-gray-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 group relative overflow-hidden bg-white text-monolith py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,210,255,0.3)] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-ethereal-blue translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative flex items-center justify-center group-hover:text-white transition-colors duration-500">
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>{isLogin ? 'Initiate Sync' : 'Finalize Enlistment'}</span>
                    <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="group text-gray-500 hover:text-ethereal-blue transition-colors flex flex-col items-center space-y-2"
            >
              <span className="text-[9px] uppercase tracking-[0.2em] font-medium">
                {isLogin ? "New user record detected?" : "Core identity already verified?"}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center border-b border-transparent group-hover:border-ethereal-blue/30 pb-0.5">
                {isLogin ? 'Switch to Registration' : 'Return to Access Hub'}
              </span>
            </button>
          </div>
        </div>

        {/* Decorative System Metadata */}
        <div className="mt-6 flex justify-between px-2">
          <div className="flex space-x-4">
             <div className="flex flex-col">
                <span className="text-[7px] text-gray-600 uppercase font-black tracking-widest">Latency</span>
                <span className="text-[8px] text-green-500 font-mono tracking-tighter">0.024ms</span>
             </div>
             <div className="flex flex-col border-l border-white/5 pl-4">
                <span className="text-[7px] text-gray-600 uppercase font-black tracking-widest">Encryption</span>
                <span className="text-[8px] text-ethereal-blue font-mono tracking-tighter">AES-256</span>
             </div>
          </div>
          <div className="text-right">
             <span className="text-[7px] text-gray-600 uppercase font-black tracking-widest">Node Status</span>
             <span className="block text-[8px] text-gray-500 font-mono tracking-tighter animate-pulse">SYNCHRONIZING...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
