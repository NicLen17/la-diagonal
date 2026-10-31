create function public.cm_reset_demo(seed jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare vid text := 'venue-cancha-manager-demo';
begin
 if seed->'venue'->>'id'<>vid then raise exception 'Solo se puede reiniciar el complejo de demostración'; end if;
 perform id from public.cm_venues where id=vid for update;
 delete from public.cm_reservations where "venueId"=vid;
 delete from public.cm_closures where "venueId"=vid;
 delete from public.cm_price_rules where "venueId"=vid;
 delete from public.cm_hours where "venueId"=vid;
 delete from public.cm_courts where "venueId"=vid;
 delete from public.cm_customers c where not exists(select 1 from public.cm_reservations r where r."customerId"=c.id);
 delete from public.cm_venues where id=vid;
 insert into public.cm_venues select * from jsonb_populate_record(null::public.cm_venues,seed->'venue');
 insert into public.cm_courts select * from jsonb_populate_recordset(null::public.cm_courts,seed->'courts');
 insert into public.cm_hours select * from jsonb_populate_recordset(null::public.cm_hours,seed->'hours');
 insert into public.cm_price_rules select * from jsonb_populate_recordset(null::public.cm_price_rules,seed->'priceRules');
 insert into public.cm_closures select * from jsonb_populate_recordset(null::public.cm_closures,seed->'closures');
 insert into public.cm_customers select * from jsonb_populate_recordset(null::public.cm_customers,seed->'customers');
 insert into public.cm_reservations select * from jsonb_populate_recordset(null::public.cm_reservations,seed->'reservations');
end $$;
revoke all on function public.cm_reset_demo(jsonb) from public,anon,authenticated;
grant execute on function public.cm_reset_demo(jsonb) to service_role;
