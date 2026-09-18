"use client";
import { useLanguage } from "@/components/language-context";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  campaignFromPath,
  campaignHref,
  campaignScreens,
} from "@/lib/campaign-routing";
import { Art, Icon } from "./ui";
import { usePreferences } from "./preview-context";

export function Shell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const { largeText } = usePreferences();
  const campaign = campaignFromPath(pathname);
  const href = (screen: Parameters<typeof campaignHref>[1]) =>
    campaignHref(campaign!.campaign_id, screen);
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
          <span className="preview-indicator">{t("PHASE 0 · PREVIEW")}</span>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="page-footer">
          {t("Preview only · Changes reset on refresh")}
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
          {campaignScreens.map(([path, label]) => (
            <Link
              key={path}
              href={href(path)}
              className={`nav-link ${pathname === href(path) ? "active" : ""} ${path === "settings" ? "settings-link" : ""}`}
              aria-current={pathname === href(path) ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <Icon name={path} />
              <span>
                {t(path === "settings" ? "Campaign Settings" : label)}
              </span>
              {pathname === href(path) && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>
            {t("“Every road starts")}
            <br />
            {t("with a question.”")}
          </p>
          <Link
            href="/campaigns"
            className="campaign-switch"
            onClick={() => setMenu(false)}
          >
            <Art name="city" />
            <span>
              {t(campaign.title)}
              <small>{t("Session 4 · The Letter")}</small>
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
            <Link href={href("game")}>{t(campaign.title)}</Link>
            <Icon name="ChevronRight" size={13} />
            <span>
              {t(
                campaignScreens.find(
                  ([path]) => pathname === href(path),
                )?.[1] ||
                  (pathname.endsWith("/camp") ? "Camp" : "Campaign Settings"),
              )}
            </span>
          </div>
          <span className="preview-indicator">
            <span /> {t("PHASE 0 · PREVIEW")}
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="page-footer">
          <span>{t("Same man. Different worlds.")}</span>
          <span>{t("Sample campaign · Changes reset on refresh")}</span>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label={t("Mobile navigation")}>
        {(["game", "character", "map", "journal", "library"] as const).map(
          (path) => (
            <Link
              key={path}
              href={href(path)}
              className={pathname === href(path) ? "active" : ""}
              aria-current={pathname === href(path) ? "page" : undefined}
            >
              <Icon name={path} />
              <span>{t(path[0].toUpperCase() + path.slice(1))}</span>
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
