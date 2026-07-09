import Link from "next/link";

// Landing page — Neuralytics, a neuromarketing scan product (rebranded from the
// thesapientcompany.com reference design), matched to the
// reference screenshot: light warm editorial layout, two-tone grotesk
// headlines, mono eyebrows in outlined pills, charcoal pill buttons, a dark
// "TOTAL DECODE" section, and fMRI data panels.

function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Neuralytics">
      <span className="t2">Neuralytics</span>
      <span className="t3">the analytics of attention</span>
    </Link>
  );
}

function Nav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Logo />
        <div className="nav-right">
          <Link href="/login" className="btn btn-outline btn-sm">
            Log in
          </Link>
          <Link href="/dashboard" className="btn btn-dark btn-sm">
            Run first scan
          </Link>
          <div className="hamburger" aria-hidden>
            <span /><span />
          </div>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="hero container">
      <h1>
        Decode what people feel
        <br />
        <span className="dim">— before they say a word</span>
      </h1>
      <p className="lead">
        We tell you how real human brains interpret ads and content so you can
        optimize for whatever result you want from any human.
      </p>
      <Link href="/dashboard" className="btn btn-dark">
        Run first scan
      </Link>
      <div className="hero-brain-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-brain-img" src="/brain.jpg" alt="Sagittal fMRI brain scan" />
      </div>
    </header>
  );
}

// Heatmap color ramp: low (green) -> high (red).
function heatColor(v: number) {
  const stops = [
    [0.0, [111, 174, 95]],
    [0.5, [214, 190, 90]],
    [1.0, [200, 78, 60]],
  ];
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (v >= (stops[i][0] as number) && v <= (stops[i + 1][0] as number)) {
      a = stops[i]; b = stops[i + 1]; break;
    }
  }
  const t = ((v - (a[0] as number)) / ((b[0] as number) - (a[0] as number))) || 0;
  const c = (a[1] as number[]).map((ca, i) => Math.round(ca + t * ((b[1] as number[])[i] - ca)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function HeatRow({ label, vals }: { label: string; vals: number[] }) {
  return (
    <div className="heat-row">
      <div className="rl">{label}</div>
      <div className="heat-cells">
        {vals.map((v, i) => (
          <i key={i} style={{ background: heatColor(v) }} />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label, value, tag, tagClass, ideal, fill, tickPct,
}: {
  label: string; value: string; tag: string; tagClass?: string; ideal: string; fill: number; tickPct: number;
}) {
  return (
    <div className="dcard">
      <div className="dcard-head">
        <span className="label">{label}</span>
        <span className={`tag ${tagClass ?? ""}`}>{tag}</span>
      </div>
      <div className="big">{value}</div>
      <div className="scan-scale">
        <span className="scanlbl">SCAN</span>
        <div className="bar" />
        <div className="fill" style={{ width: `${fill}%`, right: 0 }} />
        <div className="tick" style={{ left: `${tickPct}%` }} />
        <span className="cap l">0</span>
        <span className="cap r">{ideal}</span>
      </div>
    </div>
  );
}

function Deliverable() {
  const rows = [
    { label: "ATTENTION", vals: [0.9, 0.85, 0.6, 0.55, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.15, 0.1, 0.1, 0.05, 0.05] },
    { label: "EMOTION", vals: [0.3, 0.35, 0.45, 0.5, 0.6, 0.7, 0.75, 0.7, 0.6, 0.55, 0.45, 0.4, 0.35, 0.3, 0.25, 0.3] },
    { label: "REWARD", vals: [0.2, 0.25, 0.3, 0.35, 0.5, 0.65, 0.85, 0.95, 0.85, 0.6, 0.4, 0.3, 0.25, 0.2, 0.2, 0.15] },
    { label: "MEMORY", vals: [0.35, 0.4, 0.4, 0.45, 0.5, 0.55, 0.5, 0.55, 0.6, 0.55, 0.5, 0.45, 0.4, 0.4, 0.35, 0.35] },
    { label: "EFFORT", vals: [0.4, 0.45, 0.5, 0.5, 0.45, 0.5, 0.55, 0.5, 0.45, 0.5, 0.55, 0.5, 0.45, 0.4, 0.45, 0.4] },
  ];
  return (
    <section className="container">
      <div className="eyebrow-wrap"><span className="eyebrow">The deliverable</span></div>
      <h2>
        Here&apos;s what you get
        <br />
        <span className="dim">from a single scan</span>
      </h2>
      <p className="section-lead lead">
        Real output from a 30 second ad. The model scores every signal, second by second.
      </p>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <StatCard label="Visual Pull" value="40" tag="Moderate" ideal=">70 STRONG" fill={16} tickPct={24} />
        <StatCard label="Cognitive Grip" value="50" tag="Steady" ideal=">65 STRONG" fill={12} tickPct={40} />
      </div>

      <div className="media brainviz" style={{ marginBottom: 18, minHeight: 260 }}>
        <div className="kicker">Brain Activation</div>
        <div className="pts">71<sup> PTS</sup></div>
      </div>

      <div className="dcard" style={{ marginBottom: 18 }}>
        <div className="dcard-head" style={{ marginBottom: 14 }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--muted)" }}>
            NEURAL READOUT · ATTENTION OVER TIME
          </span>
          <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>63% · 0:12</span>
        </div>
        <AttentionCurve />
        <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>ATTENTION HOLD</span>
          <span className="mono" style={{ fontSize: 13 }}>63%</span>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <StatCard label="Mental Effort" value="61" tag="Runs High" tagClass="hot" ideal="<40 IDEAL" fill={20} tickPct={61} />
        <StatCard label="Hesitation Risk" value="23" tag="Low" tagClass="good" ideal="<30 IDEAL" fill={22} tickPct={23} />
      </div>

      <div className="dcard">
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--muted)", marginBottom: 4 }}>PER-SECOND</div>
        <div style={{ fontWeight: 600, letterSpacing: "0.08em", marginBottom: 18 }} className="mono">ACTIVATION HEATMAP</div>
        <div className="heat">
          {rows.map((r) => <HeatRow key={r.label} label={r.label} vals={r.vals} />)}
        </div>
        <div className="row" style={{ justifyContent: "space-between", marginTop: 14 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>LOW</span>
          <div style={{ flex: 1, height: 4, margin: "0 12px", borderRadius: 2, background: "linear-gradient(90deg,#6fae5f,#d6be5a,#c84e3c)" }} />
          <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>HIGH</span>
        </div>
      </div>
    </section>
  );
}

function AttentionCurve() {
  // Simple smooth attention arc with a marked hold point at 0:12.
  return (
    <svg viewBox="0 0 600 150" width="100%" role="img" aria-label="Attention over time" style={{ display: "block" }}>
      <path d="M20 110 C 120 60, 220 55, 320 70 C 420 85, 520 120, 580 130" fill="none" stroke="#1b1e1f" strokeWidth="2.5" />
      <line x1="320" y1="70" x2="320" y2="140" stroke="#9aa3aa" strokeDasharray="3 3" />
      <line x1="20" y1="70" x2="320" y2="70" stroke="#9aa3aa" strokeDasharray="3 3" />
      <circle cx="320" cy="70" r="6" fill="#1b1e1f" />
      <text x="20" y="148" className="mono" fontSize="11" fill="#9aa3aa">0:00</text>
      <text x="300" y="148" className="mono" fontSize="11" fill="#9aa3aa">0:12</text>
      <text x="545" y="148" className="mono" fontSize="11" fill="#9aa3aa">0:19</text>
    </svg>
  );
}

function HowItWorks() {
  return (
    <section className="container">
      <div className="eyebrow-wrap"><span className="eyebrow">How it works</span></div>
      <h2>Score any ad<br /><span className="dim">In three steps</span></h2>
      <p className="section-lead lead">
        No panels. No surveys. A model trained on real fMRI brain data reads your
        creative the way a human brain does — in seconds.
      </p>
      <div className="center" style={{ marginBottom: 40 }}>
        <Link href="/dashboard" className="btn btn-dark">Run first scan</Link>
      </div>

      <div className="step">
        <span className="step-n">1</span>
        <h3>Upload Your Creative</h3>
        <p className="lead">Drop in any ad, video, or piece of content — a link or a file. That&apos;s the whole setup.</p>
        <div className="media upload">
          <div className="kicker">Your Creative<span className="sub">UPLOAD</span></div>
          <div className="dropzone"><span className="up">⤒</span></div>
          <div className="foot"><span>MP4 · MOV · LINK</span><span>MAX 5 MIN</span></div>
        </div>
      </div>

      <div className="step">
        <span className="step-n">2</span>
        <h3>We Scan It With fMRI</h3>
        <p className="lead">A model trained on real fMRI brain data reads it second by second, mapping attention, emotion, memory and intent as they fire.</p>
        <div className="media gradientlite" style={{ display: "block" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--muted)" }}>PER-SECOND</div>
          <div className="mono" style={{ fontWeight: 600, letterSpacing: "0.08em", marginBottom: 16 }}>ACTIVATION HEATMAP</div>
          <div className="heat">
            <HeatRow label="ATTENTION" vals={[0.8,0.6,0.7,0.55,0.5,0.45,0.4,0.35,0.3,0.28,0.25,0.2]} />
            <HeatRow label="EMOTION" vals={[0.5,0.55,0.45,0.6,0.7,0.75,0.6,0.55,0.5,0.45,0.4,0.5]} />
            <HeatRow label="REWARD" vals={[0.4,0.45,0.5,0.55,0.6,0.85,0.95,0.8,0.5,0.4,0.35,0.3]} />
          </div>
        </div>
      </div>

      <div className="step">
        <span className="step-n">3</span>
        <h3>Read The Response</h3>
        <p className="lead">Get the full neural readout — where attention holds, the exact second they decide to buy, what to cut — and optimize for the result you want.</p>
        <div className="media gradientlite" style={{ display: "block" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--muted)" }}>NEURAL READOUT</div>
          <div className="mono" style={{ fontWeight: 600, letterSpacing: "0.08em", marginBottom: 8 }}>ATTENTION OVER TIME</div>
          <AttentionCurve />
        </div>
      </div>
    </section>
  );
}

function NeuralCard({
  kick, title, children, note,
}: { kick: string; title: string; children: React.ReactNode; note: string }) {
  return (
    <div className="ncard">
      <div className="kick">{kick}<b>{title}</b></div>
      <div style={{ margin: "18px 0" }}>{children}</div>
      <div className="note">{note}</div>
    </div>
  );
}

function TotalDecode() {
  return (
    <section className="dark-section">
      <div className="container">
        <div className="eyebrow-wrap"><span className="eyebrow">Total decode</span></div>
        <h2>Your ad&apos;s complete <span className="dim">neural readout</span></h2>
        <p className="section-lead lead">
          Every second, decoded. We read 160+ neural signals to show exactly how
          the brain responds — and the moment it turns away.
        </p>
        <div className="grid grid-2">
          <NeuralCard kick="POSITIONING" title="EMOTIONAL REGISTER"
            note="Your ad reads emotional and calm — a warmth-led register, unlike the intense pushes most competitors run.">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8b9694" }} className="mono">
              <span>EMOTIONAL</span><span>INTENSE / CALM</span><span>RATIONAL</span>
            </div>
            <div style={{ height: 90, borderRadius: 8, marginTop: 8, background: "#2b3335", position: "relative" }}>
              <span style={{ position: "absolute", left: "34%", top: "30%", background: "#f0efe9", color: "#232a2c", fontSize: 10, padding: "3px 8px", borderRadius: 6 }} className="mono">YOU</span>
            </div>
          </NeuralCard>

          <NeuralCard kick="DYNAMICS" title="AROUSAL: CALM → PEAK"
            note="Arousal builds to an elevated read at the reveal, then eases — a clean tension-and-release shape.">
            <div className="mono" style={{ fontSize: 11, color: "#b7c0be", display: "grid", gap: 8 }}>
              {["PEAK", "ELEVATED", "ENGAGED", "SETTLED", "CALM"].map((s, i) => (
                <div key={s} style={{ opacity: i === 1 ? 1 : 0.55 }}>— {s}</div>
              ))}
            </div>
          </NeuralCard>

          <NeuralCard kick="PERCENTILE" title="ATTENTION DENSITY"
            note="Your ad is in the 82nd percentile for attention density among finance ads.">
            <div className="regvals"><span className="v">82%<span className="u"> · YOU</span></span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8b9694" }} className="mono">
              <span>LOW</span><span>MEDIUM</span><span>HIGH</span>
            </div>
          </NeuralCard>

          <NeuralCard kick="STRUCTURE" title="TIMELINE THIRDS"
            note="Attention held across the open, holds through the middle, and lands the close.">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
              {["88%", "64%", "71%"].map((v) => (
                <span key={v} style={{ fontSize: 28, fontWeight: 300 }}>{v}</span>
              ))}
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              {["OPEN", "MIDDLE", "CLOSE"].map((v) => (
                <span key={v} className="mono" style={{ fontSize: 10, color: "#8b9694" }}>{v}</span>
              ))}
            </div>
            <div className="mono" style={{ fontSize: 9, color: "#8b9694", marginTop: 8 }}>ATTENTION HELD · % OF PEAK</div>
          </NeuralCard>
        </div>
      </div>
    </section>
  );
}

function ApiSection() {
  return (
    <section className="container">
      <div className="eyebrow-wrap"><span className="eyebrow">The API</span></div>
      <h2>One POST, <span className="dim">every signal back</span></h2>
      <p className="section-lead lead">
        The same readout, straight from your pipeline. Send a video URL, poll the
        scan, read every signal per second.
      </p>

      <div className="codecard" style={{ marginBottom: 8 }}>
        <div className="kick">REQUEST<b>CREATE A SCAN</b></div>
        <div className="code">
          <div><span className="p">$</span> <span className="b">curl</span> /api/v1/scans \</div>
          <div>&nbsp;&nbsp;-d &apos;&#123;<span className="s">&quot;video_url&quot;</span>: <span className="s">&quot;ad.mp4&quot;</span>&#125;&apos;</div>
        </div>
      </div>

      <div className="step">
        <span className="step-n">1</span>
        <h3>Send your ad</h3>
        <p className="lead">POST a video URL or file with your API key. No SDK required, it is plain HTTPS.</p>
        <div className="codecard">
          <div className="kick">SCAN<b>POLL THE RUN</b></div>
          <div className="code">
            <div><span className="p">$</span> <span className="b">curl</span> /api/v1/scans/abc123</div>
            <div style={{ height: 8 }} />
            <div>&#123;<span className="s">&quot;status&quot;</span>: <span className="s">&quot;processing&quot;</span>&#125;</div>
          </div>
        </div>
      </div>

      <div className="step">
        <span className="step-n">2</span>
        <h3>The model scans it</h3>
        <p className="lead">A model trained on real fMRI brain data reads attention, emotion, memory and intent as they fire.</p>
        <div className="codecard">
          <div className="kick">RESPONSE<b>EVERY SIGNAL, PER SECOND</b></div>
          <div className="code">
            <div>&#123;<span className="s">&quot;score&quot;</span>: 71,</div>
            <div>&nbsp;<span className="s">&quot;attention&quot;</span>: [64, 66, …],</div>
            <div>&nbsp;<span className="s">&quot;buy_intent&quot;</span>: [22, 31, …],</div>
            <div>&nbsp;<span className="s">&quot;transcript&quot;</span>: […]&#125;</div>
          </div>
        </div>
      </div>

      <div className="step">
        <span className="step-n">3</span>
        <h3>Read every signal</h3>
        <p className="lead">The response carries the full per-second readout. Pipe it into your dashboard, your agent, or your ad rotation.</p>
      </div>
    </section>
  );
}

const PFEATURES = [
  ["50 scans a month", "Score 50 ads or pieces of content a month against real human brain responses."],
  ["The complete neural readout", "Per-second activation, predicted attention, and buy-moment timelines for every scan."],
  ["API access included", "Your key works from the dashboard, your terminal, or your coding agent."],
  ["Compare cuts before you spend", "Scan variations of the same ad and see which one the brain responds to."],
  ["Direct founder access", "Founding members get onboarding and answers straight from the team."],
];

const PTRUST = [
  ["◱", "Cancel anytime. No lock-in."],
  ["🔒", "Secure Payment Processing"],
  ["◈", "Your Data Is Private & Safe"],
];

function Pricing() {
  return (
    <section className="container">
      <div className="eyebrow-wrap"><span className="eyebrow">Pricing</span></div>
      <h2>The world&apos;s first <span className="dim">brain fMRI,</span><br />for $29</h2>
      <p className="section-lead lead">
        A real fMRI ad study runs five figures. You get the readout for $29 a
        month, API key included.
      </p>

      <div className="price-hero">
        <div className="fm">Neuralytics<b>Founding Member</b></div>
        <div className="amt">$29<span className="per">/month</span></div>
        <div className="fine">No hidden fees. Cancel anytime.</div>
      </div>
      <div className="center" style={{ margin: "22px 0 8px" }}>
        <Link href="/dashboard" className="btn btn-dark" style={{ width: "100%", maxWidth: 640 }}>Get access</Link>
      </div>

      <div>
        {PFEATURES.map(([h, p]) => (
          <div className="pfeat" key={h}>
            <span className="ck">✓</span>
            <div><h4>{h}</h4><p>{p}</p></div>
          </div>
        ))}
        {PTRUST.map(([ic, t]) => (
          <div className="ptrust" key={t}><span className="ic">{ic}</span>{t}</div>
        ))}
      </div>
    </section>
  );
}

function QuickInstall() {
  return (
    <section className="container">
      <div className="eyebrow-wrap"><span className="eyebrow">Quick install</span></div>
      <h2>Add Neuralytics to <span className="dim">your coding agent</span></h2>
      <p className="section-lead lead">Connect Neuralytics to any MCP-capable agent in one command.</p>

      <div className="codecard" style={{ marginBottom: 8 }}>
        <div className="kick">TERMINAL<b>INSTALL</b></div>
        <div className="copybar" style={{ marginTop: 16 }}>
          <span><span className="p" style={{ color: "#8b9694" }}>$</span> npx -y @neuralytics/mcp</span>
          <button className="cp">COPY</button>
        </div>
        <p className="mono" style={{ fontSize: 12, color: "var(--faint)", marginTop: 12 }}>No key needed to try the demo.</p>
      </div>

      <div className="step">
        <h3>One command</h3>
        <p className="lead">Run it once — your agent gets scan, score, and readout tools, plus a keyless demo to try first.</p>
        <div className="agentcard">
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--faint)" }}>AGENTS</div>
          <div className="mono" style={{ fontWeight: 600, letterSpacing: "0.08em", marginBottom: 12 }}>WORKS WITH</div>
          <div className="agents">
            {[["◣","CLAUDE CODE"],["✳","CODEX"],["◆","CURSOR"],["ᗐ","WINDSURF"]].map(([g, n]) => (
              <div className="a" key={n}><div className="g">{g}</div><div className="n">{n}</div></div>
            ))}
          </div>
          <div className="agentnote">One MCP server. Every agent gets scan, score, and readout tools.</div>
        </div>
      </div>

      <div className="step">
        <h3>Works where you work</h3>
        <p className="lead">Claude Code, Codex, Cursor, Windsurf. Anything that speaks MCP.</p>
        <div className="codecard">
          <div className="kick">ACCESS<b>YOUR API KEY</b></div>
          <div className="copybar light" style={{ marginTop: 16 }}>
            <span>NEURALYTICS_API_KEY=sk_live_••••••••</span>
          </div>
        </div>
      </div>

      <div className="step">
        <h3>Your key ships with the plan</h3>
        <p className="lead">Create an account, join as a Founding Member, and your API key is waiting in the dashboard.</p>
      </div>

      <div className="center" style={{ marginTop: 20 }}>
        <div className="eyebrow-wrap"><span className="eyebrow">One-command install</span></div>
        <div className="copybar light" style={{ maxWidth: 640, margin: "0 auto" }}>
          <span>$ npx -y @neuralytics/mcp</span>
          <button className="cp">COPY</button>
        </div>
        <p className="lead" style={{ margin: "16px 0 22px" }}>No account needed to try it — add a key to scan your own.</p>
        <Link href="/dashboard" className="btn btn-outline">Read the API docs →</Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="container">
      <div className="foot-brand-top">NEURALYTICS/</div>
      <a className="foot-mail" href="mailto:support@neuralytics.ai">support@neuralytics.ai</a>
      <div className="foot-brand-top">DISCLAIMER /</div>
      <p className="foot-discl">
        All brain data comes from de-identified, non-identifiable research
        subjects. Readouts are directional, and results may vary.
      </p>
      <div className="foot-grid">
        <div className="foot-col">
          <div className="h">Company /</div>
          <a href="#">Research</a>
          <a href="#">Careers</a>
        </div>
        <div className="foot-col">
          <div className="h">Others /</div>
          <a href="#">Intel</a>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
        <div className="foot-col">
          <div className="h">Connect /</div>
          <a href="#">LinkedIn</a>
          <a href="#">Instagram</a>
        </div>
      </div>
      <div className="wordmark">NEURALYTICS</div>
    </footer>
  );
}

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Deliverable />
      <HowItWorks />
      <TotalDecode />
      <ApiSection />
      <Pricing />
      <QuickInstall />
      <Footer />
    </main>
  );
}
