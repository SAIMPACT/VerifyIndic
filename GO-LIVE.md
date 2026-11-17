# Take VerifyIndic live

This is the React application in `verifyindic-app/`. Use it through Vercel or `npm run dev`; the older root-level static HTML files are retained only as a legacy reference and do not contain the live authentication flow.

## 1. Configure Supabase Auth

In your Supabase project:

1. Enable Email and Phone authentication.
2. Connect an SMS provider so phone OTPs can be delivered.
3. Configure the email template to include the Supabase OTP token, so the email verification and password-reset screens can verify a code rather than relying on a link.
4. Enable Google under **Authentication → Providers**. Its callback URL is:

   ```text
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```

5. Add your deployed URLs to **Authentication → URL Configuration**:

   ```text
   https://YOUR-DOMAIN/login
   https://YOUR-DOMAIN/signup
   https://YOUR-DOMAIN/reset-password
   https://YOUR-DOMAIN/admin
   ```

## 2. Apply the database migrations

Apply every SQL file in `supabase/migrations/`, in filename order, using the Supabase CLI or SQL editor. The newest migration adds:

- server-side profiles and registration gate;
- the four administrator email allowlist;
- protected admin dashboard queries; and
- the Google registration completion function.

## 3. Provision the four administrator accounts

After migrations have completed, run this command from the project root. Pass the temporary password through the environment, rather than storing it in source code:

```bash
SUPABASE_URL='https://YOUR-PROJECT.supabase.co' \
SUPABASE_SERVICE_ROLE_KEY='YOUR_SERVICE_ROLE_KEY' \
VERIFYINDIC_ADMIN_PASSWORD='YOUR_TEMPORARY_PASSWORD' \
npm run provision-admins
```

The command creates or verifies the allowlisted accounts and gives each admin the correct display name. Administrators should change the temporary password immediately using **Forgot password**.

## 4. Deploy to Vercel

Create a Vercel project from this folder. The included `vercel.json` builds `verifyindic-app/` and supports direct access to `/login`, `/signup`, `/reset-password`, `/dashboard`, and `/admin`.

Set these Vercel environment variables for Production and Preview:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` is only for the one-time provisioning command. Never add it to the front-end or Vercel client environment.

## What is enforced

- A person must complete registration before the app creates their profile and workspace.
- Login verifies that server-side profile before routing into the app.
- Email and SMS verification codes can be used during registration and password recovery.
- `/admin` verifies the server-side role; changing a URL or client-side state cannot make a normal user an administrator.
