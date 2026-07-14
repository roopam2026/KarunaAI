import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, X, Check, RefreshCw, Volume2, Info, Star } from 'lucide-react';
import { generatePositiveQuoteOrNudge } from '../services/gemini';

interface Notification {
  id: string;
  type: 'quote' | 'nudge';
  title: string;
  quoteText?: string;
  author?: string;
  action?: string;
  why?: string;
}

const STATIC_QUOTES = [
  {
    type: 'quote' as const,
    title: 'Daily Wisdom',
    quoteText: 'Compassion is not a relationship between the healer and the wounded. It\'s a relationship between equals. Only when we know our own darkness well can we be present with the darkness of others.',
    author: 'Pema Chödrön',
  },
  {
    type: 'quote' as const,
    title: 'Outrospective Insight',
    quoteText: 'Could a greater miracle take place than for us to look through each other\'s eyes for an instant?',
    author: 'Henry David Thoreau',
  },
  {
    type: 'quote' as const,
    title: 'Quiet Truth',
    quoteText: 'We are here to awaken from our illusion of separateness.',
    author: 'Thich Nhat Hanh',
  },
  {
    type: 'quote' as const,
    title: 'Language of Humanity',
    quoteText: 'Kindness is the language which the deaf can hear and the blind can see.',
    author: 'Mark Twain',
  },
  {
    type: 'quote' as const,
    title: 'Graceful Intention',
    quoteText: 'The smallest act of kindness is worth more than the grandest intention.',
    author: 'Oscar Wilde',
  }
];

const STATIC_NUDGES = [
  {
    type: 'nudge' as const,
    title: 'Micro-Gratitude',
    action: 'Reflect on a person who made your meal, water, or electricity possible today. Silently acknowledge the invisible chain of human effort that supports you.',
    why: 'Expanding appreciation outwards anchors us in humility and community connection.',
  },
  {
    type: 'nudge' as const,
    title: 'Compassionate Listening',
    action: 'In your next conversation, wait a full two seconds after the other person finishes speaking before responding.',
    why: 'Taking a pause demonstrates to the speaker that their words were truly received and weighed, rather than simply reacted to.',
  },
  {
    type: 'nudge' as const,
    title: 'Unseen Kindness',
    action: 'Identify a minor mess in a shared space (kitchen, hallway, or desk) and tidy it without seeking recognition or telling anyone.',
    why: 'Anonymity ensures our kindness remains pure and reinforces a collective duty of care.',
  },
  {
    type: 'nudge' as const,
    title: 'Warm Connection',
    action: 'Send a quick text message to an old friend you haven\'t spoken with in weeks, sharing one specific happy memory you have of them.',
    why: 'Proactive warmth disrupts social friction and nurtures mutual reassurance.',
  },
  {
    type: 'nudge' as const,
    title: 'The Forgiveness Pause',
    action: 'Recall a mild irritation caused by someone today. Release the resentment and wish that person ease, recognizing that they too have hidden struggles.',
    why: 'Outrospection reminds us that others acts are often symptoms of their own burdens, not deliberate attacks on us.'
  }
];

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [completedCount, setCompletedCount] = useState<number>(() => {
    const saved = localStorage.getItem('karuna_completed_nudges_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streakCount, setStreakCount] = useState<number>(() => {
    const saved = localStorage.getItem('karuna_nudges_streak');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [recentCompletedTitle, setRecentCompletedTitle] = useState('');

  // Auto-trigger an initial toast and set background cycle
  useEffect(() => {
    // Initial welcome toast after 8 seconds
    const initialTimer = setTimeout(() => {
      triggerRandomNotification();
    }, 8000);

    // Periodic toast interval (every 60 seconds)
    const periodicInterval = setInterval(() => {
      triggerRandomNotification();
    }, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(periodicInterval);
    };
  }, []);

  const triggerRandomNotification = () => {
    const isQuote = Math.random() > 0.5;
    let selected: any;
    if (isQuote) {
      selected = STATIC_QUOTES[Math.floor(Math.random() * STATIC_QUOTES.length)];
    } else {
      selected = STATIC_NUDGES[Math.floor(Math.random() * STATIC_NUDGES.length)];
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      ...selected
    };

    setNotifications((prev) => [...prev.slice(-1), newNotification]); // Keep max 2 active toasts on screen
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const triggerAIMicroWisdom = async () => {
    if (isLoadingAI) return;
    setIsLoadingAI(true);
    try {
      const data = await generatePositiveQuoteOrNudge();
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: data.type || 'nudge',
        title: data.title || 'AI Compassion Spark',
        quoteText: data.quoteText,
        author: data.author,
        action: data.action,
        why: data.why
      };
      setNotifications((prev) => [...prev.slice(-1), newNotification]);
    } catch (err) {
      console.error(err);
      triggerRandomNotification();
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleCompleteNudge = (nudgeTitle: string, id: string) => {
    const newCount = completedCount + 1;
    const newStreak = streakCount + 1;
    setCompletedCount(newCount);
    setStreakCount(newStreak);
    localStorage.setItem('karuna_completed_nudges_count', newCount.toString());
    localStorage.setItem('karuna_nudges_streak', newStreak.toString());

    // Trigger storage event manually to sync other components
    window.dispatchEvent(new Event('storage'));

    setRecentCompletedTitle(nudgeTitle);
    setShowCelebration(true);
    removeNotification(id);

    // Dismiss celebration banner after 3.5 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 3500);
  };

  // Speaks aloud the notification text
  const speakNotification = (notif: Notification) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    let speakText = '';
    if (notif.type === 'quote') {
      speakText = `${notif.title}. ${notif.quoteText}. By ${notif.author}.`;
    } else {
      speakText = `${notif.title} nudge. Action to take: ${notif.action}. Reasoning: ${notif.why}.`;
    }

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')) || 
                        voices.find(v => v.lang.startsWith('en'));
    if (naturalVoice) utterance.voice = naturalVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Toast Pop-up Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 w-full max-w-[360px] pointer-events-none">
        
        {/* Silent AI spark helper launcher card */}
        <div className="pointer-events-auto self-end">
          <button
            onClick={triggerAIMicroWisdom}
            disabled={isLoadingAI}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-white/95 text-karuna-olive hover:text-white hover:bg-karuna-olive transition-all px-4 py-2 rounded-full border border-stone-200/50 shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Sparkles size={11} className={isLoadingAI ? "animate-spin" : "animate-pulse"} />
            <span>{isLoadingAI ? "Generating insight..." : "Seek Micro-Wisdom"}</span>
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="pointer-events-auto w-full bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/40 shadow-xl overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-karuna-olive flex items-center gap-1.5">
                    <Sparkles size={11} className="text-amber-500 animate-pulse" />
                    {notif.title}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => speakNotification(notif)}
                      className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors"
                      title="Listen out loud"
                    >
                      <Volume2 size={12} />
                    </button>
                    <button
                      onClick={() => removeNotification(notif.id)}
                      className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors"
                      title="Dismiss"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                {notif.type === 'quote' ? (
                  <div className="space-y-2">
                    <p className="font-serif text-sm italic text-stone-800 leading-relaxed font-light">
                      "{notif.quoteText}"
                    </p>
                    <p className="text-right text-[9px] font-bold tracking-widest text-stone-400 uppercase">
                      — {notif.author}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm font-semibold text-stone-850 leading-snug">
                      {notif.action}
                    </p>
                    <p className="text-[11px] text-stone-500 leading-relaxed font-light">
                      <strong className="font-semibold text-karuna-olive uppercase text-[9px] tracking-wider block mb-0.5">Focus Intent:</strong> {notif.why}
                    </p>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  {notif.type === 'nudge' ? (
                    <button
                      onClick={() => handleCompleteNudge(notif.title, notif.id)}
                      className="text-[10px] bg-karuna-olive/10 hover:bg-karuna-olive hover:text-white text-karuna-olive transition-all px-3 py-1.5 rounded-full flex items-center gap-1 font-bold uppercase tracking-wider"
                    >
                      <Check size={11} />
                      <span>Accept Habit</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => removeNotification(notif.id)}
                      className="text-[10px] text-stone-500 hover:text-stone-800 font-bold uppercase tracking-wider hover:underline"
                    >
                      Absorb Truth
                    </button>
                  )}
                  
                  <span className="text-[10px] font-mono text-stone-400 font-semibold uppercase tracking-wider">
                    {notif.type === 'quote' ? 'Wisdom' : 'Habit Nudge'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Celebration Notification Overlay (Top Slider) */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white rounded-2xl px-6 py-4.5 shadow-2xl border border-stone-800/80 max-w-md w-full mx-auto flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Star size={18} className="fill-current animate-pulse" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-[9px] font-bold tracking-widest text-amber-400 uppercase block mb-0.5">
                Compassionate Achievement
              </span>
              <h4 className="text-sm font-semibold text-white">Habit Nudge Accepted!</h4>
              <p className="text-[11px] text-stone-300 font-light mt-0.5">
                Earned +5 points toward your total Karuna Index. Daily streak: <strong className="font-semibold text-white">{streakCount} days</strong>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
