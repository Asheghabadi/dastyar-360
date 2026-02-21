import { createContext, useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from 'uuid';

export const NotificationsContext = createContext();

const getInitialNotifications = () => {
  const saved = localStorage.getItem('notifications');
  return saved ? JSON.parse(saved) : [];
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(getInitialNotifications);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((message, options = { variant: 'info', persistent: false, id: null }) => {
    enqueueSnackbar(message, { variant: options.variant });

    if (options.persistent) {
      setNotifications(prevNotifications => {
        if (options.id && prevNotifications.some(n => n.id === options.id)) {
          return prevNotifications;
        }
        const newNotification = {
          id: options.id || uuidv4(),
          message,
          variant: options.variant,
          date: new Date().toISOString(),
          read: false,
        };
        return [newNotification, ...prevNotifications];
      });
    }
  }, [enqueueSnackbar]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, markAsRead, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
};
