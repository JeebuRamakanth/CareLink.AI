-- Additional private hospitals with first-party hospital sources or current AP DME directory evidence.
-- Department lists are hospital-published categories, not claims about individual doctor rosters.

alter table public.hospitals
  add column if not exists specialties text[] not null default '{}';

insert into public.hospitals
  (name, city, address, description, image_url, image_source_url, phone, category,
   is_verified, source_url, verification_status, last_verified_at, specialties)
select v.name, v.city, v.address, v.description, '', null, v.phone, v.category,
       true, v.source_url, v.verification_status, now(), v.specialties
from (values
 ('Sentini Hospitals','Vijayawada','54-15-5 B&C, Ring Road, opposite Novotel Hotel, Vijayawada, Andhra Pradesh 520008','Hospital-published directory entry. Confirm current services and appointments directly with the hospital.','08666677869','Private multispecialty hospital','https://sentinihospitals.com/contact-us.php','official_hospital_website',ARRAY['General Medicine','Critical Care','Cardiology','Cosmetic Surgery','Obstetrics & Gynecology','Emergency & Trauma Care','Nephrology','Neurology','Bariatrics','Cardiothoracic Surgery','Neurosurgery','Pulmonology','ENT','Gastroenterology','Preventive Medicine']::text[]),
 ('Sentini City Hospital','Vijayawada','D.No.29-13-15, near Badri Apartments, Kaleswara Rao Road, Suryaraopet, Vijayawada, Andhra Pradesh 520002','Hospital-published directory entry. Confirm current services and appointments directly with the hospital.','07352104108','Private multispecialty hospital','https://sentinicityhospital.com/','official_hospital_website',ARRAY['Neurology','Neurosurgery','Cardiology','Cardiothoracic Surgery','Medical Gastroenterology','Surgical Gastroenterology','Critical Care','Anesthesiology','Orthopedics','Pulmonology']::text[]),
 ('Dr Madhu Super Speciality Hospital - Machilipatnam Branch','Machilipatnam','Machilipatnam branch; use the official hospital website for current directions','Official hospital website lists a Machilipatnam branch and contact number. Detailed clinician roster and exact branch address are not independently verified here.','09493573133','Private super-speciality hospital','https://madhuneuro.com/','official_hospital_website',ARRAY['Neurology']::text[]),
 ('Andhra Hospitals - Machilipatnam','Machilipatnam','Door No. 124/125, Raju Peta, Machilipatnam, Andhra Pradesh 521001','Listed in the Andhra Pradesh Directorate of Medical Education recognised-hospital directory. Recognition listed as valid through 25 November 2026; re-check status after that date.','08672221199','Private multispecialty hospital','https://dme.ap.nic.in/Recognizedhosolist.pdf','listed_in_ap_dme_recognised_hospital_pdf',ARRAY['Anesthesiology','Cardiology','Emergency Medicine','General Medicine','General Surgery','Obstetrics & Gynecology','Nephrology','Neurosurgery','Pediatrics','Orthopedics','Pulmonology','Radiology','Surgical Gastroenterology','Urology','ENT']::text[])
) as v(name,city,address,description,phone,category,source_url,verification_status,specialties)
where not exists (select 1 from public.hospitals h where lower(h.name)=lower(v.name) and lower(h.city)=lower(v.city));
