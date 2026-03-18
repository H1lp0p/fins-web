import { useAuthRevokeMutation } from "@fins/api/sso";
import { BluredContainer, LinkButton, OnBlurContainer } from "@fins/ui-kit";
import {
  getSsoPostLoginRedirectUrl,
  redirectToSsoPostLoginTarget,
} from "../../shared/lib/sso-post-login-redirect";

export function ActiveSessionPanel() {
  const [revoke, { isLoading: revokeLoading }] = useAuthRevokeMutation();
  const target = getSsoPostLoginRedirectUrl();

  return (
    <BluredContainer
      className="ph-max pv-max color-info text-info"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
        maxWidth: "28rem",
        margin: "0 auto",
      }}
    >
      <p style={{ textAlign: "center", margin: 0 }}>
        You are already signed in. Continue to the app or sign out to use another
        account.
      </p>
      {!target ? (
        <p
          style={{
            textAlign: "center",
            margin: 0,
            opacity: 0.75,
            fontSize: "0.9rem",
          }}
          className="color-info text-info"
        >
          Set <code>VITE_SSO_POST_LOGIN_REDIRECT_URL</code> in{" "}
          <code>apps/sso/.env.local</code> to enable &quot;Continue&quot;.
        </p>
      ) : null}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <LinkButton
          text="Continue to app"
          onClick={() => {
            if (!target) return;
            redirectToSsoPostLoginTarget();
          }}
          variant="info"
          textClassName="text-info-accent"
        />
        <LinkButton
          text={revokeLoading ? "Signing out…" : "Sign out"}
          onClick={() => {
            if (revokeLoading) return;
            void revoke().unwrap();
          }}
          variant="info"
          textClassName="text-info-accent"
        />
      </div>
    </BluredContainer>
  );
}
