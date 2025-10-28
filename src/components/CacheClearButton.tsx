import { Trash2 } from 'lucide-react';
import { clearAppCache } from '../utils/cache';

export default function CacheClearButton() {
  return (
    <button
      onClick={clearAppCache}
      className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
      title="Clear cache and refresh (fixes white screen)"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}