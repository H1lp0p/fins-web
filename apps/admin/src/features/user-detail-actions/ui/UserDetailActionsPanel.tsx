import type { UserDto } from "@fins/api";
import type { statusType } from "@fins/ui-kit";
import {
  InlineCheckBox,
  LinkButton,
  OnBlurContainer,
} from "@fins/ui-kit";

export type UserDetailActionsPanelProps = {
  isLoading: boolean;
  user: UserDto | undefined;
  onBack: () => void;
  clientCheckboxStatus: statusType;
  workerCheckboxStatus: statusType;
  controlsDisabled: boolean;
  userActive: boolean;
  activeButtonLoading: boolean;
  onClientClick: (currentStatus: statusType) => void;
  onWorkerClick: (currentStatus: statusType) => void;
  onActiveClick: () => void;
};

export function UserDetailActionsPanel({
  isLoading,
  user,
  onBack,
  clientCheckboxStatus,
  workerCheckboxStatus,
  controlsDisabled,
  userActive,
  activeButtonLoading,
  onClientClick,
  onWorkerClick,
  onActiveClick,
}: UserDetailActionsPanelProps) {
  return (
    <div
      className="ph-mid pv-mid gap-min color-info"
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
      {isLoading ? (
        <span className="text-info color-input-placeholder">…</span>
      ) : user ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="text-title color-info">{user.name}</span>
            <LinkButton
              text="Back"
              variant="success"
              textClassName="text-title"
              onClick={onBack}
              disabled={controlsDisabled}
            />
          </div>
          <OnBlurContainer
            className="gap-mid pv-min ph-mid"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >

            <div
              className="gap-min"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <InlineCheckBox
                content="client"
                status={clientCheckboxStatus}
                disabled={controlsDisabled}
                onClick={onClientClick}
              />
              <InlineCheckBox
                content="worker"
                status={workerCheckboxStatus}
                disabled={controlsDisabled}
                onClick={onWorkerClick}
              />
            </div>
            <div
              className=""
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                minWidth: "5.5rem",
              }}
            >
              <span className="text-info color-info">status</span>
              <OnBlurContainer className="ph-mid pv-min">
                <LinkButton
                  text={userActive ? "Active" : "Blocked"}
                  variant={userActive ? "success" : "error"}
                  textClassName="text-info-accent"
                  onClick={onActiveClick}
                  loading={activeButtonLoading}
                  disabled={controlsDisabled}
                />
              </OnBlurContainer>
            </div>
          </OnBlurContainer>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span className="text-info color-input-placeholder">—</span>
          <OnBlurContainer className="ph-mid pv-min">
            <LinkButton
              text="Back"
              variant="success"
              textClassName="text-info"
              onClick={onBack}
            />
          </OnBlurContainer>
        </div>
      )}
    </div>
  );
}
