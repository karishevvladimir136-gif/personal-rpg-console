"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { readJson, errorMessage } from "@/lib/persistence/client";
import { Badge, Button, Icon, Panel } from "./ui";
import { languageOptions } from "@/lib/i18n";

export function OwnerLogin() {
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  return (
    <section className="owner-access">
      <span className="eyebrow">{t("YOUR PRIVATE STORY ROOM")}</span>
      <h1>{t("Owner sign in")}</h1>
      <p>
        {t(
          "Only the configured owner account can open saved campaigns. Public registration is disabled.",
        )}
      </p>
      <Panel>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (submitting.current) return;
            submitting.current = true;
            setBusy(true);
            setError("");
            try {
              await readJson("/api/auth/sign-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
              });
              window.location.replace("/");
            } catch (cause) {
              setError(errorMessage(cause));
              setBusy(false);
              submitting.current = false;
            }
          }}
        >
          <label className="field">
            {t("Email")}
            <input
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field">
            {t("Password")}
            <input
              type="password"
              autoComplete="current-password"
              required
              maxLength={1024}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p role="alert">{t(error)}</p>}
          <Button primary type="submit" disabled={busy}>
            {t(busy ? "Signing in…" : "Sign in")}
          </Button>
        </form>
      </Panel>
      <label className="field">
        {t("Interface Language")}
        <select
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value === "ru" ? "ru" : "en")
          }
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <Link href="/preview" className="text-link">
        {t("Open isolated Phase 0 preview")}
      </Link>
    </section>
  );
}
export function SetupRequired() {
  const { t } = useLanguage();
  return (
    <section className="owner-access">
      <Badge>{t("Setup required")}</Badge>
      <h1>{t("Connect your private campaign store")}</h1>
      <p>
        {t(
          "The persistence code is ready for configuration. No database is connected here, so this screen cannot promise saved data.",
        )}
      </p>
      <Panel title={t("Local setup")}>
        <ol>
          <li>
            {t(
              "Use a local Supabase stack or an existing test project. Do not deploy yet.",
            )}
          </li>
          <li>
            {t(
              "Follow SUPABASE_SETUP.md to inspect the target, apply migrations and configure one owner. Public registration must stay disabled.",
            )}
          </li>
          <li>
            {t(
              "Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and RPG_OWNER_USER_ID in .env.local, then restart this preview. Never paste secret values into chat or Git.",
            )}
          </li>
          <li>
            {t(
              "Complete the persistence and owner-access checks before requesting deployment.",
            )}
          </li>
        </ol>
      </Panel>
      <p>
        {t(
          "The approved visual preview remains available separately. Its synthetic actions never save to the database.",
        )}
      </p>
      <Link className="button primary" href="/preview">
        {t("Open isolated Phase 0 preview")}
      </Link>
    </section>
  );
}
export function PersistentMainMenu({
  trustedLocalOwner = false,
}: {
  trustedLocalOwner?: boolean;
}) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  return (
    <section className="main-menu-scene">
      <div className="menu-ornament" aria-hidden="true">
        ✧
      </div>
      <span className="eyebrow">{t("SAME MAN. DIFFERENT WORLDS.")}</span>
      <h1>{t("Your next chapter awaits.")}</h1>
      <p>{t("A quiet place for extraordinary stories.")}</p>
      <nav aria-label={t("Main menu")} className="main-menu-links">
        <Link className="button primary" href="/campaigns">
          <Icon name="campaigns" />
          {t("Campaigns")}
          <Icon name="ArrowRight" />
        </Link>
        <Link className="button" href="/settings">
          <Icon name="settings" />
          {t("General Settings")}
        </Link>
        <Link className="button" href="/world-library">
          <Icon name="library" />
          {t("World Library")}
        </Link>
        <Link className="button" href="/dm-craft">
          <Icon name="BookOpen" />
          {t("DM Craft")}
        </Link>
        {!trustedLocalOwner && (
          <Button
            disabled={busy}
            onClick={async () => {
              if (submitting.current) return;
              submitting.current = true;
              setBusy(true);
              setError("");
              try {
                await readJson("/api/auth/sign-out", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: "{}",
                });
                window.location.replace("/login");
              } catch (cause) {
                setError(errorMessage(cause));
                setBusy(false);
                submitting.current = false;
              }
            }}
          >
            <Icon name="Exit" />
            {t(busy ? "Signing out…" : "Sign out")}
          </Button>
        )}
      </nav>
      {error && <p role="alert">{t(error)}</p>}
      <Link className="text-link" href="/preview">
        {t("Open isolated Phase 0 preview")}
      </Link>
    </section>
  );
}
