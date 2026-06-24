import React, { useState } from 'react';
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
    <div className="min-h-screen bg-karuna-bg selection:bg-karuna-olive/20">
      {/* Navigation */}
      <nav className="px-6 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Logo className="text-karuna-olive" size={32} />
          <span className="font-serif text-2xl font-bold tracking-tight text-stone-800">KarunaAI</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-stone-500">
          {username ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-stone-600 font-light text-xs">
                Welcome back, <strong className="font-medium text-stone-800">{username}</strong>
              </span>
              <button 
                onClick={handleSignOut} 
                className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-full transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setCurrentView('auth')} 
              className="olive-button py-2 text-xs"
            >
              Sign In / Sign Up
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-20 space-y-12">
        {/* Hero / Dashboard Section */}
        <Dashboard />

        {/* Interactive Section */}
        <div className="max-w-4xl mx-auto w-full">
          <CompassionChat />
        </div>

        {/* Karuna Index Calculator */}
        <div className="max-w-4xl mx-auto w-full">
          <KarunaIndex 
            userEmail={userEmail} 
            username={username} 
            onSignInClick={() => setCurrentView('auth')} 
          />
        </div>

        {/* Second App Interface (Kindness Ledger & Reflection Journal) - displayed after sign in */}
        {username && userEmail && (
          <div className="max-w-4xl mx-auto w-full">
            <KindnessJournal userEmail={userEmail} username={username} />
          </div>
        )}

        {/* Global Pop-up Notification Engine */}
        <NotificationSystem />


      </main>

      <footer className="bg-stone-900 text-stone-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Logo className="text-karuna-olive" size={24} />
            <span className="font-serif text-xl font-bold text-white">KarunaAI</span>
          </div>
          <p className="text-xs">© 2026 KarunaAI. Augmenting humanity through compassion.</p>
          <div className="flex gap-6 text-xs font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

