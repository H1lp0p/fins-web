import type { CreditEntity, User } from "@fins/api";
import {
  mapCardAccountFromDto,
  useEditUserMutation,
  useGetAllUsersQuery,
  useGetByUserIdQuery,
  useGetUserByIdQuery,
  useGetUserCardAccountsQuery,
} from "@fins/api";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  BgText,
  RectSpaceLayout,
  useMessageStack,
  type statusType,
} from "@fins/ui-kit";
import { sortAccountsForIndex } from "@fins/entities";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { UserDetailActionsPanel } from "../features/user-detail-actions";
import { UsersSearchPanel } from "../features/users-search";
import { isValidUserId, rolesPayload } from "../shared/lib/user-id";
import { getSsoOrigin } from "../shared/lib/sso-origin";

function redirectToSsoWithReturn(): void {
  const sso = getSsoOrigin();
  const next = encodeURIComponent(window.location.href);
  window.location.replace(`${sso}/?returnUrl=${next}`);
}
import {
  editUserFailedMessage,
  messageFromFetchError,
  userNotFoundMessage,
} from "../lib/adminStackMessages";
import { UserAdminLeftBottomSlot } from "../widgets/user-admin-left-bottom";
import { UserAdminLeftTopSlot } from "../widgets/user-admin-left-top";
import { UserEntityPickerPanel } from "../widgets/user-entity-picker";
import { UsersDirectoryPanel } from "../widgets/users-directory";

export function UsersPage() {
  const { pushMessage } = useMessageStack();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState("");
  /** Подтверждённый запрос — список фильтруется только после клика [Search]. */
  const [appliedSearch, setAppliedSearch] = useState("");
  const userIdParam = searchParams.get("userId")?.trim() ?? "";
  const userId =
    userIdParam && isValidUserId(userIdParam) ? userIdParam : "";

  const listErrRef = useRef(false);
  const detailErrRef = useRef(false);

  const { data: allUsersRaw = [], isError: listError, error: listErrObj } =
    useGetAllUsersQuery();
  const allUsers = allUsersRaw as User[];
  const {
    data: detailUser,
    isError: detailError,
    error: detailErrObj,
    isSuccess: detailOk,
    isLoading: detailLoading,
  } = useGetUserByIdQuery({ id: userId }, { skip: !userId });

  const { data: accountsPage } = useGetUserCardAccountsQuery(
    { userId, pageIndex: 0, pageSize: 100 },
    { skip: !userId || !detailOk },
  );
  const { data: creditsRaw = [] } = useGetByUserIdQuery(
    { userId },
    { skip: !userId || !detailOk },
  );
  const credits = creditsRaw as CreditEntity[];

  const accounts = useMemo(() => {
    const rows = (accountsPage?.content ?? []).map(mapCardAccountFromDto);
    return sortAccountsForIndex(rows);
  }, [accountsPage?.content]);

  const filteredUsers = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) => u.email.toLowerCase().includes(q));
  }, [allUsers, appliedSearch]);

  const applySearch = useCallback(() => {
    setAppliedSearch(searchDraft.trim());
  }, [searchDraft]);

  const [entityTab, setEntityTab] = useState<"accounts" | "credits">(
    "accounts",
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(
    null,
  );

  const [editUser] = useEditUserMutation();
  const [rolePending, setRolePending] = useState<"client" | "worker" | null>(
    null,
  );
  const [activePending, setActivePending] = useState(false);

  useEffect(() => {
    const raw = searchParams.get("userId")?.trim() ?? "";
    if (raw === "" || isValidUserId(raw)) return;
    const next = new URLSearchParams(searchParams);
    next.delete("userId");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (userId) {
      listErrRef.current = false;
      return;
    }
    if (listError && !listErrRef.current) {
      listErrRef.current = true;
      const fe = listErrObj as FetchBaseQueryError | undefined;
      if (fe?.status === 401) {
        redirectToSsoWithReturn();
        return;
      }
      if (fe && fe.status !== 403) pushMessage(messageFromFetchError(fe));
    }
    if (!listError) listErrRef.current = false;
  }, [userId, listError, listErrObj, pushMessage]);

  useEffect(() => {
    if (!userId) {
      detailErrRef.current = false;
      return;
    }
    if (detailError && !detailErrRef.current) {
      detailErrRef.current = true;
      const fe = detailErrObj as FetchBaseQueryError | undefined;
      if (fe?.status === 401) {
        redirectToSsoWithReturn();
        return;
      }
      if (fe?.status !== 403) {
        if (fe?.status === 404) pushMessage(userNotFoundMessage());
        else if (fe) pushMessage(messageFromFetchError(fe));
        else pushMessage(userNotFoundMessage());
      }
    }
    if (detailOk) detailErrRef.current = false;
  }, [userId, detailError, detailOk, detailErrObj, pushMessage]);

  useEffect(() => {
    if (!userId) {
      setEntityTab("accounts");
      setSelectedAccountId(null);
      setSelectedCreditId(null);
      return;
    }
    setEntityTab("accounts");
  }, [userId]);

  useEffect(() => {
    if (!userId || entityTab !== "accounts" || !detailOk) return;
    if (accounts.length === 0) {
      setSelectedAccountId(null);
      return;
    }
    setSelectedAccountId((prev) => {
      if (prev && accounts.some((a) => a.id === prev)) return prev;
      return accounts[0]?.id ?? null;
    });
  }, [userId, entityTab, accounts, detailOk]);

  useEffect(() => {
    if (!userId || entityTab !== "credits" || !detailOk) return;
    if (credits.length === 0) {
      setSelectedCreditId(null);
      return;
    }
    setSelectedCreditId((prev) => {
      if (prev && credits.some((c) => c.id === prev)) return prev;
      return credits[0]?.id ?? null;
    });
  }, [userId, entityTab, credits, detailOk]);

  const pickUser = useCallback(
    (id: string) => {
      setSearchParams({ userId: id });
    },
    [setSearchParams],
  );

  const goBack = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedCredit = credits.find((c) => c.id === selectedCreditId);
  const linkedForCredit =
    selectedCredit?.cardAccountId != null
      ? accounts.find((a) => a.id === selectedCredit.cardAccountId) ?? null
      : null;

  const hasClient = detailUser?.roles?.includes("CLIENT") ?? false;
  const hasWorker = detailUser?.roles?.includes("WORKER") ?? false;
  const userActive = detailUser?.active !== false;

  const saveRoles = async (
    which: "client" | "worker",
    nextClient: boolean,
    nextWorker: boolean,
  ) => {
    if (!detailUser?.id) return;
    setRolePending(which);
    try {
      await editUser({
        id: detailUser.id,
        userEditModelDto: {
          name: detailUser.name,
          newRoles: rolesPayload(nextClient, nextWorker),
        },
      }).unwrap();
    } catch (e) {
      const fe = e as FetchBaseQueryError | undefined;
      if (fe && typeof fe === "object" && "status" in fe) {
        const err = fe as FetchBaseQueryError;
        if (err.status === 401) redirectToSsoWithReturn();
        else pushMessage(messageFromFetchError(err));
      } else {
        pushMessage(editUserFailedMessage());
      }
    } finally {
      setRolePending(null);
    }
  };

  const saveActive = useCallback(async () => {
    if (!detailUser?.id) return;
    const nextActive = !userActive;
    setActivePending(true);
    try {
      await editUser({
        id: detailUser.id,
        userEditModelDto: {
          name: detailUser.name,
          newRoles: rolesPayload(hasClient, hasWorker),
          active: nextActive,
        },
      }).unwrap();
    } catch (e) {
      const fe = e as FetchBaseQueryError | undefined;
      if (fe && typeof fe === "object" && "status" in fe) {
        const err = fe as FetchBaseQueryError;
        if (err.status === 401) redirectToSsoWithReturn();
        else pushMessage(messageFromFetchError(err));
      } else {
        pushMessage(editUserFailedMessage());
      }
    } finally {
      setActivePending(false);
    }
  }, [
    detailUser,
    editUser,
    hasClient,
    hasWorker,
    pushMessage,
    userActive,
  ]);

  const controlsDisabled = rolePending !== null || activePending;
  const clientCheckboxStatus: statusType =
    rolePending === "client"
      ? "loading"
      : hasClient
        ? "checked"
        : "denied";
  const workerCheckboxStatus: statusType =
    rolePending === "worker"
      ? "loading"
      : hasWorker
        ? "checked"
        : "denied";

  const showDetailShell = Boolean(userId);
  const hasDetailData = Boolean(detailUser && detailOk);
  const bgLabel = showDetailShell && hasDetailData ? "User Info" : "Users";

  const hasLeftTop =
    showDetailShell &&
    hasDetailData &&
    ((entityTab === "accounts" && selectedAccount) ||
      (entityTab === "credits" && selectedCredit));

  const leftTop = hasLeftTop ? (
    <UserAdminLeftTopSlot
      entityTab={entityTab}
      selectedAccount={selectedAccount}
      selectedCredit={selectedCredit}
    />
  ) : undefined;

  const hasLeftBottom =
    showDetailShell &&
    hasDetailData &&
    ((entityTab === "accounts" && selectedAccount?.id) ||
      (entityTab === "credits" && selectedCredit));

  const leftBottom = hasLeftBottom ? (
    <UserAdminLeftBottomSlot
      entityTab={entityTab}
      selectedAccount={selectedAccount}
      selectedCredit={selectedCredit}
      linkedAccount={linkedForCredit}
    />
  ) : undefined;

  const rightTop = !showDetailShell ? (
    <UsersSearchPanel
      value={searchDraft}
      onChange={setSearchDraft}
      onSubmit={applySearch}
    />
  ) : (
    <UserDetailActionsPanel
      isLoading={detailLoading}
      user={detailUser}
      onBack={goBack}
      clientCheckboxStatus={clientCheckboxStatus}
      workerCheckboxStatus={workerCheckboxStatus}
      controlsDisabled={controlsDisabled}
      userActive={userActive}
      activeButtonLoading={activePending}
      onClientClick={(st) => {
        const next = st === "denied";
        void saveRoles("client", next, hasWorker);
      }}
      onWorkerClick={(st) => {
        const next = st === "denied";
        void saveRoles("worker", hasClient, next);
      }}
      onActiveClick={() => {
        void saveActive();
      }}
    />
  );

  const rightBottom = !showDetailShell ? (
    <UsersDirectoryPanel users={filteredUsers} onPickUser={pickUser} />
  ) : !hasDetailData ? (
    undefined
  ) : (
    <UserEntityPickerPanel
      entityTab={entityTab}
      onEntityTabChange={setEntityTab}
      accounts={accounts}
      credits={credits}
      selectedAccountId={selectedAccountId}
      selectedCreditId={selectedCreditId}
      onSelectAccount={setSelectedAccountId}
      onSelectCredit={setSelectedCreditId}
    />
  );

  return (
    <>
      <BgText text={bgLabel} />
      <div
        className="bg-background"
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <RectSpaceLayout
          topLeftContent={leftTop}
          bottomLeftContent={leftBottom}
          topRightContent={rightTop}
          bottomRightContent={rightBottom}
        />
      </div>
    </>
  );
}
