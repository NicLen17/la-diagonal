-- Cancha Manager: one demonstration venue, accessed only by the application server.
create extension if not exists btree_gist with schema extensions;

create table public.cm_venues (
 id text primary key, slug text not null unique, name text not null, address text not null,
 city text not null, province text not null, "phoneE164" text not null, "whatsappE164" text not null,
 timezone text not null, "planWidthM" numeric not null check ("planWidthM">0),
 "planLengthM" numeric not null check ("planLengthM">0),
 "depositPercent" numeric not null check ("depositPercent" between 0 and 100),
 "bankAlias" text not null, "bankCbu" text not null, "bankHolder" text not null,
 "holdTtlMinutes" int not null check ("holdTtlMinutes" between 1 and 30),
 "instagramUrl" text not null default '', "facebookUrl" text not null default '', "whatsappContactUrl" text not null
);
create table public.cm_courts (
 id text primary key, "venueId" text not null references public.cm_venues(id), name text not null,
 sport text not null check (sport in ('futbol_5','futbol_7','futbol_8','futbol_9','futbol_11','futsal','handball','padel')),
 description text not null, surface text not null, "hasLights" boolean not null,
 "slotDurationMinutes" int not null check ("slotDurationMinutes">0), "basePriceArs" int not null check ("basePriceArs">=0),
 "planX_m" numeric not null, "planY_m" numeric not null, "planWidthM" numeric not null check ("planWidthM">0),
 "planLengthM" numeric not null check ("planLengthM">0), "planRotationDeg" numeric not null,
 "sortOrder" int not null, "isActive" boolean not null, unique(id,"venueId")
);
create table public.cm_hours (
 id text primary key, "venueId" text not null references public.cm_venues(id), "dayOfWeek" int not null check ("dayOfWeek" between 0 and 6),
 "opensAt" text not null, "closesAt" text not null, unique ("venueId","dayOfWeek")
);
create table public.cm_price_rules (
 id text primary key, "venueId" text not null references public.cm_venues(id), "courtId" text,
 name text not null, "daysOfWeek" int[] not null, "startsAt" text not null, "endsAt" text not null,
 "priceArs" int check ("priceArs">=0), "surchargeArs" int, priority int not null, "isActive" boolean not null,
 foreign key ("courtId","venueId") references public.cm_courts(id,"venueId") on delete cascade
);
create table public.cm_closures (
 id text primary key, "venueId" text not null references public.cm_venues(id), "courtId" text, reason text not null,
 "startsAt" timestamptz not null, "endsAt" timestamptz not null, check ("endsAt">"startsAt"),
 foreign key ("courtId","venueId") references public.cm_courts(id,"venueId") on delete cascade
);
create table public.cm_customers (
 id text primary key, "fullName" text not null, email text not null, "phoneE164" text not null,
 "authUserId" text, "createdAt" timestamptz not null default now()
);
create table public.cm_reservations (
 id text primary key, code text not null unique, "venueId" text not null references public.cm_venues(id),
 "courtId" text not null, "customerId" text not null references public.cm_customers(id),
 "startsAt" timestamptz not null, "endsAt" timestamptz not null, check ("endsAt">"startsAt"),
 status text not null check (status in ('hold','pending','confirmed','cancelled','expired')),
 "holdExpiresAt" timestamptz, "paymentMethod" text not null check ("paymentMethod" in ('cash','deposit','transfer_full')),
 "priceArs" int not null check ("priceArs">=0), "depositArs" int not null default 0 check ("depositArs">=0),
 "receiptFileName" text, "receiptPath" text, notes text,
 "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now(),
 foreign key ("courtId","venueId") references public.cm_courts(id,"venueId"),
 exclude using gist ("courtId" with =, tstzrange("startsAt","endsAt",'[)') with &&) where (status in ('hold','pending','confirmed'))
);
create index cm_reservations_venue_date on public.cm_reservations("venueId","startsAt");
create index cm_reservations_customer on public.cm_reservations("customerId");
create index cm_courts_venue on public.cm_courts("venueId");
create index cm_rules_venue on public.cm_price_rules("venueId");
create index cm_rules_court on public.cm_price_rules("courtId","venueId");
create index cm_closures_venue on public.cm_closures("venueId");
create index cm_closures_court on public.cm_closures("courtId","venueId");

create function public.cm_expire_holds() returns int language plpgsql security invoker set search_path='' as $$
declare affected int;
begin
 update public.cm_reservations set status='expired',"updatedAt"=now() where status='hold' and "holdExpiresAt"<=now();
 get diagnostics affected=row_count; return affected;
end $$;

create function public.cm_create_hold(venue_id text, court_id text, starts_at timestamptz, ends_at timestamptz, price_ars int)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare c public.cm_courts; v public.cm_venues; h public.cm_hours; r public.cm_reservations; local_start timestamp; local_end timestamp; opens timestamp; closes timestamp;
begin
 select * into v from public.cm_venues where id=venue_id for share;
 select * into c from public.cm_courts where id=court_id and "venueId"=venue_id and "isActive" for share;
 if c.id is null or v.id is null then raise exception 'Cancha no disponible'; end if;
 perform public.cm_expire_holds();
 local_start := starts_at at time zone v.timezone; local_end := ends_at at time zone v.timezone;
 select * into h from public.cm_hours where "venueId"=venue_id and "dayOfWeek"=extract(dow from local_start)::int;
 opens := local_start::date + h."opensAt"::time; closes := local_start::date + h."closesAt"::time;
 if closes<=opens then closes:=closes+interval '1 day'; end if;
 if starts_at<=now() or ends_at-starts_at<>make_interval(mins=>c."slotDurationMinutes") or h.id is null
 or local_start<opens or local_end>closes or mod(extract(epoch from(local_start-opens))::numeric,c."slotDurationMinutes"*60)<>0
 then raise exception 'El turno no corresponde al horario disponible'; end if;
 if exists(select 1 from public.cm_closures where "venueId"=venue_id and ("courtId" is null or "courtId"=court_id) and "startsAt"<ends_at and "endsAt">starts_at)
 then raise exception 'La cancha está cerrada en ese horario'; end if;
 insert into public.cm_customers(id,"fullName",email,"phoneE164") values ('hold-guest','Reserva en proceso','','') on conflict do nothing;
 insert into public.cm_reservations(id,code,"venueId","courtId","customerId","startsAt","endsAt",status,"holdExpiresAt","paymentMethod","priceArs")
 values(gen_random_uuid()::text,'CM-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,16)),venue_id,court_id,'hold-guest',starts_at,ends_at,'hold',now()+make_interval(mins=>v."holdTtlMinutes"),'cash',price_ars)
 returning * into r; return to_jsonb(r);
end $$;

create function public.cm_complete_reservation(reservation_id text, customer jsonb, payment text, receipt_name text, receipt_path text, customer_notes text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.cm_reservations; v public.cm_venues; cid text;
begin
 select * into r from public.cm_reservations where id=reservation_id for update;
 if r.id is null or r.status<>'hold' or r."holdExpiresAt"<=now() then raise exception 'El turno expiró o ya fue registrado. Elegí otro horario.'; end if;
 select * into v from public.cm_venues where id=r."venueId";
 if payment not in ('cash','deposit','transfer_full') then raise exception 'Método de pago inválido'; end if;
 if payment<>'cash' and (receipt_name is null or receipt_path is null) then raise exception 'Adjuntá el comprobante'; end if;
 cid:=gen_random_uuid()::text;
 insert into public.cm_customers(id,"fullName",email,"phoneE164") values(cid,customer->>'fullName',customer->>'email',customer->>'phoneE164');
 update public.cm_reservations set "customerId"=cid,status='pending',"holdExpiresAt"=null,"paymentMethod"=payment,
 "depositArs"=case when payment='deposit' then round("priceArs"*v."depositPercent"/100) when payment='transfer_full' then "priceArs" else 0 end,
 "receiptFileName"=case when payment<>'cash' then receipt_name end,"receiptPath"=case when payment<>'cash' then receipt_path end,
 notes=customer_notes,"updatedAt"=now() where id=reservation_id returning * into r;
 return to_jsonb(r);
end $$;

-- No public read or write access: all business access is via authenticated Next server actions.
do $$ declare t text; begin
 foreach t in array array['cm_venues','cm_courts','cm_hours','cm_price_rules','cm_closures','cm_customers','cm_reservations'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
revoke all on function public.cm_expire_holds() from public,anon,authenticated;
revoke all on function public.cm_create_hold(text,text,timestamptz,timestamptz,int) from public,anon,authenticated;
revoke all on function public.cm_complete_reservation(text,jsonb,text,text,text,text) from public,anon,authenticated;
grant execute on function public.cm_expire_holds() to service_role;
grant execute on function public.cm_create_hold(text,text,timestamptz,timestamptz,int) to service_role;
grant execute on function public.cm_complete_reservation(text,jsonb,text,text,text,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('cm-receipts','cm-receipts',false,3145728,array['image/jpeg','image/png','image/webp','application/pdf']) on conflict(id) do nothing;
