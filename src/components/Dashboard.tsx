import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Heart, Sparkles, Compass, Eye, ShieldCheck } from 'lucide-react';

const COMPASSION_INTENTS = [
  {
    icon: <Heart size={16} className="text-rose-500 animate-pulse" />,
    title: "Loving-Kindness",
    body: "Today, let your interactions be warmed by the understanding that every individual carries a silent struggle."
  },
  {
    icon: <Eye size={16} className="text-amber-500" />,
    title: "Deep Presence",
    body: "Focus on listening with your entire presence. When others speak, silence your inner response and receive their words."
  },
  {
    icon: <Compass size={16} className="text-emerald-500" />,
    title: "Proactive Outrospection",
    body: "Shift your gaze outwards. Actively seek one opportunity to ease someone else's minor inconvenience."
  }
];

export default function Dashboard() {
  const [greeting, setGreeting] = useState("Welcome back");
  const [breathState, setBreathState] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [intentIndex, setIntentIndex] = useState(0);

  // Time-of-day greeting
  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting("Good morning");
    else if (hrs < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Breath pacing simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const runBreathLoop = () => {
      // Inhale: 4s
      setBreathState('Inhale');
      timer = setTimeout(() => {
        // Hold: 4s
        setBreathState('Hold');
        timer = setTimeout(() => {
          // Exhale: 4s
          setBreathState('Exhale');
          timer = setTimeout(runBreathLoop, 4000);
        }, 4000);
      }, 4000);
    };

    runBreathLoop();
    return () => clearTimeout(timer);
  }, []);

  // Intent rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setIntentIndex((prev) => (prev + 1) % COMPASSION_INTENTS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Vision & Dynamic Greetings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-karuna-olive/5 border border-karuna-olive/10 px-3.5 py-1.5 rounded-full"
            >
              <div className="indicator-dot text-karuna-olive" />
              <span className="text-[10px] font-bold tracking-widest text-stone-600 uppercase">
                {greeting} • Mindful Sanctuary
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-serif font-extralight tracking-tight text-stone-900 leading-[1.1]"
            >
              Outrospection <br />
              <span className="serif-italic text-karuna-olive font-normal">for a better world</span>
            </motion.h1>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-stone-500 max-w-xl leading-relaxed text-base font-light"
          >
            KarunaAI is your supportive digital companion, crafted to cultivate outward empathy (outrospection) and quiet self-reflection. Join us in dismantling isolation and amplifying genuine compassion.
          </motion.p>

          {/* Staggered Quick badges */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
              <ShieldCheck size={14} className="text-karuna-olive" />
              <span>Offline-first SQLite State</span>
            </div>
            <div className="text-stone-300 hidden sm:inline">•</div>
            <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              <span>Gemini Intelligent Guidance</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Mindful Breathing Ring & Focus card (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-6">
          
          {/* Breathing Canvas */}
          <div className="card p-6 flex flex-col items-center justify-center relative overflow-hidden bg-white/95 border-stone-200/50 h-[190px]">
            {/* Soft backdrop radial gradient pulsing */}
            <div className={`absolute inset-0 bg-radial from-karuna-olive/5 via-transparent to-transparent transition-opacity duration-[4000s] ${
              breathState === 'Inhale' ? 'opacity-100' : 'opacity-40'
            }`} />

            <div className="flex items-center gap-8 z-10 w-full px-4">
              {/* Organic Ring animation */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                {/* Dynamic pulsing outer circle */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-karuna-olive/20"
                  animate={{
                    scale: breathState === 'Inhale' ? [1, 1.4] : breathState === 'Hold' ? 1.4 : [1.4, 1],
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                  }}
                />
                {/* Mid ring */}
                <motion.div
                  className="absolute w-16 h-16 rounded-full bg-karuna-olive/5 border border-karuna-olive/15"
                  animate={{
                    scale: breathState === 'Inhale' ? [1, 1.25] : breathState === 'Hold' ? 1.25 : [1.25, 1],
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                  }}
                />
                {/* Center dot */}
                <div className="w-10 h-10 rounded-full bg-karuna-olive text-white flex items-center justify-center shadow-md">
                  <Wind size={16} className={breathState === 'Inhale' || breathState === 'Exhale' ? 'animate-spin [animation-duration:8s]' : ''} />
                </div>
              </div>

              {/* Breathing labels */}
              <div className="space-y-1">
                <span className="text-[10px] tracking-widest uppercase font-bold text-stone-400 block">
                  Interactive Calming Focus
                </span>
                <AnimatePresence mode="wait">
                  <motion.h4
                    key={breathState}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.4 }}
                    className="text-2xl font-serif font-bold text-stone-850"
                  >
                    {breathState === 'Inhale' && "Breathing In..."}
                    {breathState === 'Hold' && "Hold the breath"}
                    {breathState === 'Exhale' && "Exhale slowly..."}
                  </motion.h4>
                </AnimatePresence>
                <p className="text-[11px] text-stone-500 leading-normal font-light">
                  Align your posture and follow the concentric rings to quieten your central nervous system.
                </p>
              </div>
            </div>
          </div>

          {/* Compassion Intent slider */}
          <div className="card p-5 bg-gradient-to-br from-white/95 to-stone-50 border-stone-200/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={intentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  {COMPASSION_INTENTS[intentIndex].icon}
                  <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                    Daily Empathy Focus: {COMPASSION_INTENTS[intentIndex].title}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed font-light">
                  "{COMPASSION_INTENTS[intentIndex].body}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
