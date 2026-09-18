"use client";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "./language-context";
import { Button, Icon, Modal } from "./ui";

export function MainMenu() {
  const { t } = useLanguage();
  const [exit, setExit] = useState(false);
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
        <Button onClick={() => setExit(true)}>
          <Icon name="Exit" />
          {t("Exit")}
        </Button>
      </nav>
      {exit && (
        <Modal title={t("Exit")} onClose={() => setExit(false)}>
          <p>
            {t(
              "Sign-out is unavailable in this preview because there are no accounts yet. You can close this tab whenever you like. Opening this message does not stop the preview or erase your temporary choices.",
            )}
          </p>
          <Button onClick={() => setExit(false)}>{t("Return to menu")}</Button>
        </Modal>
      )}
    </section>
  );
}
