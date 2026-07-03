"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, User, UserPlus } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { IconInput, PasswordInput } from "@/components/ui/icon-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/auth/field";
import { SocialButtons } from "@/components/auth/social-buttons";

export function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: "/dashboard",
    });
    if (error) return toast.error(error.message ?? "Something went wrong");
    toast.success("Account created — check your email to verify.");
    router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <Card className="rounded-2xl border-border/60 py-6 shadow-xl shadow-black/5">
      <CardHeader className="space-y-1.5 px-6 text-center">
        <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UserPlus className="size-6" />
        </div>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Sign up to get started — it only takes a moment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Name" htmlFor="name" error={errors.name?.message}>
            <IconInput
              icon={User}
              id="name"
              placeholder="Jane Doe"
              autoComplete="name"
              {...register("name")}
            />
          </Field>
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
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <SocialButtons />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
