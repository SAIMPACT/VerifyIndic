import { useEffect, useState } from "react";
import { Activity, Bell, Building2, LogOut, ShieldCheck, UsersRound } from "lucide-react";
import { Navigate } from "react-router-dom";
import { getCurrentProfile, type AccountProfile, useAuth } from "@/lib/auth";
import "./admin-dashboard.css";

interface AdminMember {
  name: string;
  email: string | null;
  phone?: string | null;
  createdAt: string;
}

interface AdminData {
  stats: { registeredUsers: number; workspaces: number; analyses: number; admins: number };
  recentMembers: AdminMember[];
  adminsList: AdminMember[];
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof UsersRound }) {
  return <article className="admin-metric"><span className="admin-metric__icon"><Icon size={18} aria-hidden="true" /></span><span className="admin-metric__label">{label}</span><strong>{value.toLocaleString("en-IN")}</strong><small>Live database total</small></article>;
}

export function AdminDashboardPage() {
  const auth = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (auth.status !== "ready") return () => { active = false; };
    const { client, session } = auth;
    if (!session) return () => { active = false; };
    void (async () => {
      try {
        const currentProfile = await getCurrentProfile(client);
        if (!currentProfile || currentProfile.role !== "admin") {
          if (active) setProfile(null);
          return;
        }
        const { data: dashboard, error: dashboardError } = await client.rpc("get_admin_dashboard");
        if (dashboardError) throw dashboardError;
        if (!dashboard || typeof dashboard !== "object") throw new Error("Invalid administrator data");
        if (active) {
          setProfile(currentProfile);
          setData(dashboard as AdminData);
        }
      } catch {
        if (active) setError("The admin workspace could not be loaded. Confirm the latest database migration has been applied.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [auth]);

  if (auth.status !== "ready") return auth.status === "loading"
    ? <main className="container section" role="status">Loading administrator access…</main>
    : <main className="container section" role="alert">Admin sign-in is unavailable. Reload and try again.</main>;
  const adminClient = auth.client;
  if (!auth.session) return <Navigate to="/login?mode=admin" replace />;
  if (!loading && !profile && !error) return <Navigate to="/dashboard#account" replace />;
  if (error) return <main className="container section"><h1>Admin dashboard unavailable</h1><p role="alert">{error}</p></main>;
  if (loading || !profile || !data) return <main className="container section" role="status">Loading your admin workspace…</main>;

  async function signOut() {
    await adminClient.auth.signOut({ scope: "local" });
  }

  return <div className="admin-console">
    <aside className="admin-sidebar">
      <div className="admin-brand"><span aria-hidden="true" /> VerifyIndic <b>Admin</b></div>
      <p className="admin-sidebar__label">Platform</p>
      <nav aria-label="Admin navigation">
        <a className="is-active" href="#overview"><Activity size={17} aria-hidden="true" /> Overview</a>
        <a href="#members"><UsersRound size={17} aria-hidden="true" /> Registered users</a>
        <a href="#admins"><ShieldCheck size={17} aria-hidden="true" /> Administrators</a>
      </nav>
      <div className="admin-sidebar__foot">
        <div className="admin-user"><span>{initials(profile.fullName)}</span><div><strong>{profile.fullName}</strong><small>Platform administrator</small></div></div>
        <button onClick={() => void signOut()}><LogOut size={16} aria-hidden="true" /> Sign out</button>
      </div>
    </aside>

    <main className="admin-main" id="overview">
      <header className="admin-topbar"><span>VerifyIndic / <strong>Admin workspace</strong></span><div><Bell size={17} aria-hidden="true" /><span className="admin-live"><i /> Live data</span></div></header>
      <section className="admin-content">
        <div className="admin-heading"><div><p className="eyebrow">Platform control</p><h1>Welcome, {profile.fullName.split(" ")[0]}.</h1><p>Review real registrations and platform access across VerifyIndic.</p></div><span className="admin-role"><ShieldCheck size={16} aria-hidden="true" /> Administrator</span></div>

        <section className="admin-metrics" aria-label="Platform totals">
          <Metric label="Registered users" value={data.stats.registeredUsers} icon={UsersRound} />
          <Metric label="Active workspaces" value={data.stats.workspaces} icon={Building2} />
          <Metric label="Analyses recorded" value={data.stats.analyses} icon={Activity} />
          <Metric label="Approved admins" value={data.stats.admins} icon={ShieldCheck} />
        </section>

        <section className="admin-card" id="members">
          <div className="admin-card__head"><div><p className="eyebrow">User access</p><h2>Recent registrations</h2></div><span>{data.recentMembers.length} shown</span></div>
          {data.recentMembers.length ? <div className="admin-table-wrap"><table><thead><tr><th>Name</th><th>Contact</th><th>Registered</th><th>Access</th></tr></thead><tbody>{data.recentMembers.map((member) => <tr key={`${member.email}-${member.createdAt}`}><td><span className="admin-avatar">{initials(member.name)}</span><strong>{member.name}</strong></td><td>{member.email ?? member.phone ?? "—"}</td><td>{formatDate(member.createdAt)}</td><td><span className="admin-status">Registered</span></td></tr>)}</tbody></table></div> : <div className="admin-empty"><UsersRound size={22} aria-hidden="true" /><strong>No users have completed registration yet.</strong><span>New users will appear here after they verify their email or mobile number.</span></div>}
        </section>

        <section className="admin-card" id="admins">
          <div className="admin-card__head"><div><p className="eyebrow">Protected access</p><h2>Administrator roster</h2></div><span>Allowlisted accounts only</span></div>
          <div className="admin-roster">{data.adminsList.map((admin) => <article key={admin.email ?? admin.name}><span className="admin-avatar admin-avatar--shield">{initials(admin.name)}</span><div><strong>{admin.name}</strong><small>{admin.email ?? "Email unavailable"}</small></div><ShieldCheck size={18} aria-label="Administrator approved" /></article>)}</div>
        </section>
      </section>
    </main>
  </div>;
}
