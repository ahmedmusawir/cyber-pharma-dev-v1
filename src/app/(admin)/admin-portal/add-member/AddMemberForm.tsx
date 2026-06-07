"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { addMember } from "../actions";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Valid email is required" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(1, { message: "Please confirm the password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const AddMemberForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const result = await addMember({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    setLoading(false);

    if (result.error) {
      toast({ title: "Error creating member", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Member created successfully" });
      router.push("/admin-portal");
    }
  };

  return (
    <div className="p-5 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Add New Member</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="p-6 bg-muted"
                    placeholder="Enter full name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>The member&apos;s display name</FormDescription>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    className="p-6 bg-muted"
                    type="email"
                    placeholder="member@example.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>The member&apos;s login email address</FormDescription>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                  Temporary Password
                </FormLabel>
                <FormControl>
                  <Input
                    className="p-6 bg-muted"
                    type="password"
                    placeholder="Minimum 8 characters"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Member can change this after first login</FormDescription>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <Input
                    className="p-6 bg-muted"
                    type="password"
                    placeholder="Re-enter password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Member"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddMemberForm;
