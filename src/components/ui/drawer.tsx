import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  widthClass?: string; // allows override (e.g., 'md:w-2/5')
}

export function Drawer({ isOpen, onClose, title, children, widthClass = 'md:w-2/5 sm:max-w-sm' }: DrawerProps) {
  useEffect(() => {
    // prevent background scroll when drawer is open
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop - dim the content but allow it to be visible */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Drawer panel */}
      <aside className={`absolute right-0 top-0 h-full bg-background shadow-lg border-l z-10 w-full ${widthClass} transform transition-transform duration-300`}>
        <div className="relative h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
            </div>
            <div>
              <Button type="button" variant="ghost" onClick={onClose}>
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto">{children}</div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
