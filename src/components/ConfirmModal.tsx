import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  revivalId?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  title = 'Project Revived!',
  message = 'Your revival has been successfully registered.',
  revivalId,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-zinc-900 border-2 border-primary rounded-lg max-w-md w-full shadow-2xl animate-scale-in"
        style={{
          animation: 'scaleIn 0.3s ease-out',
        }}
      >
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-white mb-3">{title}</h2>
          <p className="text-zinc-400 mb-8">{message}</p>

          <div className="flex flex-col gap-3">
            <Link
              to="/my-revivals"
              className="w-full bg-primary text-black py-3 px-6 font-bold hover:bg-primary/80 transition-colors rounded"
            >
              View My Revivals
            </Link>
            {revivalId && (
              <Link
                to={`/revivals/${revivalId}`}
                className="w-full border-2 border-primary text-primary py-3 px-6 font-bold hover:bg-primary hover:text-black transition-colors rounded"
              >
                View Revival Details
              </Link>
            )}
            <button
              onClick={onClose}
              className="w-full border border-zinc-600 text-zinc-400 py-3 px-6 font-bold hover:bg-zinc-800 transition-colors rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
