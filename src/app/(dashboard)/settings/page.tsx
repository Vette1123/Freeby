import { requireSession } from "@/lib/get-session";
import { UpdateNameForm } from "@/components/settings/update-name-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SessionsList } from "@/components/settings/sessions-list";
import {
  BusinessProfileForm,
} from "@/components/settings/business-profile-form";
import { getBusinessProfile } from "./actions";

export default async function SettingsPage() {
  const session = await requireSession();
  const businessDefaults = await getBusinessProfile();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, business details, and active sessions.
        </p>
      </div>

      {/* Account */}
      <section className="space-y-4">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Account
        </h2>
        <UpdateNameForm initialName={session.user.name} />
        <ChangePasswordForm />
      </section>

      {/* Business profile */}
      <section className="space-y-4">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Business profile
        </h2>
        <BusinessProfileForm defaults={businessDefaults} />
      </section>

      {/* Sessions */}
      <section className="space-y-4">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Active sessions
        </h2>
        <SessionsList />
      </section>
    </div>
  );
}
