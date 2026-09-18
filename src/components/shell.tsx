"use client";
import { useLanguage } from "@/components/language-context";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { navigation } from "@/lib/mock-data";
import { Art, Icon } from "./ui";
import { usePreview } from "./preview-context";

export function Shell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const { largeText } = usePreview();
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
        <nav aria-label={t("Main navigation")}>
          {navigation.map(([path, label]) => (
            <Link
              key={path}
              href={`/${path}`}
              className={`nav-link ${pathname === `/${path}` ? "active" : ""} ${path === "settings" ? "settings-link" : ""}`}
              aria-current={pathname === `/${path}` ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <Icon name={path} />
              <span>{t(label)}</span>
              {pathname === `/${path}` && <span className="nav-dot" />}
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
              {t("The Long Road West")}
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
            <Link href="/campaigns">{t("THE LONG ROAD WEST")}</Link>
            <Icon name="ChevronRight" size={13} />
            <span>
              {t(
                navigation.find(([path]) => pathname === `/${path}`)?.[1] ||
                  "Campaigns",
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
              href={`/${path}`}
              className={pathname === `/${path}` ? "active" : ""}
              aria-current={pathname === `/${path}` ? "page" : undefined}
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
