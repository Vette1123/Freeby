"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { updateUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/icon-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UpdateNameForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const { error } = await updateUser({ name });
    setLoading(false);
    if (error) return toast.error(error.message ?? "Update failed");
    toast.success("Name updated.");
  }

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="px-6">
        <CardTitle className="text-lg">Profile</CardTitle>
        <CardDescription>Update your display name.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <IconInput
            icon={User}
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button
          onClick={save}
          disabled={loading || name.trim().length < 2}
          className="rounded-xl"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
