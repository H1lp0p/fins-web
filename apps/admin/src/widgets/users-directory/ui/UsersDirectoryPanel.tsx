import type { User } from "@fins/api";
import {
  CenteredPlaceholder,
  LoadingFrameIndicator,
} from "@fins/ui-kit";
import { AdminUserRowCard } from "@fins/entities";

export type UsersDirectoryPanelProps = {
  users: User[];
  onPickUser: (id: string) => void;
  isLoading?: boolean;
};

export function UsersDirectoryPanel({
  users,
  onPickUser,
  isLoading = false,
}: UsersDirectoryPanelProps) {
  return (
    <div
      className="ph-mid gap-mid"
      style={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {isLoading ? (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <LoadingFrameIndicator />
        </div>
      ) : users.length === 0 ? (
        <CenteredPlaceholder text="filteredUsers.length === 0" />
      ) : (
        users.map((u) => (
          <AdminUserRowCard
            key={u.id}
            user={u}
            onClick={() => onPickUser(u.id)}
          />
        ))
      )}
    </div>
  );
}
