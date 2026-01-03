-- Versión corregida para forzar la comparación con Zona Horaria (timestamptz)

create or replace function cancel_expired_orders()
returns void as $$
begin
  update orders
  set status = 'cancelled'
  where status = 'pending'
    -- Casteamos a timestamptz para asegurar que se compara en UTC/Server Time correctamente
    and expires_at::timestamptz < now();
end;
$$ language plpgsql;

-- Nos aseguramos que el cron siga activo
select cron.schedule(
  'cancel-expired-orders',
  '*/10 * * * *', 
  $$select cancel_expired_orders()$$
);

-- Para probar si FUNCIONA AHORA (sin esperar 10 min), ejecuta esto manualmente una vez:
-- select cancel_expired_orders();
