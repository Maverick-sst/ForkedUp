import { useState, useEffect, createContext, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const newNotification = { id, message, type, duration };
    
    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-md">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

const Notification = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-[#39FF14] text-black border-[#2acc00]';
      case 'error':
        return 'bg-[#FF4444] text-white border-[#cc0000]';
      case 'warning':
        return 'bg-[#FFB703] text-black border-[#cc9200]';
      case 'info':
        return 'bg-[#4ECDC4] text-white border-[#3da59f]';
      default:
        return 'bg-[#39FF14] text-black border-[#2acc00]';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '✓';
    }
  };

  return (
    <div
      className={`
        ${getTypeStyles()}
        pointer-events-auto
        rounded-lg shadow-2xl border-2
        px-4 py-3 pr-10
        min-w-[280px] max-w-md
        transform transition-all duration-300 ease-in-out
        ${isExiting 
          ? 'translate-x-[400px] opacity-0' 
          : 'translate-x-0 opacity-100'
        }
      `}
      style={{
        boxShadow: notification.type === 'success' 
          ? '0 8px 24px rgba(57, 255, 20, 0.3)' 
          : '0 8px 24px rgba(0, 0, 0, 0.2)'
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-black/10 font-bold text-lg">
          {getIcon()}
        </div>

        <div className="flex-grow text-sm font-medium leading-relaxed break-words">
          {notification.message}
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
          aria-label="Close notification"
        >
          <span className="text-lg font-bold">×</span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-black/20"
          style={{
            animation: `progress ${notification.duration}ms linear forwards`
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};