import React from 'react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div 
          className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-textMain">{title}</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-textMuted hover:text-textMain hover:bg-surfaceHover transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-3 sm:p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
