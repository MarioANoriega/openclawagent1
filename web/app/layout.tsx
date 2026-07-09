import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "the sapient company — Decode what humans think, then control it.",
  description:
    "We tell you how real human brains interpret ads and content so you can optimize for whatever result you want from any human. A model trained on real fMRI brain data reads your creative second by second.",
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
