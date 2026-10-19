-- Run after the migration. All test visits are rolled back.
begin;
do $$
declare
    baseline bigint;
    first_id uuid := gen_random_uuid();
    first_total bigint;
    repeated_total bigint;
    next_total bigint;
begin
    select total into baseline from public.site_visit_total where singleton for update;
    first_total := public.record_site_visit(first_id);
    repeated_total := public.record_site_visit(first_id);
    next_total := public.record_site_visit(gen_random_uuid());
    if first_total <> baseline + 1 or repeated_total <> first_total or next_total <> baseline + 2 then
        raise exception 'Visit deduplication failed';
    end if;
    if has_table_privilege('anon', 'public.site_visit_total', 'SELECT')
        or has_table_privilege('anon', 'public.site_visit_sessions', 'INSERT')
        or has_table_privilege('authenticated', 'public.site_visit_sessions', 'SELECT') then
        raise exception 'Unexpected direct table privileges';
    end if;
    if not has_function_privilege('anon', 'public.record_site_visit(uuid)', 'EXECUTE')
        or has_function_privilege('authenticated', 'public.record_site_visit(uuid)', 'EXECUTE') then
        raise exception 'Unexpected RPC privileges';
    end if;
end;
$$;
select 'PASS: deduplication, increments and role privileges; test visits rolled back' as result;
rollback;
