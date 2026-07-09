import { AuthNav } from "@/components/AuthShared";

// Shared shell for the /privacy and /terms pages: same editorial system,
// narrow reading column, mono eyebrow, dated header.

export default function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <AuthNav />
      <div className="container" style={{ maxWidth: 720, padding: "64px 22px 90px" }}>
        <div className="eyebrow-wrap" style={{ justifyContent: "flex-start" }}>
          <span className="eyebrow">{eyebrow}</span>
        </div>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 54px)", marginBottom: 8 }}>{title}</h1>
        <p className="mono" style={{ fontSize: 12, color: "var(--faint)", marginBottom: 40 }}>
          LAST UPDATED · {updated}
        </p>
        <div className="legal-body">{children}</div>
      </div>
    </main>
  );
}
