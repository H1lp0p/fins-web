import {
  DEFAULT_CHARS,
  formatNumber,
  LinkButton,
  OnBlurContainer,
} from "@fins/ui-kit";
import type { CurrencyCode } from "@fins/api";
import { useCallback, useMemo, useState } from "react";
import { tripleForBase } from "../../shared/lib/mock-exchange-rates";
import styles from "./ExchangeRateWidget.module.css";

const LABEL: Record<CurrencyCode, string> = {
  DOLLAR: DEFAULT_CHARS.DOLLAR,
  EURO: DEFAULT_CHARS.EURO,
  RUBLE: DEFAULT_CHARS.RUBLE,
};

export function ExchangeRateWidget() {
  const [base, setBase] = useState<CurrencyCode>("DOLLAR");
  const [bump, setBump] = useState(0);
  const values = useMemo(() => {
    const t = tripleForBase(base);
    const jitter = 1 + bump * 0.001;
    /** Базовая валюта всегда 1.00; «дрожание» только у кросс-курсов. */
    return {
      DOLLAR: base === "DOLLAR" ? 1 : t.DOLLAR * jitter,
      EURO: base === "EURO" ? 1 : t.EURO * jitter,
      RUBLE: base === "RUBLE" ? 1 : t.RUBLE * jitter,
    };
  }, [base, bump]);

  const onUpdate = useCallback(() => {
    setBump((n) => (n + 1) % 100);
  }, []);

  return (
    <div
      className={`${styles.root} ph-mid pv-mid color-info text-info gap-mid`}
    >
      <div className={styles.headerRow}>
        <span className={`text-title color-info ${styles.title}`}>
          Exchange rate
        </span>
        <LinkButton
          text="update"
          onClick={onUpdate}
          variant="success"
          textClassName="text-info"
        />
      </div>
      <OnBlurContainer
        className={`ph-mid pv-mid text-info-accent gap-min ${styles.ratesRow}`}
      >
        {(["DOLLAR", "EURO", "RUBLE"] as const).map((code, i) => (
          <span key={code} className={styles.rateCluster}>
            {i > 0 ? <span className="color-success">=</span> : null}
            <button
              type="button"
              onClick={() => setBase(code)}
              className={`${styles.rateBtn} color-success text-info-accent`}
            >
              <span className="color-info">{formatNumber(values[code])}</span>{" "}
              <span className={`color-success ${styles.rateCurrency}`}>
                {LABEL[code]}
              </span>
            </button>
          </span>
        ))}
      </OnBlurContainer>
    </div>
  );
}
