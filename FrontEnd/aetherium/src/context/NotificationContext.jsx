// // NotificationContext.js
// import { createContext, useContext, useEffect, useState } from 'react';

// const NotificationContext = createContext();

// export const NotificationProvider = ({ children, userId }) => {
//   const [notifications, setNotifications] = useState([]);
//   const baseWsUrl = import.meta.env.VITE_WS_URL;
//   useEffect(() => {
//     // WebSocket connection
//     const ws = new WebSocket(`${baseWsUrl}/ws/${userId}`);
    
//     ws.onmessage = (event) => {
//       const notification = JSON.parse(event.data);
//       setNotifications(prev => [notification, ...prev]);
      
//       // Show toast notification
//       showToast(notification.message);
//     };
    
//     return () => ws.close();
//   }, [userId]);
  
//   return (
//     <NotificationContext.Provider value={{ notifications, setNotifications }}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);

import { createContext, useContext, useEffect, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const baseWsUrl = import.meta.env.VITE_WS_URL;

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if (!userId) return;

    // WebSocket connection
    const ws = new WebSocket(`${baseWsUrl}/ws/${userId}`);
    ws.onmessage = (event) => console.log("Received:", event.data);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        setNotifications(prev => [notification, ...prev]);
        
        // Show toast notification
        showToast(notification.message, 'info');
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [userId, baseWsUrl]);
  
  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      setNotifications, 
      toasts, 
      showToast, 
      removeToast 
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </NotificationContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300 ease-in-out"
          style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">New Notification</p>
              <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => removeToast(toast.id)}
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};