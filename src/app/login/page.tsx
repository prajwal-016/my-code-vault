'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SecretKnockLogin() {
  const router = useRouter();
  const [taps, setTaps] = useState<number[][]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  // Secret sequence requirements: 
  // [0,0] Top-Left, [1,1] Center, [0,2] Top-Right, [2,0] Bottom-Left
  const SECRET_COMBINATION = '0,0|1,1|0,2|2,0';

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default touch behaviors like scrolling
    if (e.type === 'touchstart') {
      // Passive listeners in React might complain about preventDefault, 
      // but in this container it usually works fine to prevent zooming/scrolling
    }
    
    if (!boxRef.current) return;
    
    const rect = boxRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
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
      const tapString = newTaps.map(t => `${t[0]},${t[1]}`).join('|');
      
      // if (tapString === SECRET_COMBINATION) {
      //   // Vault access granted
      //   document.cookie = "vault_access_granted=true; path=/; max-age=86400; SameSite=Strict";
      //   router.push('/');
      // } else {
        // Silently reset without alerting the intruder
      setTaps([]);
      // }
    } else {
      setTaps(newTaps);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 select-none">
      <div 
        ref={boxRef}
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
        className="aspect-square w-full max-w-[450px] bg-gray-900 border border-gray-800 rounded-2xl relative overflow-hidden cursor-crosshair shadow-2xl transition-transform active:scale-[0.99]"
        style={{
          // Subtle grid pattern to guide the user but look like a placeholder
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '33.333% 33.333%'
        }}
      >
        {/* Decorative graphic element to make it look like a static screen */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <svg className="w-24 h-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
