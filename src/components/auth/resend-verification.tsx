"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, RotateCw } from "lucide-react";
import { sendVerificationEmail } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function ResendVerification({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);

  async function resend() {
    if (!email) return toast.error("No email provided.");
    setLoading(true);
    const { error } = await sendVerificationEmail({
      email,
      callbackURL: "/dashboard",
    });
    setLoading(false);
    if (error) return toast.error(error.message ?? "Could not resend.");
    toast.success("Verification email sent.");
  }

  return (
    <Button
      onClick={resend}
      disabled={loading}
      variant="outline"
      className="h-11 w-full rounded-xl"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RotateCw className="size-4" />
      )}
      {loading ? "Sending..." : "Resend verification email"}
    </Button>
  );
}
