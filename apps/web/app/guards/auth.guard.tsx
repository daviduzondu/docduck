"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth.provider";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children, next }: { children: React.ReactNode, next?: string }) {
 const { data, isPending, error } = useAuth();
 const router = useRouter();


 useEffect(() => {
  if (!isPending && !data) {
   router.replace("/auth/login" + (next ? "?next=" + next : ''));
  }
 }, [isPending, data, router]);

 if (isPending || !data) return null;

 return <>{children}</>;
}