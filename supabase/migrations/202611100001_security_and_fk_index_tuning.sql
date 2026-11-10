-- Tighten function name resolution and cover foreign-key lookup paths.
alter function public.comparex_guard_sellable_supplier_product()
  set search_path = public, pg_temp;
alter function public.comparex_pause_products_when_supplier_unapproved()
  set search_path = public, pg_temp;

create index if not exists comparex_fulfilment_supplier_idx
  on public.comparex_fulfilment_tasks(supplier_id);
create index if not exists comparex_fulfilment_supplier_product_idx
  on public.comparex_fulfilment_tasks(supplier_product_id);
create index if not exists comparex_payment_events_order_idx
  on public.comparex_payment_events(order_id);
