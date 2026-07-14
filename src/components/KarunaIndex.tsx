import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, BookOpen, Heart, Sparkles, Activity, Award, 
  HelpCircle, ChevronRight, ChevronLeft, RefreshCw, ShieldAlert, 
  Info, Star, LogIn 
} from 'lucide-react';

interface KarunaIndexProps {
  userEmail: string | null;
  username: string | null;
  onSignInClick: () => void;
}

interface Analytics {
  total_journals: number;
  total_kindness: number;
  avg_compassion: number;
  emotions: { emotion: string; count: number }[];
  categories: { category: string; count: number }[];
}

export default function KarunaIndex({ userEmail, username, onSignInClick }: KarunaIndexProps) {
  // Sync analytics if logged in
  const [analytics, setAnalytics] = useState<Analytics>({
    total_journals: 0,
    total_kindness: 0,
    avg_compassion: 0,
    emotions: [],
    categories: []
  });
  const [nudgeCount, setNudgeCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(false);

  // Interactive Quiz State for Guests
  const [quizStep, setQuizStep] = useState<number>(0); // 0: intro, 1-4: questions, 5: results
  const [guestAnswers, setGuestAnswers] = useState({
    reflections: 2, // 0-5 times/week
    altruism: 2, // 0-5 actions/week
    nudges: 3, // 1-5 scale of habit openness
    resonance: 3, // 1-5 level of compassion
  });

  const fetchRealData = async () => {
    if (!userEmail) return;
    setIsFetching(true);
    try {
      const [resAnalytics, resKindness] = await Promise.all([
        fetch(`/api/analytics?email=${encodeURIComponent(userEmail)}`),
        fetch(`/api/kindness?email=${encodeURIComponent(userEmail)}`) // to ensure sync or fetch if needed
      ]);

      if (resAnalytics.ok) {
        setAnalytics(await resAnalytics.json());
      }
      
      const savedNudges = localStorage.getItem('karuna_completed_nudges_count');
      if (savedNudges) {
        setNudgeCount(parseInt(savedNudges, 10));
      }
    } catch (err) {
      console.error('Error fetching index analytics:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchRealData();
    }
  }, [userEmail]);

  // Handle listening for state updates from local storage for nudges
  useEffect(() => {
    const handleStorageChange = () => {
      const savedNudges = localStorage.getItem('karuna_completed_nudges_count');
      if (savedNudges) {
        setNudgeCount(parseInt(savedNudges, 10));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Calculate scores (either from real logged-in data, or from Guest quiz answers)
  let reflectionsScore = 0;
  let kindnessScore = 0;
  let nudgeScore = 0;
  let compassionResonance = 0;

  if (userEmail && username) {
    reflectionsScore = Math.min(analytics.total_journals * 5, 25);
    kindnessScore = Math.min(analytics.total_kindness * 6, 30);
    nudgeScore = Math.min(nudgeCount * 5, 25);
    compassionResonance = Math.round((analytics.avg_compassion / 5) * 20);
  } else {
    // Guest calculator map
    reflectionsScore = Math.min(guestAnswers.reflections * 5, 25);
    kindnessScore = Math.min(guestAnswers.altruism * 6, 30);
    nudgeScore = Math.min(guestAnswers.nudges * 5, 25);
    compassionResonance = Math.round((guestAnswers.resonance / 5) * 20);
  }

  const karunaIndex = reflectionsScore + kindnessScore + nudgeScore + compassionResonance;

  // Rank determination
  let rankName = "Seed of Awareness";
  let rankDescription = "Every great forest begins with a single seed of mindful attention. Start writing reflections and completing kindness challenges to nurture your empathy.";
  let rankQuote = "Though your journey is in its infancy, the seed of compassion is planted. Water it with daily awareness.";
  let rankColor = "text-emerald-600 bg-emerald-50/70 border-emerald-100";
  let ringColor = "stroke-emerald-500";
  let ringGradient = "from-emerald-500 to-teal-500";

  if (karunaIndex > 20 && karunaIndex <= 40) {
    rankName = "Sprouting Compassion";
    rankDescription = "Your empathy is taking root. Each mindful reflection and small act of kindness is nourishing the soil of human connection around you.";
    rankQuote = "Small sprouts break the hardest ground. Keep reflecting, keep giving, and watch your impact expand.";
    rankColor = "text-teal-600 bg-teal-50/70 border-teal-100";
    ringColor = "stroke-teal-500";
    ringGradient = "from-teal-500 to-cyan-500";
  } else if (karunaIndex > 40 && karunaIndex <= 60) {
    rankName = "Budding Harmony";
    rankDescription = "A balanced warmth is emerging. You are actively reconciling self-reflection with outward prosocial behavior, bridging the gap between minds.";
    rankQuote = "In harmony with others, we find ourselves. Your daily practice of outrospection is creating ripples of peace.";
    rankColor = "text-stone-700 bg-stone-100/80 border-stone-250";
    ringColor = "stroke-amber-600";
    ringGradient = "from-amber-600 to-stone-500";
  } else if (karunaIndex > 60 && karunaIndex <= 80) {
    rankName = "Empathetic Beacon";
    rankDescription = "You are a steady source of understanding and support for those in your sphere. Your awareness guides others toward compassionate pathways.";
    rankQuote = "To be a beacon is to hold space for others without losing your own ground. Continue shining your mindful presence.";
    rankColor = "text-amber-600 bg-amber-50/70 border-amber-100";
    ringColor = "stroke-amber-500";
    ringGradient = "from-amber-500 to-orange-400";
  } else if (karunaIndex > 80) {
    rankName = "Luminous Altruist";
    rankDescription = "A true practitioner of compassionate living. Your highly integrated habit of empathy, reflection, and actions helps dissolve the illusion of separateness.";
    rankQuote = "When the boundary between self and other dissolves, pure light remains. Your luminous care elevates our shared humanity.";
    rankColor = "text-rose-600 bg-rose-50/70 border-rose-100";
    ringColor = "stroke-rose-500";
    ringGradient = "from-rose-500 to-pink-500";
  }

  const handleGuestAnswerChange = (key: keyof typeof guestAnswers, value: number) => {
    setGuestAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNextStep = () => {
    setQuizStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setQuizStep(prev => prev - 1);
  };

  const resetQuiz = () => {
    setGuestAnswers({
      reflections: 2,
      altruism: 2,
      nudges: 3,
      resonance: 3,
    });
    setQuizStep(1);
  };

  return (
    <div className="card overflow-hidden p-6 md:p-8 bg-white/95 border-stone-200/40 shadow-xl shadow-stone-100/30">
      
      {/* Upper Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-100 pb-5 mb-8 gap-4">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-bold text-karuna-olive flex items-center gap-1.5 mb-1.5">
            <Award size={12} className="text-amber-500" />
            Empathetic Evaluation
          </span>
          <h2 className="text-2xl font-serif text-stone-900 font-bold tracking-tight">
            Karuna Index Calculator
          </h2>
          <p className="text-stone-500 text-xs mt-0.5 max-w-xl font-light">
            {userEmail 
              ? "A real-time index representing your integrated mindfulness reflections, proactive altruistic tasks, and daily kindness habits." 
              : "Discover your baseline empathy index. Sincere self-reflection is the first stepping stone to healthy human connection."
            }
          </p>
        </div>
        {userEmail && (
          <button 
            onClick={fetchRealData} 
            disabled={isFetching}
            className="flex items-center gap-2 text-xs text-stone-600 hover:text-karuna-olive transition-colors bg-stone-50 hover:bg-stone-100 px-4 py-2 rounded-full border border-stone-200/60 font-semibold"
          >
            <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} />
            <span>Recalculate Index</span>
          </button>
        )}
      </div>

      {userEmail && username ? (
        /* Signed In Display: Premium Interactive Card */
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Column 1: Progress indicator & circular SVG (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center text-center bg-stone-50/50 rounded-3xl p-6 border border-stone-100 relative overflow-hidden">
              {/* Subtle design matrix details */}
              <div className="absolute inset-0 opacity-5" style={{ 
                backgroundImage: 'radial-gradient(circle at 1px 1px, #5A5A40 1px, transparent 0)', 
                backgroundSize: '16px 16px' 
              }} />

              <div className="relative w-44 h-44 flex items-center justify-center z-10">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    className="stroke-stone-200/60"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="88"
                    cy="88"
                    r="76"
                    className={`${ringColor} transition-all duration-700`}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={477.5}
                    initial={{ strokeDashoffset: 477.5 }}
                    animate={{ strokeDashoffset: 477.5 - (karunaIndex / 100) * 477.5 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                
                <div className="absolute flex flex-col items-center justify-center">
                  <motion.span 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-serif font-bold text-stone-900 leading-none"
                  >
                    {karunaIndex}
                  </motion.span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400 mt-1.5">
                    Empathy Score
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-1 z-10 w-full">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${rankColor}`}>
                  {rankName}
                </span>
                <p className="text-[11px] text-stone-500 italic max-w-xs mt-3 px-2 leading-relaxed">
                  "{rankQuote}"
                </p>
              </div>
            </div>

            {/* Column 2: Pillar details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="font-serif text-lg font-semibold text-stone-850 flex items-center gap-2">
                  <TrendingUp size={18} className="text-karuna-olive" />
                  Your 4 Pillars of Compassion
                </h3>
                <p className="text-stone-500 text-xs mt-1 leading-relaxed font-light">
                  The Karuna Index is dynamically compiled from your active participation in self-reflection, outbound kindness, prosocial habits, and balanced emotional states.
                </p>
              </div>

              {/* Pillars progress list */}
              <div className="space-y-4">
                {/* Pillar 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                      <BookOpen size={14} className="text-emerald-500" />
                      Mindful Reflections
                    </span>
                    <span className="font-mono text-stone-500 font-medium">
                      {reflectionsScore} <span className="text-stone-300">/ 25 pts</span>
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-emerald-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(reflectionsScore / 25) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 font-light">
                    Earn 5 pts per Reflection journal entry logged (Max 25 pts). Currently: <strong className="text-stone-600 font-medium">{analytics.total_journals} entries</strong>.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                      <Heart size={14} className="text-rose-500" />
                      Active Altruism
                    </span>
                    <span className="font-mono text-stone-500 font-medium">
                      {kindnessScore} <span className="text-stone-300">/ 30 pts</span>
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-rose-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(kindnessScore / 30) * 100}%` }}
                      transition={{ duration: 1, delay: 0.1 }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 font-light">
                    Earn 6 pts per Act of Kindness committed (Max 30 pts). Currently: <strong className="text-stone-600 font-medium">{analytics.total_kindness} acts</strong>.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      Kindness Habits
                    </span>
                    <span className="font-mono text-stone-500 font-medium">
                      {nudgeScore} <span className="text-stone-300">/ 25 pts</span>
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-amber-400 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(nudgeScore / 25) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 font-light">
                    Earn 5 pts per positive nudge challenge completed in popups (Max 25 pts). Currently: <strong className="text-stone-600 font-medium">{nudgeCount} completed</strong>.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                      <Activity size={14} className="text-indigo-500" />
                      Compassion Resonance
                    </span>
                    <span className="font-mono text-stone-500 font-medium">
                      {compassionResonance} <span className="text-stone-300">/ 20 pts</span>
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-indigo-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(compassionResonance / 20) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 font-light">
                    Based on self-reported emotion compassion score. Currently: <strong className="text-stone-600 font-medium">{analytics.avg_compassion} / 5</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines Section */}
          <div className="bg-stone-50 border border-stone-100 p-5 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <Info size={14} className="text-karuna-olive" />
              Mindful Instructions to Grow Your Index
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Write reflections in your journal. Sincere, self-compassionate writing improves emotional integration.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Actively perform kind actions like listening, donating, or assisting, and log them here.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Acknowledge and accept incoming micro-nudge tasks in your bottom right notifier stack.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Hold deep empathy scores in your writing today. Cultivate real loving-kindness for all beings.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Guest Mode: Beautiful 4-Step Interactive Calculator with high-fidelity transition animation */
        <div className="bg-stone-50/50 border border-stone-200/40 rounded-2xl p-6 relative min-h-[380px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {quizStep === 0 && (
              <motion.div
                key="quiz-intro"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-center my-auto py-8"
              >
                <div className="w-16 h-16 bg-karuna-olive/10 text-karuna-olive rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <TrendingUp size={30} />
                </div>
                <div className="space-y-2 max-w-lg mx-auto">
                  <h3 className="text-2xl font-serif text-stone-800 font-bold">Interactive Baseline Assessment</h3>
                  <p className="text-xs text-stone-500 leading-relaxed font-light">
                    Answer 4 swift, reflective questions regarding your current daily routine, interpersonal habits, and mindfulness state to instantly calculate your starting Karuna Index!
                  </p>
                </div>
                <button
                  onClick={() => setQuizStep(1)}
                  className="olive-button px-8 py-3 text-xs inline-flex items-center gap-2 font-semibold shadow-md mx-auto"
                >
                  <span>Begin Self-Assessment</span>
                  <ChevronRight size={14} />
                </button>
              </motion.div>
            )}

            {quizStep === 1 && (
              <motion.div
                key="quiz-q1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-stone-400">
                  <span>Step 1 of 4: Mindful Reflections</span>
                  <span className="font-mono">25% Complete</span>
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="font-serif text-xl text-stone-800 font-semibold leading-snug">How often do you write down or deeply reflect on your feelings/thoughts?</h4>
                  <p className="text-stone-500 text-xs font-light">Self-reflection creates self-awareness, the first stepping stone to prosocial outcomes.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-semibold text-stone-600 font-mono px-1">
                    <span>Rarely / Never</span>
                    <span>Daily Reflection</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={guestAnswers.reflections}
                    onChange={(e) => handleGuestAnswerChange('reflections', parseInt(e.target.value))}
                    className="w-full accent-karuna-olive h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center text-xs font-bold text-karuna-olive bg-karuna-olive/5 py-2.5 rounded-xl border border-karuna-olive/10">
                    {guestAnswers.reflections === 0 && "Rarely, mostly busy with outer tasks."}
                    {guestAnswers.reflections === 1 && "Occasionally, maybe once or twice a week."}
                    {guestAnswers.reflections === 2 && "Regularly, write thoughts on some days (3x/week)."}
                    {guestAnswers.reflections === 3 && "Frequently, dedicated quiet reflection on weekdays."}
                    {guestAnswers.reflections === 4 && "Almost daily, high priority given to introspective journaling."}
                    {guestAnswers.reflections === 5 && "Daily, dedicated written mental/emotional synthesis."}
                  </div>
                </div>
              </motion.div>
            )}

            {quizStep === 2 && (
              <motion.div
                key="quiz-q2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-stone-400">
                  <span>Step 2 of 4: Active Altruism</span>
                  <span className="font-mono">50% Complete</span>
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="font-serif text-xl text-stone-800 font-semibold leading-snug">How many deliberate, helpful actions of kindness did you complete recently?</h4>
                  <p className="text-stone-500 text-xs font-light">This includes listening carefully, aiding strangers, donating time/items, or showing appreciation.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-semibold text-stone-600 font-mono px-1">
                    <span>None this week</span>
                    <span>5+ Active Acts</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={guestAnswers.altruism}
                    onChange={(e) => handleGuestAnswerChange('altruism', parseInt(e.target.value))}
                    className="w-full accent-karuna-olive h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center text-xs font-bold text-rose-500 bg-rose-500/5 py-2.5 rounded-xl border border-rose-500/10">
                    {guestAnswers.altruism === 0 && "Focused on personal duties right now."}
                    {guestAnswers.altruism === 1 && "Made minor efforts to support someone once."}
                    {guestAnswers.altruism === 2 && "Shared active help/listening with a friend or colleague (2x)."}
                    {guestAnswers.altruism === 3 && "Sought out three kind opportunities this week."}
                    {guestAnswers.altruism === 4 && "Committed 4 distinct kind deeds to support community connection."}
                    {guestAnswers.altruism === 5 && "Highly active: 5 or more generous acts performed with care."}
                  </div>
                </div>
              </motion.div>
            )}

            {quizStep === 3 && (
              <motion.div
                key="quiz-q3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-stone-400">
                  <span>Step 3 of 4: Prosocial Habits</span>
                  <span className="font-mono">75% Complete</span>
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="font-serif text-xl text-stone-800 font-semibold leading-snug">How receptive are you to micro-nudges and immediate calls of support?</h4>
                  <p className="text-stone-500 text-xs font-light">Rate your openness to stepping slightly outside your comfort zone for brief empathetic challenges.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-semibold text-stone-600 font-mono px-1">
                    <span>Reluctant / Hesitant</span>
                    <span>Extremely Receptive</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={guestAnswers.nudges}
                    onChange={(e) => handleGuestAnswerChange('nudges', parseInt(e.target.value))}
                    className="w-full accent-karuna-olive h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center text-xs font-bold text-amber-500 bg-amber-500/5 py-2.5 rounded-xl border border-amber-500/10">
                    {guestAnswers.nudges === 1 && "Prefer keeping to my planned routine."}
                    {guestAnswers.nudges === 2 && "Would consider it occasionally if highly convenient."}
                    {guestAnswers.nudges === 3 && "Open: Happy to complete minor kindness tips when reminded."}
                    {guestAnswers.nudges === 4 && "Enthusiastic: Actively try to pause and engage helper recommendations."}
                    {guestAnswers.nudges === 5 && "Passionate: Eager to act immediately on prosocial reminders daily."}
                  </div>
                </div>
              </motion.div>
            )}

            {quizStep === 4 && (
              <motion.div
                key="quiz-q4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-stone-400">
                  <span>Step 4 of 4: Compassion Resonance</span>
                  <span className="font-mono">Almost There</span>
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="font-serif text-xl text-stone-800 font-semibold leading-snug">How would you rate your general level of empathy and compassion today?</h4>
                  <p className="text-stone-500 text-xs font-light">Do you find it easy to actively validate others, or do you carry some internal blockages/resentments?</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => handleGuestAnswerChange('resonance', stars)}
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                          guestAnswers.resonance >= stars
                            ? 'bg-amber-400 border-amber-400 text-stone-900 font-bold shadow-sm scale-105'
                            : 'bg-white border-stone-200 text-stone-400 hover:bg-stone-100 hover:scale-[1.02]'
                        }`}
                      >
                        <Heart size={18} className={guestAnswers.resonance >= stars ? "fill-current text-stone-900" : ""} />
                        <span className="text-[10px] mt-0.5">{stars}</span>
                      </button>
                    ))}
                  </div>
                  <div className="text-center text-xs font-bold text-indigo-500 bg-indigo-500/5 py-2.5 rounded-xl border border-indigo-500/10">
                    {guestAnswers.resonance === 1 && "Slightly dry/isolated emotional focus today."}
                    {guestAnswers.resonance === 2 && "Neutral, moderate capacity to listen with patient care."}
                    {guestAnswers.resonance === 3 && "Sincere empathy: Genuinely wish others ease and well-being."}
                    {guestAnswers.resonance === 4 && "High compassion resonance: Active desire to ease people's distress."}
                    {guestAnswers.resonance === 5 && "Luminous warmth: Feel deeply connected to the humanity in everyone."}
                  </div>
                </div>
              </motion.div>
            )}

            {quizStep === 5 && (
              <motion.div
                key="quiz-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="72" cy="72" r="62" className="stroke-stone-200/60" strokeWidth="8" fill="transparent" />
                      <motion.circle
                        cx="72"
                        cy="72"
                        r="62"
                        className={`${ringColor}`}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={389.5}
                        initial={{ strokeDashoffset: 389.5 }}
                        animate={{ strokeDashoffset: 389.5 - (karunaIndex / 100) * 389.5 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-serif font-bold text-stone-900 leading-none">
                        {karunaIndex}
                      </span>
                      <span className="text-[8px] uppercase font-bold tracking-wider text-stone-400 mt-1">
                        Quotient Score
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${rankColor}`}>
                      {rankName}
                    </span>
                    <p className="text-[11px] text-stone-500 italic max-w-sm mx-auto mt-2 px-2 leading-relaxed">
                      "{rankQuote}"
                    </p>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl text-left space-y-3">
                  <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <TrendingUp size={14} className="text-karuna-olive" />
                    Pillar Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-stone-500 font-light">
                    <div>
                      Reflections Score: <strong className="font-semibold text-stone-700">{reflectionsScore} / 25</strong>
                    </div>
                    <div>
                      Altruism Score: <strong className="font-semibold text-stone-700">{kindnessScore} / 30</strong>
                    </div>
                    <div>
                      Habit Nudges Score: <strong className="font-semibold text-stone-700">{nudgeScore} / 25</strong>
                    </div>
                    <div>
                      Resonance Score: <strong className="font-semibold text-stone-700">{compassionResonance} / 20</strong>
                    </div>
                  </div>
                </div>

                {/* Call To Action */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
                  <button
                    onClick={resetQuiz}
                    className="text-xs border border-stone-300 hover:bg-stone-100 text-stone-700 px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 font-medium"
                  >
                    <RefreshCw size={12} />
                    <span>Recalculate</span>
                  </button>
                  <button
                    onClick={onSignInClick}
                    className="olive-button px-6 py-2.5 text-xs flex items-center gap-2 font-semibold shadow-md shadow-karuna-olive/10 hover:shadow-lg"
                  >
                    <LogIn size={13} />
                    <span>Sign In to Track Daily</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Buttons and Footer info */}
          {quizStep !== 0 && (
            <div className="flex items-center justify-between border-t border-stone-200/60 pt-4 mt-6">
              {quizStep <= 4 ? (
                <>
                  <button
                    onClick={handlePrevStep}
                    className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium transition-colors"
                  >
                    <ChevronLeft size={14} />
                    <span>Back</span>
                  </button>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-all ${
                          quizStep === step ? 'bg-karuna-olive w-5' : 'bg-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={quizStep === 4 ? () => setQuizStep(5) : handleNextStep}
                    className="text-xs bg-karuna-olive text-white px-5 py-2 rounded-full font-bold hover:bg-[#4E4E37] transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>{quizStep === 4 ? "Finish" : "Next"}</span>
                    <ChevronRight size={14} />
                  </button>
                </>
              ) : (
                <div className="w-full text-center">
                  <p className="text-[10px] text-stone-400 font-light italic">
                    Start making real mindful inputs. Sincere care changes your internal neural connections.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
