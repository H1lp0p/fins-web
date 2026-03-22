import { SingleSpaceLayout } from "@fins/ui-kit";
import { LoginForm, LoginSubmitButton } from "../features/login-form/LoginForm";

export function LoginPage() {
  return (
    <div className="ph-max pv-max">
      <SingleSpaceLayout>
        {[
          <LoginForm key="login-form"
          style={{ width: "100%" }} />,
          <LoginSubmitButton key="login-submit" />,
        ]}
      </SingleSpaceLayout>
    </div>
  );
}
