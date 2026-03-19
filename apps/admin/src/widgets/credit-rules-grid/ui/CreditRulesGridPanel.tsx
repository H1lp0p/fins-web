import type { CreditRuleEntity } from "@fins/api";
import { useGetAllCreditRulesQuery } from "@fins/api";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { CreditRuleInfo } from "@fins/entities";
import { useMessageStack } from "@fins/ui-kit";
import { useEffect, useRef } from "react";
import {
  forbiddenMessage,
  messageFromFetchError,
} from "../../../lib/adminStackMessages";
import styles from "./CreditRulesGridPanel.module.css";

export function CreditRulesGridPanel() {
  const { pushMessage } = useMessageStack();
  const errRef = useRef(false);
  const { data: rules = [], isError, error } = useGetAllCreditRulesQuery();

  useEffect(() => {
    if (!isError) {
      errRef.current = false;
      return;
    }
    if (errRef.current) return;
    errRef.current = true;
    const fe = error as FetchBaseQueryError | undefined;
    if (fe?.status === 403) {
      pushMessage(forbiddenMessage());
    } else if (fe) {
      pushMessage(messageFromFetchError(fe));
    }
  }, [isError, error, pushMessage]);

  const list = rules as CreditRuleEntity[];

  return (
    <div
      className={`${styles.wrap} ph-mid pv-mid`}
      style={{ 
        height: "100%", 
        boxSizing: "border-box", 
        overflow: "auto" 
      }}
    >
      <div className={styles.grid}>
        {list.map((rule, index) => (
          <CreditRuleInfo
            key={rule.id ?? `credit-rule-${index}`}
            rule={rule}
            style={{width: "100%"}}
          />
        ))}
      </div>
    </div>
  );
}
