'use client';

import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loginWithEmailAndPassword } from "../../lib/auth.client";

import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import {
 Field,
 FieldError,
 FieldGroup,
 FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const loginSchema = z.object({
 email: z.email({ error: "Please enter a valid email address." }),
 password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
 const searchParams = useSearchParams();

 const form = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: "", password: "" },
 });

 async function onSubmit(data: LoginFormValues) {
  try {
   await loginWithEmailAndPassword(
    data.email,
    data.password,
    searchParams?.get("next") ?? '/dashboard'
   );
  } catch (err) {
   toast.error(
    err instanceof Error ? err.message : "Invalid email or password."
   );
  }
 }

 return (
  <div className="min-h-screen flex items-center justify-center bg-background px-4">
   <Card className="w-full sm:max-w-sm">
    <CardHeader>
     <CardTitle>Sign in</CardTitle>
     <CardDescription>
      {searchParams?.get("next")
       ? "You must be logged in to perform this action."
       : "Enter your credentials to access your account."}
     </CardDescription>
    </CardHeader>

    <CardContent>
     <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>

       <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
         <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
           {...field}
           id="login-email"
           type="email"
           placeholder="you@example.com"
           autoComplete="email"
           aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && (
           <FieldError errors={[fieldState.error]} />
          )}
         </Field>
        )}
       />

       <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
         <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <Input
           {...field}
           id="login-password"
           type="password"
           placeholder="••••••••"
           autoComplete="current-password"
           aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && (
           <FieldError errors={[fieldState.error]} />
          )}
         </Field>
        )}
       />
      </FieldGroup>
     </form>
    </CardContent>

    <CardFooter>
     <Button
      type="submit"
      form="login-form"
      className="w-full"
      disabled={form.formState.isSubmitting}
     >
      {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
     </Button>
    </CardFooter>
   </Card>
  </div>
 );
}