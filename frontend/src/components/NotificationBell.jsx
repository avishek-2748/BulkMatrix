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
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          border: '1px solid #DADCEB',
          background: open ? '#F5FAFE' : '#FEFFFF',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.18s ease',
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F5FAFE'; e.currentTarget.style.borderColor = '#4187AB'; }}
        onMouseLeave={e => { e.currentTarget.style.background = open ? '#F5FAFE' : '#FEFFFF'; e.currentTarget.style.borderColor = '#DADCEB'; }}
      >
        <Bell size={17} color="#4187AB" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            background: '#F3752F',
            color: 'white',
            fontSize: '10px',
            fontWeight: 800,
            minWidth: '17px',
            height: '17px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #FEFFFF',
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
          top: 'calc(100% + 8px)',
          width: '360px',
          background: '#FEFFFF',
          border: '1px solid #DADCEB',
          borderRadius: '14px',
          boxShadow: '0 12px 32px rgba(19, 48, 86, 0.09)',
          zIndex: 100,
          overflow: 'hidden',
          animation: 'pageEnter 180ms ease-out',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #DADCEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F5FAFE' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#133056', margin: 0 }}>Operational Alerts</h4>
              {unreadCount > 0 && <span style={{ fontSize: '11px', color: '#586D85' }}>{unreadCount} unread</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{ fontSize: '11px', fontWeight: 600, color: '#4187AB', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#586D85' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <Bell size={32} color="#DADCEB" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '13px', color: '#586D85', fontWeight: 500 }}>All operational updates cleared.</p>
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
                      borderBottom: '1px solid #F5FAFE',
                      cursor: 'pointer',
                      background: notif.isRead ? 'transparent' : '#F5FAFE',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#EBF4FA'}
                    onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : '#F5FAFE'}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#F5FAFE', color: '#4187AB', border: '1px solid #DADCEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconCmp size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: notif.isRead ? 500 : 700, color: '#133056', margin: '0 0 3px 0', lineHeight: 1.4 }}>{notif.title}</p>
                      <p style={{ fontSize: '12px', color: '#586D85', margin: '0 0 5px 0', lineHeight: 1.4 }}>{notif.message}</p>
                      <span style={{ fontSize: '11px', color: '#8295AB' }}>
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F3752F', flexShrink: 0, marginTop: '5px' }} />
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
