import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const icon = type === 'success' 
    ? <CheckCircle className="w-5 h-5 text-primary" /> 
    : <XCircle className="w-5 h-5 text-red-500" />;

  const borderColor = type === 'success' ? 'border-primary' : 'border-red-500';
  const textColor = type === 'success' ? 'text-primary' : 'text-red-500';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`bg-black border ${borderColor} rounded-lg px-6 py-4 shadow-lg flex items-center gap-3`}>
            {icon}
            <span className={`font-medium ${textColor}`}>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
