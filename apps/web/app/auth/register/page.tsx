'use client';

import { redirect, useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createAccountWithEmailAndPassword } from "@/lib/auth.client";

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

const registerSchema = z
 .object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email({ error: "Please enter a valid email address." }),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
 })
 .refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
 });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
 const searchParams = useSearchParams();

 const form = useForm<RegisterFormValues>({
  resolver: zodResolver(registerSchema),
  defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
 });

 async function onSubmit(data: RegisterFormValues) {
  try {
   await createAccountWithEmailAndPassword(
    {
     name: data.name,
     email: data.email,
     password: data.password,
    }
   );
   toast.success("Registration successful.");
   router.replace(searchParams?.get("next") ?? '/dashboard');
  } catch (err) {
   toast.error(
    err instanceof Error ? err.message : "Something went wrong. Please try again."
   );
  }
 }

 return (
  <div className="min-h-screen flex items-center justify-center bg-background px-4">
   <Card className="w-full sm:max-w-sm">
    <CardHeader>
     <CardTitle>Create an account</CardTitle>
     <CardDescription>
      {searchParams?.get("next")
       ? "You must be logged in to perform this action."
       : "Enter your details to get started."}
     </CardDescription>
    </CardHeader>

    <CardContent>
     <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>

       <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
         <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="register-name">Name</FieldLabel>
          <Input
           {...field}
           id="register-name"
           type="text"
           placeholder="Jane Doe"
           autoComplete="name"
           aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && (
           <FieldError errors={[fieldState.error]} />
          )}
         </Field>
        )}
       />

       <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
         <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <Input
           {...field}
           id="register-email"
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
          <FieldLabel htmlFor="register-password">Password</FieldLabel>
          <Input
           {...field}
           id="register-password"
           type="password"
           placeholder="••••••••"
           autoComplete="new-password"
           aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && (
           <FieldError errors={[fieldState.error]} />
          )}
         </Field>
        )}
       />

       <Controller
        name="confirmPassword"
        control={form.control}
        render={({ field, fieldState }) => (
         <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="register-confirm-password">
           Confirm Password
          </FieldLabel>
          <Input
           {...field}
           id="register-confirm-password"
           type="password"
           placeholder="••••••••"
           autoComplete="new-password"
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
      form="register-form"
      className="w-full"
      disabled={form.formState.isSubmitting}
     >
      {form.formState.isSubmitting ? "Creating account…" : "Create account"}
     </Button>
    </CardFooter>
   </Card>
  </div>
 );
}