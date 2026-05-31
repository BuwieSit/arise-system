import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  requireInput?: string;
  isDangerous?: boolean;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Abort",
  requireInput,
  isDangerous = false
}: ConfirmationModalProps) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!isOpen) setInputValue('');
  }, [isOpen]);

  if (!isOpen) return null;

  const isLocked = requireInput && inputValue.toUpperCase() !== requireInput.toUpperCase();

  return (
    <div className="fixed inset-0 z-[300] bg-monolith/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className={`max-w-md w-full glass-panel p-8 border-2 ${isDangerous ? 'border-system-alert shadow-[0_0_40px_rgba(255,0,85,0.2)]' : 'border-ethereal-blue shadow-[0_0_40px_rgba(0,210,255,0.15)]'}`}>
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
             <div className={`p-2 rounded bg-opacity-10 ${isDangerous ? 'bg-system-alert text-system-alert' : 'bg-ethereal-blue text-ethereal-blue'}`}>
                <AlertTriangle size={20} />
             </div>
             <h3 className={`font-orbitron text-sm font-black uppercase tracking-widest ${isDangerous ? 'text-system-alert' : 'text-ethereal-blue'}`}>
               {title}
             </h3>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs md:text-sm text-gray-300 font-inter leading-relaxed mb-8 uppercase tracking-tight">
          {message}
        </p>

        {requireInput && (
          <div className="mb-8 space-y-3">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              Type <span className="text-white">"{requireInput}"</span> to authorize:
            </p>
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={requireInput}
              className={`w-full bg-monolith/50 border-2 rounded-lg p-3 text-center font-orbitron font-black tracking-[0.3em] text-white focus:outline-none transition-colors ${
                isDangerous ? 'border-red-900 focus:border-system-alert' : 'border-blue-900 focus:border-ethereal-blue'
              }`}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-800 text-gray-500 font-orbitron text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 hover:text-white transition-all"
          >
            {cancelText}
          </button>
          <button 
            disabled={!!isLocked}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 border-2 font-orbitron text-[10px] font-black uppercase tracking-widest transition-all ${
              isLocked 
              ? 'border-gray-900 text-gray-700 cursor-not-allowed' 
              : isDangerous 
                ? 'bg-system-alert border-system-alert text-monolith hover:bg-red-700 shadow-[0_0_20px_rgba(255,0,85,0.4)]'
                : 'bg-ethereal-blue border-ethereal-blue text-monolith hover:bg-blue-400 shadow-[0_0_20px_rgba(0,210,255,0.4)]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
