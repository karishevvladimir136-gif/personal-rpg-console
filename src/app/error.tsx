"use client";
import { useLanguage } from "@/components/language-context";
import { Button, Panel } from "@/components/ui";
export default function ErrorBoundary({ reset }: { reset: () => void }) {
  const { t } = useLanguage();
  return (
    <Panel title={t("The campaign store could not be reached")}>
      <p>
        {t(
          "No save is confirmed here. Please retry; do not enter the same record twice.",
        )}
      </p>
      <Button onClick={reset}>{t("Retry")}</Button>
    </Panel>
  );
}
