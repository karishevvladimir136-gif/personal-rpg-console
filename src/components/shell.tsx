"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { navigation } from "@/lib/mock-data";
import { Art, Icon } from "./ui";
import { usePreview } from "./preview-context";

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const { largeText } = usePreview();
  return (
    <div className={`app-shell ${largeText ? "large-text" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className={`sidebar ${menu ? "mobile-open" : ""}`}>
        <Link
          href="/campaigns"
          className="brand"
          onClick={() => setMenu(false)}
        >
          <span className="brand-mark">✧</span>
          <span>
            PERSONAL<span>RPG CONSOLE</span>
          </span>
        </Link>
        <p className="brand-motto">
          SAME MAN.
          <br />
          DIFFERENT WORLDS.
        </p>
        <nav aria-label="Main navigation">
          {navigation.map(([path, label]) => (
            <Link
              key={path}
              href={`/${path}`}
              className={`nav-link ${pathname === `/${path}` ? "active" : ""} ${path === "settings" ? "settings-link" : ""}`}
              aria-current={pathname === `/${path}` ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <Icon name={path} />
              <span>{label}</span>
              {pathname === `/${path}` && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>
            “Every road starts
            <br />
            with a question.”
          </p>
          <Link
            href="/campaigns"
            className="campaign-switch"
            onClick={() => setMenu(false)}
          >
            <Art name="city" />
            <span>
              The Long Road West<small>Session 4 · The Letter</small>
            </span>
            <Icon name="ChevronRight" size={15} />
          </Link>
        </div>
      </aside>
      {menu && (
        <button
          className="menu-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Icon name={menu ? "X" : "Menu"} />
          </button>
          <div className="breadcrumbs">
            <Link href="/campaigns">THE LONG ROAD WEST</Link>
            <Icon name="ChevronRight" size={13} />
            <span>
              {navigation.find(([path]) => pathname === `/${path}`)?.[1] ||
                "Campaigns"}
            </span>
          </div>
          <span className="preview-indicator">
            <span /> PHASE 0 · PREVIEW
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="page-footer">
          <span>Same man. Different worlds.</span>
          <span>Sample campaign · Changes reset on refresh</span>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {(["game", "character", "map", "journal", "library"] as const).map(
          (path) => (
            <Link
              key={path}
              href={`/${path}`}
              className={pathname === `/${path}` ? "active" : ""}
              aria-current={pathname === `/${path}` ? "page" : undefined}
            >
              <Icon name={path} />
              <span>{path[0].toUpperCase() + path.slice(1)}</span>
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
