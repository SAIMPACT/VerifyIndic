import { Link } from "react-router-dom";

type LegalPageProps = { kind: "privacy" | "terms" };

export function LegalPage({ kind }: LegalPageProps) {
  const privacy = kind === "privacy";
  return (
    <main className="container section" style={{ maxWidth: 780, paddingTop: 56, paddingBottom: 72 }}>
      <Link className="underline" to="/">← Back to VerifyIndic</Link>
      <h1 style={{ marginTop: 28 }}>{privacy ? "Privacy Policy" : "Terms of Service"}</h1>
      {privacy ? <>
        <p>Last updated: 17 November 2026</p>
        <h2>Information we process</h2>
        <p>VerifyIndic stores the name, email address, mobile number when provided, and workspace details needed to create and secure an account. When you choose Google sign-in, Google provides the name and email address you approve on its consent screen.</p>
        <h2>How information is used</h2>
        <p>We use account information to authenticate users, personalise the workspace, provide account support, and protect the service. We do not sell personal information.</p>
        <h2>Storage and security</h2>
        <p>Authentication and account records are processed through Supabase with access controls. Keep your login details private and contact the service administrator if you believe your account has been accessed without permission.</p>
        <h2>Your choices</h2>
        <p>You can ask to update or remove your account information by contacting the VerifyIndic administrator using the support email shown on the Google consent screen.</p>
      </> : <>
        <p>Last updated: 17 November 2026</p>
        <h2>Using VerifyIndic</h2>
        <p>You must register an account before accessing protected workspace features. You are responsible for the information submitted through your account and for keeping access credentials secure.</p>
        <h2>Account access</h2>
        <p>VerifyIndic may limit or suspend access that is unauthorised, abusive, or risks the security of the service. Administrator access is granted only to approved administrator accounts.</p>
        <h2>Service availability</h2>
        <p>The prototype is provided for its intended verification workflow. Features may be changed or improved as the service develops.</p>
        <h2>Contact</h2>
        <p>For account or service questions, contact the VerifyIndic administrator using the support email shown on the Google consent screen.</p>
      </>}
    </main>
  );
}
