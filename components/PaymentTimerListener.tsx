"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { showPaymentTimerToast, closePaymentTimerToast } from "@/components/ui/toastSweetAlert";

export default function PaymentTimerListener() {
    const pathname = usePathname();
    useEffect(() => {
        const checkPending = async () => {
            try {
                // Consultamos solo si hay pendiente y fecha de expiración
                // Usamos el endpoint existente
                const res = await fetch('/api/orders/retake?check=true');
                const json = await res.json();

                if (json.pending && json.expires_at) {
                    const expiresAt = new Date(json.expires_at).getTime();
                    // El componente toastSweetAlert se encarga de no duplicar si ya está visible o manejar su singleton
                    showPaymentTimerToast(expiresAt, pathname);
                } else {
                    // Si no hay pendiente, aseguramos que se cierre por si acaso (ej: usuario pagó en otra tab)
                    closePaymentTimerToast();
                }
            } catch (e) {
                console.error('Error checking global pending order:', e);
            }
        };

        // Chequear al montar
        checkPending();

        // Chequear al volver a la pestaña
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkPending();
            }
        };

        // Opcional: Podríamos chequear cada X tiempo globalmente, 
        // pero con visibilityChange y updates al navegar suele ser suficiente para un MVP
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [pathname]); // Dependencia pathname para re-verificar al navegar

    // Este componente no renderiza nada visual en el DOM, solo maneja el efecto
    return null;
}
