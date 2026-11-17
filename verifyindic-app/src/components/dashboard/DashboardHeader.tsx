import React, { useState } from "react";
import { Brand } from "@/components/common/Brand";
import { useToast } from "@/hooks/useToast";
import type { DashboardTab, User, PlanConfig } from "@/types";

interface DashboardHeaderProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  user: User;
  plan: PlanConfig;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentTab,
  onSelectTab,
  user,
  plan,
  onSignOut,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [signingOut, setSigningOut] = useState(false);

  const handleUserClick = async () => {
    setSigningOut(true);
    try {
      await onSignOut();
    } catch {
      toast("Couldn’t sign out. Please try again.");
      setSigningOut(false);
    }
  };

  const handleTabClick = (tab: DashboardTab) => {
    onSelectTab(tab);
    setIsOpen(false);
  };

  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <Brand to="/" />

        <button
          className="topbar__toggle"
          aria-expanded={isOpen}
          aria-controls="tabs"
          aria-label="Toggle menu"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="tabs"
          className={`tabs ${isOpen ? "is-open" : ""}`}
          aria-label="Dashboard"
        >
          <button
            type="button"
            className={currentTab === "account" ? "is-active" : ""}
            onClick={() => handleTabClick("account")}
            aria-current={currentTab === "account" ? "page" : undefined}
          >
            My account
          </button>
          <button
            type="button"
            className={currentTab === "last" ? "is-active" : ""}
            onClick={() => handleTabClick("last")}
            aria-current={currentTab === "last" ? "page" : undefined}
          >
            Last call
          </button>
          <button
            type="button"
            className={currentTab === "history" ? "is-active" : ""}
            onClick={() => handleTabClick("history")}
            aria-current={currentTab === "history" ? "page" : undefined}
          >
            Call history
          </button>
          <button
            type="button"
            className={currentTab === "billing" ? "is-active" : ""}
            onClick={() => handleTabClick("billing")}
            aria-current={currentTab === "billing" ? "page" : undefined}
          >
            Billing
          </button>
          <button
            type="button"
            className={currentTab === "keys" ? "is-active" : ""}
            onClick={() => handleTabClick("keys")}
            aria-current={currentTab === "keys" ? "page" : undefined}
          >
            API keys
          </button>
          <button
            type="button"
            className={currentTab === "docs" ? "is-active" : ""}
            onClick={() => handleTabClick("docs")}
            aria-current={currentTab === "docs" ? "page" : undefined}
          >
            Docs
          </button>
        </nav>

        <button
          className="user"
          id="userBtn"
          type="button"
          aria-label="Sign out"
          disabled={signingOut}
          onClick={handleUserClick}
        >
          <span className="user__av" id="userAv" aria-hidden="true">
            {user.initials}
          </span>
          <span className="user__txt">
            <strong id="userName">
              {user.name} · {user.company}
            </strong>
            <small id="userSub">{signingOut ? "Signing out…" : `${plan.label} plan · Sign out`}</small>
          </span>
        </button>
      </div>
    </header>
  );
};

