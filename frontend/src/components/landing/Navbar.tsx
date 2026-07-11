"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Products", hasDropdown: true },
  { label: "Templates", hasDropdown: true },
  { label: "Integrations", hasDropdown: false },
  { label: "Resources", hasDropdown: true },
  { label: "Pricing", hasDropdown: false },
  { label: "Enterprise", hasDropdown: false },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: 72, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px",
          background: scrolled ? "rgba(14, 0, 20, 0.94)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
          transition: "background 0.3s ease, border-bottom 0.3s ease",
        }}
      >
        {/* Left: Logo + Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Image
              src="/typeform-logo.svg"
              alt="Typeform"
              width={148}
              height={36}
              priority
              style={{ display: "block" }}
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  cursor: "pointer",
                  fontFamily: "'Twklausanne 400', Arial, sans-serif",
                  fontWeight: 400, fontSize: "0.9375rem",
                  color: "rgba(255,255,255,0.8)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.color = "white")}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.color = "rgba(255,255,255,0.8)")}
              >
                {link.label}
                {link.hasDropdown && (
                  <ChevronDown size={13} color="rgba(255,255,255,0.45)" style={{ marginTop: 1 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: CTA Buttons */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/dashboard"
            style={{
              padding: "9px 18px", borderRadius: 1000,
              border: "1px solid rgba(255,255,255,0.25)",
              color: "rgba(255,255,255,0.9)", background: "transparent",
              textDecoration: "none", fontSize: "0.9375rem",
              fontFamily: "'Twklausanne 500', Arial, sans-serif",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.6)")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)")}
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            style={{
              padding: "9px 22px", borderRadius: 1000,
              background: "white", color: "#2a222b",
              textDecoration: "none", fontSize: "0.9375rem",
              fontFamily: "'Twklausanne 600', Arial, sans-serif",
              fontWeight: 600,
              boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)")}
          >
            Sign up free
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-nav-toggle"
          style={{ display: "none", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen
            ? <X size={26} color="white" />
            : <Menu size={26} color="white" />
          }
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed", inset: 0, top: 72,
          background: "#0e0014", zIndex: 90,
          padding: 32, display: "flex", flexDirection: "column", gap: 24,
        }}>
          {NAV_LINKS.map((link) => (
            <div key={link.label} style={{
              fontSize: 22, fontWeight: 500, color: "white",
              fontFamily: "'Twklausanne 500', Arial, sans-serif",
            }}>
              {link.label}
            </div>
          ))}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/dashboard" style={{
              textAlign: "center", padding: "14px",
              border: "1px solid rgba(255,255,255,0.25)", borderRadius: 1000,
              color: "white", textDecoration: "none",
              fontFamily: "'Twklausanne 500', Arial, sans-serif",
            }}>Log in</Link>
            <Link href="/dashboard" style={{
              textAlign: "center", padding: "14px",
              background: "white", borderRadius: 1000,
              color: "#2a222b", textDecoration: "none",
              fontFamily: "'Twklausanne 600', Arial, sans-serif", fontWeight: 600,
            }}>Sign up free</Link>
          </div>
        </div>
      )}
    </>
  );
}
