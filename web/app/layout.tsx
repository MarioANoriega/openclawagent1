import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Neuralytics — Decode what people feel, before they say a word",
  description:
    "Neuralytics tells you how real human brains interpret ads and content so you can optimize for whatever result you want. A model trained on real fMRI brain data reads your creative second by second.",
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
