import { LinkButton, LoadingFrameIndicator } from "@fins/ui-kit";

export type TransactionTransferTopBarProps = {
  disabled: boolean;
  loading?: boolean;
  onTransfer: () => void;
};

export function TransactionTransferTopBar({
  disabled,
  loading = false,
  onTransfer,
}: TransactionTransferTopBarProps) {
  return (
    <div
      className="ph-mid pv-mid text-title color-info gap-min"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <span className="color-input-placeholder">&gt;&gt;&gt;</span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <LinkButton
          text="Transfer"
          variant="success"
          textClassName="text-info-accent"
          disabled={disabled || loading}
          onClick={onTransfer}
        />
        {loading ? <LoadingFrameIndicator /> : null}
      </div>
      <span className="color-input-placeholder">&gt;&gt;&gt;</span>
    </div>
  );
}
