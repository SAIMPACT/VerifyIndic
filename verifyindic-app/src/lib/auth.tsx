import { createContext, useContext, useEffect, useState } from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { Navigate, Outlet, useLocation } from "react-router-dom";

type AuthState =
  | { status: "loading" | "unavailable" }
  | { status: "ready"; client: SupabaseClient; session: Session | null };

export const signupIdentityKey = "verifyindic.signupEmail";

export interface AccountProfile {
  fullName: string;
  role: "member" | "admin";
  email: string | null;
  phone: string | null;
}

function isAccountProfile(value: unknown): value is AccountProfile {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.fullName === "string"
    && (record.role === "member" || record.role === "admin")
    && (typeof record.email === "string" || record.email === null)
    && (typeof record.phone === "string" || record.phone === null);
}

/**
 * The profile exists only after the database registration trigger has created
 * the account. This keeps a raw Auth user from accessing the app without
 * completing registration.
 */
export async function getCurrentProfile(client: SupabaseClient): Promise<AccountProfile | null> {
  const { data, error } = await client.rpc("get_current_profile");
  if (error) throw error;
  return isAccountProfile(data) ? data : null;
}

export function matchesSignupIdentity(user: User | undefined, identity: string | null) {
  if (!user || !identity) return false;
  return identity.startsWith("+")
    ? user.phone?.replace(/^\+/, "") === identity.slice(1)
    : user.email?.toLowerCase() === identity;
}

const AuthContext = createContext<AuthState>({ status: "loading" });
let clientRequest: Promise<SupabaseClient> | undefined;

function getClient() {
  clientRequest ??= fetch("/api/auth-config", { signal: AbortSignal.timeout(8000) })
    .then(async (response) => {
      if (!response.ok) throw new Error("Sign-in configuration unavailable");
      const { url, publishableKey } = await response.json();
      if (typeof url !== "string" || !publishableKey?.startsWith("sb_publishable_")) {
        throw new Error("Invalid sign-in configuration");
      }
      const { createClient } = await import("@supabase/supabase-js");
      return createClient(url, publishableKey);
    })
    .catch((error) => {
      clientRequest = undefined;
      throw error;
    });

  return clientRequest;
}

export function AuthLayout() {
  const { pathname } = useLocation();
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    getClient()
      .then((client) => {
        if (!active) return;
        const { data } = client.auth.onAuthStateChange((_event, session) => {
          if (active) setAuth({ status: "ready", client, session });
        });
        unsubscribe = () => data.subscription.unsubscribe();
      })
      .catch(() => {
        if (active) setAuth({ status: "unavailable" });
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  if (pathname !== "/signup" && auth.status === "ready" && auth.session
      && matchesSignupIdentity(auth.session.user, sessionStorage.getItem(signupIdentityKey))) {
    return <Navigate to="/signup" replace />;
  }

  return (
    <AuthContext.Provider value={auth}>
      <Outlet />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
