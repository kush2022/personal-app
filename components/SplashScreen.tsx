"use client";

import { useEffect, useState } from "react";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"visible" | "fading">("visible");

  useEffect(() => {
    // Start fading after 2.2s, call onDone after fade completes (0.7s)
    const fadeTimer = setTimeout(() => setPhase("fading"), 2200);
    const doneTimer = setTimeout(() => onDone(), 2900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020617] overflow-hidden"
      style={{
        opacity: phase === "fading" ? 0 : 1,
        transition: "opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: phase === "fading" ? "none" : "all",
      }}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] rounded-full bg-indigo-600/25 blur-[120px]"
          style={{ animation: "blob1 8s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] rounded-full bg-fuchsia-600/25 blur-[130px]"
          style={{ animation: "blob2 10s ease-in-out infinite" }}
        />
        <div
          className="absolute top-[30%] right-[5%] w-[300px] h-[300px] rounded-full bg-cyan-500/15 blur-[100px]"
          style={{ animation: "blob3 12s ease-in-out infinite" }}
        />
      </div>

      {/* Glassmorphic card */}
      <div
        className="relative z-10 flex flex-col items-center px-12 py-10 rounded-3xl bg-white/[0.04] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
        style={{
          animation:
            "splashCard 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        {/* Logo */}
        <div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(99,102,241,0.4)] mb-6"
          style={{ animation: "logoFloat 3s ease-in-out infinite" }}
        >
          🌿
        </div>

        {/* App name */}
        <h1
          className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-300 via-white to-purple-300 bg-clip-text text-transparent"
          style={{ animation: "fadeSlideUp 0.5s 0.3s both" }}
        >
          LifeOS
        </h1>

        {/* Tagline */}
        <p
          className="mt-2 text-sm text-slate-400 tracking-wide"
          style={{ animation: "fadeSlideUp 0.5s 0.5s both" }}
        >
          Your personal productivity companion
        </p>

        {/* Animated loading dots */}
        <div
          className="flex items-center gap-1.5 mt-8"
          style={{ animation: "fadeSlideUp 0.5s 0.7s both" }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400"
              style={{
                animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                display: "inline-block",
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom credit */}
      <p
        className="absolute bottom-8 text-[11px] text-slate-600 tracking-widest uppercase"
        style={{ animation: "fadeSlideUp 0.5s 0.9s both" }}
      >
        Made with ❤️
      </p>

      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(60px, -40px) scale(1.1); }
          66%  { transform: translate(-30px, 20px) scale(0.95); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(-50px, 30px) scale(1.05); }
          66%  { transform: translate(40px, -20px) scale(1.1); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-20px, -30px) scale(1.15); }
        }
        @keyframes splashCard {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 60%, 100% { opacity: 0.2; transform: scale(0.8); }
          30%            { opacity: 1;   transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
