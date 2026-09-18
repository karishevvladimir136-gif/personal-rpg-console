"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useLanguage } from "./language-context";
import {
  useOptionalCampaignData,
  useWorkspaceData,
} from "./persistence-context";
import { campaignScreens } from "@/lib/campaign-routing";
import { Icon } from "./ui";
import { Shell } from "./shell";

const persistentNavigation = [
  ...campaignScreens.filter(([screen]) => screen !== "settings"),
  ["dm-chat", "Chat with DM"],
  ["settings", "Campaign Settings"],
] as const;

export function ApplicationFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/preview")) return <Shell>{children}</Shell>;
  if (/^\/campaigns\/[^/]+/.test(pathname)) return children;
  return <PersistentShell>{children}</PersistentShell>;
}
export function PersistentShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const workspace = useWorkspaceData();
  const snapshot = useOptionalCampaignData();
  const campaign = snapshot?.data?.campaign;
  const largeText = workspace.data?.preferences.largeText;
  const href = (screen: string) => `/campaigns/${campaign?.id}/${screen}`;
  if (!campaign)
    return (
      <div className={`app-level-shell ${largeText ? "large-text" : ""}`}>
        <a className="skip-link" href="#main">
          {t("Skip to content")}
        </a>
        <header className="app-level-header">
          <Link className="brand" href="/">
            ✧ {t("PERSONAL RPG CONSOLE")}
          </Link>
          <span className="preview-indicator">
            {t("PHASE 1 · PERSISTENCE")}
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="page-footer">
          {t("Private owner application · Gameplay is not active")}
        </footer>
      </div>
    );
  return (
    <div className={`app-shell ${largeText ? "large-text" : ""}`}>
      <a className="skip-link" href="#main">
        {t("Skip to content")}
      </a>
      <aside className={`sidebar ${menu ? "mobile-open" : ""}`}>
        <Link
          href="/campaigns"
          className="brand"
          onClick={() => setMenu(false)}
        >
          <span className="brand-mark">✧</span>
          <span>
            {t("PERSONAL")}
            <span>{t("RPG CONSOLE")}</span>
          </span>
        </Link>
        <p className="brand-motto">
          {t("SAME MAN.")}
          <br />
          {t("DIFFERENT WORLDS.")}
        </p>
        <Link
          href="/campaigns"
          className="back-campaigns"
          onClick={() => setMenu(false)}
        >
          {t("Back to campaigns")}
        </Link>
        <nav aria-label={t("Campaign navigation")}>
          {persistentNavigation.map(([screen, label]) => (
            <Link
              key={screen}
              href={href(screen)}
              className={`nav-link ${pathname === href(screen) ? "active" : ""} ${screen === "settings" ? "settings-link" : ""}`}
              aria-current={pathname === href(screen) ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <Icon name={screen} />
              <span>
                {t(screen === "settings" ? "Campaign Settings" : label)}
              </span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>{campaign.title}</p>
          <Link className="text-link" href="/">
            {t("Back to main menu")}
          </Link>
        </div>
      </aside>
      {menu && (
        <button
          className="menu-scrim"
          aria-label={t("Close navigation")}
          onClick={() => setMenu(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label={t(menu ? "Close navigation" : "Open navigation")}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Icon name={menu ? "X" : "Menu"} />
          </button>
          <div className="breadcrumbs">
            <Link href={href("game")}>{campaign.title}</Link>
            <Icon name="ChevronRight" size={13} />
            <span>
              {t(
                persistentNavigation.find(
                  ([screen]) => pathname === href(screen),
                )?.[1] || "Camp",
              )}
            </span>
          </div>
          <span className="preview-indicator">
            {t("PHASE 1 · PERSISTENCE")}
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="page-footer">
          {t("Manual owner records · Gameplay is not active")}
        </footer>
      </div>
      <nav className="bottom-nav" aria-label={t("Mobile navigation")}>
        {(["game", "character", "map", "journal", "library"] as const).map(
          (screen) => (
            <Link
              key={screen}
              href={href(screen)}
              aria-current={pathname === href(screen) ? "page" : undefined}
              className={pathname === href(screen) ? "active" : ""}
            >
              <Icon name={screen} />
              <span>{t(screen[0].toUpperCase() + screen.slice(1))}</span>
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
