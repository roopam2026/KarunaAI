import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, LogIn, Heart, Compass, Sparkles } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CompassionChat from './components/CompassionChat';
import NotificationSystem from './components/NotificationSystem';
import Logo from './components/Logo';
import AuthPage from './components/AuthPage';
import KindnessJournal from './components/KindnessJournal';
import KarunaIndex from './components/KarunaIndex';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'auth'>('home');
  const [username, setUsername] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const handleAuthSuccess = (email: string, name: string) => {
    setUsername(name);
    setUserEmail(email);
    setCurrentView('home');
  };

  const handleSignOut = () => {
    setUsername(null);
    setUserEmail(null);
  };

  if (currentView === 'auth') {
    return (
      <AuthPage 
        onBack={() => setCurrentView('home')} 
        onSuccess={handleAuthSuccess} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-karuna-bg/90 selection:bg-karuna-olive/20 relative overflow-x-hidden">
      
      {/* Zen Ambient Background Blobs */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] rounded-full bg-karuna-olive/5 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full bg-amber-500/3 blur-[100px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] rounded-full bg-indigo-500/3 blur-[140px] pointer-events-none animate-pulse-slow" />

      {/* Floating Glassmorphic Header */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-stone-200/20">
        <nav className="px-6 py-5 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-karuna-olive/10 flex items-center justify-center text-karuna-olive group-hover:bg-karuna-olive group-hover:text-white transition-all duration-300 shadow-sm">
              <Logo size={22} />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 group-hover:text-karuna-olive transition-colors duration-300">
              KarunaAI
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            {username ? (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline-block text-stone-500 font-light text-xs">
                  Welcome back, <strong className="font-semibold text-stone-800">{username}</strong>
                </span>
                <button 
                  onClick={handleSignOut} 
                  className="text-xs font-semibold bg-stone-100 hover:bg-stone-200/80 text-stone-700 px-4.5 py-2 rounded-full transition-all duration-300 active:scale-95"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setCurrentView('auth')} 
                className="olive-button !py-2.5 !px-5 text-xs inline-flex items-center gap-1.5"
              >
                <LogIn size={13} />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16 relative z-10">
        
        {/* Core Hero Branding Area */}
        <Dashboard />

        {/* Guest Reminder Callout */}
        {!username && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-4xl mx-auto w-full bg-gradient-to-r from-amber-50/70 to-stone-100/50 border border-amber-500/10 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex gap-3 items-start text-left">
              <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <Sparkles size={16} />
              </span>
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Uncover Your Persistent Empathy Sanctuary</h4>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed font-light">
                  Sign in to unlock your personal <strong>Empathy Ledger</strong>, persistent <strong>Reflection Journal</strong>, and track your daily index metrics securely in Cloud/SQLite storage.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('auth')}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-4.5 py-2 rounded-full transition-all shrink-0 shadow-sm active:scale-95"
            >
              Unlock Features
            </button>
          </motion.div>
        )}

        {/* Interactive Dialogue Sanctuary */}
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <div className="text-center sm:text-left">
            <span className="text-[10px] tracking-widest uppercase font-bold text-stone-400 flex items-center justify-center sm:justify-start gap-1.5 mb-1">
              <Compass size={12} className="text-karuna-olive" />
              Mindful Co-Reflection
            </span>
            <h3 className="font-serif text-2xl font-bold text-stone-850">The Dialogue Chamber</h3>
          </div>
          <CompassionChat />
        </div>

        {/* Karuna Index Interactive Calculator */}
        <div className="max-w-4xl mx-auto w-full">
          <KarunaIndex 
            userEmail={userEmail} 
            username={username} 
            onSignInClick={() => setCurrentView('auth')} 
          />
        </div>

        {/* Dynamic Empathy Ledger & Journaling Hub (displayed only after sign-in) */}
        {username && userEmail && (
          <div className="max-w-4xl mx-auto w-full">
            <KindnessJournal userEmail={userEmail} username={username} />
          </div>
        )}

        {/* Micro-Wisdom Notification Engine */}
        <NotificationSystem />

      </main>

      {/* Structured Footer */}
      <footer className="bg-stone-900 text-stone-400 py-16 px-6 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-karuna-olive">
                <Logo size={18} />
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-tight">KarunaAI</span>
            </div>
            <p className="text-xs text-stone-500 font-light mt-1 text-center md:text-left max-w-sm leading-relaxed">
              Empowering global empathy. Merging introspective wisdom with outward prosocial habits for a unified society.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-3.5">
            <p className="text-xs text-stone-500 font-mono">© 2026 KarunaAI. Crafted with mindful awareness.</p>
            <div className="flex gap-6 text-xs font-semibold">
              <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors duration-300">Terms of Use</a>
              <a href="#" className="hover:text-white transition-colors duration-300">Get Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
