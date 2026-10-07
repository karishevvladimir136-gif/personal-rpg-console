"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useLanguage } from "./language-context";
import {
  useOptionalCampaignData,
  useWorkspaceData,
} from "./persistence-context";
import {
  mobileCampaignScreens,
  playerNavigation,
  saveNavigation,
} from "@/lib/saves/navigation";
import { Icon } from "./ui";
import { Shell } from "./shell";

const persistentNavigation = playerNavigation;

export function ApplicationFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (
    pathname === "/preview/v1/campaign" ||
    pathname === "/preview/adventure-media" ||
    pathname === "/preview/live-ui"
  )
    return children;
  if (pathname.startsWith("/preview")) return <Shell>{children}</Shell>;
  if (/^\/campaigns\/[^/]+/.test(pathname)) return children;
  return <PersistentShell>{children}</PersistentShell>;
}
export function PersistentShell({
  children,
  reviewNavigation,
}: {
  children: ReactNode;
  reviewNavigation?: {
    screen: string;
    navigate: (screen: string) => void;
    basePath?: string;
  };
}) {
  const { t } = useLanguage();
  const route = usePathname();
  const [menu, setMenu] = useState(false);
  const workspace = useWorkspaceData();
  const snapshot = useOptionalCampaignData();
  const campaign = snapshot?.data?.campaign;
  const currentSession = snapshot?.data?.sessions.find(
    (session) =>
      session.id === snapshot.data?.publicState.current_session_id,
  );
  const largeText = workspace.data?.preferences.largeText;
  const href = (screen: string) =>
    reviewNavigation
      ? `${reviewNavigation.basePath ?? "/preview/v1/campaign"}?screen=${screen}`
      : `/campaigns/${campaign?.id}/${screen}`;
  const pathname = reviewNavigation ? href(reviewNavigation.screen) : route;
  const visit =
    (screen: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      setMenu(false);
      if (reviewNavigation) {
        event.preventDefault();
        reviewNavigation.navigate(screen);
      }
    };
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
          <span className="eyebrow">{t("Same man. Different worlds.")}</span>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="page-footer">
          {t("Same man. Different worlds.")}
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
              onClick={visit(screen)}
            >
              <Icon name={screen} />
              <span>
                {t(label)}
              </span>
              {pathname === href(screen) && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link
            className="campaign-switch"
            href="/campaigns"
            onClick={() => setMenu(false)}
          >
            <Icon name="BookOpen" size={27} />
            <span>
              {campaign.title}
              {currentSession && <small>{currentSession.title}</small>}
            </span>
            <Icon name="ChevronRight" size={15} />
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
            <Link href={href("game")} onClick={visit("game")}>
              {campaign.title}
            </Link>
            <Icon name="ChevronRight" size={13} />
            <span>
              {t(
                persistentNavigation.find(([screen]) => pathname === href(screen))
                  ?.[1] ||
                  saveNavigation.find(([screen]) => pathname === href(screen))
                    ?.[1] ||
                  "Game",
              )}
            </span>
          </div>
          <span className="eyebrow">{t("Same man. Different worlds.")}</span>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="page-footer">
          {t("Same man. Different worlds.")}
        </footer>
      </div>
      <nav className="bottom-nav" aria-label={t("Mobile navigation")}>
        {mobileCampaignScreens.map((screen) => (
          <Link
            key={screen}
            href={href(screen)}
            onClick={visit(screen)}
            aria-current={pathname === href(screen) ? "page" : undefined}
            className={pathname === href(screen) ? "active" : ""}
          >
            <Icon name={screen} />
            <span>{t(screen[0].toUpperCase() + screen.slice(1))}</span>
          </Link>
        ))}
        <button
          type="button"
          className={`more-campaign-nav ${!mobileCampaignScreens.some((screen) => pathname === href(screen)) ? "active" : ""}`}
          aria-label={t("More campaign screens")}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          <Icon name="MoreHorizontal" />
          <span>{t("More")}</span>
        </button>
      </nav>
    </div>
  );
}
