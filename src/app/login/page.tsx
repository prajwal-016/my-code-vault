"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SecretKnockLogin() {
  const router = useRouter();
  const [taps, setTaps] = useState<number[][]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  // Secret sequence requirements:
  // [0,0] Top-Left, [1,1] Center, [0,2] Top-Right, [2,0] Bottom-Left
  const SECRET_COMBINATION = "0,0|1,1|0,2|2,0";

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // FIX MOBILE DUPLICATE CLICK BUG: Prevent the ghost mouse click event from triggering on mobile devices
    if (e.type === "touchstart" && e.cancelable) {
      e.preventDefault();
    }

    if (!boxRef.current) return;

    const rect = boxRef.current.getBoundingClientRect();

    let clientX: number, clientY: number;

    // Pull coordinates safely based on interaction channel
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return; // No valid tracking coordinates found
    }

    // Relative coordinates
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Map into 3x3 grid (0, 1, 2)
    const col = Math.floor((x / rect.width) * 3);
    const row = Math.floor((y / rect.height) * 3);

    // Bounds check to ensure 0-2 range even if clicking exactly on the border
    const safeCol = Math.max(0, Math.min(2, col));
    const safeRow = Math.max(0, Math.min(2, row));

    const newTaps = [...taps, [safeRow, safeCol]];

    if (newTaps.length === 4) {
      const tapString = newTaps.map((t) => `${t[0]},${t[1]}`).join("|");

      if (tapString === SECRET_COMBINATION) {
        // Vault access granted!
        // REMOVED 'max-age' so it safely clears the second you slide your browser app closed.
        document.cookie = "vault_access_granted=true; path=/; SameSite=Strict";
        router.push("/");
      } else {
        // Silently reset without alerting the intruder what went wrong
        setTaps([]);
      }
    } else {
      setTaps(newTaps);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 select-none">
      <div className="text-center mb-4">
        <span className="text-xs font-mono text-gray-700 tracking-widest uppercase">
          System Entry Required
        </span>
      </div>

      <div
        ref={boxRef}
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
        className="aspect-square w-full max-w-[450px] bg-gray-900 border border-gray-800 rounded-2xl relative overflow-hidden cursor-crosshair shadow-2xl transition-transform active:scale-[0.99]"
        style={{
          // Beautiful geometric design mapping out your exact grid columns subtly
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "33.333% 33.333%",
        }}
      >
        {/* Decorative graphic element to make it look like a static hardware utility screen */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <svg
            className="w-16 h-16 text-gray-600 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.75"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
