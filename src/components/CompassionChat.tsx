import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Sparkles, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
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
  }, [messages]);

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
      className="flex flex-col h-[600px] card overflow-hidden"
    >
      <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-karuna-olive flex items-center justify-center text-white">
            <Logo size={24} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold">Karuna Dialogue</h3>
            <p className="text-xs text-stone-500 italic">Modeling compassion in every word</p>
          </div>
        </div>
        
        {/* Global Voice Options */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (autoRead) {
                window.speechSynthesis.cancel();
                setSpeakingMessageId(null);
              }
              setAutoRead(!autoRead);
            }}
            title={autoRead ? "Disable Auto-Read" : "Enable Auto-Read"}
            className={`p-2.5 rounded-full transition-all ${
              autoRead 
                ? 'bg-karuna-olive/10 text-karuna-olive ring-1 ring-karuna-olive/20' 
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
            }`}
          >
            {autoRead ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-karuna-bg/30"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-stone-200 text-stone-600' : 'bg-karuna-olive text-white'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div className="relative group">
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-karuna-olive text-white rounded-tr-none' 
                      : 'bg-white text-stone-800 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  
                  {/* Single Message read/speak option button */}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => speakMessage(msg.id, msg.content)}
                      className={`absolute -right-10 top-2 p-1.5 rounded-full shadow-sm bg-white border border-stone-100 transition-opacity flex items-center justify-center ${
                        speakingMessageId === msg.id 
                          ? 'opacity-100 text-karuna-olive ring-1 ring-karuna-olive/20' 
                          : 'opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-600'
                      }`}
                      title={speakingMessageId === msg.id ? "Pause speech" : "Read message out loud"}
                    >
                      <Volume2 size={14} className={speakingMessageId === msg.id ? "animate-pulse" : ""} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-karuna-olive text-white flex items-center justify-center animate-pulse">
                <Sparkles size={16} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-stone-100">
        <div className="relative flex items-center gap-2">
          {/* Microphone dictate button */}
          <button
            onClick={toggleListen}
            className={`p-3 rounded-full transition-all flex items-center justify-center ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse shadow-md ring-4 ring-rose-500/15' 
                : 'bg-karuna-bg text-stone-500 hover:text-stone-700 hover:bg-stone-100'
            }`}
            title={isListening ? "Listening... click to stop" : "Speak to KarunaAI"}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening... start speaking" : "Share what's on your heart..."}
              className="w-full pl-4 pr-12 py-3 bg-karuna-bg rounded-full border-none focus:ring-2 focus:ring-karuna-olive/20 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-8 h-8 rounded-full bg-karuna-olive text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

