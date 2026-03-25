'use client'

import React from "react";
import { authClient } from "../lib/auth-client";

const AuthContext = React.createContext<ReturnType<typeof authClient.useSession> | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const session = authClient.useSession();

 return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
}

export function useAuth(){
 const context = React.useContext(AuthContext);
 if (!context) throw new Error("useAuth must be used within an AuthProvider.");

 return context;
}