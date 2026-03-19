import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { MessageSquare, Send, User as UserIcon } from 'lucide-react';
import type { CurrentUser } from '@/hooks/useAuth';
import {
  createChatSocket,
  getChatDisplayName,
  getChatUserId,
  isStaffRole,
} from '@/lib/chatSocket';

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

const mergeActiveClients = (
  currentClients: ActiveClient[],
  incomingClients: ActiveClient[],
  defaults: Partial<ActiveClient> = {},
) => {
  const mergedClients = new Map(currentClients.map((client) => [client.userId, client]));

  incomingClients.forEach((client) => {
    const existingClient = mergedClients.get(client.userId);
    mergedClients.set(client.userId, {
      ...defaults,
      ...existingClient,
      ...client,
    });
  });

  return Array.from(mergedClients.values());
};

export function StaffChatDashboard({ user, isEmbedded }: StaffChatDashboardProps) {
  const [activeClients, setActiveClients] = useState<ActiveClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [inputValue, setInputValue] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const selectedClientIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const staffUserId = getChatUserId(user);
  const staffRole = user?.role || 'staff';
  const staffName = getChatDisplayName(user, 'Staff');
  const canUseStaffChat = Boolean(user && isStaffRole(user.role));
  const selectedClient = selectedClientId
    ? activeClients.find((client) => client.userId === selectedClientId) || null
    : null;
  const currentHistory = selectedClientId ? chatHistories[selectedClientId] || [] : [];

  useEffect(() => {
    selectedClientIdRef.current = selectedClientId;
  }, [selectedClientId]);

  useEffect(() => {
    if (!canUseStaffChat || !staffUserId) {
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
        userId: staffUserId,
        role: staffRole,
        name: staffName,
      });
    };

    const handleActiveClients = (clients: ActiveClient[]) => {
      setActiveClients((prev) => mergeActiveClients(prev, clients));
    };

    const handleLoadAllHistories = (histories: Record<string, ChatMessage[]>) => {
      setChatHistories(histories);
    };

    const handleClientOnline = (clients: ActiveClient[]) => {
      setActiveClients((prev) =>
        mergeActiveClients(prev, clients, {
          isOnline: true,
          unreadCount: 0,
        }),
      );
    };

    const handleClientOffline = (offlineUserId: string) => {
      setActiveClients((prev) =>
        prev.map((client) =>
          client.userId === offlineUserId ? { ...client, isOnline: false } : client,
        ),
      );
    };

    const handleReceiveMessage = (msg: ChatMessage) => {
      const conversationId = msg.isStaff ? msg.receiverId : msg.senderId;
      if (!conversationId) return;

      setChatHistories((prev) => {
        const history = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: [...history, msg],
        };
      });

      if (selectedClientIdRef.current === conversationId) {
        return;
      }

      setActiveClients((prev) =>
        prev.map((client) =>
          client.userId === conversationId
            ? { ...client, unreadCount: (client.unreadCount || 0) + 1 }
            : client,
        ),
      );
    };

    socket.on('connect', handleConnect);
    socket.on('active_clients', handleActiveClients);
    socket.on('load_all_histories', handleLoadAllHistories);
    socket.on('client_online', handleClientOnline);
    socket.on('client_offline', handleClientOffline);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('active_clients', handleActiveClients);
      socket.off('load_all_histories', handleLoadAllHistories);
      socket.off('client_online', handleClientOnline);
      socket.off('client_offline', handleClientOffline);
      socket.off('receive_message', handleReceiveMessage);
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [canUseStaffChat, staffName, staffRole, staffUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentHistory.length, selectedClientId]);

  const selectClient = (client: ActiveClient) => {
    setSelectedClientId(client.userId);
    setActiveClients((prev) =>
      prev.map((currentClient) =>
        currentClient.userId === client.userId
          ? { ...currentClient, unreadCount: 0 }
          : currentClient,
      ),
    );
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current || !staffUserId || !selectedClientId) return;

    socketRef.current.emit('send_message', {
      senderId: staffUserId,
      receiverId: selectedClientId,
      role: staffRole,
      message: inputValue.trim(),
    });

    setInputValue('');
  };

  const selectedClientIsOnline = selectedClient?.isOnline ?? false;

  return (
    <div
      className={`flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${
        isEmbedded ? 'h-[600px]' : 'h-screen'
      }`}
    >
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
                    selectedClientId === client.userId
                      ? 'bg-pink-50 border border-pink-100 shadow-sm'
                      : 'hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0 text-slate-500 font-semibold relative">
                      {client.name?.charAt(0).toUpperCase() || <UserIcon size={20} />}
                      {client.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div className="truncate">
                      <p
                        className={`text-sm truncate ${
                          selectedClientId === client.userId
                            ? 'font-semibold text-pink-900'
                            : 'font-medium text-slate-700'
                        }`}
                      >
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

      <div className="flex-1 flex flex-col bg-white">
        {!selectedClient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="opacity-20 mb-4" />
            <p>Select a client from the sidebar to start chatting</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-lg">
                  {selectedClient.name?.charAt(0).toUpperCase() || <UserIcon size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{selectedClient.name}</h3>
                  <p
                    className={`text-xs flex items-center gap-1 ${
                      selectedClientIsOnline ? 'text-green-600' : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block ${
                        selectedClientIsOnline ? 'bg-green-500' : 'bg-slate-400'
                      }`}
                    ></span>
                    {selectedClientIsOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

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
                      <div
                        className={`max-w-[70%] rounded-2xl px-5 py-3 text-[15px] shadow-sm leading-relaxed ${
                          isMe
                            ? 'bg-pink-600 text-white rounded-tr-sm'
                            : 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200/50'
                        }`}
                      >
                        {msg.message}
                        <div
                          className={`text-[11px] mt-1.5 flex items-center ${
                            isMe ? 'text-pink-100 justify-end' : 'text-slate-400 justify-start'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

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
                  <Send size={16} className={inputValue.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
