import swal from 'sweetalert2';

/**
 * Muestra un toast persistente con cuenta regresiva para el pago
 * @param expiresAtTime Timestamp (ms) de cuándo expira la orden
 */
export const showPaymentTimerToast = (expiresAtTime: number, pathname: string) => {
    // Si ya pasó el tiempo, no mostrar nada
    if (expiresAtTime <= Date.now()) return;

    let timerInterval: NodeJS.Timeout;

    swal.fire({
        title: '¡Tienes un pago pendiente!',
        html: 'Tu reserva expira en: <b></b>',
        timer: expiresAtTime - Date.now(),
        timerProgressBar: true,
        toast: true,
        position: 'bottom-start',
        showConfirmButton: pathname === '/carrito' ? false : true,
        confirmButtonText: 'Gestionar',
        confirmButtonColor: '#8b5cf6', // Violeta
        showCloseButton: true,
        didOpen: () => {
            const b = swal.getHtmlContainer()?.querySelector('b');
            timerInterval = setInterval(() => {
                const now = Date.now();
                const diff = expiresAtTime - now;

                if (diff <= 0) {
                    clearInterval(timerInterval);
                    swal.close();
                    return;
                }

                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);

                if (b) {
                    b.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
            }, 1000);
        },
        willClose: () => {
            clearInterval(timerInterval);
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/carrito';
        }
    });
};

/**
 * Cierra cualquier toast de timer abierto
 */
export const closePaymentTimerToast = () => {
    // Solo cerrar si es el toast del timer (podríamos añadir una clase custom si fuera necesario para ser más específicos)
    // Por ahora cerramos swal genérico ya que suele ser singleton visualmente
    if (swal.isVisible()) {
        swal.close();
    }
};
