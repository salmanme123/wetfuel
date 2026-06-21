import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof sizeClasses;
  bodyClassName?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md', bodyClassName }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 cursor-pointer bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative w-full rounded-2xl border border-border bg-card p-6 shadow-2xl',
          sizeClasses[size],
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 cursor-pointer text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={cn("max-h-[70vh] overflow-y-auto", bodyClassName)}>{children}</div>
        {footer && (
          <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
