import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, WifiOff, Sparkles, Loader2 } from 'lucide-react';
import { useLocalStorage, useNetworkStatus } from '@/hooks';
import { geminiService } from '@/services/geminiService';
import { getOfflineProtocol } from '@/data/offlineProtocols';
import type { ChatMessage } from '@/types';

const WELCOME_MESSAGE: ChatMessage = {
  type: 'bot',
  text: `🛡️ **GUARDIAN AI ACTIVE**

I'm your emergency medical assistant with **200+ offline disaster protocols** ready to help.

**How to use:**
• Describe your emergency (e.g., "severe bleeding from arm")
• I'll provide immediate first aid steps
• Works **offline** when connectivity is lost

**What can I help with?**
🩸 Bleeding & Trauma | 🦴 Fractures | 🫁 Breathing Issues
🔥 Burns | 🤰 Maternal Care | 🧠 Head Injuries | 😰 Panic/Stress

**Describe your emergency now.**`,
  timestamp: Date.now(),
};

const QUICK_ACTIONS = [
  'Severe bleeding',
  'Broken bone',
  "Can't breathe",
  'Burn injury',
  'Head trauma',
  'Panic attack',
];

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
}

const MessageBubble = memo<MessageBubbleProps>(function MessageBubble({ message, index }) {
  const isBot = message.type === 'bot';
  
  // Parse markdown-like formatting
  const formatText = (text: string): React.ReactNode => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('🚨') || line.startsWith('🩹') || line.startsWith('🚑')) {
        return (
          <p key={i} className="text-red-400 font-black text-xs uppercase tracking-wider mb-2 mt-3">
            {line}
          </p>
        );
      }
      // Numbered steps with emojis
      if (/^[\d️⃣]/.test(line)) {
        return (
          <p key={i} className="text-slate-200 text-[11px] mb-1.5 pl-1">
            {line}
          </p>
        );
      }
      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className="text-slate-300 text-[11px] mb-1">
            {parts.map((part, j) => 
              part.startsWith('**') && part.endsWith('**') ? (
                <span key={j} className="font-bold text-white">
                  {part.slice(2, -2)}
                </span>
              ) : (
                part
              )
            )}
          </p>
        );
      }
      // Regular text
      return line ? (
        <p key={i} className="text-slate-300 text-[11px] mb-1">
          {line}
        </p>
      ) : null;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[90%] p-4 rounded-2xl text-[11px] leading-relaxed shadow-xl ${
          isBot
            ? 'bg-slate-800/80 text-cyan-50 border border-cyan-500/20 rounded-tl-none'
            : 'bg-cyan-600 text-white rounded-tr-none'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          {isBot ? (
            <>
              <Bot size={14} className="text-cyan-400" />
              <span className="text-[9px] uppercase tracking-wider font-bold text-cyan-400">
                Guardian AI
              </span>
            </>
          ) : (
            <>
              <User size={14} />
              <span className="text-[9px] uppercase tracking-wider font-bold">
                You
              </span>
            </>
          )}
        </div>
        <div className="whitespace-pre-wrap">
          {formatText(message.text)}
        </div>
      </div>
    </motion.div>
  );
});

interface GuardianChatProps {
  onToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const GuardianChat: React.FC<GuardianChatProps> = memo(function GuardianChat({ onToast }) {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('quakelens_chat', [WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isOnline } = useNetworkStatus();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      type: 'user',
      text: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setLoading(true);

    // Try online mode first if available
    if (isOnline && isOnlineMode) {
      try {
        const result = await geminiService.generateEmergencyResponse(currentInput);
        
        if (result.success && result.response) {
          const botMessage: ChatMessage = {
            type: 'bot',
            text: `🌐 **CLOUD AI RESPONSE**\n\n${result.response}`,
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, botMessage]);
          onToast?.('Online response received', 'success');
          setLoading(false);
          return;
        } else if (result.error === 'API_KEY_MISSING') {
          setIsOnlineMode(false);
          onToast?.('API key not configured. Using offline mode.', 'warning');
        } else {
          // Fall through to offline mode
          onToast?.('Online service unavailable. Using offline protocols.', 'warning');
        }
      } catch (error) {
        console.error('Gemini API error:', error);
        onToast?.('Connection error. Using offline protocols.', 'warning');
      }
    }

    // Offline mode fallback
    setTimeout(() => {
      const protocol = getOfflineProtocol(currentInput);
      const botMessage: ChatMessage = {
        type: 'bot',
        text: `💾 **OFFLINE PROTOCOL**\n\n**${protocol.title}**\n\n${protocol.content}\n\n---\n*This response uses local emergency protocols. Connect to internet for enhanced AI guidance.*`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
    }, 600);
  }, [input, loading, isOnline, isOnlineMode, setMessages, onToast]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleQuickAction = useCallback((action: string) => {
    setInput(action);
    inputRef.current?.focus();
  }, []);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    onToast?.('Chat history cleared', 'info');
  }, [setMessages, onToast]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-[520px]"
    >
      {/* Status Bar */}
      <div className="flex items-center justify-between px-2 mb-3">
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="flex items-center gap-1 text-[9px] text-yellow-500 uppercase tracking-wider font-bold">
              <WifiOff size={12} />
              Offline Mode
            </span>
          )}
          {isOnline && !isOnlineMode && (
            <span className="flex items-center gap-1 text-[9px] text-cyan-400 uppercase tracking-wider font-bold">
              <Sparkles size={12} />
              Offline Only
            </span>
          )}
        </div>
        <button
          onClick={clearChat}
          className="text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-2 scrollbar-hide pb-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <MessageBubble key={`${message.timestamp}-${index}`} message={message} index={index} />
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 ml-2"
          >
            <Loader2 size={14} className="text-cyan-400 animate-spin" />
            <span className="text-[9px] text-cyan-400 font-mono uppercase tracking-wider animate-pulse">
              Processing Emergency Protocol...
            </span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            onClick={() => handleQuickAction(action)}
            className="flex-shrink-0 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full text-[9px] text-slate-300 hover:bg-slate-700/50 hover:border-cyan-500/30 transition-all whitespace-nowrap"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mt-2 flex gap-2 p-2 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-md">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe emergency (e.g., severe bleeding from leg)..."
          disabled={loading}
          className="flex-1 bg-transparent px-4 py-3 text-xs outline-none text-white placeholder-slate-600 font-medium disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-cyan-600 p-3 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 transition-all"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </motion.div>
  );
});

export default GuardianChat;
