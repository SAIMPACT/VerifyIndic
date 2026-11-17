import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { AuthShell } from "@/components/common/AuthShell";
import { getCurrentProfile, matchesSignupIdentity, signupIdentityKey, useAuth } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

function GoogleMark() {
  return <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.8 12.23c0-.71-.06-1.39-.18-2.05H12v3.87h5.5a4.7 4.7 0 0 1-2.04 3.08v2.51h3.31c1.94-1.78 3.03-4.41 3.03-7.41Z" />
    <path fill="#34A853" d="M12 22c2.75 0 5.05-.91 6.73-2.46l-3.31-2.51c-.91.61-2.08.97-3.42.97-2.64 0-4.88-1.79-5.68-4.19H2.9v2.59A10.16 10.16 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.32 13.81a6.13 6.13 0 0 1 0-3.62V7.6H2.9a10 10 0 0 0 0 8.8l3.42-2.59Z" />
    <path fill="#EA4335" d="M12 6c1.46 0 2.77.5 3.8 1.48l2.85-2.85C17.04 3.13 14.75 2 12 2a10.16 10.16 0 0 0-9.1 5.6l3.42 2.59C7.12 7.79 9.36 6 12 6Z" />
  </svg>;
}

export function SignupPage() {
  const auth = useAuth();
  const [search] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [destination, setDestination] = useState(() => sessionStorage.getItem(signupIdentityKey) ?? "");
  const [method, setMethod] = useState<"email" | "sms">(() => destination.startsWith("+") ? "sms" : "email");
  const viaSms = method === "sms";
  const [codeSent, setCodeSent] = useState(false);
  const [details, setDetails] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [googleComplete, setGoogleComplete] = useState(false);
  const [registeredRole, setRegisteredRole] = useState<"loading" | "member" | "admin" | null>(null);
  const googleSignup = search.get("google") === "1";

  const verified = auth.status === "ready" && matchesSignupIdentity(auth.session?.user, destination);

  useEffect(() => {
    let active = true;
    const needsRedirect = auth.status === "ready" && Boolean(auth.session) && !verified && !busy
      && (!googleSignup || googleComplete);
    if (!needsRedirect) {
      setRegisteredRole(null);
      return () => { active = false; };
    }

    setRegisteredRole("loading");
    void getCurrentProfile(auth.client)
      .then((profile) => {
        if (active) setRegisteredRole(profile?.role === "admin" ? "admin" : "member");
      })
      .catch(() => {
        if (active) setRegisteredRole("member");
      });
    return () => { active = false; };
  }, [auth, busy, googleComplete, googleSignup, verified]);

  useEffect(() => {
    let active = true;
    if (!googleSignup || auth.status !== "ready" || !auth.session || googleComplete) {
      return () => { active = false; };
    }
    const fullName = sessionStorage.getItem("verifyindic.googleSignupName")
      || String(auth.session.user.user_metadata.full_name ?? auth.session.user.user_metadata.name ?? "").trim();
    if (fullName.length < 2) {
      setError("We need your full name to complete Google registration. Return to registration and try again.");
      return () => { active = false; };
    }
    setBusy(true);
    setError("");
    void (async () => {
      try {
        const { error: registrationError } = await auth.client.rpc("complete_google_registration", { p_display_name: fullName });
        if (!active) return;
        if (registrationError) {
          setError("We couldn’t complete Google registration. Please contact support if the problem continues.");
          return;
        }
        sessionStorage.removeItem("verifyindic.googleSignupName");
        setGoogleComplete(true);
      } catch {
        if (active) setError("We couldn’t complete Google registration. Please try again.");
      } finally {
        if (active) setBusy(false);
      }
    })();
    return () => { active = false; };
  }, [auth, googleComplete, googleSignup]);

  if (auth.status === "ready" && auth.session && !verified && !busy && (!googleSignup || googleComplete)) {
    if (registeredRole === "loading" || registeredRole === null) {
      return <AuthShell title="Setting up your account" intro="Checking your VerifyIndic access…"><p role="status">Preparing your workspace…</p></AuthShell>;
    }
    return <Navigate to={registeredRole === "admin" ? "/admin" : "/dashboard#account"} replace />;
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (auth.status !== "ready" || busy) return;

    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name") ?? "").trim();
    const address = viaSms
      ? normalizePhone(String(fields.get("phone") ?? ""))
      : String(fields.get("email") ?? "").trim().toLowerCase();

    if (name.length < 2 || !address) {
      setError(viaSms ? "Enter your name and a valid mobile number." : "Enter your name and a valid email address.");
      return;
    }

    await sendCode(address, name);
  }

  async function sendCode(address: string, name: string) {
    if (auth.status !== "ready" || busy) return;
    setBusy(true);
    setError("");
    const recipient = viaSms ? "mobile number" : "email address";
    try {
      const options = { data: { verifyindic_registration: true, display_name: name } };
      const { error: sendError } = await auth.client.auth.signInWithOtp(viaSms
        ? { phone: address, options: { ...options, channel: "sms" } }
        : { email: address, options });
      if (sendError) {
        setError(sendError.status === 429
          ? "Too many codes requested. Wait a minute and try again."
          : `Couldn’t send the verification code. Check your ${recipient} and try again later.`);
        return;
      }
      setDestination(address);
      setCodeSent(true);
    } catch {
      setError("Couldn’t reach the sign-up service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function registerWithGoogle() {
    if (auth.status !== "ready" || busy) return;
    const name = details.name.trim();
    if (name.length < 2) {
      setError("Enter your full name before continuing with Google.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      sessionStorage.setItem("verifyindic.googleSignupName", name);
      const { error: oauthError } = await auth.client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/signup?google=1`,
        },
      });
      if (oauthError) {
        sessionStorage.removeItem("verifyindic.googleSignupName");
        setError("Google registration is not available yet. Ask an administrator to enable it.");
      }
    } catch {
      setError("Couldn’t start Google registration. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (auth.status !== "ready" || busy) return;
    const token = String(new FormData(event.currentTarget).get("code") ?? "").trim();
    setBusy(true);
    setError("");
    try {
      sessionStorage.setItem(signupIdentityKey, destination);
      const { error: verifyError } = await auth.client.auth.verifyOtp(viaSms
        ? { phone: destination, token, type: "sms" }
        : { email: destination, token, type: "email" });
      if (verifyError) {
        sessionStorage.removeItem(signupIdentityKey);
        setError("That code couldn’t be verified. Check it or request a new code.");
      }
    } catch {
      setError("Couldn’t verify the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function createPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (auth.status !== "ready" || !verified || busy) return;
    const fields = new FormData(event.currentTarget);
    const password = String(fields.get("password") ?? "");
    if (password !== fields.get("confirmPassword")) {
      setError("The passwords don’t match.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const { error: passwordError } = await auth.client.auth.updateUser({ password });
      if (passwordError) {
        setError(passwordError.message);
        return;
      }
      sessionStorage.removeItem(signupIdentityKey);
      setDestination("");
    } catch {
      setError("Couldn’t save your password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={verified ? "Create your password" : codeSent ? (viaSms ? "Verify your number" : "Verify your email") : "Create your account"}
      intro={<>Already have an account? <Link className="underline" to="/login">Sign in</Link></>}
    >
      {auth.status === "ready" && (
        <ol className="auth-shell__steps" aria-label="Signup progress">
          <li aria-current={!codeSent && !verified ? "step" : undefined}>1. Your details</li>
          <li aria-current={codeSent && !verified ? "step" : undefined}>2. Verify code</li>
          <li aria-current={verified ? "step" : undefined}>3. Create password</li>
        </ol>
      )}
      {auth.status === "loading" && <p role="status">Loading sign-up…</p>}
      {auth.status === "unavailable" && <p role="alert">Sign-up is unavailable. Please reload and try again.</p>}
      {auth.status === "ready" && !verified && !codeSent && (
        <form className="grid gap-4" onSubmit={register} aria-busy={busy}>
          <div className="field">
            <label htmlFor="signup-name">Full name</label>
            <input id="signup-name" name="name" autoComplete="name" required minLength={2} maxLength={100} disabled={busy}
              value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} />
          </div>
          <fieldset className="auth-method">
            <legend>Send my code by</legend>
            <label><input type="radio" name="method" checked={!viaSms} disabled={busy} onChange={() => { setMethod("email"); setError(""); }} /> Email</label>
            <label><input type="radio" name="method" checked={viaSms} disabled={busy} onChange={() => { setMethod("sms"); setError(""); }} /> SMS</label>
          </fieldset>
          {viaSms ? (
            <div className="field">
              <label htmlFor="signup-phone">Mobile number</label>
              <div className="auth-phone">
                {!details.phone.trim().startsWith("+") && <span aria-hidden="true">+91</span>}
                <input id="signup-phone" name="phone" type="tel" autoComplete="tel-national" placeholder="98765 43210"
                  aria-describedby="signup-phone-help" required maxLength={30} disabled={busy}
                  value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} />
              </div>
              <small id="signup-phone-help">India (+91) is added automatically.</small>
            </div>
          ) : (
            <div className="field">
              <label htmlFor="signup-email">Email</label>
              <input id="signup-email" name="email" type="email" autoComplete="email" defaultValue={destination.startsWith("+") ? "" : destination}
                placeholder="you@gmail.com" required maxLength={254} disabled={busy} />
            </div>
          )}
          <button className="social-login" type="button" onClick={() => void registerWithGoogle()} disabled={busy}>
            <GoogleMark /> Continue with Google
          </button>
          <div className="login-divider" aria-hidden="true"><span>or verify with a code</span></div>
          <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Sending code…" : "Send verification code"}</button>
        </form>
      )}
      {auth.status === "ready" && !verified && codeSent && (
        <form className="grid gap-4" onSubmit={verifyCode} aria-busy={busy}>
          <p role="status">Enter the verification code sent to <strong>{destination}</strong>.</p>
          <div className="field">
            <label htmlFor="signup-code">Verification code</label>
            <input id="signup-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" maxLength={10} required disabled={busy} />
          </div>
          <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Verifying…" : "Verify code"}</button>
          <div className="flex flex-wrap gap-4">
            <button className="underline" type="button" disabled={busy} onClick={() => void sendCode(destination, details.name.trim())}>Resend code</button>
            <button className="underline" type="button" disabled={busy} onClick={() => {
              setCodeSent(false);
              setError("");
            }}>Change {viaSms ? "number" : "email"}</button>
          </div>
        </form>
      )}
      {verified && (
        <form className="grid gap-4" onSubmit={createPassword} aria-busy={busy}>
          <p role="status">{viaSms ? "Mobile number" : "Email"} verified. Create a password for future sign-ins.</p>
          <div className="field">
            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" name="password" type="password" autoComplete="new-password" required minLength={8} aria-describedby="password-help" disabled={busy} />
            <small id="password-help">Use at least 8 characters.</small>
          </div>
          <div className="field">
            <label htmlFor="signup-confirm-password">Confirm password</label>
            <input id="signup-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} disabled={busy} />
          </div>
          <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving password…" : "Create password"}</button>
        </form>
      )}
      {error && <p className="field__err" role="alert">{error}</p>}
    </AuthShell>
  );
}
