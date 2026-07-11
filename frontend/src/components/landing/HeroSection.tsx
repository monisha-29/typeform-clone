"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function HeroSection() {
  return (
    <section style={{ 
      position: "relative", 
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      paddingTop: 80,
      paddingLeft: 40,
      paddingRight: 40,
      overflow: "hidden",
      background: "linear-gradient(135deg, #0e0014 0%, #1a0028 30%, #2d0045 55%, #1a0a35 80%, #0a0018 100%)",
    }}>
      {/* Radial purple glows */}
      <div style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: "70vw", height: "70vw",
        background: "radial-gradient(ellipse, rgba(162, 95, 186, 0.25) 0%, transparent 65%)",
        zIndex: 0, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-5%",
        width: "40vw", height: "40vw",
        background: "radial-gradient(ellipse, rgba(100, 40, 160, 0.3) 0%, transparent 70%)",
        zIndex: 0, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "30%", left: "-5%",
        width: "30vw", height: "30vw",
        background: "radial-gradient(ellipse, rgba(180, 100, 220, 0.12) 0%, transparent 70%)",
        zIndex: 0, pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "80px 0 100px" }}>

        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(162, 95, 186, 0.15)",
            border: "1px solid rgba(162, 95, 186, 0.3)",
            borderRadius: 1000, padding: "6px 16px", marginBottom: 32,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a25fba" }} />
          <span style={{ fontSize: "0.875rem", color: "rgba(220, 180, 240, 0.9)", fontFamily: "'Twklausanne 500', Arial, sans-serif", letterSpacing: "0.02em" }}>
            The most beautiful forms on the internet
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            fontFamily: "Tobias, 'Times New Roman', serif", 
            fontSize: "clamp(3.5rem, 8vw, 5.5rem)", 
            lineHeight: "1em", letterSpacing: "-2px", 
            maxWidth: 900, color: "#ffffff", marginBottom: 0,
          }}
        >
          Make forms{" "}
          <span style={{ color: "#c98de8", fontStyle: "italic" }}>worth filling out.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            fontSize: "1.25rem", lineHeight: "1.5em",
            color: "rgba(220, 200, 235, 0.75)", maxWidth: 620, marginTop: 28,
            fontFamily: "'Twklausanne 400', Arial, sans-serif",
          }}
        >
          Get more data—like signups, feedback, and anything else—with forms designed to be{" "}
          <strong style={{ color: "rgba(220, 200, 235, 1)", fontFamily: "'Twklausanne 500', Arial, sans-serif", fontWeight: 500 }}>
            refreshingly different.
          </strong>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 48 }}
        >
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center",
            background: "#ffffff", color: "#2a222b",
            borderRadius: 1000, padding: "16px 36px",
            fontSize: "1.0625rem", fontWeight: 600,
            fontFamily: "'Twklausanne 600', Arial, sans-serif",
            textDecoration: "none",
            transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}>
            Get started — it&apos;s free
          </Link>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center",
            background: "transparent", color: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 1000, padding: "16px 28px",
            fontSize: "1.0625rem", fontWeight: 500,
            fontFamily: "'Twklausanne 500', Arial, sans-serif",
            textDecoration: "none",
            transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}>
            Log in
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ marginTop: 20, fontSize: "0.875rem", color: "rgba(200, 170, 220, 0.6)", fontFamily: "'Twklausanne 400', Arial, sans-serif" }}
        >
          No credit card required · No time limit on Free plan
        </motion.div>

        {/* Floating glassmorphism form UI mockups */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute", bottom: 40, left: "5%",
            background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: 24, borderRadius: 20, width: 320, zIndex: 2,
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          }}
          className="desktop-floating"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #a25fba, #7b3fa0)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.875rem" }}>1→</div>
            <div style={{ fontWeight: 500, fontSize: "1rem", color: "white", fontFamily: "'Twklausanne 500', Arial, sans-serif" }}>What&apos;s your name?</div>
          </div>
          <div style={{ width: "100%", padding: "10px 0", borderBottom: "2px solid rgba(162,95,186,0.6)", fontSize: "1.125rem", color: "rgba(255,255,255,0.3)", fontFamily: "'Twklausanne 400', Arial, sans-serif" }}>
            Type your answer...
          </div>
          <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, background: "#a25fba", color: "white", borderRadius: 1000, padding: "8px 20px", fontSize: "0.875rem", fontFamily: "'Twklausanne 500', Arial, sans-serif" }}>
            OK <span style={{ opacity: 0.7, fontSize: "0.75rem" }}>↵</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, rotate: 3 }}
          animate={{ opacity: 1, y: 0, rotate: 2 }}
          transition={{ duration: 1.4, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute", bottom: 80, right: "5%",
            background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: 28, borderRadius: 20, width: 300, zIndex: 2,
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          }}
          className="desktop-floating"
        >
          <div style={{ fontWeight: 500, fontSize: "1rem", marginBottom: 20, color: "white", fontFamily: "'Twklausanne 500', Arial, sans-serif" }}>Rate your experience</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{
                width: 40, height: 40, borderRadius: 10,
                border: n <= 3 ? "1px solid #a25fba" : "1px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: n <= 3 ? "#c98de8" : "rgba(255,255,255,0.2)",
                fontSize: "1.125rem",
                background: n <= 3 ? "rgba(162,95,186,0.15)" : "transparent"
              }}>★</div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
