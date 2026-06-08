-- Stored procedure to transactionally reorder FAQs based on an array of IDs
create or replace function reorder_faqs(faq_ids jsonb)
returns void as $$
declare
  faq_id_val jsonb;
  idx int := 0;
begin
  for faq_id_val in select jsonb_array_elements(faq_ids) loop
    update faqs 
    set order_index = idx 
    where id = (faq_id_val->>0)::bigint;
    idx := idx + 1;
  end loop;
end;
$$ language plpgsql security definer;
