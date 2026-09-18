import type { Metadata } from "next";
import { PreviewProvider } from "@/components/preview-context";
import { ApplicationFrame } from "@/components/persistent-shell";
import { WorkspaceProvider } from "@/components/persistence-context";
import { LanguageProvider } from "@/components/language-context";
import "./globals.css";
export const metadata: Metadata = {
  title: "Personal RPG Console",
  description:
    "A private narrative RPG journal with owner-controlled campaign records.",
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
            <WorkspaceProvider>
              <ApplicationFrame>{children}</ApplicationFrame>
            </WorkspaceProvider>
          </PreviewProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
