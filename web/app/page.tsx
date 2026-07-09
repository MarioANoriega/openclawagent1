import Link from "next/link";

// Landing page — mirrors the section structure reconstructed in
// research/sapient-website-research.md:
// hero -> how it works -> features -> API/dev -> MCP -> testimonials ->
// pricing -> CTA/footer.

function Nav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span className="brand-dot" /> Sapient
        </Link>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Signals</a>
          <a href="#api">API</a>
          <a href="#pricing">Pricing</a>
        </div>
        <Link href="/dashboard" className="btn btn-primary">
          Open dashboard
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="hero">
      <div className="container">
        <div className="hero-badge">
          <span className="brand-dot" style={{ width: 14, height: 14 }} />
          Trained on real fMRI brain data
        </div>
        <h1>
          Decode what
          <br />
          humans think.
        </h1>
        <p className="lead">
          Sapient reads <strong>160+ neural signals</strong> to show exactly how
          the brain responds to your content — and the moment it turns away. Drop
          in any ad or video and get a per-second readout of attention, emotion,
          memory, and intent.
        </p>
        <div className="hero-cta">
          <Link href="/dashboard" className="btn btn-primary">
            Scan your first ad →
          </Link>
          <a href="#api" className="btn btn-ghost">
            Read the API
          </a>
        </div>
        <p className="hero-sub">
          $29/mo · 50 scans/month · API key included · no fMRI machine required
        </p>
      </div>
    </header>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Upload",
    body:
      "Drop in any ad, video, or piece of content — a link or a file. That's the whole setup.",
  },
  {
    n: "02",
    title: "Analyze",
    body:
      "A model trained on real fMRI brain data reads it second by second, mapping attention, emotion, memory and intent as they fire.",
  },
  {
    n: "03",
    title: "Optimize",
    body:
      "Get the full neural readout — where attention holds, the exact second they decide to buy, what to cut — and optimize for the result you want.",
  },
];

function HowItWorks() {
  return (
    <section id="how">
      <div className="container">
        <div className="sec-head">
          <div className="eyebrow">How it works</div>
          <h2>From upload to neural readout in one poll.</h2>
          <p className="muted">
            Real fMRI ad studies run five figures and take weeks. Sapient returns
            a full per-second read in seconds.
          </p>
        </div>
        <div className="grid grid-3">
          {STEPS.map((s) => (
            <div className="card" key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    ic: "◔",
    title: "Per-second activation",
    body:
      "Every signal, every second. Watch attention spike at the hook and decay through the middle.",
  },
  {
    ic: "◆",
    title: "Buy-moment timeline",
    body:
      "We read reward vs. hesitation second by second and mark the exact moment intent tips over.",
  },
  {
    ic: "◇",
    title: "Predicted attention",
    body:
      "Attention density across the whole clip — where it holds, where the audience turns away.",
  },
  {
    ic: "▨",
    title: "Neural signal heatmap",
    body:
      "Attention, emotion, memory, intent, reward, and hesitation, scored against real brain data.",
  },
  {
    ic: "⇄",
    title: "Variant comparison",
    body:
      "Scan variations of the same ad and see which one the brain actually responds to — no traffic required.",
  },
  {
    ic: "◎",
    title: "Composite neural score",
    body:
      "One 0–100 number, comparable across every scan in your account, so you can rank creative fast.",
  },
];

function Features() {
  return (
    <section id="features" style={{ background: "var(--bg-elev)" }}>
      <div className="container">
        <div className="sec-head">
          <div className="eyebrow">The signals</div>
          <h2>The buy moment is measured, not guessed.</h2>
          <p className="muted">
            Every read is scored against a model trained on real fMRI brain data.
          </p>
        </div>
        <div className="grid grid-3">
          {FEATURES.map((f) => (
            <div className="card" key={f.title}>
              <div className="feature-ic">{f.ic}</div>
              <h3>{f.title}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApiSection() {
  return (
    <section id="api">
      <div className="container">
        <div className="grid grid-2" style={{ alignItems: "center", gap: 48 }}>
          <div>
            <div className="eyebrow">Built for developers</div>
            <h2>Send a URL, poll the scan, read every signal.</h2>
            <p className="muted">
              POST a video URL or file with your API key. No SDK required — it's
              plain HTTPS. Pipe results into your dashboard, your agent, or your
              ad rotation.
            </p>
            <ul className="price-list" style={{ maxWidth: 420 }}>
              <li>Async job API — create, poll, read.</li>
              <li>Per-second signal arrays + derived events.</li>
              <li>Same key works from dashboard, terminal, or agent.</li>
            </ul>
          </div>
          <div className="code" aria-label="API example">
            <div>
              <span className="c"># create a scan</span>
            </div>
            <div>
              <span className="k">POST</span> /v1/scans
            </div>
            <div>Authorization: Bearer <span className="s">sk_demo_sapient</span></div>
            <div>{`{ `}<span className="s">&quot;url&quot;</span>{`: `}<span className="s">&quot;https://cdn.me/ad.mp4&quot;</span>{` }`}</div>
            <div style={{ height: 10 }} />
            <div>
              <span className="c"># poll until completed</span>
            </div>
            <div>
              <span className="k">GET</span> /v1/scans/&#123;id&#125;
            </div>
            <div style={{ height: 10 }} />
            <div>
              <span className="c"># {"->"} per-second signals + buy moment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function McpSection() {
  return (
    <section style={{ background: "var(--bg-elev)" }}>
      <div className="container" style={{ textAlign: "center" }}>
        <div className="eyebrow">Agent-native</div>
        <h2 style={{ margin: "0 auto 16px", maxWidth: 640 }}>
          Connects to any MCP-capable agent in one command.
        </h2>
        <p className="muted" style={{ maxWidth: 560, margin: "0 auto 26px" }}>
          Claude Code, Codex, Cursor, Windsurf — score creative from your coding
          agent, your terminal, or the dashboard.
        </p>
        <div
          className="code"
          style={{ maxWidth: 560, margin: "0 auto", textAlign: "left" }}
        >
          <span className="k">$</span> claude mcp add sapient \<br />
          &nbsp;&nbsp;--transport http https://api.thesapientcompany.com/mcp \<br />
          &nbsp;&nbsp;--header <span className="s">&quot;Authorization: Bearer $SAPIENT_KEY&quot;</span>
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    q: "Sapient made me realize what to cut and backed it up with the actual brain response, second by second.",
    by: "Performance marketer, DTC",
  },
  {
    q: "We stopped guessing which cut converts. The buy-moment timeline is the whole game.",
    by: "Creative lead, agency",
  },
  {
    q: "For the price, the readout is well done and genuinely insightful. Nothing else is close at $29.",
    by: "Solo founder",
  },
];

function Testimonials() {
  return (
    <section>
      <div className="container">
        <div className="sec-head">
          <div className="eyebrow">Social proof</div>
          <h2>The people optimizing creative already trust the read.</h2>
        </div>
        <div className="grid grid-3">
          {TESTIMONIALS.map((t, i) => (
            <div className="card" key={i}>
              <p className="quote">“{t.q}”</p>
              <p className="quote-by">— {t.by}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" style={{ background: "var(--bg-elev)" }}>
      <div className="container">
        <div className="sec-head" style={{ textAlign: "center", margin: "0 auto 44px" }}>
          <div className="eyebrow">Pricing</div>
          <h2>One plan. Real brain data.</h2>
        </div>
        <div className="price-card">
          <div className="pill">Sapient</div>
          <div className="price" style={{ marginTop: 16 }}>
            $29<span>/mo</span>
          </div>
          <p className="muted" style={{ marginTop: 4 }}>
            Real fMRI ad studies run five figures. This runs $29.
          </p>
          <ul className="price-list">
            <li>50 scans (ads or content) every month</li>
            <li>Per-second signals, events &amp; benchmarks</li>
            <li>API key included — plain HTTPS, no SDK</li>
            <li>MCP server for Claude Code, Cursor, Codex, Windsurf</li>
            <li>Variant comparison &amp; composite neural score</li>
          </ul>
          <Link href="/dashboard" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Start scanning →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="container footer-inner">
        <div className="brand">
          <span className="brand-dot" /> Sapient
        </div>
        <div className="faint">
          Open replica for study — not affiliated with thesapientcompany.com.
        </div>
        <div className="faint">© {new Date().getFullYear()}</div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <ApiSection />
      <McpSection />
      <Testimonials />
      <Pricing />
      <Footer />
    </main>
  );
}
