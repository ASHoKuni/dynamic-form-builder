import type { ReactNode, SyntheticEvent } from 'react';

interface ModalProps {
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement, Event>) => {
    event.preventDefault();
    onClose();
  };

  return (
    <dialog className="modal-overlay" aria-label={title} open onCancel={handleCancel}>
      <div className="modal">
        <div className="modal__header">
          <h2>{title}</h2>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </dialog>
  );
}
