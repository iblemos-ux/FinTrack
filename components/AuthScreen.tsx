
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LayoutDashboard, Receipt, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;
                setMessage('Verifique seu e-mail para confirmar o cadastro!');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-primary p-8 text-center">
                    <div className="mx-auto size-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 backdrop-blur-sm">
                        <LayoutDashboard size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">FinTrack</h1>
                    <p className="text-blue-100">Gerencie suas finanças com inteligência</p>
                </div>

                <div className="p-8">
                    <div className="flex gap-4 mb-8 bg-gray-50 p-1 rounded-xl">
                        <button
                            onClick={() => { setIsSignUp(false); setError(null); setMessage(null); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignUp ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setIsSignUp(true); setError(null); setMessage(null); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignUp ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Cadastro
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">E-mail</label>
                            <input
                                type="email"
                                required
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-gray-800"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Senha</label>
                            <input
                                type="password"
                                required
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-gray-800"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        {message && (
                            <div className="p-4 bg-green-50 text-green-700 text-sm rounded-xl font-medium animate-in fade-in slide-in-from-top-2">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                isSignUp ? 'Criar Conta' : 'Entrar'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
