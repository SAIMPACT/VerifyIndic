import React, { createContext, useContext, useState, useCallback } from "react";

interface ToastContextType {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const toast = useCallback((msg: string) => {
    setMessage(msg);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => {
      setMessage(null);
    }, 2600);
    setTimeoutId(id);
  }, [timeoutId]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {message && (
        <div className="toast-banner" role="status">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
