-- Asegúrate de que la extensión pg_cron está habilitada en Supabase (Database -> Extensions)
-- create extension if not exists pg_cron;

-- 1. Función para cancelar órdenes expiradas
-- Esta función busca órdenes con estado 'pending' cuya fecha expires_at sea menor a la actual (now())
create or replace function cancel_expired_orders()
returns void as $$
begin
  update orders
  set status = 'cancelled'
  where status = 'pending'
    and expires_at < now();
end;
$$ language plpgsql;

-- 2. Programar el Cron Job
-- Se ejecutará cada 10 minutos para limpiar las órdenes vencidas.
-- Nota: Puedes ajustar el intervalo '*/10 * * * *' según necesites (ej. '*/1 * * * *' para cada minuto durante pruebas).
select cron.schedule(
  'cancel-expired-orders', -- Nombre único del job
  '*/10 * * * *',          -- Cron expression (cada 10 minutos)
  $$select cancel_expired_orders()$$
);

-- Para verificar que se creó:
-- select * from cron.job;

-- Para detener/borrar el job si fuera necesario:
-- select cron.unschedule('cancel-expired-orders');
