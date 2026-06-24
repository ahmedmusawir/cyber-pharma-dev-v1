"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { storeMemberService } from "@/services/adminDemo";

// THE ONE HARD RULE, IN THE UI: Email + Job title ONLY. There is no password
// field and no permission/role dropdown — V1 has exactly one admin (the owner;
// 2nd admins only via MissionControl). Job title is demo-only display; the
// member's permission role is ALWAYS 'member', hardcoded at the call site.
// (memory: admin-v1-single-admin-model)
const JOB_TITLES = ["Pharmacist", "Technician", "Staff"] as const;

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  jobTitle: z.enum(JOB_TITLES, { required_error: "Select a job title" }),
});
type InviteValues = z.infer<typeof schema>;

interface InviteMemberFormProps {
  storeId: string;
  onInvited: () => void;
}

const InviteMemberForm = ({ storeId, onInvited }: InviteMemberFormProps) => {
  const { toast } = useToast();
  const form = useForm<InviteValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: InviteValues) => {
    try {
      const res = await storeMemberService.inviteMember({
        storeId,
        email: values.email,
        role: "member", // V1: never a permission choice — always 'member'.
        jobTitle: values.jobTitle,
      });
      toast({ title: res.message, variant: res.ok ? "default" : "destructive" });
      form.reset({ email: "", jobTitle: undefined });
      onInvited();
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Invite failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-[560px] space-y-5"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                Email
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@pharmacy.com" {...field} />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                Job title
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job title" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {JOB_TITLES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />
        <div className="flex gap-3 border border-info/40 bg-info/10 p-3 text-sm">
          <Lock
            className="mt-0.5 h-4 w-4 shrink-0 text-info"
            aria-hidden="true"
          />
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              Invite-based — no password here.
            </span>{" "}
            An invite email goes to this address; the member sets their own
            password when they accept. You never set or see it.
          </p>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          Send invite
        </Button>
      </form>
    </Form>
  );
};

export default InviteMemberForm;
