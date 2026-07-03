"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Monitor } from "lucide-react";
import { listSessions, revokeSession, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SessionRow = {
  id: string;
  token: string;
  userAgent?: string | null;
  createdAt: string | Date;
};

export function SessionsList() {
  const { data: current } = useSession();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await listSessions();
    setSessions((data as SessionRow[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    // Initial load of sessions from the auth API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function revoke(token: string) {
    const { error } = await revokeSession({ token });
    if (error) return toast.error(error.message ?? "Revoke failed");
    toast.success("Session revoked.");
    load();
  }

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="px-6">
        <CardTitle className="text-lg">Active sessions</CardTitle>
        <CardDescription>
          Devices currently signed in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 px-6">
        {loading &&
          [0, 1].map((i) => (
            <div
              key={i}
              className="h-[66px] animate-pulse rounded-xl border border-border/60 bg-muted/40"
            />
          ))}
        {!loading && sessions.length === 0 && (
          <p className="text-sm text-muted-foreground">No active sessions.</p>
        )}
        {!loading &&
          sessions.map((s) => {
          const isCurrent = s.token === current?.session.token;
          return (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
                  <Monitor className="size-4" />
                </span>
                <span className="truncate">
                  {s.userAgent ?? "Unknown device"}
                  {isCurrent && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      this device
                    </span>
                  )}
                </span>
              </div>
              {!isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => revoke(s.token)}
                >
                  Revoke
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
