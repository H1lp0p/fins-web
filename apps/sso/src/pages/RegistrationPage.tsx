import { SingleSpaceLayout } from "@fins/ui-kit";
import {
  RegistrationForm,
  RegistrationSubmitButton,
} from "../features/registration-form/RegistrationForm";

export function RegistrationPage() {
  return (
    <div className="ph-max pv-max">
      <SingleSpaceLayout>
        {[
          <RegistrationForm key="register-form" 
          style={{ width: "100%" }} />,
          <RegistrationSubmitButton key="register-submit" />,
        ]}
      </SingleSpaceLayout>
    </div>
  );
}
