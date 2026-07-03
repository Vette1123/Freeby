"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { resetPassword } from "@/lib/auth-client";
import { resetSchema, type ResetInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/icon-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/auth/field";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetInput>({ resolver: zodResolver(resetSchema) });

  async function onSubmit(values: ResetInput) {
    if (!token) return toast.error("Invalid or missing reset token.");
    const { error } = await resetPassword({
      newPassword: values.password,
      token,
    });
    if (error) return toast.error(error.message ?? "Reset failed");
    toast.success("Password updated. Please log in.");
    router.push("/login");
  }

  return (
    <Card className="rounded-2xl border-border/60 py-6 shadow-xl shadow-black/5">
      <CardHeader className="space-y-1.5 px-6 text-center">
        <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-6" />
        </div>
        <CardTitle className="text-2xl">Set a new password</CardTitle>
        <CardDescription>
          Choose a strong password you don&apos;t use elsewhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field
            label="New password"
            htmlFor="password"
            error={errors.password?.message}
          >
            <PasswordInput
              id="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              {...register("password")}
            />
          </Field>
          <Button
            type="submit"
            className="h-11 w-full rounded-xl text-[0.95rem]"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
