import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppButton() {
    // REEMPLAZAR AQUÍ CON TU NÚMERO REAL
    // Formato: código de país + número (sin el + ni espacios)
    // Ejemplo: 34600123456
    const phoneNumber = "34610037534";
    const message = "Hola, me gustaría más información.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center group"
            aria-label="Contactar por WhatsApp"
        >
            <FaWhatsapp size={32} />
            <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                ¡Hablemos!
                <span className="absolute top-1/2 -right-1 -mt-1 border-4 border-transparent border-l-white"></span>
            </span>
        </a>
    );
}
