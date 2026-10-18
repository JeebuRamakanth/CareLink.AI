-- Source-backed public facility directory for the Machilipatnam–Gudivada–Vijayawada corridor.
-- Names and facility types below are sourced from official Andhra Pradesh district websites.
-- This migration intentionally does not invent doctors, doctor counts, specialties, or hospital photographs.

alter table public.hospitals
  add column if not exists source_url text,
  add column if not exists image_source_url text,
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists last_verified_at timestamptz;

alter table public.doctors
  add column if not exists source_url text,
  add column if not exists is_verified boolean not null default false,
  add column if not exists verification_status text not null default 'unverified';

-- Remove the explicitly synthetic preview records introduced by earlier sample migrations.
delete from public.doctors where full_name ilike '%(Sample)%';
delete from public.hospitals where name ilike '%(Sample)%' or name ilike 'CareLink Community Hospital%';

-- The fallback image is illustrative only. image_url stays blank unless a real facility photo
-- with an attributable source is available. source_url points to the official listing.
insert into public.hospitals
  (name, city, address, description, image_url, image_source_url, phone, category,
   is_verified, source_url, verification_status, last_verified_at)
select v.name, v.city, v.address,
       'Listed in an official Andhra Pradesh district public-facility directory. Current departments, staffing and services must be confirmed with the facility.',
       '', null, coalesce(v.phone,''), v.category, true, v.source_url,
       'listed_in_official_district_directory', now()
from (values
 ('District Hospital','Machilipatnam','Near Noble High School, Machilipatnam, Andhra Pradesh 521001','','Government','https://krishna.ap.gov.in/public-utility/district-hospital/'),
 ('P.P.UNIT Machilipatnam','Machilipatnam','Machilipatnam, Andhra Pradesh 521002','9989090509','PPU','https://krishna.ap.gov.in/public-utility/p-p-unit-machilipatnam/'),
 ('E-UPHC Chilakalapudi','Machilipatnam','Chilakalapudi, Machilipatnam, Andhra Pradesh 521002','8885935351','E-UPHC','https://krishna.ap.gov.in/public-utility/e-uphc-chilakalapudi/'),
 ('E-UPHC Narayanapuram','Machilipatnam','Narayanapuram, Machilipatnam, Andhra Pradesh 521001','8106514760','E-UPHC','https://krishna.ap.gov.in/public-utility-category/hospitals/page/2/'),
 ('E-UPHC Saradanagar','Machilipatnam','Saradanagar, Machilipatnam, Andhra Pradesh 521001','8555905772','E-UPHC','https://krishna.ap.gov.in/public-utility-category/hospitals/page/2/'),
 ('PHC Atukuru','Krishna District','Atukuru, Krishna District, Andhra Pradesh 521229','8142100617','PHC','https://krishna.ap.gov.in/public-utility-category/hospitals/page/3/'),
 ('PHC Bantumilli','Bantumilli','Bantumilli, Andhra Pradesh 521324','7660925998','PHC','https://krishna.ap.gov.in/public-utility-category/hospitals/page/3/'),
 ('PHC Chandrala','Krishna District','Chandrala, Krishna District, Andhra Pradesh 521330','9290929882','PHC','https://krishna.ap.gov.in/public-utility-category/hospitals/page/3/'),
 ('PHC Chevendrapalem','Krishna District','Chevendrapalem, Krishna District, Andhra Pradesh 521366','9491058223','PHC','https://krishna.ap.gov.in/public-utility-category/hospitals/page/3/'),
 ('PHC Chinaogirala','Krishna District','Chinaogirala, Krishna District, Andhra Pradesh 521245','9490297728','PHC','https://krishna.ap.gov.in/public-utility-category/hospitals/page/3/'),
 ('PHC Chinnapuram','Machilipatnam','Chinnapuram, Machilipatnam, Andhra Pradesh 521001','8919376255','PHC','https://krishna.ap.gov.in/public-utility-category/hospitals/page/3/'),
 ('E-UPHC NTR Colony (Gudivada)','Gudivada','NTR Colony, Gudivada, Andhra Pradesh 521301','8500448422','E-UPHC','https://krishna.ap.gov.in/public-utility-category/hospitals/page/2/'),
 ('New Government Hospital','Vijayawada','Gunadala, Vijayawada, Andhra Pradesh 520008','','Government','https://ntr.ap.gov.in/public-utility/new-government-hospital/'),
 ('Old Government General Hospital','Vijayawada','Benz Circle, Vijayawada, Andhra Pradesh 520004','','Government','https://ntr.ap.gov.in/public-utility-category/hospitals/page/15/'),
 ('E-UPHC Patamata','Vijayawada','Patamata, Vijayawada, Andhra Pradesh 520010','9032226903','E-UPHC','https://ntr.ap.gov.in/public-utility-category/hospitals/page/11/'),
 ('E-UPHC Labbipeta','Vijayawada','Labbipeta, Vijayawada, Andhra Pradesh 520010','8142378130','E-UPHC','https://ntr.ap.gov.in/public-utility-category/hospitals/page/8/'),
 ('E-UPHC Ramalingeswara Nagar','Vijayawada','Ramalingeswara Nagar, Vijayawada, Andhra Pradesh 520010','9885421733','E-UPHC','https://ntr.ap.gov.in/public-utility-category/hospitals/page/5/'),
 ('E-UPHC Gunadala','Vijayawada','Gunadala, Vijayawada, Andhra Pradesh 520004','9700931535','E-UPHC','https://ntr.ap.gov.in/public-utility-category/hospitals/page/5/'),
 ('E-UPHC Jakkampudi','Vijayawada','Jakkampudi, Vijayawada, Andhra Pradesh 520012','9494770903','E-UPHC','https://ntr.ap.gov.in/public-utility-category/hospitals/page/2/'),
 ('E-UPHC Kreesthurajapuram','Vijayawada','Kreesthurajapuram, Vijayawada, Andhra Pradesh 520004','9030092814','E-UPHC','https://ntr.ap.gov.in/public-utility-category/hospitals/page/7/')
) as v(name,city,address,phone,category,source_url)
where not exists (
  select 1 from public.hospitals h where lower(h.name)=lower(v.name) and lower(h.city)=lower(v.city)
);

-- Do not fabricate doctors: only explicitly verified clinician records are shown by the UI.
