import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sapient — Decode what humans think",
  description:
    "A model trained on real fMRI brain data reads any ad or video second by second — attention, emotion, memory, and intent — and marks the exact moment the brain decides to buy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
