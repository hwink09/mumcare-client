import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Send } from 'lucide-react';
import type { CurrentUser as User } from '@/hooks/useAuth';

interface ChatMessage {
  senderId: string;
  message: string;
  name?: string;
  avatar?: string;
  timestamp: string;
  isStaff: boolean;
}

interface ChatPopupProps {
  user: User | null;
  isLoggedIn: boolean;
}

const SOCKET_URL = 'http://localhost:8017';

export const ChatPopup: React.FC<ChatPopupProps> = ({ user, isLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear chat history when switching users
    setMessages([]);
    setUnreadCount(0);
  }, [user?._id, user?.id, user?.email]);

  useEffect(() => {
    // Only connect if logged in user is a regular client
    const isClient = user && user.role !== 'staff' && user.role !== 'admin' && user.role !== 'manager';

    if (!isLoggedIn || !isClient) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_chat', {
        userId: user._id || user.id || user.email || `guest-${Date.now()}`,
        role: user.role || 'client',
        name: user.firstName ? `${user.firstName} ${user.lastName}` : ('Client'),
      });
    });

    socket.on('load_chat_history', (history: ChatMessage[]) => {
      setMessages(history || []);
    });

    socket.on('receive_message', (msg: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicate messages by verifying timestamp or content if needed, but for now just append
        return [...prev, msg];
      });
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, isLoggedIn]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!isLoggedIn || !user) {
      alert("Bạn cần đăng nhập để trò chuyện.");
      setIsOpen(false);
      navigate('/login');
      return;
    }

    if (!socketRef.current) return;

    socketRef.current.emit('send_message', {
      senderId: user._id || user.id || user.email || `guest`,
      role: user.role || 'client',
      name: user.firstName ? `${user.firstName} ${user.lastName}` : ('Client'),
      message: inputValue.trim(),
    });

    setInputValue('');
  };

  // Hide for staff/admin even if they are logged in
  if (isLoggedIn && user && (user.role === 'staff' || user.role === 'admin' || user.role === 'manager')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-4 shadow-xl flex items-center justify-center relative transition-transform hover:scale-105"
        >
          <MessageCircle size={28} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-md border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-[380px] overflow-hidden flex flex-col h-[550px] max-h-[85vh] border border-gray-100 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-rose-500 p-4 shrink-0 flex items-center justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 mix-blend-overlay"></div>
            <div className="flex items-center space-x-3 z-10">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0 shadow-inner backdrop-blur-sm">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight tracking-wide">Support Chat</h3>
                <p className="text-pink-100 text-xs font-medium">We typically reply in a few minutes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all z-10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <div className="p-4 bg-slate-100 rounded-full">
                  <MessageCircle size={40} className="text-slate-300" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-slate-500">How can we help you today?</p>
                  <p className="text-xs text-slate-400 mt-1">Send us a message and we'll reply as soon as possible.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = !msg.isStaff;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] shadow-sm leading-relaxed ${isMe
                      ? 'bg-pink-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm'
                      }`}>
                      {msg.message}
                      <div className={`text-[10px] mt-1.5 ${isMe ? 'text-pink-100' : 'text-slate-400'} flex items-center ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.02)]">
            <form onSubmit={handleSend} className="flex relative items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-slate-100 border border-transparent rounded-full pl-5 pr-12 py-3.5 text-[15px] text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:bg-white outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-pink-600 text-white p-2.5 rounded-full disabled:bg-slate-200 disabled:text-slate-400 transition-all hover:bg-pink-700 hover:shadow-md disabled:hover:shadow-none"
              >
                <Send size={16} className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
