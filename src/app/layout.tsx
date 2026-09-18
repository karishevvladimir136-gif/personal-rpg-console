import type { Metadata } from "next";
import { PreviewProvider } from "@/components/preview-context";
import { Shell } from "@/components/shell";
import { LanguageProvider } from "@/components/language-context";
import "./globals.css";
export const metadata: Metadata = {
  title: "Personal RPG Console",
  description:
    "A private narrative RPG journal. Phase 0 visual preview with sample data.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <LanguageProvider>
          <PreviewProvider>
            <Shell>{children}</Shell>
          </PreviewProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
