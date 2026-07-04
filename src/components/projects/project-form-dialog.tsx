"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createProject } from "@/app/(dashboard)/projects/actions";
import {
  projectSchema,
  type ProjectInput,
  type SelectOption,
} from "@/lib/validations/freeby";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/auth/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal, ModalTitle, ModalDescription } from "@/components/ui/dialog";

export interface CreatedProject {
  id: string;
  name: string;
  clientId: string;
  hourlyRate: string;
  status: "active" | "archived";
  clientName?: string;
}

export function ProjectFormDialog({
  clients,
  triggerLabel = "New project",
  onCreated,
}: {
  clients: SelectOption[];
  triggerLabel?: string;
  onCreated?: (project: CreatedProject) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema) as never,
    defaultValues: {
      clientId: "",
      name: "",
      hourlyRate: "0",
      status: "active",
    },
  });

  const clientId = useWatch({ control, name: "clientId" });

  async function onSubmit(values: ProjectInput) {
    setSubmitting(true);
    const res = await createProject(values);
    setSubmitting(false);
    if (!res.ok) {
      if (res.fieldErrors) {
        for (const [f, msg] of Object.entries(res.fieldErrors)) {
          setError(f as keyof ProjectInput, { message: msg });
        }
      }
      toast.error(res.error);
      return;
    }
    toast.success("Project created.");
    if (res.ok) {
      onCreated?.({
        id: res.data.id,
        name: values.name,
        clientId: values.clientId,
        hourlyRate: values.hourlyRate,
        status: "active",
        clientName: clients.find((c) => c.value === values.clientId)?.label,
      });
    }
    setOpen(false);
    router.refresh();
  }

  // Guard: if the user has no clients, prompt them to create one first.
  const hasClients = clients.length > 0;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={!hasClients}
        title={!hasClients ? "Add a client first" : undefined}
      >
        <Plus className="size-4" />
        {triggerLabel}
      </Button>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalTitle>New project</ModalTitle>
        <ModalDescription>
          Track time against a project for a specific client.
        </ModalDescription>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <Field
            label="Client"
            htmlFor="clientId"
            error={errors.clientId?.message}
          >
            <Select
              id="clientId"
              options={clients}
              placeholder="Select a client"
              value={clientId}
              onChange={(e) =>
                setValue("clientId", e.target.value, { shouldValidate: true })
              }
            />
          </Field>
          <Field label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="Website redesign"
              {...register("name")}
            />
          </Field>
          <Field
            label="Hourly rate (USD)"
            htmlFor="hourlyRate"
            error={errors.hourlyRate?.message}
          >
            <Input
              id="hourlyRate"
              type="text"
              inputMode="decimal"
              placeholder="75"
              {...register("hourlyRate")}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Create project
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
