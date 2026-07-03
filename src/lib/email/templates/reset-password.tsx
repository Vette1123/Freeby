import { EmailLayout } from "./email-layout";

export function ResetPassword({ url }: { url: string }) {
  return (
    <EmailLayout
      preview="Reset your password"
      heading="Reset your password"
      intro="We received a request to reset your password. Click the button below to choose a new one."
      buttonText="Reset password"
      url={url}
      footnote="If you didn't request a password reset, you can safely ignore this email — your password won't change."
    />
  );
}
