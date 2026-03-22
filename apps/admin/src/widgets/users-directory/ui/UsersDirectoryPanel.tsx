import type { User } from "@fins/api";
import { AdminUserRowCard } from "@fins/entities";

export type UsersDirectoryPanelProps = {
  users: User[];
  onPickUser: (id: string) => void;
};

export function UsersDirectoryPanel({
  users,
  onPickUser,
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
      {users.map((u) => (
        <AdminUserRowCard key={u.id} user={u} onClick={() => onPickUser(u.id)} />
      ))}
    </div>
  );
}
