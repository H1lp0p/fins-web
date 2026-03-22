import { LinkButton } from "@fins/ui-kit";
import { useNavigate } from "react-router-dom";
import { buildTransactionsSearchString } from "../../shared/lib/transactions-endpoint";

type CreditPaybackLinkProps = {
  creditId: string;
};

export function CreditPaybackLink({ creditId }: CreditPaybackLinkProps) {
  const navigate = useNavigate();

  return (
    <LinkButton
      text="Payback"
      variant="success"
      textClassName="text-title"
      onClick={() =>
        navigate(
          `/transactions${buildTransactionsSearchString({
            to: { type: "Credit", id: creditId },
          })}`,
        )
      }
    />
  );
}
