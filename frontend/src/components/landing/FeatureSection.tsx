"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FEATURES = [
  {
    eyebrow: "Profile & Personalization",
    title: "Forms that feel personal from the very first question.",
    description:
      "Collect profile info, verify emails, and let respondents feel seen — not processed. Our conversational UI guides them step by step with zero friction.",
    linkText: "See how it works",
    image: "/feature-profile.png",
    imageAlt: "Complete Profile UI Design",
    reverse: false,
  },
  {
    eyebrow: "Onboarding & Notifications",
    title: "Turn form submissions into automated workflows.",
    description:
      "Trigger onboarding sequences, notification preferences, and settings — all from a single typeform. Connect to Zapier, Slack, or your own backend in minutes.",
    linkText: "Explore integrations",
    image: "/feature-onboarding.png",
    imageAlt: "Onboarding Notifications Settings UI",
    reverse: true,
  },
  {
    eyebrow: "Multi-Step Wizards",
    title: "Complex flows made simple with one question at a time.",
    description:
      "Replace multi-page forms and confusing wizards with a single fluid experience. Guide users through every step with progress indicators, conditional logic, and smart defaults.",
    linkText: "Build your first form",
    image: "/feature-wizard.png",
    imageAlt: "Multi-Step Form Wizard UI",
    reverse: false,
  },
];

export function FeatureSection() {
  return (
    <section style={{
      background: "linear-gradient(180deg, #0e0014 0%, #130020 40%, #1a0030 70%, #0e0014 100%)",
      padding: "80px 0 120px",
      overflow: "hidden",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.eyebrow}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex",
              flexDirection: feature.reverse ? "row-reverse" : "row",
              alignItems: "center",
              gap: "6vw",
              padding: "72px 0",
              borderBottom: i < FEATURES.length - 1
                ? "1px solid rgba(255,255,255,0.06)"
                : "none",
            }}
          >
            {/* Text */}
            <div style={{ flex: "1 1 420px", minWidth: 0 }}>
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, x: feature.reverse ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(162, 95, 186, 0.12)",
                  border: "1px solid rgba(162, 95, 186, 0.25)",
                  borderRadius: 1000, padding: "4px 14px",
                  marginBottom: 24,
                }}
              >
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#a25fba" }} />
                <span style={{
                  fontSize: "0.8125rem", color: "rgba(201, 141, 232, 0.9)",
                  fontFamily: "'Twklausanne 600', Arial, sans-serif",
                  fontWeight: 600, letterSpacing: "0.03em",
                }}>
                  {feature.eyebrow}
                </span>
              </motion.div>

              <h2 style={{
                fontFamily: "Tobias, 'Times New Roman', serif",
                fontSize: "clamp(2rem, 3.5vw, 2.875rem)",
                lineHeight: "1.1em",
                letterSpacing: "-1px",
                color: "#ffffff",
                marginBottom: 20,
              }}>
                {feature.title}
              </h2>

              <p style={{
                fontSize: "1.0625rem",
                color: "rgba(220, 200, 235, 0.65)",
                lineHeight: "1.65em",
                fontFamily: "'Twklausanne 400', Arial, sans-serif",
                marginBottom: 32,
                maxWidth: 480,
              }}>
                {feature.description}
              </p>

              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  color: "#c98de8", textDecoration: "none",
                  fontSize: "1rem", fontFamily: "'Twklausanne 500', Arial, sans-serif",
                  fontWeight: 500, transition: "gap 0.2s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.gap = "12px";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.gap = "8px";
                }}
              >
                {feature.linkText} <ArrowRight size={16} />
              </Link>
            </div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: "1 1 460px", minWidth: 0, position: "relative" }}
            >
              {/* Glow behind image */}
              <div style={{
                position: "absolute",
                inset: "-20px",
                background: "radial-gradient(ellipse, rgba(162,95,186,0.18) 0%, transparent 70%)",
                zIndex: 0,
                borderRadius: 24,
                pointerEvents: "none",
              }} />

              <div style={{
                position: "relative", zIndex: 1,
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)",
                transform: feature.reverse ? "rotate(1.5deg)" : "rotate(-1.5deg)",
                transition: "transform 0.4s ease",
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = "rotate(0deg) scale(1.02)")}
                onMouseLeave={e => (e.currentTarget.style.transform = feature.reverse ? "rotate(1.5deg)" : "rotate(-1.5deg)")}
              >
                <Image
                  src={feature.image}
                  alt={feature.imageAlt}
                  width={600}
                  height={420}
                  style={{
                    width: "100%", height: "auto",
                    display: "block",
                  }}
                />
                {/* Subtle glass overlay at bottom */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
                  background: "linear-gradient(to top, rgba(14,0,20,0.4) 0%, transparent 100%)",
                }} />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
