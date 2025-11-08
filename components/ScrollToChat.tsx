'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function ScrollToChat() {
  const scrollToChatSection = () => {
    const chatSection = document.getElementById('chat-section');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-2 animate-bounce-slow cursor-pointer"
         onClick={scrollToChatSection}>
      <p className="text-lg font-semibold text-purple-700 hover:text-purple-900 transition-colors duration-300 hover:scale-105">
        ¡Chatear con la Astróloga ahora!
      </p>
      <ChevronDown size={24} className="text-purple-700 mt-1" />
    </div>
  );
}
