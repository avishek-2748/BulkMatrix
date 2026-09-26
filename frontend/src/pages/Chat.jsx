import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getChatThreads, getChatMessages, sendMessage } from '../services/api';
import { Send, Loader2, MessageSquare, Ship, Circle, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Helper to safely extract string ID from any user or ID reference
const extractId = (entity) => {
  if (!entity) return '';
  if (typeof entity === 'string') return entity;
  if (entity._id) {
    return typeof entity._id === 'string' ? entity._id : entity._id.toString();
  }
  if (entity.id) {
    return typeof entity.id === 'string' ? entity.id : entity.id.toString();
  }
  if (entity.userId) {
    return typeof entity.userId === 'string' ? entity.userId : entity.userId.toString();
  }
  if (typeof entity.toString === 'function') {
    const s = entity.toString();
    if (s && s !== '[object Object]') return s;
  }
  return '';
};

// Helper to extract the sender ID from a message document
const getMessageSenderId = (msg) => {
  if (!msg) return '';
  return (
    extractId(msg.senderId) ||
    extractId(msg.sender) ||
    extractId(msg.userId) ||
    extractId(msg.authorId) ||
    extractId(msg.createdBy)
  );
};

const Chat = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const prevMessageCountRef = useRef(0);

  // Authenticated user ID (string)
  const currentUserId = extractId(user);

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
    if (activeThread?.contract?._id) {
      fetchMessages(activeThread.contract._id);

      pollIntervalRef.current = setInterval(() => {
        fetchMessages(activeThread.contract._id);
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeThread?.contract?._id]);

  // Smart scroll: auto-scroll if near bottom or when new messages arrive
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    const hasNewMessages = messages.length > prevMessageCountRef.current;

    if (isNearBottom || hasNewMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThread) return;

    setSending(true);
    try {
      const contract = activeThread.contract;
      const currentId = extractId(user);
      const managerId = extractId(contract.logisticManagerId);
      const ownerId = extractId(contract.vesselOwnerId);
      const receiverId = (managerId === currentId) ? ownerId : managerId;

      const sentMsg = await sendMessage({
        contractId: contract._id,
        receiverId,
        message: newMessage.trim()
      });

      setMessages(prev => [...prev, sentMsg]);
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  const handleThreadSelect = useCallback((thread) => {
    setActiveThread(thread);
    setMobileShowChat(true);
  }, []);

  const getPartner = useCallback((contract) => {
    if (!contract) return {};
    const currentId = extractId(user);
    const managerId = extractId(contract.logisticManagerId);
    return (managerId === currentId)
      ? (contract.vesselOwnerId || {})
      : (contract.logisticManagerId || {});
  }, [user]);

  const getPartnerInitial = (partner) => {
    if (partner?.company) return partner.company.charAt(0).toUpperCase();
    if (partner?.name) return partner.name.charAt(0).toUpperCase();
    return 'U';
  };

  /**
   * CRITICAL MESSAGE ALIGNMENT DETERMINATION:
   * For EVERY message:
   * - If message was sent by the currently logged-in user => TRUE (RIGHT side, #F3752F)
   * - If message was sent by the other party/receiver => FALSE (LEFT side, #F5FAFE)
   */
  const isOwnMessage = (msg) => {
    const senderId = getMessageSenderId(msg);
    if (!currentUserId || !senderId) return false;
    return senderId === currentUserId;
  };

  // Check if consecutive messages are from the same sender for grouping
  const isSameSenderAsPrev = (idx) => {
    if (idx === 0) return false;
    const prevSenderId = getMessageSenderId(messages[idx - 1]);
    const currSenderId = getMessageSenderId(messages[idx]);
    return Boolean(prevSenderId && currSenderId && prevSenderId === currSenderId);
  };

  if (loading) {
    return (
      <div className="chat-loading-state">
        <Loader2 className="chat-loading-spinner" size={36} />
        <p className="chat-loading-text">Loading secure charter negotiations...</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <div className="chat-page-title-row">
            <h1 className="saas-title chat-page-title">
              <MessageSquare className="chat-page-icon" size={24} /> Direct Communications
            </h1>
            <span className="saas-badge saas-badge-success chat-encrypted-badge">
              <span className="chat-encrypted-dot" />
              END-TO-END ENCRYPTED
            </span>
          </div>
          <p className="saas-subtitle">
            Bilateral fixture negotiations, charter party terms clarification, and direct broker dispatch.
          </p>
        </div>

        <div className="chat-realtime-indicator">
          <Circle size={8} className="chat-realtime-dot" />
          <span>Real-time channel active</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="chat-container">
        {/* Sidebar: Chat Threads */}
        <div className={`chat-sidebar ${mobileShowChat ? 'chat-sidebar--hidden-mobile' : ''}`}>
          <div className="chat-sidebar-header">
            <h2 className="chat-sidebar-title">
              Active Inquiries ({threads.length})
            </h2>
          </div>

          <div className="chat-sidebar-list">
            {threads.length === 0 ? (
              <div className="chat-sidebar-empty">
                <MessageSquare size={32} className="chat-sidebar-empty-icon" />
                <p className="chat-sidebar-empty-title">No active negotiations</p>
                <p className="chat-sidebar-empty-sub">Inbound charter requests will appear here automatically.</p>
              </div>
            ) : (
              threads.map(thread => {
                const partner = getPartner(thread.contract);
                const isActive = activeThread?.contract._id === thread.contract._id;

                return (
                  <div
                    key={thread.contract._id}
                    onClick={() => handleThreadSelect(thread)}
                    className={`chat-thread-item ${isActive ? 'chat-thread-item--active' : ''}`}
                  >
                    {isActive && <div className="chat-thread-accent" />}
                    <div className="chat-thread-avatar">
                      {getPartnerInitial(partner)}
                      {thread.unreadCount > 0 && (
                        <span className="chat-thread-unread">{thread.unreadCount}</span>
                      )}
                    </div>
                    <div className="chat-thread-content">
                      <div className="chat-thread-top-row">
                        <h4 className="chat-thread-name">
                          {partner.company || partner.name || 'Counterparty'}
                        </h4>
                        {thread.lastMessage && (
                          <span className="chat-thread-time">
                            {formatDistanceToNow(new Date(thread.lastMessage.createdAt), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      <p className="chat-thread-meta">
                        {thread.contract.volume?.toLocaleString()}t {thread.contract.cargoType} • {thread.contract.originPort}
                      </p>
                      <p className="chat-thread-preview">
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
        <div className={`chat-main ${mobileShowChat ? 'chat-main--visible-mobile' : ''}`}>
          {activeThread ? (
            <>
              {/* Chat Header */}
              {(() => {
                const partner = getPartner(activeThread.contract);

                return (
                  <div className="chat-header">
                    <div className="chat-header-left">
                      <button
                        className="chat-header-back"
                        onClick={() => setMobileShowChat(false)}
                        aria-label="Back to conversations"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="chat-header-avatar">
                        {getPartnerInitial(partner)}
                        <span className="chat-header-online" />
                      </div>
                      <div className="chat-header-info">
                        <h3 className="chat-header-name">
                          {partner.company || partner.name || 'Counterparty'}
                        </h3>
                        <div className="chat-header-contract">
                          <Circle size={7} className="chat-header-status-dot" />
                          <span>Contract #{activeThread.contract._id.slice(-6).toUpperCase()}</span>
                          <span className="chat-header-status-badge">{activeThread.contract.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="chat-header-right">
                      <span className="chat-header-scope-label">Fixture Scope</span>
                      <span className="chat-header-scope-value">
                        <Ship size={13} /> {activeThread.contract.volume?.toLocaleString()}t {activeThread.contract.cargoType}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Messages Area */}
              <div className="chat-messages" ref={messagesContainerRef}>
                {messages.length === 0 ? (
                  <div className="chat-messages-empty">
                    <MessageSquare size={40} className="chat-messages-empty-icon" />
                    <p className="chat-messages-empty-title">No messages exchanged yet</p>
                    <p className="chat-messages-empty-sub">Send an inquiry or rate proposal to start negotiations.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const mine = isOwnMessage(msg);
                    const sameSender = isSameSenderAsPrev(idx);
                    const partner = getPartner(activeThread.contract);

                    return (
                      <div
                        key={msg._id || idx}
                        className={`chat-msg-row ${mine ? 'chat-msg-row--right' : 'chat-msg-row--left'} ${sameSender ? 'chat-msg-row--grouped' : ''}`}
                      >
                        {/* Incoming avatar (OTHER USER) — only shown on left side for first message in group */}
                        {!mine && !sameSender && (
                          <div className="chat-msg-avatar" title={partner.company || partner.name || 'Counterparty'}>
                            {getPartnerInitial(partner)}
                          </div>
                        )}
                        {!mine && sameSender && (
                          <div className="chat-msg-avatar-spacer" />
                        )}

                        {/* Message Bubble: Left (#F5FAFE) for other user, Right (#F3752F) for logged-in user */}
                        <div className={`chat-bubble ${mine ? 'chat-bubble--outgoing' : 'chat-bubble--incoming'}`}>
                          <p className="chat-bubble-text">{msg.message}</p>
                          <span className={`chat-bubble-time ${mine ? 'chat-bubble-time--outgoing' : ''}`}>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="chat-composer">
                <form onSubmit={handleSendMessage} className="chat-composer-form">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a proposal or inquiry... (Enter to send)"
                    className="chat-composer-input"
                    rows="1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    onInput={(e) => {
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="chat-composer-send"
                    aria-label="Send message"
                  >
                    {sending ? <Loader2 size={18} className="chat-composer-sending" /> : <Send size={17} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="chat-no-thread">
              <MessageSquare size={48} className="chat-no-thread-icon" />
              <p className="chat-no-thread-title">Select a conversation thread</p>
              <p className="chat-no-thread-sub">Choose a vessel charter party inquiry from the left to view negotiation logs and send messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
