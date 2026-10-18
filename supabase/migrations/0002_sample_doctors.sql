-- Illustrative profiles only; these are not real or verified clinicians.
insert into public.doctors (hospital_id, full_name, specialty, experience_years, image_url)
select h.id, v.full_name, v.specialty, v.experience_years, v.image_url
from (values
 ('Dr. Ananya Rao (Sample)', 'General Medicine', 8, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80'),
 ('Dr. Kiran Kumar (Sample)', 'Cardiology', 10, 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80'),
 ('Dr. Priya Sharma (Sample)', 'Pediatrics', 6, 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80')
) as v(full_name, specialty, experience_years, image_url)
cross join lateral (select id from public.hospitals order by created_at limit 1) h
where not exists (select 1 from public.doctors d where d.full_name = v.full_name);
