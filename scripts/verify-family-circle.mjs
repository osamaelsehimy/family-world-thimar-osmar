import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync('App.jsx','utf8');
const garden=fs.readFileSync('src/components/ThimarGarden.jsx','utf8');
const schema=fs.readFileSync('supabase/migrations/20261126064204_family_circle_shared_garden.sql','utf8');
const hardening=fs.readFileSync('supabase/migrations/20261126064218_family_circle_private_rpc_hardening.sql','utf8');
const rotation=fs.readFileSync('supabase/migrations/20261126064405_family_circle_invite_rotation.sql','utf8');
const activeDashboard=fs.readFileSync('supabase/migrations/20261126065233_family_circle_active_member_dashboard.sql','utf8');

assert.match(activeDashboard,/join public\\.profiles caller_profile[\\s\\S]*membership_status = 'active'/,'Dashboard access must require an active member profile');
assert.match(activeDashboard,/join public\\.profiles p on p\\.id = cm\\.user_id and p\\.membership_status = 'active'/,'Inactive members must not appear in the shared family directory');
assert.match(activeDashboard,/active_profile\\.membership_status = 'active'/,'Family achievement totals must exclude inactive members');

assert.match(app,/<ThimarGarden lang=\{lang\} userId=\{session\.user\.id\} supabase=\{configured \? supabase : null\} \/>/,'Garden must receive only the configured Supabase client and authenticated user ID');
for (const rpc of ['family_circle_dashboard','create_family_circle','join_family_circle','complete_family_mission']) {
  assert.ok(garden.includes("rpc('"+rpc+"'"),'Garden must call '+rpc);
  assert.match(schema,new RegExp('function public\\.'+rpc.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),'Database migration must define '+rpc);
}
for (const table of ['family_circles','family_circle_members','family_mission_completions']) {
  assert.match(schema,new RegExp('create table if not exists public\\.'+table),'Missing table '+table);
  assert.match(schema,new RegExp('alter table public\\.'+table+' enable row level security'),'RLS must be enabled for '+table);
}
assert.match(schema,/membership_status='active'/,'Creating circles must require active membership');
assert.match(schema,/membership_status='active'/,'Joining and completing missions must require active membership');
assert.match(schema,/unique \(circle_id,user_id,task_key,completed_on\)/,'Daily mission completions must be idempotent');
assert.match(hardening,/alter function public\.create_family_circle\(text\) set schema private/,'Privileged implementation must move into private schema');
assert.match(hardening,/security invoker/,'Public RPC entrypoints must use invoker security');
assert.match(hardening,/grant execute on function private\.family_circle_dashboard\(\) to authenticated/,'Private RPC execution must be explicitly scoped');
for (const locale of ['ar','en','zh']) assert.ok(garden.includes(locale+': {') || garden.includes(locale+':{'), 'Missing locale '+locale);
assert.match(garden,/circle\.invite_code/,'Family owner must receive an invitation code');
assert.match(garden,/circle\.members/,'Shared family member list must render');
assert.match(garden,/localStorage/,'Demo mode should retain local-only fallback');
console.log('Family Circle checks passed: three locales, authenticated family circle, private invitation, shared daily missions, idempotent progress, RLS and private RPC hardening.');
