import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Neuralytics — Decode what people feel, before they say a word",
  description:
    "See what your audience feels before they can put it into words. Neuralytics reveals how real brains experience your content — a model trained on real fMRI data reads your creative second by second.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
