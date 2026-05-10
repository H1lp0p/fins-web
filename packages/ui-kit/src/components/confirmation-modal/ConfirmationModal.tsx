import "./confirmation-modal.css";
import { useCallback, useEffect, type SyntheticEvent } from "react";
import { BluredContainer } from "../blured-container/BluredContainer";
import { LinkButton } from "../link-button/LinkButton";

export type ConfirmationModalProps = {
  open: boolean;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLoading?: boolean;
};

export function ConfirmationModal({
  open,
  content,
  onConfirm,
  onCancel,
  confirmLoading = false,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  const stop = useCallback((e: SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  if (!open) return null;

  return (
    <div
      className="fins-confirm-modal-overlay"
      role="presentation"
      onClick={onCancel}
    >
      <BluredContainer className="fins-confirm-modal-dialog rounded">
        <div
          className="ph-mid pv-mid gap-mid text-info color-info"
          style={{ display: "flex", flexDirection: "column" }}
          role="dialog"
          aria-modal="true"
          onClick={stop}
        >
          <p className="fins-confirm-modal-body text-info color-info">
            {content}
          </p>
          <div className="fins-confirm-modal-actions">
            <LinkButton
              text="N"
              variant="error"
              textClassName="text-info-accent"
              disabled={confirmLoading}
              onClick={onCancel}
            />
            <LinkButton
              text="Y"
              variant="success"
              textClassName="text-info-accent"
              loading={confirmLoading}
              disabled={confirmLoading}
              onClick={onConfirm}
            />
          </div>
        </div>
      </BluredContainer>
    </div>
  );
}
