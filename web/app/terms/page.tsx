import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Terms of Service — Neuralytics" };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" updated="JULY 9, 2026">
      <p>
        These terms govern your use of Neuralytics — the website, dashboard,
        and API. By creating an account or running a scan, you agree to them.
      </p>

      <h2>The service</h2>
      <p>
        Neuralytics returns model-scored, per-second readouts (attention,
        emotion, memory, intent, and related signals) for ads and video content
        you submit. Readouts are <strong>directional predictions, not
        guarantees</strong> — they estimate how audiences may respond and
        results may vary.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must provide accurate information and keep your credentials secure.</li>
        <li>Your API key is yours alone — you&apos;re responsible for activity under it.</li>
        <li>One account per person or organization unless we agree otherwise.</li>
      </ul>

      <h2>Subscriptions &amp; billing</h2>
      <ul>
        <li>The Founding Member plan is $29/month and includes 50 scans per month and API access.</li>
        <li>Unused scans don&apos;t roll over. Quotas reset each billing cycle.</li>
        <li>Cancel anytime — access continues to the end of the paid period. No hidden fees.</li>
      </ul>

      <h2>Acceptable use</h2>
      <ul>
        <li>Only scan content you own or have the right to analyze.</li>
        <li>No attempts to reverse-engineer the model, probe the service&apos;s security, or resell readouts as a competing API.</li>
        <li>No unlawful, deceptive, or harmful use of readouts, including manipulative targeting of vulnerable groups.</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        You keep all rights to the creative you upload. You own the readouts we
        generate for you. We keep all rights to the service, the model, and the
        scoring methodology.
      </p>

      <h2>Disclaimers &amp; liability</h2>
      <p>
        The service is provided &quot;as is&quot;. To the fullest extent the law
        allows, Neuralytics is not liable for indirect or consequential damages,
        and our total liability is capped at the amount you paid us in the 12
        months before the claim.
      </p>

      <h2>Changes &amp; termination</h2>
      <p>
        We may update these terms; material changes will be announced by email
        or in the dashboard before they take effect. We may suspend accounts
        that violate these terms. You may close your account at any time.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href="mailto:support@neuralytics.ai">support@neuralytics.ai</a>.
      </p>
    </LegalPage>
  );
}
