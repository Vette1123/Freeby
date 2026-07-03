import { EmailLayout } from "./email-layout";

export function VerifyEmail({ url }: { url: string }) {
  return (
    <EmailLayout
      preview="Confirm your email to activate your account"
      heading="Verify your email"
      intro="Welcome aboard! Confirm this is your email address to activate your account and get started."
      buttonText="Verify email address"
      url={url}
      footnote="If you didn't create an account, you can safely ignore this email."
    />
  );
}
