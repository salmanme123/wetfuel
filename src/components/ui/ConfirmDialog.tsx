import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

const icons = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
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
        <Icon className="h-6 w-6 shrink-0 text-yellow-500" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </Modal>
  );
}
