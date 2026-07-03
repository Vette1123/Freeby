"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { IconInput, PasswordInput } from "@/components/ui/icon-input";
import { BrandMark } from "@/components/brand/brand-mark";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/auth/field";
import { SocialButtons } from "@/components/auth/social-buttons";

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/dashboard",
    });
    if (error) {
      if (error.status === 403)
        return toast.error("Please verify your email before logging in.");
      return toast.error(error.message ?? "Invalid email or password");
    }
    router.push("/dashboard");
  }

  return (
    <Card className="rounded-2xl border-border/60 py-6 shadow-xl shadow-black/5">
      <CardHeader className="space-y-1.5 px-6 text-center">
        <BrandMark className="mx-auto mb-1" size={48} />
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Log in to continue to your dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-6">
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
          <Field
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            action={
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot?
              </Link>
            }
          >
            <PasswordInput
              id="password"
              placeholder="Your password"
              autoComplete="current-password"
              {...register("password")}
            />
          </Field>
          <Button
            type="submit"
            className="h-11 w-full rounded-xl text-[0.95rem]"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <SocialButtons />
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
