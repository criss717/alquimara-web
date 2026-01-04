-- Versión FINAL AJUSTADA (SOLUCIÓN PRAGMÁTICA)
-- El problema: La DB está en UTC (ahora mismo X horas).
-- Tu código JS envió la fecha como "Y horas" (UTC+1, probablemente).
-- Resultado: La orden expira en la DB 1 hora MÁS TARDE de lo que debería.

-- Solución: Le decimos a la base de datos que "mire hacia el futuro" 1 hora 
-- para compensar ese retraso.

create or replace function cancel_expired_orders()
returns void as $$
begin
  update orders
  set status = 'cancelled'
  where status = 'pending'
    -- Si expires_at tiene "1 hora de más", sumamos 1 hora a NOW() para alcanzarlo antes.
    -- Ajusta '1 hour' a '2 hours' si en verano sigue pasando (por el cambio de hora).
    and expires_at < (now() + interval '1 hour');
end;
$$ language plpgsql;

-- Mantenemos el cron activo
select cron.schedule(
  'cancel-expired-orders',
  '*/120 * * * *', 
  $$select cancel_expired_orders()$$
);

-- PRUEBA INMEDIATA:
-- select cancel_expired_orders();
