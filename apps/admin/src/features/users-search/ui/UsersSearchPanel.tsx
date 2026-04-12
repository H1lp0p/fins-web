import { Input, LinkButton, OnBlurContainer } from "@fins/ui-kit";

export type UsersSearchPanelProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
};

export function UsersSearchPanel({
  value,
  onChange,
  onSubmit,
}: UsersSearchPanelProps) {
  return (
    <div
      className="ph-mid pv-min gap-mid color-info"
      style={{
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <span className="text-title">Search</span>

      <div 
        className="ph-mid gap-mid color-info"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
        style={{
          flexGrow: 1,
          minWidth: 0,
          boxSizing: "border-box",
        }}
        >
          <Input
            title="Email"
            placeholder="useremail@gmail.com"
            value={value}
            onChange={onChange}
          />
        </div>
        <OnBlurContainer 
        className="ph-mid pv-mid"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxSizing: "border-box",
        }}
        >
          <LinkButton
            text="Search"
            variant="success"
            textClassName="text-info"
            onClick={() => onSubmit?.()}
          />
        </OnBlurContainer>
      </div>
    </div>
  );
}
