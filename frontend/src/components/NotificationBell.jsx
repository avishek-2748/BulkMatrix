import React, { useState, useEffect, useRef } from 'react';
import { Bell, Package, MessageSquare, Activity, X, CheckCheck } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const typeConfig = {
  CONTRACT_REQUEST: { icon: Package, color: '#0B82C9', bg: '#EAF6FC' },
  CONTRACT_UPDATE: { icon: Activity, color: '#16A34A', bg: '#DCFCE7' },
  CHAT_MESSAGE: { icon: MessageSquare, color: '#7C3AED', bg: '#EDE9FE' },
  SYSTEM_ALERT: { icon: Bell, color: '#D97706', bg: '#FEF3C7' },
};

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 15000); // Poll count every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const fetchCount = async () => {
    try {
      const res = await api.get('/notifications/count');
      setUnreadCount(res.data.count);
    } catch (e) {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {}
  };

  const handleOpen = () => {
    if (!open) fetchNotifications();
    setOpen(!open);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await api.put(`/notifications/${notif._id}/read`);
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setOpen(false);
    // Navigate based on type and role
    if (notif.type === 'CONTRACT_REQUEST') {
      navigate('/owner/requests');
    } else if (notif.type === 'CONTRACT_UPDATE') {
      if (user?.role === 'VESSEL_OWNER') {
        navigate('/owner/contracts');
      } else {
        navigate('/contracts');
      }
    } else if (notif.type === 'CHAT_MESSAGE') {
      navigate('/chat');
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: '1px solid #D9E6EF',
          background: open ? '#EAF6FC' : '#FFFFFF',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.18s ease',
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F0F8FC'; e.currentTarget.style.borderColor = '#0B82C9'; }}
        onMouseLeave={e => { e.currentTarget.style.background = open ? '#EAF6FC' : '#FFFFFF'; e.currentTarget.style.borderColor = '#D9E6EF'; }}
      >
        <Bell size={18} color="#122F55" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#DC2626',
            color: 'white',
            fontSize: '10px',
            fontWeight: 800,
            minWidth: '18px',
            height: '18px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            padding: '0 3px',
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 10px)',
          width: '360px',
          background: '#FFFFFF',
          border: '1px solid #D9E6EF',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(18, 47, 85, 0.14)',
          zIndex: 100,
          overflow: 'hidden',
          animation: 'pageEnter 180ms ease-out',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF2F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#122F55', margin: 0 }}>Notifications</h4>
              {unreadCount > 0 && <span style={{ fontSize: '11px', color: '#5F7894' }}>{unreadCount} unread</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{ fontSize: '11px', fontWeight: 700, color: '#0B82C9', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7890A8' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <Bell size={36} color="#D9E6EF" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '13px', color: '#7890A8', fontWeight: 500 }}>You're all caught up!</p>
              </div>
            ) : (
              notifications.map(notif => {
                const config = typeConfig[notif.type] || typeConfig.SYSTEM_ALERT;
                const IconCmp = config.icon;
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #F4F7FB',
                      cursor: 'pointer',
                      background: notif.isRead ? 'transparent' : '#F8FCFF',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F0F8FC'}
                    onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : '#F8FCFF'}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: config.bg, color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconCmp size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: notif.isRead ? 500 : 700, color: '#122F55', margin: '0 0 3px 0', lineHeight: 1.4 }}>{notif.title}</p>
                      <p style={{ fontSize: '12px', color: '#5F7894', margin: '0 0 5px 0', lineHeight: 1.4 }}>{notif.message}</p>
                      <span style={{ fontSize: '11px', color: '#A0B4C4' }}>
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0B82C9', flexShrink: 0, marginTop: '4px' }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
