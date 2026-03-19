import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import { MessageCircle, Send, X } from 'lucide-react';
import type { CurrentUser as User } from '@/hooks/useAuth';
import {
  createChatSocket,
  getChatDisplayName,
  getChatUserId,
  isStaffRole,
} from '@/lib/chatSocket';

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

export const ChatPopup: React.FC<ChatPopupProps> = ({ user, isLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const isOpenRef = useRef(isOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userId = getChatUserId(user);
  const userRole = user?.role || 'client';
  const displayName = getChatDisplayName(user, 'Client');
  const isClient = Boolean(user && !isStaffRole(user.role));

  useEffect(() => {
    setMessages([]);
    setUnreadCount(0);
  }, [user?._id, user?.id, user?.email]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isLoggedIn || !isClient || !userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = createChatSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      socket.emit('join_chat', {
        userId,
        role: userRole,
        name: displayName,
      });
    };

    const handleLoadChatHistory = (history: ChatMessage[] = []) => {
      setMessages(history);
    };

    const handleReceiveMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      if (!isOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('load_chat_history', handleLoadChatHistory);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('load_chat_history', handleLoadChatHistory);
      socket.off('receive_message', handleReceiveMessage);
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [displayName, isClient, isLoggedIn, userId, userRole]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!isLoggedIn || !user) {
      alert('Ban can dang nhap de tro chuyen.');
      setIsOpen(false);
      navigate('/login');
      return;
    }

    if (!socketRef.current || !userId) return;

    socketRef.current.emit('send_message', {
      senderId: userId,
      role: userRole,
      name: displayName,
      message: inputValue.trim(),
    });

    setInputValue('');
  };

  if (isLoggedIn && user && isStaffRole(user.role)) {
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

          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <div className="p-4 bg-slate-100 rounded-full">
                  <MessageCircle size={40} className="text-slate-300" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-slate-500">How can we help you today?</p>
                  <p className="text-xs text-slate-400 mt-1">Send us a message and we&apos;ll reply as soon as possible.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = !msg.isStaff;

                return (
                  <div
                    key={idx}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] shadow-sm leading-relaxed ${
                        isMe
                          ? 'bg-pink-600 text-white rounded-tr-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.message}
                      <div
                        className={`text-[10px] mt-1.5 ${
                          isMe ? 'text-pink-100' : 'text-slate-400'
                        } flex items-center ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

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
                <Send size={16} className={inputValue.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
