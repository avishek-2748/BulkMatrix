import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getChatThreads, getChatMessages, sendMessage } from '../services/api';
import { Send, Loader2, MessageSquare, Anchor, Ship, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Chat = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const fetchThreads = async () => {
    try {
      const data = await getChatThreads();
      setThreads(data);
      if (data.length > 0 && !activeThread) {
        setActiveThread(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch chat threads", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contractId) => {
    try {
      const data = await getChatMessages(contractId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  // Fetch threads on mount
  useEffect(() => {
    fetchThreads();
  }, []);

  // Poll for messages when a thread is active
  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread.contract._id);
      
      // Setup polling every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(activeThread.contract._id);
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeThread]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThread) return;

    setSending(true);
    try {
      // Determine the receiver based on the other party in the contract
      const contract = activeThread.contract;
      const currentUserId = user?._id?.toString() || user?.id?.toString();
      const receiverId = (contract.logisticManagerId?._id?.toString() === currentUserId)
        ? (contract.vesselOwnerId?._id || contract.vesselOwnerId)
        : (contract.logisticManagerId?._id || contract.logisticManagerId);
      
      const sentMsg = await sendMessage({
        contractId: contract._id,
        receiverId,
        message: newMessage
      });
      
      setMessages(prev => [...prev, sentMsg]);
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm font-medium text-slate-500">Loading secure charter negotiations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 max-w-[1400px] mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="saas-title flex items-center gap-2.5">
              <MessageSquare className="text-blue-600" size={24} /> Direct Communications
            </h1>
            <span className="saas-badge saas-badge-success flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              END-TO-END ENCRYPTED
            </span>
          </div>
          <p className="saas-subtitle">
            Bilateral fixture negotiations, charter party terms clarification, and direct broker dispatch.
          </p>
        </div>

        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200">
          <Circle size={8} className="fill-emerald-500 text-emerald-500" />
          <span>Real-time channel active</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="saas-card p-0 overflow-hidden border border-slate-200 shadow-sm h-[calc(100vh-250px)] min-h-[580px] flex flex-col md:flex-row">
        {/* Sidebar: Chat Threads */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Inquiries ({threads.length})
              </h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {threads.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No active negotiations</p>
                <p className="text-xs mt-1 text-slate-400">Inbound charter requests will appear here automatically.</p>
              </div>
            ) : (
              threads.map(thread => {
                const currentUserId = user?._id?.toString() || user?.id?.toString();
                const managerId = thread.contract.logisticManagerId?._id?.toString() || thread.contract.logisticManagerId?.toString();
                const partner = (managerId === currentUserId)
                  ? (thread.contract.vesselOwnerId || {})
                  : (thread.contract.logisticManagerId || {});
                const isActive = activeThread?.contract._id === thread.contract._id;

                return (
                  <div 
                    key={thread.contract._id}
                    onClick={() => setActiveThread(thread)}
                    className={`p-4 cursor-pointer transition-all flex items-start gap-3.5 ${
                      isActive 
                        ? 'bg-blue-50/80 border-l-4 border-l-blue-600 shadow-sm' 
                        : 'border-l-4 border-l-transparent hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 font-bold flex items-center justify-center shrink-0 border border-blue-200/60 relative text-sm">
                      {partner.company ? partner.company.charAt(0) : partner.name ? partner.name.charAt(0) : 'U'}
                      {thread.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {partner.company || partner.name || 'Counterparty'}
                        </h4>
                        {thread.lastMessage && (
                          <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                            {formatDistanceToNow(new Date(thread.lastMessage.createdAt), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate font-medium">
                        {thread.contract.volume?.toLocaleString()}t {thread.contract.cargoType} • {thread.contract.originPort}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-1">
                        {thread.lastMessage ? thread.lastMessage.message : 'Initiated channel'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {activeThread ? (
            <>
              {/* Chat Header */}
              {(() => {
                const currentUserId = user?._id?.toString() || user?.id?.toString();
                const managerId = activeThread.contract.logisticManagerId?._id?.toString() || activeThread.contract.logisticManagerId?.toString();
                const partner = (managerId === currentUserId)
                  ? (activeThread.contract.vesselOwnerId || {})
                  : (activeThread.contract.logisticManagerId || {});

                return (
                  <div className="p-4 sm:px-6 border-b border-slate-200 flex justify-between items-center bg-white z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {partner.company ? partner.company.charAt(0) : partner.name ? partner.name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          {partner.company || partner.name || 'Counterparty'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <Circle size={7} className="fill-emerald-500 text-emerald-500" />
                          <span>Contract #{activeThread.contract._id.slice(-6).toUpperCase()}</span>
                          <span className="saas-badge saas-badge-neutral text-[10px] py-0">{activeThread.contract.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Fixture Scope</span>
                      <span className="text-xs font-semibold text-blue-700 flex items-center justify-end gap-1 mt-0.5">
                        <Ship size={13} /> {activeThread.contract.volume?.toLocaleString()}t {activeThread.contract.cargoType}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <MessageSquare size={40} className="text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No messages exchanged yet</p>
                    <p className="text-xs text-slate-400">Send an inquiry or rate proposal to start negotiations.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[78%] sm:max-w-[68%] ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-2xl rounded-br-none shadow-sm' 
                            : 'bg-white border border-slate-200/80 text-slate-800 rounded-2xl rounded-bl-none shadow-sm'
                        } p-3.5 px-4 relative`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          <span className={`text-[10px] mt-1.5 block ${isMe ? 'text-blue-100 text-right' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a proposal or inquiry... (Enter to send, Shift+Enter for new line)"
                      className="w-full border border-slate-200 rounded-xl p-3.5 text-sm resize-none outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all bg-slate-50 focus:bg-white text-slate-800"
                      rows="2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="saas-btn-primary flex items-center justify-center shrink-0 h-[48px] px-5"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 p-8 text-center">
              <MessageSquare size={48} className="text-slate-300 mb-3" />
              <p className="text-base font-bold text-slate-700">Select a conversation thread</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">Choose a vessel charter party inquiry from the left to view negotiation logs and send messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
