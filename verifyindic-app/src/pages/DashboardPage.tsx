import { useState, useEffect } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LastCallTab } from "@/components/dashboard/LastCallTab";
import { CallHistoryTab } from "@/components/dashboard/CallHistoryTab";
import { BillingTab } from "@/components/dashboard/BillingTab";
import { ApiKeysTab } from "@/components/dashboard/ApiKeysTab";
import { DocsTab } from "@/components/dashboard/DocsTab";
import { AccountTab } from "@/components/dashboard/AccountTab";
import { useAuth } from "@/lib/auth";
import { appConfig } from "@/config/appConfig";
import { sampleInvoices, initialApiKeys } from "@/data/mockData";
import type { DashboardTab, CallRecord, ApiKey, User } from "@/types";

interface WorkspaceData {
  workspace: { id: string; name: string; plan: string; displayName: string };
  calls: CallRecord[];
}

export function DashboardPage() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status !== "ready") {
    return <main className="container section" role="status">
      {auth.status === "loading" ? "Loading your session…" : "Sign-in is unavailable. Reload and try again."}
    </main>;
  }
  if (!auth.session) {
    return <Navigate to="/login" replace state={{ returnTo: location.pathname + location.search + location.hash }} />;
  }

  const callId = new URLSearchParams(location.search).get("callId");
  const accountPhone = auth.session.user.phone;
  const phone = accountPhone ? "+" + accountPhone.replace(/^\+/, "") : auth.session.user.user_metadata.contact_phone;
  return <WorkspaceLoader
    key={JSON.stringify([auth.session.user.id, callId])}
    callId={callId}
    email={auth.session.user.email ?? "Not provided"}
    phone={typeof phone === "string" && /^\+[1-9][0-9]{7,14}$/.test(phone) ? phone : null}
    client={auth.client}
    onSignOut={async () => {
      const { error } = await auth.client.auth.signOut({ scope: "local" });
      if (error) throw error;
    }}
  />;
}

interface WorkspaceLoaderProps {
  callId: string | null;
  email: string;
  phone: string | null;
  client: SupabaseClient;
  onSignOut: () => Promise<void>;
}

function WorkspaceLoader({ client, callId, email, phone, onSignOut }: WorkspaceLoaderProps) {
  const [result, setResult] = useState<
    { data: WorkspaceData } | { error: string } | null
  >(null);
  const [retry, setRetry] = useState(0);
  const [signOutError, setSignOutError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWorkspace() {
      try {
        const { data, error } = await client.rpc("get_workspace_dashboard", { p_call_id: callId });
        if (controller.signal.aborted) return;
        if (error || !data || typeof data !== "object") throw error ?? new Error("Workspace request failed");
        const workspaceData = data as WorkspaceData;
        if (!workspaceData.workspace) {
          setResult({ error: "Your account hasn’t been assigned to a workspace. Contact your administrator." });
        } else if (callId !== null && !workspaceData.calls.length) {
          setResult({ error: "Call not found in your workspace." });
        } else {
          setResult({ data: workspaceData });
        }
      } catch {
        if (!controller.signal.aborted) {
          setResult({ error: "Couldn’t load your workspace. Please try again." });
        }
      }
    }

    void loadWorkspace();
    return () => controller.abort();
  }, [client, callId, retry]);

  if (!result) {
    return <main className="container section" role="status">Loading your workspace…</main>;
  }
  if ("error" in result) {
    return (
      <main className="container section">
        <p role="alert">{result.error}</p>
        <div className="btn-row">
          {callId === null
            ? <button className="btn btn--primary" onClick={() => { setResult(null); setRetry(retry + 1); }}>Retry</button>
            : <Link className="btn btn--primary" to="/dashboard#history">Back to call history</Link>}
          <button className="btn btn--ghost" onClick={() => { void onSignOut().catch(() => setSignOutError(true)); }}>Sign out</button>
        </div>
        {signOutError && <p role="alert">Couldn’t sign out. Please try again.</p>}
      </main>
    );
  }

  const { workspace, calls } = result.data;
  const initials = workspace.displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const user: User = { name: workspace.displayName, initials, company: workspace.name, plan: workspace.plan };
  return <WorkspaceDashboard key={workspace.id} user={user} calls={calls} email={email} phone={phone} onSignOut={onSignOut} />;
}

interface WorkspaceDashboardProps {
  user: User;
  calls: CallRecord[];
  email: string;
  phone: string | null;
  onSignOut: () => Promise<void>;
}

function WorkspaceDashboard({ user, calls, email, phone, onSignOut }: WorkspaceDashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCallId, setSelectedCallId] = useState<string>(calls[0]?.id ?? "");
  const [keys, setKeys] = useState<ApiKey[]>(initialApiKeys);

  // Determine active tab from URL hash (e.g. #billing) or query param (?tab=billing)
  const getTabFromUrl = (): DashboardTab => {
    const hash = location.hash.replace("#", "").toLowerCase();
    const validTabs: DashboardTab[] = ["account", "last", "history", "billing", "keys", "docs"];
    if (validTabs.includes(hash as DashboardTab)) {
      return hash as DashboardTab;
    }

    const searchParams = new URLSearchParams(location.search);
    const queryTab = searchParams.get("tab")?.toLowerCase();
    if (queryTab && validTabs.includes(queryTab as DashboardTab)) {
      return queryTab as DashboardTab;
    }

    return searchParams.has("callId") ? "last" : "account";
  };

  const [currentTab, setCurrentTab] = useState<DashboardTab>(getTabFromUrl());

  useEffect(() => {
    const tab = getTabFromUrl();
    setCurrentTab(tab);
  }, [location.hash, location.search]);

  useEffect(() => {
    const tabName = currentTab.charAt(0).toUpperCase() + currentTab.slice(1);
    document.title = `${tabName} — VerifyIndic`;
  }, [currentTab]);

  const handleSelectTab = (tab: DashboardTab) => {
    if (tab === "last") {
      // If clicking Last call tab, reset to latest call as original code does
      setSelectedCallId(calls[0]?.id ?? "");
    }
    setCurrentTab(tab);
    navigate(`/dashboard#${tab}`, { replace: false });
  };

  const handleSelectCallAndGoToLast = (id: string) => {
    setSelectedCallId(id);
    setCurrentTab("last");
    navigate("/dashboard#last");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const plan = appConfig.plans[user.plan] || appConfig.plans.yearly;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <a className="skip-link" href="#view">
        Skip to content
      </a>

      <DashboardHeader
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        user={user}
        plan={plan}
        onSignOut={onSignOut}
      />

      <main className="container flex-1" id="view" tabIndex={-1}>
        {currentTab === "account" && (
          <AccountTab name={user.name} email={email} phone={phone} workspace={user.company} />
        )}

        {currentTab === "last" && (calls.length ? (
          <LastCallTab
            calls={calls}
            selectedCallId={selectedCallId}
            onSelectCall={(id) => setSelectedCallId(id)}
            onGoToBilling={() => handleSelectTab("billing")}
            user={user}
            plan={plan}
          />
        ) : (
          <div className="page-head"><h1>Last call analysis</h1><p>No calls have been recorded for this workspace yet.</p></div>
        ))}

        {currentTab === "history" && (
          <CallHistoryTab
            calls={calls}
            onSelectCallAndGoToLast={handleSelectCallAndGoToLast}
          />
        )}

        {currentTab === "billing" && (
          <BillingTab
            calls={calls}
            invoices={sampleInvoices}
            user={user}
            plan={plan}
          />
        )}

        {currentTab === "keys" && (
          <ApiKeysTab
            keys={keys}
            onKeysChange={(updatedKeys) => setKeys(updatedKeys)}
          />
        )}

        {currentTab === "docs" && <DocsTab />}
      </main>
    </div>
  );
}
