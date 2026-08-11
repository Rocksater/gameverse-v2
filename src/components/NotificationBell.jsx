import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaHeart, FaComment } from 'react-icons/fa6';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*, actor:actor_id(username, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.read).length);
    } catch (err) {
      console.error('Notification Error:', err.message);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Subscribe to Real-time Notifications
    const channel = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          fetchNotifications(); // Refresh notifications on new payload
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id);

      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark read:', err.message);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) markAllAsRead();
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={toggleDropdown}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--gv-text)',
          fontSize: '1.2rem',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: '0.4rem',
        }}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '2.5rem',
            width: '320px',
            backgroundColor: 'var(--gv-card)',
            border: '1px solid var(--gv-border)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--gv-border)', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Notifications
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{ padding: '1rem', color: 'var(--gv-muted)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--gv-border)',
                    backgroundColor: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  {n.type === 'like' ? (
                    <FaHeart style={{ color: '#ef4444', fontSize: '1rem' }} />
                  ) : (
                    <FaComment style={{ color: '#a855f7', fontSize: '1rem' }} />
                  )}
                  <div style={{ fontSize: '0.825rem' }}>
                    <strong>{n.actor?.username || 'Someone'}</strong> {n.type === 'like' ? 'liked your post' : 'replied to your post'}.
                    <div style={{ fontSize: '0.7rem', color: 'var(--gv-muted)', marginTop: '0.1rem' }}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;