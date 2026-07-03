import Link from "next/link";
import { ArrowLeft, MailOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResendVerification } from "@/components/auth/resend-verification";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;
  return (
    <Card className="rounded-2xl border-border/60 py-6 shadow-xl shadow-black/5">
      <CardHeader className="space-y-1.5 px-6 text-center">
        <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MailOpen className="size-6" />
        </div>
        <CardTitle className="text-2xl">Check your inbox</CardTitle>
        <CardDescription>
          We sent a verification link
          {email ? (
            <>
              {" "}
              to <span className="font-medium text-foreground">{email}</span>
            </>
          ) : null}
          . Click it to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6">
        <ResendVerification email={email} />
        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </CardContent>
    </Card>
  );
}
