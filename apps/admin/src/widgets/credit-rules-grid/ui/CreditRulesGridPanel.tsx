import type { CreditRuleEntity } from "@fins/api";
import { useGetAllCreditRulesQuery } from "@fins/api";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { CreditRuleInfo } from "@fins/entities";
import {
  CenteredPlaceholder,
  LoadingFrameIndicator,
  useMessageStack,
} from "@fins/ui-kit";
import { useEffect, useRef } from "react";
import { messageFromFetchError } from "../../../lib/adminStackMessages";
import styles from "./CreditRulesGridPanel.module.css";

export function CreditRulesGridPanel() {
  const { pushMessage } = useMessageStack();
  const errRef = useRef(false);
  const {
    data: rules = [],
    isError,
    error,
    isLoading,
    isFetching,
  } = useGetAllCreditRulesQuery();

  useEffect(() => {
    if (!isError) {
      errRef.current = false;
      return;
    }
    if (errRef.current) return;
    errRef.current = true;
    const fe = error as FetchBaseQueryError | undefined;
    if (fe && fe.status !== 403) {
      pushMessage(messageFromFetchError(fe));
    }
  }, [isError, error, pushMessage]);

  const list = rules as CreditRuleEntity[];
  const busy = isLoading || isFetching;

  return (
    <div
      className={`${styles.wrap} ph-mid pv-mid`}
      style={{
        height: "100%",
        boxSizing: "border-box",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {busy ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          <LoadingFrameIndicator />
        </div>
      ) : list.length === 0 ? (
        <CenteredPlaceholder text="creditRules.length === 0" />
      ) : (
        <div className={styles.grid}>
          {list.map((rule, index) => (
            <CreditRuleInfo
              key={rule.id ?? `credit-rule-${index}`}
              rule={rule}
              style={{ width: "100%" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
