import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Privacy Policy — Neuralytics" };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="JULY 9, 2026">
      <p>
        Neuralytics (&quot;we&quot;, &quot;us&quot;) provides model-scored neural readouts of
        ads and video content. This policy explains what we collect, why, and
        the choices you have. It applies to the website, dashboard, and API.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details</strong> — name, email, and sign-in identifiers
          from Google or Apple when you use those options.
        </li>
        <li>
          <strong>Content you scan</strong> — the videos, ads, and URLs you
          submit, plus the readouts our model produces from them.
        </li>
        <li>
          <strong>Usage &amp; device data</strong> — pages visited, scan counts,
          API calls, browser and IP information, used for quotas, security, and
          product improvement.
        </li>
        <li>
          <strong>Billing details</strong> — handled by our payment processor;
          we never store full card numbers.
        </li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t sell your personal information.</li>
        <li>We don&apos;t use your scanned creative to train models for other customers without your consent.</li>
        <li>
          All brain data behind our model comes from de-identified,
          non-identifiable research subjects.
        </li>
      </ul>

      <h2>How we use information</h2>
      <p>
        To run scans and return readouts, operate quotas and API keys, process
        subscriptions, secure the service, respond to support requests, and —
        with your consent — send product updates.
      </p>

      <h2>Sharing</h2>
      <p>
        We share data only with service providers who run our infrastructure
        (hosting, payments, analytics) under contract, or when the law requires
        it. If Neuralytics is acquired, data transfers as part of that
        transaction with this policy still applying.
      </p>

      <h2>Retention &amp; deletion</h2>
      <p>
        Scans and readouts stay in your account until you delete them. You can
        delete your account at any time from the dashboard or by emailing us;
        we remove personal data within 30 days, except records we must keep for
        legal or billing reasons.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (GDPR, CCPA, and similar), you may have the
        right to access, correct, export, or delete your personal data, and to
        object to certain processing. Email{" "}
        <a href="mailto:support@neuralytics.ai">support@neuralytics.ai</a> and
        we&apos;ll act on the request.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy:{" "}
        <a href="mailto:support@neuralytics.ai">support@neuralytics.ai</a>.
      </p>
    </LegalPage>
  );
}
