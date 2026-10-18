-- Patients may only change their own appointment status to cancelled.
drop policy if exists "Patients cancel own appointments" on public.appointments;
create policy "Patients cancel own appointments" on public.appointments
for update to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id and status = 'cancelled');
