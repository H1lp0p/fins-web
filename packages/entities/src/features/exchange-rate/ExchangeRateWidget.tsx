import type { CurrencyCode, CurrencyDto } from "@fins/api";
import { useGetCurrencyListQuery } from "@fins/api";
import {
  CenteredPlaceholder,
  formatNumber,
  LinkButton,
  LoadingFrameIndicator,
  OnBlurContainer,
} from "@fins/ui-kit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { currencyCodeToAmountSymbol } from "../../lib/currency-symbol";
import styles from "./ExchangeRateWidget.module.css";

const CHAR_TO_APP: Partial<Record<string, CurrencyCode>> = {
  USD: "USD",
  EUR: "EUR",
  RUB: "RUB",
};

function rubPerUnit(row: { Value?: number; Nominal?: number }): number {
  const nom = row.Nominal && row.Nominal > 0 ? row.Nominal : 1;
  return (row.Value ?? 0) / nom;
}

function labelForCharCode(charCode: string | undefined): string {
  if (!charCode) {
    return "?";
  }
  const app = CHAR_TO_APP[charCode];
  return app ? currencyCodeToAmountSymbol(app) : charCode;
}

/**
 * Курсы валют с BFF → `GET /api/core-api/currency/all` (прокси на gateway).
 */
export function ExchangeRateWidget() {
  const { data, isLoading, isError, refetch, isFetching } =
    useGetCurrencyListQuery();

  const rows = useMemo((): CurrencyDto[] => {
    const v = data?.Valute;
    if (!v) {
      return [];
    }
    return Object.values(v).filter(
      (x): x is CurrencyDto =>
        x != null &&
        typeof x === "object" &&
        typeof x.CharCode === "string" &&
        x.CharCode.length > 0,
    );
  }, [data]);

  const [baseCode, setBaseCode] = useState<string | null>(null);

  useEffect(() => {
    if (rows.length === 0) {
      return;
    }
    if (!baseCode || !rows.some((r) => r.CharCode === baseCode)) {
      setBaseCode(rows[0].CharCode ?? null);
    }
  }, [rows, baseCode]);

  const baseRow = useMemo(
    () => rows.find((r) => r.CharCode === baseCode) ?? rows[0],
    [rows, baseCode],
  );

  const displayValues = useMemo(() => {
    if (!baseRow?.CharCode) {
      return [];
    }
    const rb = rubPerUnit(baseRow);
    if (rb <= 0) {
      return [];
    }
    return rows.map((r) => {
      const code = r.CharCode ?? "";
      const rc = rubPerUnit(r);
      if (!code || code === baseRow.CharCode) {
        return { code, rate: 1, label: labelForCharCode(code) };
      }
      if (rc <= 0) {
        return { code, rate: 0, label: labelForCharCode(code) };
      }
      return {
        code,
        rate: rb / rc,
        label: labelForCharCode(code),
      };
    });
  }, [rows, baseRow]);

  const onUpdate = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className={`${styles.root} ph-mid pv-mid`}>
        <LoadingFrameIndicator />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={`${styles.root} ph-mid pv-mid`}>
        <CenteredPlaceholder text="Не удалось загрузить курсы валют." />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={`${styles.root} ph-mid pv-mid`}>
        <CenteredPlaceholder text="Список валют пуст." />
      </div>
    );
  }

  return (
    <div
      className={`${styles.root} ph-mid pv-mid color-info text-info gap-mid`}
    >
      <div className={styles.headerRow}>
        <span className={`text-title color-info ${styles.title}`}>
          Exchange rate
        </span>
        <LinkButton
          text={isFetching ? "…" : "update"}
          onClick={onUpdate}
          variant="success"
          textClassName="text-info"
        />
      </div>
      {data.Date ? (
        <div className="text-caption color-info" style={{ fontSize: "0.75rem" }}>
          {data.Date}
        </div>
      ) : null}
      <OnBlurContainer
        className={`ph-mid pv-mid text-info-accent gap-min ${styles.ratesRow}`}
      >
        {displayValues.map(({ code, rate, label }, i) => (
          <span key={code || String(i)} className={styles.rateCluster}>
            {i > 0 ? <span className="color-success">=</span> : null}
            <button
              type="button"
              onClick={() => code && setBaseCode(code)}
              className={`${styles.rateBtn} color-success text-info-accent`}
            >
              <span className="color-info">{formatNumber(rate)}</span>{" "}
              <span className={`color-success ${styles.rateCurrency}`}>
                {label}
              </span>
            </button>
          </span>
        ))}
      </OnBlurContainer>
    </div>
  );
}
