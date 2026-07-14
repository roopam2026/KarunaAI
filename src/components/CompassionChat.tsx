import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Sparkles, Mic, MicOff, Volume2, VolumeX, Compass, Info } from 'lucide-react';
import Logo from './Logo';
import { generateCompassionateResponse } from '../services/gemini';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function CompassionChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to KarunaAI. I am here to help you navigate life's complexities with compassion. Is there something on your mind that we could explore together?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? prev + ' ' : '') + transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Read newest assistant message if autoRead is on
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && autoRead) {
      speakMessage(lastMessage.id, lastMessage.content);
    }
  }, [messages, autoRead]);

  const speakMessage = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(id);

    // Filter emojis/non-speakable elements simple clean
    const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    // Prefer standard high quality English voice with warm pitch
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')) || 
                        voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) || 
                        voices.find((v) => v.lang.startsWith('en'));
                        
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    // Warm and elegant unhurried narration parameters
    utterance.rate = 0.96;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try using modern Google Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (isListening) {
      recognitionRef.current.stop();
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateCompassionateResponse(input);
      const assistantMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response || "I'm reflecting on how to best support you. Could you tell me more?" 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col h-[580px] card overflow-hidden bg-white/95 border-stone-200/40 shadow-xl shadow-stone-100/30"
    >
      {/* Dialogue Header */}
      <div className="p-5 md:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/60 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-karuna-olive flex items-center justify-center text-white shadow-sm ring-4 ring-karuna-olive/5">
            <Logo size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-stone-900 leading-none">Karuna Dialogue</h3>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-stone-500 text-xs mt-1 leading-none font-light">Modeling compassionate listening and thoughtful co-reflection</p>
          </div>
        </div>
        
        {/* Voice auto-read settings controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (autoRead) {
                window.speechSynthesis.cancel();
                setSpeakingMessageId(null);
              }
              setAutoRead(!autoRead);
            }}
            title={autoRead ? "Disable Auto-Read Responses" : "Enable Auto-Read Responses"}
            className={`p-2.5 rounded-full transition-all duration-300 ${
              autoRead 
                ? 'bg-karuna-olive/10 text-karuna-olive ring-2 ring-karuna-olive/15' 
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
          >
            {autoRead ? <Volume2 size={16} className="animate-pulse" /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Messages Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-stone-50/20 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[78%] flex gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Persona Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-stone-100 border border-stone-200 text-stone-600' 
                    : 'bg-karuna-olive text-white ring-4 ring-karuna-olive/5'
                }`}>
                  {msg.role === 'user' ? <User size={15} /> : <Sparkles size={15} />}
                </div>

                {/* Message Body Capsule */}
                <div className="relative group/msg">
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-karuna-olive text-white rounded-tr-none shadow-md shadow-karuna-olive/10' 
                      : 'bg-white text-stone-800 rounded-tl-none border border-stone-150/70 shadow-sm leading-relaxed'
                  }`}>
                    <p className="text-xs sm:text-sm whitespace-pre-wrap font-light">{msg.content}</p>
                  </div>
                  
                  {/* Single Speak out loud trigger */}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => speakMessage(msg.id, msg.content)}
                      className={`absolute -right-11 top-2.5 p-2 rounded-full shadow-md bg-white border border-stone-100 transition-all duration-300 flex items-center justify-center ${
                        speakingMessageId === msg.id 
                          ? 'opacity-100 text-karuna-olive ring-2 ring-karuna-olive/10 scale-105' 
                          : 'opacity-0 group-hover/msg:opacity-100 text-stone-400 hover:text-stone-700 hover:bg-stone-50'
                      }`}
                      title={speakingMessageId === msg.id ? "Pause Voice narration" : "Listen out loud"}
                    >
                      <Volume2 size={13} className={speakingMessageId === msg.id ? "animate-pulse" : ""} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Dynamic loading typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3.5 items-center">
              <div className="w-8 h-8 rounded-full bg-karuna-olive text-white flex items-center justify-center animate-pulse">
                <Sparkles size={15} />
              </div>
              <div className="bg-white px-5 py-4.5 rounded-2xl rounded-tl-none border border-stone-100 shadow-sm flex items-center gap-1.5">
                <span className="text-stone-400 text-xs font-light mr-1">Karuna is reflecting</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-karuna-olive/40 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-karuna-olive/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-karuna-olive/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Structured Text / Dictation Input Bar */}
      <div className="p-4 bg-stone-50/80 border-t border-stone-100 z-10">
        <div className="relative flex items-center gap-3 max-w-4xl mx-auto">
          {/* Audio dictation toggle with pulsing glow ring */}
          <button
            onClick={toggleListen}
            className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center shrink-0 ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse shadow-md ring-4 ring-rose-500/20' 
                : 'bg-white text-stone-500 hover:text-stone-700 hover:bg-stone-100 border border-stone-200/60 shadow-sm'
            }`}
            title={isListening ? "Listening... click to pause" : "Speak into dialogue chamber"}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Styled input form container */}
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening... speak clearly" : "Share what is resting on your heart today..."}
              className="w-full pl-5 pr-14 py-3 bg-white border border-stone-200/70 focus:border-karuna-olive/40 rounded-full text-xs sm:text-sm outline-none transition-all focus:ring-4 focus:ring-karuna-olive/5 text-stone-800 shadow-inner placeholder-stone-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-8.5 h-8.5 rounded-full bg-karuna-olive text-white flex items-center justify-center hover:bg-[#4E4E37] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-karuna-olive/10"
              title="Send message"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
        
        {/* Small tips caption */}
        <div className="flex justify-between items-center px-4 mt-2 text-[10px] text-stone-400 font-light">
          <span>Your words are safe, private, and computed server-side.</span>
          <span className="hidden sm:inline-block">Press Enter ↵ to Send</span>
        </div>
      </div>
    </motion.div>
  );
}
