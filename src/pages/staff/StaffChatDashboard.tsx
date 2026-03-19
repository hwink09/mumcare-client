import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import type { CurrentUser } from '@/hooks/useAuth';

const SOCKET_URL = 'http://localhost:8017';

interface ChatMessage {
  senderId: string;
  receiverId?: string;
  message: string;
  name?: string;
  timestamp: string;
  isStaff: boolean;
}

interface ActiveClient {
  userId: string;
  name: string;
  socketId: string;
  lastActive: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface StaffChatDashboardProps {
  user?: CurrentUser | null;
  isEmbedded?: boolean;
}

export function StaffChatDashboard({ user, isEmbedded }: StaffChatDashboardProps) {
  const [activeClients, setActiveClients] = useState<ActiveClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<ActiveClient | null>(null);
  
  // Store chat histories per client (key is userId)
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [inputValue, setInputValue] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || (user.role !== 'staff' && user.role !== 'admin' && user.role !== 'manager')) {
      return;
    }

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_chat', {
        userId: user._id || user.id || user.email || `staff-${Date.now()}`,
        role: user.role,
        name: user.firstName ? `${user.firstName} ${user.lastName}` : 'Staff'
      });
    });

    socket.on('active_clients', (clients: ActiveClient[]) => {
      setActiveClients((prev) => {
        const newClients = [...prev];
        clients.forEach(c => {
          const index = newClients.findIndex(p => p.userId === c.userId);
          if (index >= 0) {
            newClients[index] = { ...newClients[index], ...c, isOnline: true };
          } else {
            newClients.push({ ...c, isOnline: true });
          }
        });
        return newClients;
      });
    });

    socket.on('load_all_histories', (histories: Record<string, ChatMessage[]>) => {
      setChatHistories(histories);
    });

    socket.on('client_online', (clients: ActiveClient[]) => {
      setActiveClients((prev) => {
        const newClients = [...prev];
        clients.forEach(c => {
          const index = newClients.findIndex(p => p.userId === c.userId);
          if (index >= 0) {
            newClients[index] = { ...newClients[index], ...c, isOnline: true };
          } else {
            newClients.push({ ...c, isOnline: true, unreadCount: 0 });
          }
        });
        return newClients;
      });
    });

    socket.on('client_offline', (userId: string) => {
      setActiveClients((prev) => prev.map(c => c.userId === userId ? { ...c, isOnline: false } : c));
    });

    socket.on('receive_message', (msg: ChatMessage) => {
      // Determine which client this message belongs to
      const conversationId = msg.isStaff ? msg.receiverId : msg.senderId;
      if (!conversationId) return;

      setChatHistories((prev) => {
        const history = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: [...history, msg]
        };
      });

      // Update unread count if not currently selected
      setSelectedClient((currentSelected) => {
        if (!currentSelected || currentSelected.userId !== conversationId) {
          setActiveClients((prevClients) => 
            prevClients.map(c => 
              c.userId === conversationId 
                ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
                : c
            )
          );
        }
        return currentSelected;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories, selectedClient]);

  const selectClient = (client: ActiveClient) => {
    setSelectedClient(client);
    // Reset unread count
    setActiveClients(prev => prev.map(c => 
      c.userId === client.userId ? { ...c, unreadCount: 0 } : c
    ));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current || !user || !selectedClient) return;

    socketRef.current.emit('send_message', {
      senderId: user._id || user.id || user.email || `staff`,
      receiverId: selectedClient.userId,
      role: user.role,
      message: inputValue.trim(),
    });

    setInputValue('');
  };

  const currentHistory = selectedClient ? (chatHistories[selectedClient.userId] || []) : [];
  
  // Find the selected client's current status from the activeClients array
  const selectedClientCurrent = activeClients.find(c => c.userId === selectedClient?.userId);
  const selectedClientIsOnline = selectedClientCurrent ? selectedClientCurrent.isOnline : false;

  return (
    <div className={`flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${isEmbedded ? 'h-[600px]' : 'h-screen'}`}>
      {/* Sidebar: Active Clients */}
      <div className="w-1/3 min-w-[250px] border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 bg-white border-b border-slate-200 shrink-0 flex items-center gap-2">
          <MessageSquare className="text-pink-600" size={20} />
          <h2 className="font-semibold text-slate-800">Live Support Chat</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {activeClients.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
              <UserIcon size={32} className="opacity-30 mb-2" />
              <p className="text-sm">No clients are currently active or chatting.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activeClients.map((client) => (
                <button
                  key={client.userId}
                  onClick={() => selectClient(client)}
                  className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${
                    selectedClient?.userId === client.userId
                      ? 'bg-pink-50 border border-pink-100 shadow-sm'
                      : 'hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0 text-slate-500 font-semibold relative">
                      {client.name?.charAt(0).toUpperCase() || <UserIcon size={20} />}
                      {client.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
                    </div>
                    <div className="truncate">
                      <p className={`text-sm truncate ${selectedClient?.userId === client.userId ? 'font-semibold text-pink-900' : 'font-medium text-slate-700'}`}>
                        {client.name || 'Client'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {client.isOnline ? 'Active now' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  {client.unreadCount ? (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                      {client.unreadCount}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedClient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="opacity-20 mb-4" />
            <p>Select a client from the sidebar to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-lg">
                  {selectedClient.name?.charAt(0).toUpperCase() || <UserIcon size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{selectedClient.name}</h3>
                  <p className={`text-xs flex items-center gap-1 ${selectedClientIsOnline ? 'text-green-600' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${selectedClientIsOnline ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                    {selectedClientIsOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentHistory.length === 0 ? (
                <div className="text-center text-slate-400 mt-10 text-sm">
                  This represents the start of your conversation with {selectedClient.name}
                </div>
              ) : (
                currentHistory.map((msg, idx) => {
                  const isMe = msg.isStaff;
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-5 py-3 text-[15px] shadow-sm leading-relaxed ${
                        isMe 
                          ? 'bg-pink-600 text-white rounded-tr-sm' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200/50'
                      }`}>
                        {msg.message}
                        <div className={`text-[11px] mt-1.5 flex items-center ${isMe ? 'text-pink-100 justify-end' : 'text-slate-400 justify-start'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 shrink-0">
              <form onSubmit={handleSend} className="flex relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Reply to ${selectedClient.name}...`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full pl-6 pr-14 py-3 text-[15px] text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-pink-600 text-white p-2.5 rounded-full disabled:bg-slate-200 disabled:text-slate-400 transition-colors hover:bg-pink-700"
                >
                  <Send size={16} className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
