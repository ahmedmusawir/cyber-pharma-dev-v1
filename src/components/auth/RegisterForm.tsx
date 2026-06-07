"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useState } from "react";

const formSchema = z
  .object({
    name: z.string().min(1, {
      message: "Name is required",
    }),
    email: z
      .string()
      .min(1, {
        message: "Email is required",
      })
      .email({
        message: "Please enter a valid email",
      }),
    password: z.string().min(1, {
      message: "Password is required",
    }),
    passwordConfirm: z.string().min(1, {
      message: "Password confirmation is required",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"], // Path where the error message will be displayed
  });

const RegisterForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setIsLoading(true);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.name,
      }),
    });

    console.log("Signup Response: ", response);

    if (response.ok) {
      router.refresh();
      router.push("/members-portal");
    } else {
      const result = await response.json();
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Signup</CardTitle>
          <CardDescription>
            Register your account with your credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className="p-6 bg-muted"
                        placeholder="Enter your full name"
                        {...field}
                      />
                    </FormControl>

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
                        type="email"
                        className="p-6 bg-muted"
                        placeholder="Please Enter Email"
                        {...field}
                      />
                    </FormControl>

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
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="p-6 bg-muted"
                        placeholder="Please Enter password"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="p-6 bg-muted"
                        placeholder="Confirm your password"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              {error && (
                <div className="text-destructive text-sm mt-2">
                  {error}
                </div>
              )}
              <Button
                disabled={isLoading}
                className="w-full disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing up...
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default RegisterForm;
