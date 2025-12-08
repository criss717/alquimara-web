'use client';

import React, { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';

/**
 * ScrollToChat: botón/CTA que desplaza a la sección de chat.
 *
 * - Añade una animación GSAP solamente al párrafo CTA.
 * - Mantiene el scroll suave al hacer clic en el contenedor.
 *
 * @returns {React.ReactElement}
 */
export default function ScrollToChat(): React.ReactElement {
  const ctaRef = useRef<HTMLParagraphElement | null>(null);

  const scrollToChatSection = () => {
    const chatSection = document.getElementById('chat-section');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' });
      // Dar tiempo al scroll suave y luego enfocar el input del chat
      try {
        setTimeout(() => {
          const input = document.getElementById('chat-input') as HTMLInputElement | null;
          if (input) {
            input.focus();
          }
        }, 350);
      } catch (e) {
        // ignore
        console.error('Error focusing chat input:', e);
      }
    }
  };

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;

    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } });
    tl.fromTo(
      el,
      { scale: 1, filter: 'none', color: 'rgb(99 102 241)' },
      { duration: 1.2, scale: 1.06, filter: 'drop-shadow(0 0 14px rgba(99,102,241,0.9))', color: 'rgb(124 58 237)' }
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-2 animate-bounce-slow cursor-pointer" onClick={scrollToChatSection}>
      <p ref={ctaRef} className="text-lg font-semibold text-purple-700 hover:text-purple-900 transition-colors duration-800 hover:scale-105">
        ¡Chatear con la Astróloga ahora!
      </p>
      <ChevronDown size={24} className="text-purple-700 mt-1" />
    </div>
  );
}
