"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons";

export function SocialButtons() {
  const [loading, setLoading] = useState(false);

  async function social() {
    setLoading(true);
    const { error } = await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (error) {
      setLoading(false);
      toast.error(error.message ?? "Sign-in failed");
    }
    // On success the browser redirects to Google — no need to reset state.
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/70" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-xl"
        onClick={social}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        Continue with Google
      </Button>
    </div>
  );
}
