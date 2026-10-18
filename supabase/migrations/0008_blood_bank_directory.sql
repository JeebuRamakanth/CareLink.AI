-- Source-backed blood-bank directory for the Machilipatnam–Vijayawada corridor.
-- Public directory details only; blood-group stock and donor availability are NOT live data.
create table if not exists public.blood_banks (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 city text not null,
 address text not null default '',
 phone text not null default '',
 category text not null default 'Blood bank',
 source_url text not null default '',
 source_notes text not null default '',
 is_verified boolean not null default false,
 last_verified_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 unique(name, city)
);
alter table public.blood_banks enable row level security;
drop policy if exists "Blood banks are publicly readable" on public.blood_banks;
create policy "Blood banks are publicly readable" on public.blood_banks for select to anon, authenticated using (true);

insert into public.blood_banks(name,city,address,phone,category,source_url,source_notes,is_verified,last_verified_at)
values
('Dr. Pattabhi Red Cross Blood Centre','Machilipatnam','DM&HO Campus, 21/276, Parasupeta, Machilipatnam, Krishna District, Andhra Pradesh','7793939660','Indian Red Cross blood centre','https://www.indianredcross.org/ircs/ircsbloodbanks/','Listed in Indian Red Cross Society directory (Sep 2026); confirm current stock by phone.',true,'2026-10-18'),
('Government General Hospital Blood Bank, Machilipatnam','Machilipatnam','Government General Hospital campus, Machilipatnam, Krishna District, Andhra Pradesh','','Government blood centre','https://www.bdoi.org/pages/lobb','Listed in Blood Donors of India directory; call to confirm current contact and stock.',false,'2026-10-18'),
('Vijaya Blood Centre','Machilipatnam','1st Floor, Old Margadarsi Building, D.No.11/689, 5 Roads Centre, Jagannadhapuram, Machilipatnam, Andhra Pradesh 521001','9133733353','Blood bank','https://www.google.com/maps/search/?api=1&query=Vijaya+Blood+Centre+Machilipatnam','Current business directory listing; phone/address should be confirmed before travel.',false,'2026-10-18'),
('Aruna Blood Bank','Machilipatnam','2nd Floor, SBI Bazar Bank Building, Ramanaidupet, Machilipatnam, Andhra Pradesh 521001','','Blood bank','https://www.google.com/maps/search/?api=1&query=Aruna+Blood+Bank+Machilipatnam','Business listing found; phone number not verified in source used.',false,'2026-10-18'),
('IRCS-APSB Blood Centre','Vijayawada','Red Cross Building, D.No.26-5-5, G.S. Raju Street, Gandhi Nagar, Vijayawada, Andhra Pradesh 520003','8977008540','Indian Red Cross blood centre','https://www.indianredcross.org/ircs/ircsbloodbanks/','Listed in Indian Red Cross Society directory (Sep 2026); confirm current stock by phone.',true,'2026-10-18'),
('New City Blood Bank','Vijayawada','29-19-10, Dornakal Road, Suryaraopeta / Governor Peta, Vijayawada, Andhra Pradesh 520002','9615444447','Blood bank','https://www.google.com/maps/search/?api=1&query=New+City+Blood+Bank+Vijayawada','Current business directory listing; call to confirm stock and service hours.',false,'2026-10-18'),
('Vijaya Sri Blood Bank','Vijayawada','29-19-27, Dornakal Road, Suryaraopeta / Governor Peta, Vijayawada, Andhra Pradesh 520002','9392120187','Blood bank and donation centre','https://www.google.com/maps/search/?api=1&query=Vijaya+Sri+Blood+Bank+Vijayawada','Current business directory listing; call to confirm stock and service hours.',false,'2026-10-18'),
('Suraksha Voluntary Blood Centre with Components','Vijayawada','Nakkala Road, Suryaraopeta, opposite MIG Hospital, Vijayawada, Andhra Pradesh 520002','0866 2434499','Voluntary blood centre','https://www.google.com/maps/search/?api=1&query=Suraksha+Voluntary+Blood+Centre+Vijayawada','Current business directory listing; call to confirm stock and service hours.',false,'2026-10-18'),
('Life Share Blood Bank','Vijayawada','Vijayawada Road, Mogalrajapuram / Labbipet, Vijayawada, Andhra Pradesh 520010','8892256789','Blood bank','https://www.google.com/maps/search/?api=1&query=Life+Share+Blood+Bank+Vijayawada','Current business directory listing; call to confirm stock and service hours.',false,'2026-10-18'),
('AAYUSH Hospitals Blood Bank','Vijayawada','D.No.48-13-3, Ring Road, Sri Ramachandra Nagar, Vijayawada, Andhra Pradesh','8498061186','Private hospital blood centre','https://www.bdoi.org/pages/lobb','Listed in Blood Donors of India directory; call to confirm current contact and stock.',false,'2026-10-18'),
('Government General Hospital Blood Centre, Guntur','Guntur','Government General Hospital, OP Block, Station Road, Guntur, Andhra Pradesh 522001','0863-2220035','Government blood centre','https://www.bdoi.org/pages/lobb','Listed in Blood Donors of India directory; Guntur is an adjacent regional option, not in the strict corridor.',false,'2026-10-18')
on conflict(name,city) do update set address=excluded.address,phone=excluded.phone,category=excluded.category,source_url=excluded.source_url,source_notes=excluded.source_notes,is_verified=excluded.is_verified,last_verified_at=excluded.last_verified_at;

comment on table public.blood_banks is 'Directory of blood centres only. No live blood group inventory, donor availability, or stock data is stored.';
