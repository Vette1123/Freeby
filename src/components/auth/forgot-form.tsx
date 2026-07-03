"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Loader2, Mail, MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth-client";
import { forgotSchema, type ForgotInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/icon-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/auth/field";

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(values: ForgotInput) {
    const { error } = await requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });
    if (error) return toast.error(error.message ?? "Something went wrong");
    setSent(true);
  }

  return (
    <Card className="rounded-2xl border-border/60 py-6 shadow-xl shadow-black/5">
      <CardHeader className="space-y-1.5 px-6 text-center">
        <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {sent ? <MailCheck className="size-6" /> : <KeyRound className="size-6" />}
        </div>
        <CardTitle className="text-2xl">
          {sent ? "Check your email" : "Forgot password?"}
        </CardTitle>
        <CardDescription>
          {sent
            ? "If that email exists, a reset link is on its way."
            : "Enter your email and we'll send you a reset link."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-6">
        {!sent && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <IconInput
                icon={Mail}
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
              />
            </Field>
            <Button
              type="submit"
              className="h-11 w-full rounded-xl text-[0.95rem]"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}
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
