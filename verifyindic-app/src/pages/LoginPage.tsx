import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { AuthShell } from "@/components/common/AuthShell";
import { getCurrentProfile, useAuth } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

type LoginMode = "member" | "admin";

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.8 12.23c0-.71-.06-1.39-.18-2.05H12v3.87h5.5a4.7 4.7 0 0 1-2.04 3.08v2.51h3.31c1.94-1.78 3.03-4.41 3.03-7.41Z" />
      <path fill="#34A853" d="M12 22c2.75 0 5.05-.91 6.73-2.46l-3.31-2.51c-.91.61-2.08.97-3.42.97-2.64 0-4.88-1.79-5.68-4.19H2.9v2.59A10.16 10.16 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.32 13.81a6.13 6.13 0 0 1 0-3.62V7.6H2.9a10 10 0 0 0 0 8.8l3.42-2.59Z" />
      <path fill="#EA4335" d="M12 6c1.46 0 2.77.5 3.8 1.48l2.85-2.85C17.04 3.13 14.75 2 12 2a10.16 10.16 0 0 0-9.1 5.6l3.42 2.59C7.12 7.79 9.36 6 12 6Z" />
    </svg>
  );
}

export function LoginPage() {
  const auth = useAuth();
  const location = useLocation();
  const [search, setSearch] = useSearchParams();
  const [invitationLink] = useState(
    () => new URLSearchParams(location.hash.slice(1)).get("type") === "invite",
  );
  const invite = invitationLink || search.get("invite") === "1";
  const [mode, setMode] = useState<LoginMode>(() => search.get("mode") === "admin" ? "admin" : "member");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [inviteAccepted, setInviteAccepted] = useState(false);
  const [profileState, setProfileState] = useState<"idle" | "checking" | "approved" | "blocked" | "error">("idle");
  const [profileRole, setProfileRole] = useState<"member" | "admin" | null>(null);
  const returnTo = location.state?.returnTo;
  const isAdmin = mode === "admin";

  useEffect(() => {
    let active = true;
    if (auth.status !== "ready") {
      setProfileRole(null);
      setProfileState("idle");
      return () => { active = false; };
    }
    const { client, session } = auth;
    if (!session || (invite && !inviteAccepted)) {
      setProfileRole(null);
      setProfileState("idle");
      return () => { active = false; };
    }

    setProfileState("checking");
    setError("");
    void getCurrentProfile(client)
      .then(async (initialProfile) => {
        if (!active) return;
        let profile = initialProfile;
        // An approved administrator who chooses Google for their first login
        // has an Auth session but no application profile yet. Complete the
        // normal Google registration here; the database assigns admin only
        // when the authenticated email is on the server-side allowlist.
        if (!profile && isAdmin && session.user.app_metadata.provider === "google") {
          const googleName = String(
            session.user.user_metadata.full_name
            ?? session.user.user_metadata.name
            ?? "Administrator",
          ).trim();
          const { error: registrationError } = await client.rpc("complete_google_registration", {
            p_display_name: googleName.length >= 2 ? googleName : "Administrator",
          });
          if (registrationError) throw registrationError;
          profile = await getCurrentProfile(client);
        }
        if (!profile) {
          await client.auth.signOut({ scope: "local" });
          if (active) {
            setProfileState("blocked");
            setError("This account has not completed VerifyIndic registration. Create an account before signing in.");
          }
          return;
        }
        if (isAdmin && profile.role !== "admin") {
          await client.auth.signOut({ scope: "local" });
          if (active) {
            setProfileState("blocked");
            setError("This account does not have administrator access.");
          }
          return;
        }
        if (active) {
          setProfileRole(profile.role);
          setProfileState("approved");
        }
      })
      .catch(() => {
        if (active) {
          setProfileState("error");
          setError("We couldn’t verify this account. Check that the database migrations have been applied and try again.");
        }
      });

    return () => { active = false; };
  }, [auth, invite, inviteAccepted, isAdmin]);

  if (auth.status === "ready" && auth.session && (!invite || inviteAccepted) && profileState === "approved") {
    const destination = typeof returnTo === "string" && /^\/dashboard(?:[?#]|$)/.test(returnTo)
      ? returnTo
      : profileRole === "admin" ? "/admin" : "/dashboard#account";
    return <Navigate to={destination} replace />;
  }

  function changeMode(nextMode: LoginMode) {
    setMode(nextMode);
    setError("");
    setPasswordVisible(false);
    const params = new URLSearchParams(search);
    if (nextMode === "admin") params.set("mode", "admin");
    else params.delete("mode");
    setSearch(params, { replace: true });
  }

  async function signInWithGoogle() {
    if (auth.status !== "ready" || busy) return;
    setBusy(true);
    setError("");
    try {
      const next = isAdmin ? "/login?mode=admin" : "/login";
      const { error: oauthError } = await auth.client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}${next}` },
      });
      if (oauthError) {
        setError("Google sign-in is not available yet. Ask your workspace administrator to enable it.");
      }
    } catch {
      setError("Couldn’t start Google sign-in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (auth.status !== "ready" || busy) return;
    const address = identifier.trim();
    const phone = isAdmin ? null : normalizePhone(address);
    if (!invite && (!address.includes("@") && !phone)) {
      setError(isAdmin ? "Enter your administrator email address." : "Enter a valid email or mobile number.");
      return;
    }
    setBusy(true);
    setError("");

    try {
      const result = invite
        ? await auth.client.auth.updateUser({ password })
        : await auth.client.auth.signInWithPassword(phone ? { phone, password } : { email: address, password });
      if (result.error) {
        if (invite) {
          setError("Couldn’t set your password. Try again or ask for a new invitation.");
        } else if (isAdmin && /email not confirmed/i.test(result.error.message)) {
          setError("Confirm the email sent to this administrator address, then sign in again.");
        } else if (isAdmin) {
          setError("Those admin sign-in details didn’t work. If this is the first sign-in, activate the approved admin account below.");
        } else {
          setError("Those sign-in details didn’t work. Check your details and try again.");
        }
      } else if (invite) {
        setInviteAccepted(true);
      }
    } catch {
      setError("Couldn’t reach the sign-in service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={invite ? "Set your password" : isAdmin ? "Admin sign in" : "Welcome back"}
      intro={invite ? "Choose a password for your workspace account." : (
        <>{isAdmin ? "Use your approved administrator account to manage the VerifyIndic platform." : <>New to VerifyIndic? <Link className="underline" to="/signup">Create an account</Link></>}</>
      )}
    >
      {auth.status === "loading" && <p role="status">Loading sign-in…</p>}
      {auth.status === "unavailable" && <p role="alert">Sign-in is unavailable. Please reload and try again.</p>}
      {auth.status === "ready" && invite && !auth.session && (
        <p role="alert">This invitation link is invalid or expired. Ask your administrator for a new one.</p>
      )}
      {auth.status === "ready" && auth.session && profileState === "checking" && <p role="status">Checking your registered account…</p>}
      {auth.status === "ready" && ((invite && auth.session) || (!invite && !auth.session)) && (
        <>
          {!invite && (
            <div className="login-mode" role="tablist" aria-label="Choose account type">
              <button type="button" role="tab" aria-selected={!isAdmin} className={!isAdmin ? "is-active" : ""} onClick={() => changeMode("member")}>
                <UserRound size={16} aria-hidden="true" /> Workspace user
              </button>
              <button type="button" role="tab" aria-selected={isAdmin} className={isAdmin ? "is-active" : ""} onClick={() => changeMode("admin")}>
                <ShieldCheck size={16} aria-hidden="true" /> Admin
              </button>
            </div>
          )}

          {!invite && (
            <>
              <button className="social-login" type="button" onClick={() => void signInWithGoogle()} disabled={busy}>
                <GoogleMark />
                Continue with Google
              </button>
              <div className="login-divider" aria-hidden="true"><span>or continue with email</span></div>
            </>
          )}

          <form className="grid gap-4" onSubmit={handleSubmit} aria-busy={busy}>
            {!invite && (
              <div className="field">
                <label htmlFor="login-identifier">{isAdmin ? "Administrator email" : "Email or mobile number"}</label>
                <input id="login-identifier" name="identifier" type={isAdmin ? "email" : "text"} autoComplete="username" required
                  placeholder={isAdmin ? "admin@company.com" : "you@company.com or 98765 43210"}
                  value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
              </div>
            )}
            <div className="field login-password-field">
              <label htmlFor="login-password">Password</label>
              <div className="password-input">
                <LockKeyhole size={18} aria-hidden="true" />
                <input id="login-password" name="password" type={passwordVisible ? "text" : "password"} required minLength={invite ? 8 : undefined}
                  autoComplete={invite ? "new-password" : "current-password"}
                  value={password} onChange={(event) => setPassword(event.target.value)} />
                <button type="button" className="password-toggle" onClick={() => setPasswordVisible(!passwordVisible)} aria-label={passwordVisible ? "Hide password" : "Show password"}>
                  {passwordVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>
            {!invite && <div className="login-help"><label><input type="checkbox" name="remember" /> Remember me</label><Link className="login-link" to="/reset-password">Forgot password?</Link></div>}
            {error && <p className="field__err" role="alert">{error}</p>}
            <button className="btn btn--primary login-submit" type="submit" disabled={busy}>
              {busy ? "Signing you in…" : invite ? "Set password and continue" : isAdmin ? "Sign in as admin" : "Sign in to workspace"}
            </button>
          </form>
          {!invite && isAdmin && <p className="login-security">First time using an approved administrator email? <Link className="login-link" to="/admin-setup">Activate your admin account</Link></p>}
          {!invite && <p className="login-security"><ShieldCheck size={16} aria-hidden="true" /> Your credentials are securely handled by VerifyIndic.</p>}
        </>
      )}
    </AuthShell>
  );
}
