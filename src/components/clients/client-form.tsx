"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  createClient,
  updateClient,
} from "@/app/(dashboard)/clients/actions";
import { clientSchema, type ClientInput } from "@/lib/validations/freeby";
import { Field } from "@/components/auth/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface ClientRow {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
}

export function ClientForm({
  clientId,
  defaultValues,
  onDone,
  onCreated,
  onUpdated,
}: {
  clientId?: string;
  defaultValues?: Partial<ClientInput>;
  onDone?: () => void;
  /** Fired with the optimistic row right after a successful create. */
  onCreated?: (row: ClientRow) => void;
  /** Fired with id + patch right after a successful update. */
  onUpdated?: (id: string, patch: Partial<ClientRow>) => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      address: "",
      notes: "",
      ...defaultValues,
    },
  });

  async function onSubmit(values: ClientInput) {
    setServerError(null);
    if (clientId) {
      const res = await updateClient(clientId, values);
      if (!res.ok) {
        if (res.fieldErrors) {
          for (const [field, msg] of Object.entries(res.fieldErrors)) {
            setError(field as keyof ClientInput, { message: msg });
          }
        }
        setServerError(res.error);
        toast.error(res.error);
        return;
      }
      toast.success("Client updated.");
      onUpdated?.(clientId, {
        name: values.name,
        email: values.email || null,
        company: values.company || null,
      });
      onDone?.();
      router.refresh();
      return;
    }

    const res = await createClient(values);
    if (!res.ok) {
      if (res.fieldErrors) {
        for (const [field, msg] of Object.entries(res.fieldErrors)) {
          setError(field as keyof ClientInput, { message: msg });
        }
      }
      setServerError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success("Client added.");
    onCreated?.({
      id: res.data.id,
      name: values.name,
      email: values.email || null,
      company: values.company || null,
    });
    onDone?.();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Name" htmlFor="name" error={errors.name?.message}>
        <Input id="name" placeholder="Acme Inc." {...register("name")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="billing@acme.com"
            {...register("email")}
          />
        </Field>
        <Field
          label="Company"
          htmlFor="company"
          error={errors.company?.message}
        >
          <Input id="company" placeholder="Acme Inc." {...register("company")} />
        </Field>
      </div>
      <Field
        label="Billing address"
        htmlFor="address"
        error={errors.address?.message}
      >
        <Textarea
          id="address"
          rows={2}
          placeholder="123 Main St, City, Country"
          {...register("address")}
        />
      </Field>
      <Field label="Notes" htmlFor="notes" error={errors.notes?.message}>
        <Textarea
          id="notes"
          rows={2}
          placeholder="Internal notes about this client…"
          {...register("notes")}
        />
      </Field>

      {serverError && !errors.root && (
        <p className="text-sm font-medium text-destructive">{serverError}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onDone?.()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {clientId ? "Save changes" : "Add client"}
        </Button>
      </div>
    </form>
  );
}
