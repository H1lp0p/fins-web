import { LinkButton } from "@fins/ui-kit";

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
      <LinkButton
        text={loading ? "…" : "Transfer"}
        variant="success"
        textClassName="text-info-accent"
        disabled={disabled || loading}
        onClick={onTransfer}
      />
      <span className="color-input-placeholder">&gt;&gt;&gt;</span>
    </div>
  );
}
