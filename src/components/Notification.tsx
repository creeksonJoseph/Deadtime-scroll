import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

export default function Notification({ type, title, message, onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
  };

  const colors = {
    success: {
      bg: 'bg-primary/10 border-primary',
      icon: 'text-primary',
      title: 'text-primary',
    },
    error: {
      bg: 'bg-red-500/10 border-red-500',
      icon: 'text-red-500',
      title: 'text-red-500',
    },
    info: {
      bg: 'bg-cyan-500/10 border-cyan-500',
      icon: 'text-cyan-500',
      title: 'text-cyan-500',
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500',
      icon: 'text-yellow-500',
      title: 'text-yellow-500',
    },
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full ${colors[type].bg} border-2 rounded-lg p-4 shadow-2xl animate-slide-in-right`}
      style={{
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <div className="flex items-start gap-3">
        <div className={colors[type].icon}>{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg ${colors[type].title} mb-1`}>{title}</h3>
          {message && <p className="text-zinc-300 text-sm">{message}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
