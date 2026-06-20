import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

const icons = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColors = {
  danger: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-sky-400',
};

const buttonVariants = {
  danger: 'danger' as const,
  warning: 'primary' as const,
  info: 'primary' as const,
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'warning',
}: ConfirmDialogProps) {
  const Icon = icons[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={buttonVariants[variant]}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <Icon className={`h-6 w-6 shrink-0 ${iconColors[variant]}`} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </Modal>
  );
}
