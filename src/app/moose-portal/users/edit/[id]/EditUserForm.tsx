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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { editUser } from "../../actions";
import { UserWithRole } from "../../actions";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  user: UserWithRole;
}

const EditUserForm = ({ user }: Props) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.full_name ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const result = await editUser(user.id, values);
    setLoading(false);

    if (result.error) {
      toast({
        title: "Error updating user",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({ title: "User updated successfully" });
      router.refresh();
      router.push("/moose-portal/users");
    }
  };

  const roleColor: Record<string, string> = {
    admin: "text-destructive",
    member: "text-success",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit User</CardTitle>
      </CardHeader>
      <CardContent>
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
                  <FormDescription>The user&apos;s display name</FormDescription>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                Email
              </FormLabel>
              <Input
                className="p-6 bg-muted mt-2"
                value={user.email ?? "—"}
                disabled
              />
              <p className="text-sm text-muted-foreground mt-2">
                Email cannot be changed
              </p>
            </div>

            <div>
              <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                Role
              </FormLabel>
              <p className={`text-base font-bold mt-2 ${roleColor[user.role] ?? "text-muted-foreground"}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Role cannot be changed by admins
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditUserForm;
