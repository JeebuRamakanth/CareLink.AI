-- Permit signed-in users to update timestamps/titles on their own AI conversation only.
drop policy if exists "Users update own AI conversations" on public.ai_conversations;
create policy "Users update own AI conversations" on public.ai_conversations
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
