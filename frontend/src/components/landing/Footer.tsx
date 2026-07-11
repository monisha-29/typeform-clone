"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: ["Templates", "Integrations", "Pricing", "Features", "Enterprise", "Typeform for Growth"]
  },
  {
    title: "Use cases",
    links: ["Surveys", "Lead generation", "Quizzes", "Feedback", "Event registration", "Polls"]
  },
  {
    title: "Resources",
    links: ["Help center", "Blog", "Community", "Partners", "Developer portal", "Status"]
  },
  {
    title: "Company",
    links: ["About", "Careers", "Contact", "Terms of Service", "Privacy Policy", "Sitemap"]
  }
];

export function Footer() {
  return (
    <footer style={{ background: "var(--tf-neutral-1000)", color: "var(--text-invert)", padding: "var(--spacer-500) 40px var(--spacer-300)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: "var(--spacer-500)" }}>
        {FOOTER_LINKS.map((col) => (
          <div key={col.title}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "var(--spacer-150)", fontFamily: "var(--font-sans)", letterSpacing: "0px" }}>{col.title}</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {col.links.map((link) => (
                <li key={link}>
                  <Link href="#" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "1rem", fontFamily: "var(--font-sans)" }} className="footer-link">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div style={{ maxWidth: 1200, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "var(--spacer-200)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              background: "var(--text-invert)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "var(--tf-neutral-1000)", fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-sans)" }}>T</span>
          </div>
          <span style={{ fontWeight: 500, fontSize: "1.125rem", letterSpacing: "-0.01em", fontFamily: "var(--font-sans)" }}>Typeform</span>
        </div>
        <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)" }}>
          © {new Date().getFullYear()} Typeform Clone (Assignment). All rights reserved.
        </div>
      </div>
    </footer>
  );
}
