import type { CreditRatingEntity } from "@fins/api";
import {
  formatCreditRatingLabel,
  useGetCreditRatingByUserQuery,
} from "@fins/api";
import { LinkButton } from "@fins/ui-kit";
import { CreditPaybackLink } from "../../../features/credit-payback/CreditPaybackLink";

type CreditsTopRightWidgetProps = { userId: string } & (
  | { kind: "createEntry"; onCreate: () => void }
  | { kind: "payback"; creditId: string }
  | { kind: "reset"; onReset: () => void }
);

export function CreditsTopRightWidget(props: CreditsTopRightWidgetProps) {
  const { data, isFetching, isError } = useGetCreditRatingByUserQuery(
    { userId: props.userId },
    { skip: !props.userId },
  );
  const ratingEntity = data as CreditRatingEntity | undefined;
  const rating =
    !props.userId || isError
      ? "—"
      : isFetching && !ratingEntity
        ? "…"
        : formatCreditRatingLabel(ratingEntity?.rating);

  return (
    <div
      className="ph-mid pv-mid gap-mid"
      style={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >

      <span className="text-info-accent color-info">
        Rating = {rating}
      </span>
      {props.kind === "createEntry" ? (
        <LinkButton
          text="New credit"
          variant="success"
          onClick={props.onCreate}
        />
      ) : props.kind === "payback" ? (
        <CreditPaybackLink creditId={props.creditId} />
      ) : (
        <LinkButton text="Reset" variant="info" onClick={props.onReset} />
      )}
    </div>
  );
}
