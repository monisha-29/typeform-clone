"use client";

const LOGOS = [
  "Mailchimp",
  "HubSpot",
  "Zapier",
  "Airtable",
  "Notion",
  "Slack",
  "Calendly",
  "Stripe",
  "Figma",
  "Shopify"
];

export function LogosSection() {
  return (
    <section style={{ padding: "var(--spacer-400) 0", background: "linear-gradient(180deg, #0e0014 0%, #130020 100%)", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ 
        textAlign: "center", 
        fontSize: "0.8125rem", 
        fontWeight: 600, 
        color: "rgba(162,95,186,0.7)", 
        marginBottom: "var(--spacer-200)", 
        letterSpacing: "0.06em", 
        textTransform: "uppercase",
        fontFamily: "'Twklausanne 600', Arial, sans-serif"
      }}>
        Trusted by teams worldwide
      </div>
      
      <div className="marquee-container" style={{ position: "relative", width: "100%", overflow: "hidden", display: "flex" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 150, background: "linear-gradient(to right, #0e0014, transparent)", zIndex: 10 }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 150, background: "linear-gradient(to left, #0e0014, transparent)", zIndex: 10 }} />
        
        <div className="marquee-content" style={{ display: "flex", gap: 80, padding: "0 40px", animation: "marquee 40s linear infinite" }}>
          {/* Double array for seamless loop */}
          {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
            <div key={i} style={{ 
              fontSize: "1.75rem", 
              fontWeight: 700, 
              color: "rgba(255,255,255,0.25)",
              opacity: 0.25,
              whiteSpace: "nowrap",
              fontFamily: "var(--font-sans)",
              letterSpacing: "-0.02em"
            }}>
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
