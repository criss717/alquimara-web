import swal from 'sweetalert2';

/**
 * Muestra un alert con SweetAlert2
 * @param title Título del alert
 * @param text Texto del alert
 * @param icon Tipo de ícono: 'success' | 'error' | 'warning' | 'info' | 'question'
 * @param autoClose Tiempo en milisegundos para cerrar automáticamente (undefined = no se cierra solo)
 */
export const sweetAlert = (
    title: string,
    text: string,
    icon: 'success' | 'error' | 'warning' | 'info' | 'question',
    autoClose?: number,
    confirm?: boolean
): ReturnType<typeof swal.fire> => {
    return swal.fire({
        title,
        text,
        icon,
        confirmButtonColor: '#8b5cf6', // Color violeta personalizado
        showCancelButton: confirm,
        cancelButtonColor: "#d33",
        confirmButtonText: confirm ? 'Sí' : 'Ok',
        ...(autoClose && {
            timer: autoClose,
            timerProgressBar: true,
            didOpen: (modal) => {
                modal.addEventListener('mouseenter', swal.stopTimer);
                modal.addEventListener('mouseleave', swal.resumeTimer);
            },
        }),
    });
};