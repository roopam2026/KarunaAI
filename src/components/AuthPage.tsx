import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowLeft, Check, Sparkles } from 'lucide-react';
import Logo from './Logo';

interface AuthPageProps {
  onBack: () => void;
  onSuccess: (username: string) => void;
}

export default function AuthPage({ onBack, onSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) return;

    setIsLoading(true);
    // Simulate quiet delay for authentication API
    setTimeout(() => {
      setIsLoading(false);
      const displayDisplayName = isSignUp ? name : email.split('@')[0];
      setSuccessMsg(isSignUp ? 'Account created successfully!' : 'Welcome back to KarunaAI!');
      
      // Auto-return on success after brief presentation of success state
      setTimeout(() => {
        onSuccess(displayDisplayName);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-karuna-bg relative overflow-hidden">
      {/* Decorative calm background elements */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-karuna-olive/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left branding information pane (4 columns / hidden on mobile) */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-center pr-8 space-y-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-stone-500 hover:text-karuna-olive transition-colors text-sm font-medium w-fit mb-4"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-3">
            <Logo className="text-karuna-olive" size={40} />
            <span className="font-serif text-3xl font-bold tracking-tight text-stone-800">KarunaAI</span>
          </div>

          <p className="text-stone-600 leading-relaxed font-light text-base">
            "In a world where you can be anything, be kind." Join a sanctuary built on the power of compassionate intelligence.
          </p>

          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-karuna-olive/10 text-karuna-olive flex items-center justify-center shrink-0 mt-0.5">
                <Check size={14} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-700">Reflective Journey</h4>
                <p className="text-xs text-stone-500">Track and explore your personal emotional states over sessions.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-karuna-olive/10 text-karuna-olive flex items-center justify-center shrink-0 mt-0.5">
                <Check size={14} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-700">Outrospection Framework</h4>
                <p className="text-xs text-stone-500">Engage in prosocial triggers to change outward perspectives.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right card form pane (7 columns) */}
        <div className="md:col-span-7">
          <div className="md:hidden flex justify-between items-center mb-6">
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 text-stone-500 hover:text-karuna-olive transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1.5">
              <Logo className="text-karuna-olive" size={24} />
              <span className="font-serif text-lg font-bold text-stone-800">KarunaAI</span>
            </div>
          </div>

          <motion.div 
            layout 
            className="card p-8 md:p-12 shadow-md relative overflow-hidden bg-white"
          >
            <AnimatePresence mode="wait">
              {successMsg ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 ring-8 ring-emerald-500/5">
                    <Check size={32} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-stone-800 mb-2">{successMsg}</h3>
                  <p className="text-stone-500 text-sm">Preparing your supportive conversational dashboard...</p>
                </motion.div>
              ) : (
                <motion.div
                  key={isSignUp ? 'signup' : 'signin'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <span className="text-xs font-semibold uppercase tracking-widest text-karuna-olive flex items-center gap-1.5 mb-2">
                      <Sparkles size={12} />
                      {isSignUp ? 'New Sanctuary' : 'Welcome Back'}
                    </span>
                    <h2 className="text-3xl font-serif text-stone-800">
                      {isSignUp ? 'Begin your journey' : 'Sign in to KarunaAI'}
                    </h2>
                    <p className="text-stone-500 text-sm mt-1">
                      {isSignUp ? 'Create an account to track updates and cultivate empathy.' : 'Step inside to continue where you left off.'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {isSignUp && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-stone-600 block">Name</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                            <User size={18} />
                          </span>
                          <input 
                            type="text" 
                            required
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 focus:border-karuna-olive/50 focus:ring-4 focus:ring-karuna-olive/5 rounded-2xl py-3 pl-11 pr-4 text-sm transition-all text-stone-800 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-600 block">Email Address</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                          <Mail size={18} />
                        </span>
                        <input 
                          type="email" 
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:border-karuna-olive/50 focus:ring-4 focus:ring-karuna-olive/5 rounded-2xl py-3 pl-11 pr-4 text-sm transition-all text-stone-800 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-stone-600 block">Password</label>
                        {!isSignUp && (
                          <a href="#" className="text-xs text-karuna-olive hover:underline">Forgot?</a>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                          <Lock size={18} />
                        </span>
                        <input 
                          type="password" 
                          required
                          placeholder="Your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 focus:border-karuna-olive/50 focus:ring-4 focus:ring-karuna-olive/5 rounded-2xl py-3 pl-11 pr-4 text-sm transition-all text-stone-800 outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="olive-button w-full py-3.5 text-sm mt-2 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>{isSignUp ? 'Create Sanctuary' : 'Enter Sanctuary'}</span>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                    <p className="text-sm text-stone-500">
                      {isSignUp ? 'Already on this path?' : 'New to Outrospection?'}
                      <button 
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setSuccessMsg(null);
                        }}
                        className="text-karuna-olive font-medium ml-1.5 hover:underline"
                      >
                        {isSignUp ? 'Sign In instead' : 'Create an Account'}
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
