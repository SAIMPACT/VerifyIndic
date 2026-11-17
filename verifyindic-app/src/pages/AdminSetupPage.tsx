import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthShell } from "@/components/common/AuthShell";
import { getCurrentProfile, useAuth } from "@/lib/auth";

export function AdminSetupPage() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [role, setRole] = useState<"loading" | "admin" | "member" | null>(null);

  useEffect(() => {
    let active = true;
    if (auth.status !== "ready" || !auth.session) {
      setRole(null);
      return () => { active = false; };
    }
    setRole("loading");
    void getCurrentProfile(auth.client)
      .then((profile) => {
        if (active) setRole(profile?.role === "admin" ? "admin" : "member");
      })
      .catch(() => { if (active) setRole("member"); });
    return () => { active = false; };
  }, [auth]);

  if (role === "admin") return <Navigate to="/admin" replace />;

  async function activate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (auth.status !== "ready" || busy) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      setError("Enter your approved administrator email address.");
      return;
    }
    if (password.length < 6) {
      setError("Use a password with at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords don’t match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { error: signupError } = await auth.client.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { verifyindic_registration: true, display_name: "Administrator" },
          emailRedirectTo: `${window.location.origin}/admin-setup`,
        },
      });
      if (signupError) {
        setError(signupError.status === 429
          ? "Too many email requests were sent. Please wait and try again later."
          : "We couldn’t start admin account activation. Check the address and try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("We couldn’t reach the sign-in service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <AuthShell title="Activate admin account" intro="Only approved administrator email addresses receive administrator access.">
    {auth.status === "loading" && <p role="status">Loading account activation…</p>}
    {auth.status === "unavailable" && <p role="alert">Sign-in is unavailable. Please reload and try again.</p>}
    {auth.status === "ready" && role === "loading" && <p role="status">Checking administrator access…</p>}
    {auth.status === "ready" && role === "member" && <p role="alert">This signed-in account is not an approved administrator.</p>}
    {auth.status === "ready" && !auth.session && !sent && <form className="grid gap-4" onSubmit={activate} aria-busy={busy}>
      <div className="field"><label htmlFor="admin-email">Approved administrator email</label><input id="admin-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
      <div className="field"><label htmlFor="admin-password">Choose password</label><input id="admin-password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
      <div className="field"><label htmlFor="admin-confirm-password">Confirm password</label><input id="admin-confirm-password" type="password" autoComplete="new-password" minLength={6} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>
      {error && <p className="field__err" role="alert">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Starting activation…" : "Activate approved account"}</button>
    </form>}
    {sent && <div className="grid gap-4"><p role="status">If this is an approved email address, a confirmation link has been sent. Open it to finish activation and enter the admin dashboard.</p><Link className="btn btn--primary" to="/login?mode=admin">Return to admin sign in</Link></div>}
    <p className="login-security"><Link className="login-link" to="/login?mode=admin">← Back to admin sign in</Link></p>
  </AuthShell>;
}
