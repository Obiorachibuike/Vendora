"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerSchema } from "@/lib/validations";
import { cn } from "@/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { readError, networkError } from "@/lib/http";

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", country: "", currency: "NGN", acceptTerms: false },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        toast.error(await readError(res, "Registration failed"));
        return;
      }
      toast.success("Account created! Let's set up your store.");
      router.push("/onboarding");
    } catch {
      toast.error(networkError);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Start building your automated store</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                {...form.register("name")}
                className={cn(
                  "text-text",
                  form.formState.errors.name ? "border-destructive" : "",
                )}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@store.com"
                {...form.register("email")}
                className={cn(
                  "text-text",
                  form.formState.errors.email ? "border-destructive" : "",
                )}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                className={cn(
                  "text-text",
                  form.formState.errors.password ? "border-destructive" : "",
                )}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="NG"
                  {...form.register("country")}
                  className={cn(
                    "text-text",
                    form.formState.errors.country ? "border-destructive" : "",
                  )}
                />
                {form.formState.errors.country && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.country.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="NGN"
                  {...form.register("currency")}
                  className={cn(
                    "text-text",
                    form.formState.errors.currency ? "border-destructive" : "",
                  )}
                />
                {form.formState.errors.currency && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.currency.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 shrink-0 rounded border-brand text-brand-contrast focus:ring-brand mt-0.5"
                {...form.register("acceptTerms")}
              />
              <Label htmlFor="terms" className="text-sm text-muted-text leading-none">
                I accept the Terms of Service and Privacy Policy
              </Label>
              {form.formState.errors.acceptTerms && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.acceptTerms.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-brand text-brand-contrast"
              disabled={form.formState.isSubmitting}
            >
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-text">
            Already have an account?{" "}
            <a href="/login" className="text-brand hover:underline">Sign in</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
