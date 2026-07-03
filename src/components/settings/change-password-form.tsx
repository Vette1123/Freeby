"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { changePassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/icon-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    if (next.length < 8)
      return toast.error("New password must be at least 8 characters.");
    setLoading(true);
    const { error } = await changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setLoading(false);
    if (error) return toast.error(error.message ?? "Change failed");
    setCurrent("");
    setNext("");
    toast.success("Password changed. Other sessions were signed out.");
  }

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="px-6">
        <CardTitle className="text-lg">Password</CardTitle>
        <CardDescription>
          Changing it signs out all your other sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6">
        <div className="space-y-1.5">
          <Label htmlFor="current">Current password</Label>
          <PasswordInput
            id="current"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="next">New password</Label>
          <PasswordInput
            id="next"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <Button
          onClick={save}
          disabled={loading || !current || next.length < 8}
          className="rounded-xl"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Saving..." : "Change password"}
        </Button>
      </CardContent>
    </Card>
  );
}
