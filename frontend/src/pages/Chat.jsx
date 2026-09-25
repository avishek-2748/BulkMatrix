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
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[calc(100vh-120px)] flex">
      
      {/* Sidebar: Chat Threads */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-500" /> Messages
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No active chats.</p>
              <p className="text-xs mt-2">Start a contract negotiation to begin chatting.</p>
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
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex items-start gap-4 hover:bg-gray-50 ${isActive ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0 relative">
                    {partner.company ? partner.company.charAt(0) : partner.name ? partner.name.charAt(0) : 'U'}
                    {thread.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{partner.company || partner.name || 'Counterparty'}</h4>
                      {thread.lastMessage && (
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(thread.lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate font-medium">
                      {thread.contract.volume?.toLocaleString()}t {thread.contract.cargoType} • {thread.contract.originPort}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-1">
                      {thread.lastMessage ? thread.lastMessage.message : 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-2/3 flex flex-col bg-white">
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
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {partner.company ? partner.company.charAt(0) : partner.name ? partner.name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        {partner.company || partner.name || 'Counterparty'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Circle size={8} className="fill-green-500 text-green-500" />
                        <span>Contract #{activeThread.contract._id.slice(-6).toUpperCase()}</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full font-semibold">{activeThread.contract.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Charter Details</span>
                    <span className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                      <Ship size={14} /> {activeThread.contract.volume?.toLocaleString()}t {activeThread.contract.cargoType}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <MessageSquare size={48} className="text-gray-300" />
                  <p>No messages yet. Send a message to start negotiating.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId._id === user._id || msg.senderId === user._id;
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${isMe ? 'bg-blue-600 text-white rounded-t-2xl rounded-bl-2xl' : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-t-2xl rounded-br-2xl'} p-4 relative`}>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <span className={`text-[10px] mt-2 block ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
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
            <div className="p-5 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full border-2 border-gray-100 rounded-xl p-4 pr-12 text-sm resize-none outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-gray-50 hover:bg-white"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center flex-shrink-0"
                  style={{ height: '54px', width: '54px' }}
                >
                  {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
            <MessageSquare size={64} className="text-gray-200 mb-4" />
            <p className="text-lg font-medium text-gray-500">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
