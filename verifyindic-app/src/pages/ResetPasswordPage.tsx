import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "@/components/common/AuthShell";
import { getCurrentProfile, useAuth } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

type Method = "email" | "sms";
type Step = "contact" | "verify" | "password" | "complete";

export function ResetPasswordPage() {
  const auth = useAuth();
  const [method, setMethod] = useState<Method>("email");
  const [step, setStep] = useState<Step>("contact");
  const [destination, setDestination] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const viaSms = method === "sms";

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (auth.status !== "ready" || busy) return;
    const fields = new FormData(event.currentTarget);
    const address = viaSms
      ? normalizePhone(String(fields.get("phone") ?? ""))
      : String(fields.get("email") ?? "").trim().toLowerCase();
    if (!address) {
      setError(viaSms ? "Enter a valid mobile number." : "Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { error: sendError } = await auth.client.auth.signInWithOtp(viaSms
        ? { phone: address, options: { shouldCreateUser: false, channel: "sms" } }
        : { email: address, options: { shouldCreateUser: false } });
      if (sendError) {
        setError(sendError.status === 429 ? "Too many codes requested. Wait a minute and try again." : "We couldn’t send a code to that account.");
        return;
      }
      setDestination(address);
      setStep("verify");
    } catch {
      setError("We couldn’t reach the verification service. Please try again.");
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
      const { error: verifyError } = await auth.client.auth.verifyOtp(viaSms
        ? { phone: destination, token, type: "sms" }
        : { email: destination, token, type: "email" });
      if (verifyError) {
        setError("That verification code isn’t correct. Check it and try again.");
        return;
      }
      const profile = await getCurrentProfile(auth.client);
      if (!profile) {
        await auth.client.auth.signOut({ scope: "local" });
        setError("That account has not completed VerifyIndic registration.");
        return;
      }
      setStep("password");
    } catch {
      setError("We couldn’t verify that code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (auth.status !== "ready" || busy) return;
    const fields = new FormData(event.currentTarget);
    const password = String(fields.get("password") ?? "");
    if (password !== String(fields.get("confirmPassword") ?? "")) {
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
      await auth.client.auth.signOut({ scope: "local" });
      setStep("complete");
    } catch {
      setError("We couldn’t update your password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const title = step === "complete" ? "Password updated" : step === "password" ? "Choose a new password" : step === "verify" ? "Enter your verification code" : "Reset your password";

  return <AuthShell title={title} intro={step === "complete" ? "Your password has been changed securely." : "We’ll verify your email address or mobile number before changing your password."}>
    {auth.status === "loading" && <p role="status">Loading password recovery…</p>}
    {auth.status === "unavailable" && <p role="alert">Password recovery is unavailable. Please reload and try again.</p>}
    {auth.status === "ready" && step === "contact" && <form className="grid gap-4" onSubmit={sendCode} aria-busy={busy}>
      <fieldset className="auth-method">
        <legend>Send a verification code by</legend>
        <label><input type="radio" checked={!viaSms} disabled={busy} onChange={() => { setMethod("email"); setError(""); }} /> Email</label>
        <label><input type="radio" checked={viaSms} disabled={busy} onChange={() => { setMethod("sms"); setError(""); }} /> SMS</label>
      </fieldset>
      {viaSms ? <div className="field"><label htmlFor="reset-phone">Mobile number</label><div className="auth-phone"><span aria-hidden="true">+91</span><input id="reset-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" required disabled={busy} /></div></div>
        : <div className="field"><label htmlFor="reset-email">Email address</label><input id="reset-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required disabled={busy} /></div>}
      {error && <p className="field__err" role="alert">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Sending code…" : "Send verification code"}</button>
    </form>}
    {auth.status === "ready" && step === "verify" && <form className="grid gap-4" onSubmit={verifyCode} aria-busy={busy}>
      <p>Enter the verification code sent to <strong>{destination}</strong>.</p>
      <div className="field"><label htmlFor="reset-code">Verification code</label><input id="reset-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" maxLength={10} required disabled={busy} /></div>
      {error && <p className="field__err" role="alert">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Verifying…" : "Verify code"}</button>
      <button className="underline" type="button" disabled={busy} onClick={() => { setStep("contact"); setError(""); }}>Use a different {viaSms ? "number" : "email"}</button>
    </form>}
    {auth.status === "ready" && step === "password" && <form className="grid gap-4" onSubmit={updatePassword} aria-busy={busy}>
      <div className="field"><label htmlFor="new-password">New password</label><input id="new-password" name="password" type="password" autoComplete="new-password" minLength={8} required disabled={busy} /><small>Use at least 8 characters.</small></div>
      <div className="field"><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required disabled={busy} /></div>
      {error && <p className="field__err" role="alert">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Updating password…" : "Update password"}</button>
    </form>}
    {auth.status === "ready" && step === "complete" && <Link className="btn btn--primary" to="/login">Return to login</Link>}
  </AuthShell>;
}
