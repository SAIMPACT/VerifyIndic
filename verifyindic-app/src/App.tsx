import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { ToastProvider } from "@/hooks/useToast";
import { LandingPage } from "@/pages/LandingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AdminSetupPage } from "@/pages/AdminSetupPage";
import { LegalPage } from "@/pages/LegalPage";
import { AuthLayout } from "@/lib/auth";
import { DocsTab } from "@/components/dashboard/DocsTab";

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/docs" element={
            <main className="container section">
              <Link className="underline" to="/">Back to VerifyIndic</Link>
              <DocsTab />
            </main>
          } />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin-setup" element={<AdminSetupPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;

