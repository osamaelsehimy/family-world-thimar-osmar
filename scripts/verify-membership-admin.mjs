import fs from 'node:fs';
import assert from 'node:assert/strict';

const app = fs.readFileSync('App.jsx', 'utf8');
const directoryMigration = fs.readFileSync('supabase/migrations/20261114184945_trusted_member_directory_and_legacy_tru_classification.sql', 'utf8');
const inviteValidationMigration = fs.readFileSync('supabase/migrations/20261116154000_osmar_invite_code_preflight_validation.sql', 'utf8');
const recentMigration = fs.readFileSync('supabase/migrations/20261116153000_osmar_recent_registration_monitor.sql', 'utf8');
const fixMigration = fs.readFileSync('supabase/migrations/20261115153321_fix_referral_directory_and_rls_performance.sql', 'utf8');

const migrationFiles = fs.readdirSync('supabase/migrations').filter(name => name.endsWith('.sql')).sort();
const expectedMigrationFiles = [
  "20261115174031_member_directory_v2_and_profile_editor.sql",
  "20261109110610_family_world_auth_profiles.sql",
  "20261113165253_trust_membership_foundation.sql",
  "20261113165316_enforce_trusted_invitation_signup.sql",
  "20261113165555_osmar_admin_invitation_console_api.sql",
  "20261113165608_osmar_admin_membership_controls.sql",
  "20261113215834_domino_online_room_lobby.sql",
  "20261113215842_domino_room_rls_membership_helper.sql",
  "20261113215935_domino_room_settings_validation.sql",
  "20261113220104_defer_domino_room_start_until_game_engine.sql",
  "20261114184945_trusted_member_directory_and_legacy_tru_classification.sql",
  "20261114185823_default_new_member_admin_label_to_tru.sql",
  "20261114191804_family_points_ledger_and_admin_controls.sql",
  "20261114192626_member_game_activity_and_pmo_metrics.sql",
  "20261114212123_member_friends_and_requests.sql",
  "20261114225329_thimar_3x_challenge_engine.sql",
  "20261114225434_thimar_3x_admin_review_and_indexes.sql",
  "20261114225518_thimar_3x_review_decision_validation.sql",
  "20261114225529_thimar_3x_unified_project_read_policy.sql",
  "20261115104454_apartment_design_cloud_sync.sql",
  "20261115104713_apartment_design_admin_review.sql",
  "20261115104809_apartment_design_json_validation.sql",
  "20261115104946_apartment_design_least_privilege_grants.sql",
  "20261115153213_member_profiles_and_avatars.sql",
  "20261115153321_fix_referral_directory_and_rls_performance.sql",
  "20261115155051_osmar_least_privilege_admin_rbac.sql",
  "20261115155251_enforce_core_admin_permissions.sql",
  "20261116153000_osmar_recent_registration_monitor.sql",
  "20261116154000_osmar_invite_code_preflight_validation.sql",
  "20261116161500_osmar_open_signup_invite_audit_and_admin_code_directory.sql",
  "20261116161600_fix_registration_attempt_email_validation.sql"
];
assert.equal(migrationFiles.length, expectedMigrationFiles.length, 'Migration inventory must match the recorded Supabase migrations');
for (const file of expectedMigrationFiles) {
  assert.ok(migrationFiles.includes(file), 'Missing or misnamed Supabase migration: ' + file);
}

assert.match(app, /session\?\.user\?\.app_metadata\?\.role === 'osmar_admin'/, 'Admin navigation must use trusted app_metadata role');
assert.match(app, /Map as MapIcon/, 'Lucide map icon must not shadow the native Map constructor');
assert.match(app, /new Map\(/, 'Directory aggregation must use the native Map constructor');
assert.match(app, /osmar_recent_registrations/, 'Admin must load the owner-only recent registration monitor');
assert.match(app, /Awaiting email confirmation/, 'Recent registrations must distinguish unconfirmed email from admin approval');
assert.match(recentMigration, /private\.osmar_is_owner\(\)/, 'Recent registration monitor must be owner-only');
assert.match(recentMigration, /email_confirmed_at is not null/, 'Recent registration monitor must expose email confirmation state');
assert.match(app, /osmar_member_directory_v2/, 'Admin directory must load the live member directory v2');
assert.match(app, /osmar_update_member_profile/, 'Owner must be able to edit member profiles');
assert.match(app, /member_type/, 'Admin directory must use the owner-controlled member type');
assert.match(app, /supabase\.rpc\('osmar_create_invite'/, 'Invite creation must call the protected RPC');
assert.match(app, /supabase\.rpc\('osmar_review_member'/, 'Membership decisions must call the protected RPC');
assert.match(app, /guardian_attested: true/, 'Signup must record adult guardian affirmation');
assert.match(app, /osmar_validate_invite_code/, 'Signup must preflight invitation codes before creating Auth users');
assert.match(inviteValidationMigration, /grant execute on function public\.osmar_validate_invite_code\(text\) to anon, authenticated/i, 'Invite preflight must be callable before authentication');
assert.match(app, /invite_code: acceptedInvite/, 'Only a valid invitation code is linked to the server-side trigger');
assert.match(app, /osmar_record_registration_attempt/, 'Invalid invite attempts must be recorded without blocking signup');
assert.match(app, /osmar_invite_directory/, 'Admin must display invitation capacity and usage');
assert.match(app, /osmar_registration_attempts/, 'Admin must display numbered registration attempts');
assert.match(app, /inviteDirectory\.map/, 'Admin must render the invitation code directory');
assert.match(app, /registrationAttempts\.map/, 'Admin must render registration attempts');
assert.match(app, /optional/, 'Invitation code must be optional at signup');
const openSignupMigration = fs.readFileSync('supabase/migrations/20261116161500_osmar_open_signup_invite_audit_and_admin_code_directory.sql', 'utf8');
assert.match(openSignupMigration, /if raw_invite_code <> ''/, 'Signup must support optional invitation codes');
assert.match(openSignupMigration, /membership_status\)\s*values \(new\.id, new_member_code, 'pending'\)/, 'Uninvited members must be registered pending review');
assert.match(openSignupMigration, /osmar_invite_directory/, 'Owner-only invitation directory RPC must exist');
assert.match(openSignupMigration, /osmar_registration_attempts/, 'Owner-only registration attempt RPC must exist');
assert.match(app, /Number\.isInteger\(maxUses\).*maxUses < 1.*maxUses > 500/s, 'Admin must validate invitation usage limits');
assert.match(app, /async function copyInviteCode\(\)/, 'Invite copy must report clipboard success/failure');
assert.match(app, /finally \{\s*setBusy\(false\);\s*\}/, 'Admin actions must release the busy state on errors');
assert.match(app, /Could not connect to the membership service/, 'Directory load must provide a recoverable network error');
assert.match(directoryMigration, /coalesce\(r\.referral_type, p\.admin_referral_label, 'UNCLASSIFIED'\)/, 'The actual invitation type must take precedence over the fallback admin label');
assert.match(fixMigration, /coalesce\(r\.referral_type, p\.admin_referral_label, 'UNCLASSIFIED'\)/, 'Live repair migration must preserve the invitation type');
for (const index of ['member_referrals_invite_code_id_idx','member_referrals_reviewed_by_idx','domino_rooms_host_id_idx','points_ledger_awarded_by_idx']) {
  assert.ok(fixMigration.includes(index), 'Missing foreign-key performance index: ' + index);
}
assert.match(fixMigration, /Members and OSMAR admins can read profiles/, 'Profile read policies must be combined');
assert.match(fixMigration, /Owners and OSMAR admins read apartment designs/, 'Apartment read policies must be combined');
console.log('Membership/admin checks passed: trusted admin role, invitation flow, guardian affirmation, safe limits, resilient UI, referral attribution, and RLS/performance migration.');
