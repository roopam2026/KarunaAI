import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Heart, Smile, CheckCircle, Calendar, TrendingUp, Sparkles, Plus, Award, Activity, Compass, Search, Filter, ChevronRight, Info } from 'lucide-react';

interface KindnessJournalProps {
  userEmail: string;
  username: string;
}

interface JournalEntry {
  id: string;
  content: string;
  emotion: string;
  compassion_rating: number;
  created_at: string;
}

interface KindnessAct {
  id: string;
  title: string;
  category: string;
  description: string;
  created_at: string;
}

interface Analytics {
  total_journals: number;
  total_kindness: number;
  avg_compassion: number;
  emotions: { emotion: string; count: number }[];
  categories: { category: string; count: number }[];
}

export default function KindnessJournal({ userEmail, username }: KindnessJournalProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'kindness' | 'insights'>('journal');
  
  // States for reflection journal
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [journalContent, setJournalContent] = useState('');
  const [journalEmotion, setJournalEmotion] = useState('Peaceful');
  const [compassionRating, setCompassionRating] = useState(4);
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [journalSearch, setJournalSearch] = useState('');

  // States for kindness ledger
  const [kindnessActs, setKindnessActs] = useState<KindnessAct[]>([]);
  const [kindnessTitle, setKindnessTitle] = useState('');
  const [kindnessCategory, setKindnessCategory] = useState('Helping');
  const [kindnessDesc, setKindnessDesc] = useState('');
  const [isSavingKindness, setIsSavingKindness] = useState(false);
  const [kindnessSearch, setKindnessSearch] = useState('');

  // Analytics
  const [analytics, setAnalytics] = useState<Analytics>({
    total_journals: 0,
    total_kindness: 0,
    avg_compassion: 0,
    emotions: [],
    categories: []
  });

  const [nudgeCount, setNudgeCount] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('karuna_completed_nudges_count');
    if (saved) {
      setNudgeCount(parseInt(saved, 10));
    }
  }, [activeTab]);

  // Dynamic Karuna Index Calculation (Max 100)
  const reflectionsScore = Math.min(analytics.total_journals * 5, 25);
  const kindnessScore = Math.min(analytics.total_kindness * 6, 30);
  const nudgeScore = Math.min(nudgeCount * 5, 25);
  const compassionResonance = Math.round((analytics.avg_compassion / 5) * 20);
  const karunaIndex = reflectionsScore + kindnessScore + nudgeScore + compassionResonance;

  // Rank determination details
  let rankName = "Seed of Awareness";
  let rankDescription = "Every great forest begins with a single seed of mindful attention. Start writing reflections and completing kindness challenges to nurture your empathy.";
  let rankQuote = "Though your journey is in its infancy, the seed of compassion is planted. Water it with daily awareness.";
  let rankColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
  let ringColor = "stroke-emerald-500 font-bold";

  if (karunaIndex > 20 && karunaIndex <= 40) {
    rankName = "Sprouting Compassion";
    rankDescription = "Your empathy is taking root. Each mindful reflection and small act of kindness is nourishing the soil of human connection around you.";
    rankQuote = "Small sprouts break the hardest ground. Keep reflecting, keep giving, and watch your impact expand.";
    rankColor = "text-teal-600 bg-teal-50 border-teal-100";
    ringColor = "stroke-teal-500 font-bold";
  } else if (karunaIndex > 40 && karunaIndex <= 60) {
    rankName = "Budding Harmony";
    rankDescription = "A balanced warmth is emerging. You are actively reconciling self-reflection with outward prosocial behavior, bridging the gap between minds.";
    rankQuote = "In harmony with others, we find ourselves. Your daily practice of outrospection is creating ripples of peace.";
    rankColor = "text-stone-700 bg-stone-100/80 border-stone-200";
    ringColor = "stroke-karuna-olive font-bold";
  } else if (karunaIndex > 60 && karunaIndex <= 80) {
    rankName = "Empathetic Beacon";
    rankDescription = "You are a steady source of understanding and support for those in your sphere. Your awareness guides others toward compassionate pathways.";
    rankQuote = "To be a beacon is to hold space for others without losing your own ground. Continue shining your mindful presence.";
    rankColor = "text-amber-600 bg-amber-50 border-amber-100";
    ringColor = "stroke-amber-500 font-bold";
  } else if (karunaIndex > 80) {
    rankName = "Luminous Altruist";
    rankDescription = "A true practitioner of compassionate living. Your highly integrated habit of empathy, reflection, and actions helps dissolve the illusion of separateness.";
    rankQuote = "When the boundary between self and other dissolves, pure light remains. Your luminous care elevates our shared humanity.";
    rankColor = "text-rose-600 bg-rose-50 border-rose-100";
    ringColor = "stroke-rose-500 font-bold";
  }

  const emotions = ['Peaceful', 'Grateful', 'Compassionate', 'Reflective', 'Troubled', 'Joyful'];
  const categories = ['Listening', 'Giving', 'Helping', 'Forgiving', 'Speaking', 'Mindfulness'];

  // Fetch all data
  const fetchData = async () => {
    try {
      const [resJournals, resKindness, resAnalytics] = await Promise.all([
        fetch(`/api/journal?email=${encodeURIComponent(userEmail)}`),
        fetch(`/api/kindness?email=${encodeURIComponent(userEmail)}`),
        fetch(`/api/analytics?email=${encodeURIComponent(userEmail)}`)
      ]);

      if (resJournals.ok) setJournals(await resJournals.json());
      if (resKindness.ok) setKindnessActs(await resKindness.json());
      if (resAnalytics.ok) setAnalytics(await resAnalytics.json());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userEmail]);

  // Sync user with backend on mount
  useEffect(() => {
    const syncUser = async () => {
      try {
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, name: username })
        });
      } catch (e) {
        console.error('Error syncing user:', e);
      }
    };
    syncUser();
  }, [userEmail, username]);

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim() || isSavingJournal) return;

    setIsSavingJournal(true);
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          content: journalContent,
          emotion: journalEmotion,
          compassion_rating: compassionRating
        })
      });

      if (response.ok) {
        setJournalContent('');
        setJournalEmotion('Peaceful');
        setCompassionRating(4);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingJournal(false);
    }
  };

  const handleSaveKindness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kindnessTitle.trim() || !kindnessDesc.trim() || isSavingKindness) return;

    setIsSavingKindness(true);
    try {
      const response = await fetch('/api/kindness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          title: kindnessTitle,
          category: kindnessCategory,
          description: kindnessDesc
        })
      });

      if (response.ok) {
        setKindnessTitle('');
        setKindnessDesc('');
        setKindnessCategory('Helping');
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingKindness(false);
    }
  };

  const filteredJournals = journals.filter(j => 
    j.content.toLowerCase().includes(journalSearch.toLowerCase()) ||
    j.emotion.toLowerCase().includes(journalSearch.toLowerCase())
  );

  const filteredKindness = kindnessActs.filter(k => 
    k.title.toLowerCase().includes(kindnessSearch.toLowerCase()) ||
    k.description.toLowerCase().includes(kindnessSearch.toLowerCase()) ||
    k.category.toLowerCase().includes(kindnessSearch.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="card border border-stone-200/80 shadow-lg overflow-hidden bg-white/95 mt-10">
      {/* Title Header */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-karuna-olive/10 to-amber-500/5 border-b border-stone-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-bold text-karuna-olive flex items-center gap-1.5 mb-1">
            <Award size={12} className="text-amber-500" />
            Empathy ledger & Journaling App
          </span>
          <h2 className="text-3xl font-serif text-stone-800">
            Welcome back, <span className="serif-italic font-medium text-karuna-olive">{username}</span>
          </h2>
          <p className="text-stone-500 text-xs mt-1">
            Your personalized local sanctuary to track kindness milestones, emotional metrics, and reflect with compassion.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-stone-100/80 p-1 rounded-full w-fit">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'journal' 
                ? 'bg-white text-stone-850 shadow-sm font-bold' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <BookOpen size={14} />
            <span>Reflections</span>
          </button>
          
          <button
            onClick={() => setActiveTab('kindness')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'kindness' 
                ? 'bg-white text-stone-850 shadow-sm font-bold' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Heart size={14} />
            <span>Kindness Acts</span>
          </button>
          
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'insights' 
                ? 'bg-white text-stone-850 shadow-sm font-bold' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <TrendingUp size={14} />
            <span>Metrics</span>
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'journal' && (
            <motion.div
              key="journal-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Journal Creation form (5 columns) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                  <h3 className="font-serif text-lg text-stone-850 mb-4 flex items-center gap-2 font-semibold">
                    <Compass size={18} className="text-karuna-olive" />
                    Write Reflection
                  </h3>
                  
                  <form onSubmit={handleSaveJournal} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500">How are you feeling?</label>
                      <div className="grid grid-cols-3 gap-2">
                        {emotions.map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => setJournalEmotion(em)}
                            className={`py-2 text-[11px] font-semibold border rounded-xl transition-all ${
                              journalEmotion === em 
                                ? 'bg-karuna-olive/15 text-karuna-olive border-karuna-olive/30 ring-1 ring-karuna-olive/10 font-bold' 
                                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Compassion Score ({compassionRating}/5)</label>
                      <div className="flex gap-2 items-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setCompassionRating(rating)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border ${
                              compassionRating >= rating
                                ? 'bg-amber-400 border-amber-400 text-stone-900 font-bold'
                                : 'bg-white border-stone-200 text-stone-400'
                            }`}
                          >
                            <Heart size={14} className={compassionRating >= rating ? "fill-current text-stone-900" : ""} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500">My Reflection</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="What happened today? Did you show compassion or encounter active listening?"
                        value={journalContent}
                        onChange={(e) => setJournalContent(e.target.value)}
                        className="w-full bg-white border border-stone-200 focus:border-karuna-olive/40 focus:ring-4 focus:ring-karuna-olive/5 rounded-2xl p-4 text-xs outline-none text-stone-800 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingJournal || !journalContent.trim()}
                      className="olive-button w-full py-3 text-xs flex items-center justify-center gap-2"
                    >
                      {isSavingJournal ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Save to Ledger</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Journal Feed (7 columns) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 border border-stone-200 rounded-full px-4 py-2.5 bg-stone-50">
                  <Search size={16} className="text-stone-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search journal reflections..."
                    value={journalSearch}
                    onChange={(e) => setJournalSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs outline-none text-stone-800 placeholder-stone-400"
                  />
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredJournals.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                      <Smile size={32} className="mx-auto text-stone-300 mb-2" />
                      <p className="text-stone-500 font-serif text-sm">Your reflective path is clear.</p>
                      <p className="text-stone-400 text-[11px] mt-1">Start writing your thoughts to populate the journal database.</p>
                    </div>
                  ) : (
                    filteredJournals.map((j) => (
                      <motion.div
                        key={j.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-5 border border-stone-100 rounded-2xl bg-white shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-karuna-olive/10 text-karuna-olive text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              {j.emotion}
                            </span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Heart 
                                  key={i} 
                                  size={11} 
                                  className={i < j.compassion_rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200'} 
                                />
                              ))}
                            </div>
                          </div>
                          
                          <span className="text-[10px] font-mono text-stone-400">
                            {formatDate(j.created_at)}
                          </span>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed font-light whitespace-pre-wrap">
                          {j.content}
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'kindness' && (
            <motion.div
              key="kindness-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Kindness Creation form (5 columns) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                  <h3 className="font-serif text-lg text-stone-850 mb-4 flex items-center gap-2 font-semibold">
                    <Sparkles size={18} className="text-amber-500" />
                    Log Act of Kindness
                  </h3>
                  
                  <form onSubmit={handleSaveKindness} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">Category</label>
                      <div className="grid grid-cols-3 gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setKindnessCategory(cat)}
                            className={`py-2 text-[11px] font-semibold border rounded-xl transition-all ${
                              kindnessCategory === cat 
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 ring-1 ring-amber-500/10 font-bold' 
                                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">What did you do?</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bought dynamic warm soup for a neighbor"
                        value={kindnessTitle}
                        onChange={(e) => setKindnessTitle(e.target.value)}
                        className="w-full bg-white border border-stone-200 focus:border-karuna-olive/40 focus:ring-4 focus:ring-karuna-olive/5 rounded-2xl p-4 text-xs outline-none text-stone-800 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">Why / How did it impact them?</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Detail the response or your internal shift after completing this prosocial task..."
                        value={kindnessDesc}
                        onChange={(e) => setKindnessDesc(e.target.value)}
                        className="w-full bg-white border border-stone-200 focus:border-karuna-olive/40 focus:ring-4 focus:ring-karuna-olive/5 rounded-2xl p-4 text-xs outline-none text-stone-800 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingKindness || !kindnessTitle.trim() || !kindnessDesc.trim()}
                      className="olive-button w-full py-3 text-xs flex items-center justify-center gap-2"
                    >
                      {isSavingKindness ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Heart size={14} />
                          <span>Commit Act</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Kindness acts log feed (7 columns) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 border border-stone-200 rounded-full px-4 py-2.5 bg-stone-50">
                  <Search size={16} className="text-stone-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search kindness ledger..."
                    value={kindnessSearch}
                    onChange={(e) => setKindnessSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs outline-none text-stone-800 placeholder-stone-400"
                  />
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredKindness.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                      <Award size={32} className="mx-auto text-stone-300 mb-2" />
                      <p className="text-stone-500 font-serif text-sm">Your kindness ledger is clear.</p>
                      <p className="text-stone-400 text-[11px] mt-1">Log your first act of kindness to see entries appear here.</p>
                    </div>
                  ) : (
                    filteredKindness.map((k) => (
                      <motion.div
                        key={k.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-5 border border-stone-100 rounded-2xl bg-white shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="bg-amber-500/10 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {k.category}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400">
                            {formatDate(k.created_at)}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                            {k.title}
                          </h4>
                          <p className="text-xs text-stone-500 mt-1 font-light leading-relaxed">
                            {k.description}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Karuna Index Interactive Card */}
              <div className="bg-stone-50 border border-stone-200/60 p-6 md:p-8 rounded-3xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Column 1: SVG Circular Indicator (5 cols) */}
                <div className="lg:col-span-5 flex flex-col items-center text-center">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    {/* SVG Radial Progress */}
                    <svg className="w-full h-full -rotate-90">
                      {/* Background track circle */}
                      <circle
                        cx="88"
                        cy="88"
                        r="76"
                        className="stroke-stone-200/70"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Foreground active indicator circle */}
                      <motion.circle
                        cx="88"
                        cy="88"
                        r="76"
                        className={ringColor}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={477.5}
                        initial={{ strokeDashoffset: 477.5 }}
                        animate={{ strokeDashoffset: 477.5 - (karunaIndex / 100) * 477.5 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Inner score reading */}
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-serif font-bold text-stone-800 leading-none">
                        {karunaIndex}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mt-1">
                        Karuna Index
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${rankColor}`}>
                      {rankName}
                    </span>
                    <p className="text-[11px] text-stone-400 italic max-w-xs mt-2 px-2 leading-relaxed">
                      "{rankQuote}"
                    </p>
                  </div>
                </div>

                {/* Column 2: Breakdown and Pillars progress (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-stone-850 flex items-center gap-2">
                      <TrendingUp size={20} className="text-karuna-olive" />
                      Empathetic Growth Matrix
                    </h3>
                    <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                      Your Karuna Index represents a holistic calculation of your mindful reflection, active altruism, daily prosocial habits, and compassionate resonance.
                    </p>
                  </div>

                  {/* 4 Pillars Progress bars */}
                  <div className="space-y-3.5">
                    {/* Pillar 1: Mindful Reflections */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                          <BookOpen size={14} className="text-emerald-500" />
                          Mindful Reflections
                        </span>
                        <span className="font-mono text-stone-500">
                          {reflectionsScore} <span className="text-stone-300">/ 25 pts</span>
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-emerald-500 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(reflectionsScore / 25) * 100}%` }}
                          transition={{ duration: 1, delay: 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Pillar 2: Active Altruism */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                          <Heart size={14} className="text-rose-500" />
                          Active Altruism
                        </span>
                        <span className="font-mono text-stone-500">
                          {kindnessScore} <span className="text-stone-300">/ 30 pts</span>
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-rose-500 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(kindnessScore / 30) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Pillar 3: Kindness Habits */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-amber-500" />
                          Kindness Habits (Nudges)
                        </span>
                        <span className="font-mono text-stone-500">
                          {nudgeScore} <span className="text-stone-300">/ 25 pts</span>
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-amber-400 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(nudgeScore / 25) * 100}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Pillar 4: Compassion Resonance */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                          <Activity size={14} className="text-indigo-500" />
                          Compassion Resonance
                        </span>
                        <span className="font-mono text-stone-500">
                          {compassionResonance} <span className="text-stone-300">/ 20 pts</span>
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-indigo-500 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(compassionResonance / 20) * 100}%` }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Suggestions to Raise Score */}
              <div className="bg-white border border-stone-100 p-5 rounded-2xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <Info size={14} className="text-karuna-olive" />
                  Pathways to Elevate Empathy Index
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3 items-start p-3 bg-stone-50/50 rounded-xl hover:bg-stone-50 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <div>
                      <h5 className="text-xs font-bold text-stone-800">Reflect deeper</h5>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">Write down your daily introspective realizations in your Reflection journal (+5 pts per entry).</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start p-3 bg-stone-50/50 rounded-xl hover:bg-stone-50 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <div>
                      <h5 className="text-xs font-bold text-stone-800">Perform prosocial challenges</h5>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">Log genuine, tangible acts of kindness (listening, helping, sharing) (+6 pts per act).</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3 bg-stone-50/50 rounded-xl hover:bg-stone-50 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <div>
                      <h5 className="text-xs font-bold text-stone-800">Embrace habits</h5>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">Look out for prompt-based popup notifications or quotes, clicking 'Accept' to log habitual nudges (+5 pts per nudge).</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3 bg-stone-50/50 rounded-xl hover:bg-stone-50 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                    <div>
                      <h5 className="text-xs font-bold text-stone-800">Cultivate genuine compassion</h5>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">Strive for highly compassionate intents in your reflections. Your average self-reported ratings raise this score significantly.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlight Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-stone-50 p-6 border border-stone-100 rounded-2xl text-center flex flex-col justify-center">
                  <div className="w-10 h-10 rounded-full bg-karuna-olive/10 text-karuna-olive flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={18} />
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-stone-850">{analytics.total_journals}</h4>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-1">Journal Reflections</p>
                </div>

                <div className="bg-stone-50 p-6 border border-stone-100 rounded-2xl text-center flex flex-col justify-center">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3">
                    <Heart size={18} className="fill-rose-50" />
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-stone-850">{analytics.total_kindness}</h4>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-1">Prosocial Acts Logged</p>
                </div>

                <div className="bg-stone-50 p-6 border border-stone-100 rounded-2xl text-center flex flex-col justify-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <Activity size={18} />
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-stone-850">{analytics.avg_compassion} / 5</h4>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-1">Compassion Score</p>
                </div>
              </div>

              {/* Categorical Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emotions chart */}
                <div className="bg-stone-50 p-6 border border-stone-100 rounded-2xl">
                  <h3 className="font-serif text-sm font-semibold text-stone-750 mb-4 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Smile size={14} className="text-karuna-olive" />
                    Emotional Landscape
                  </h3>
                  
                  {analytics.emotions.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 text-xs">
                      No journal entries to analyze yet.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {analytics.emotions.map((em) => (
                        <div key={em.emotion} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono text-stone-600">
                            <span>{em.emotion}</span>
                            <span>{em.count} {em.count === 1 ? 'entry' : 'entries'}</span>
                          </div>
                          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-karuna-olive h-full rounded-full transition-all duration-500" 
                              style={{ width: `${(em.count / analytics.total_journals) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Kindness categories chart */}
                <div className="bg-stone-50 p-6 border border-stone-100 rounded-2xl">
                  <h3 className="font-serif text-sm font-semibold text-stone-750 mb-4 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Sparkles size={14} className="text-amber-500" />
                    Kindness Channels
                  </h3>
                  
                  {analytics.categories.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 text-xs">
                      No kindness acts logged to analyze yet.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {analytics.categories.map((cat) => (
                        <div key={cat.category} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono text-stone-600">
                            <span>{cat.category}</span>
                            <span>{cat.count} {cat.count === 1 ? 'act' : 'acts'}</span>
                          </div>
                          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${(cat.count / analytics.total_kindness) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
