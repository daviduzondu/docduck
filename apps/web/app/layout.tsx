import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./providers/auth.provider";
import { Figtree } from "next/font/google";
import { cn } from "@/lib/utils";
import TanstackQueryClientProvider from "@/providers/react-query.provider";
import { Toaster } from "@/components/ui/sonner";

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
 title: "DocDuck",
 description: "An editing experience like no other.",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <html lang="en" className={cn("font-sans", figtree.variable)}>
   <body>
    <TanstackQueryClientProvider>
     <AuthProvider>
      {children}
      <Toaster richColors theme="light" position="bottom-left"/>
     </AuthProvider>
    </TanstackQueryClientProvider>
   </body>
  </html>
 );
}
