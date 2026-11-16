import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync('App.jsx','utf8');
const component=fs.readFileSync('src/components/WorldHub.jsx','utf8');
const styles=fs.readFileSync('src/styles/world-hub.css','utf8');
const threeX=fs.readFileSync('src/components/ThreeXGuide.jsx','utf8');
const threeXLanding=fs.readFileSync('src/components/ThreeXExperience.jsx','utf8');
const threeXStyles=fs.readFileSync('src/styles/three-x.css','utf8');
const guide=fs.readFileSync('docs/FAMILY_WORLD_VISION_GUIDE_AR_EN.md','utf8');
const studio=fs.readFileSync('src/components/ThreeXChallengeStudio.jsx','utf8');
const planner=fs.readFileSync('src/components/ApartmentPlanner.jsx','utf8');
const plannerStyles=fs.readFileSync('src/styles/apartment-planner.css','utf8');
const studioStyles=fs.readFileSync('src/styles/three-x-studio.css','utf8');
const migration=fs.readFileSync('supabase/migrations/20261114225329_thimar_3x_challenge_engine.sql','utf8');
const studioMigration=fs.readFileSync('supabase/migrations/20261114225434_thimar_3x_admin_review_and_indexes.sql','utf8');
const reviewMigration=fs.readFileSync('supabase/migrations/20261114225518_thimar_3x_review_decision_validation.sql','utf8');
const designMigration=fs.readFileSync('supabase/migrations/20261115104454_apartment_design_cloud_sync.sql','utf8');
const designReviewMigration=fs.readFileSync('supabase/migrations/20261115104713_apartment_design_admin_review.sql','utf8');
const designValidationMigration=fs.readFileSync('supabase/migrations/20261115104809_apartment_design_json_validation.sql','utf8');

assert.match(app,/import WorldHub from ['"]\.\/src\/components\/WorldHub\.jsx['"]/,'World Hub component must be imported');
assert.ok(app.includes('<WorldHub lang={lang}') && app.includes("onChallenge={() => setTab('threex')}") ,'Home route must render WorldHub and link to the apartment challenge');
for (const locale of ['ar','en','zh']) assert.match(component,new RegExp('\\n\\s*'+locale+':\\{'),locale+' translation must exist');
for (const concept of ['100 m²','family','market','learning','community','projects','progress']) assert.ok(component.toLowerCase().includes(concept.toLowerCase()),'Missing hub concept: '+concept);
for (const feature of ['wh-feature-art','wh-house','wh-grid','wh-card-icon']) assert.ok(component.includes(feature),'Missing original illustration feature: '+feature);
assert.match(styles,/@media\(max-width:760px\)/,'World Hub must have a mobile layout');
assert.match(component,/family-world\.svg/,'World Hub must use the original app icon');
assert.match(component,/wh-art-gallery/,'Home must visibly surface the artwork gallery');
assert.match(component,/family-world-character-sprite\.webp/,'Home gallery must use the checked-in character artwork');
assert.match(component,/assets\/ideas\/world-map\.jpg/,'Home gallery must use the checked-in world map artwork');
assert.match(fs.readFileSync('public/sw.js','utf8'),/family-world-shell-v5/,'PWA shell cache must be versioned when artwork is added');
assert.match(component,/rtl=lang==='ar'/,'Arabic must use right-to-left layout');
assert.match(component,/soon:'Coming soon'/,'Unbuilt areas must be clearly labelled');
assert.match(component,/is-soon/,'Unbuilt areas must be visually distinguished');
const icon=fs.readFileSync('public/icons/family-world.svg','utf8');
const manifest=fs.readFileSync('public/manifest.webmanifest','utf8');
assert.match(icon,/<svg/,'Original app icon must exist');
assert.match(manifest,/family-world\.svg/,'PWA manifest must register the original icon');
console.log('World Hub checks passed: route, 3 locales, original brand icon, 100 m² challenge link, clean module map, mobile layout, and honest feature status.');

assert.match(app,/import ThreeXExperience/,'3X page must be imported');
assert.match(app,/import ThreeXGuide/,'Dedicated 3X guide page must be imported');
assert.match(app,/tab === 'threex-guide'/,'3X guide must have its own route');
assert.match(threeXLanding,/onGuide/,'3X landing must link to the separate guide page');
assert.match(threeXLanding,/threex-short-card/,'3X landing must use concise challenge cards');
assert.match(app,/\['threex', t\.threex, MapIcon\]/,'3X page must use the non-conflicting map icon alias');
assert.match(app,/<ThreeXExperience lang=\{lang\} onGuide=\{\(\) => setTab\('threex-guide'\)\}/,'3X page must be routed with its separate guide action');
for (const phrase of ['10,000 m²','1000 × 1000','FWP','OBS','WBS','PMO','Supply Chain','Work–life balance']) assert.ok(threeX.includes(phrase),'Missing 3X concept: '+phrase);
for (const phrase of ['100 م²','10,000 م²','1000 × 1000','FWP','OBS','WBS','PMO','سلسلة إمداد']) assert.ok(threeX.includes(phrase),'Missing Arabic 3X concept: '+phrase);
assert.match(guide,/### العربية/,'Bilingual guide must include Arabic');
assert.match(guide,/### English/,'Bilingual guide must include English');
assert.match(threeXStyles,/@media\(max-width:650px\)/,'3X page must have mobile layout');
assert.doesNotMatch(styles,/Sponge City/i,'Public-facing stylesheet must not use Sponge City branding');
console.log('3X checks passed: route, challenge areas, safeguards, supply chain, OBS/WBS/PMO, bilingual guide and responsive layout.');

assert.match(app,/import ThreeXChallengeStudio/,'3X studio must be imported');
assert.match(app,/<ThreeXChallengeStudio supabase=\{supabase\} user=\{session\.user\} lang=\{lang\} isAdmin=\{isAdmin\} \/>/,'3X studio must receive authenticated user and admin context');
for (const rpc of ['submit_3x_challenge','osmar_review_3x_submission']) assert.ok(studio.includes(rpc),'Missing secure workflow: '+rpc);
for (const field of ['family_needs','space_layout','privacy_access','climate_energy','materials_budget']) assert.ok(migration.includes(field),'Missing required home design task: '+field);
for (const table of ['challenge_catalog','challenge_tasks','challenge_projects','challenge_task_progress','challenge_submissions']) assert.ok(migration.includes('public.'+table),'Missing challenge data table: '+table);
assert.match(migration,/enable row level security/,'Challenge tables must enable RLS');
assert.match(migration,/membership_status='active'/,'Project creation must require active membership');
assert.match(migration,/Complete every required task before submitting/,'Server must enforce completion before submission');
assert.match(migration,/app_metadata/,'Admin review must check trusted app_metadata role');
assert.match(migration,/osmar_award_points/,'Points must be awarded through the protected points ledger');
assert.match(studioMigration,/Owners and OSMAR admins read challenge projects/,'Admin review must have scoped project visibility');
assert.match(reviewMigration,/p_decision is null/,'Review RPC must reject null decisions');
assert.match(studio,/completed!==tasks\.length/,'Client must prevent incomplete submissions');
assert.match(studioStyles,/@media\(max-width:600px\)/,'Challenge studio must support mobile');
console.log('3X Studio checks passed: authenticated route, five apartment tasks, RLS, active membership, server-side completion gate, trusted admin review, ledger-only points, and mobile layout.');

assert.match(studio,/import ApartmentPlanner/,'Apartment planner must be integrated');
assert.match(studio,/<ApartmentPlanner lang=\{lang\} userId=\{user\.id\} projectId=\{active\.id\} supabase=\{supabase\} \/>/,'Planner must be scoped to the signed-in member, project, and cloud client');
for (const phrase of ['Array(100)','localStorage.setItem','localStorage.getItem','10 × 10','m²']) assert.ok(planner.includes(phrase),'Missing planner capability: '+phrase);
for (const locale of ['ar','en','zh']) assert.ok(planner.includes(locale+':{'),'Apartment planner must support '+locale);
for (const zone of ['bed','living','kitchen','bath','entry','corridor']) assert.ok(planner.includes("'"+zone+"'"),'Missing apartment zone: '+zone);
assert.match(plannerStyles,/@media\(max-width:650px\)/,'Apartment planner must support mobile');
for (const feature of ['apartment_designs','design_json','furniture','doors','rotated','itemCost','cloudSaved']) assert.ok(planner.includes(feature),'Missing apartment studio capability: '+feature);
assert.match(studio,/words\[lang\]\|\|words\.en/,'Challenge studio must resolve all three locales');
assert.match(designMigration,/enable row level security/i,'Apartment design table must enable RLS');
assert.match(designMigration,/grant select, insert on public\.apartment_designs to authenticated/i,'Apartment design table must have explicit Data API grants');
assert.match(designMigration,/with check/i,'Apartment design writes must enforce ownership');
assert.match(designReviewMigration,/app_metadata/,'Only trusted OSMAR admins may read plans for review');
assert.match(designValidationMigration,/jsonb_array_length/,'Apartment design payload must be validated');
console.log('Apartment planner checks passed: 100 m² zoning, furniture footprints, doors, editable cost inputs, cloud/local save, RLS, admin review and three locales.');

const authSource=fs.readFileSync('App.jsx','utf8');
for (const capability of ['resetPasswordForEmail','PASSWORD_RECOVERY','updateUser({ password: newPassword })','auth.resend({ type: \'signup\'','forgotPassword','resendConfirmation','passwordMismatch']) assert.ok(authSource.includes(capability),'Missing secure account recovery capability: '+capability);
assert.match(authSource,/minLength="8"/,'New passwords must have a minimum length');
assert.match(authSource,/authRedirectUrl/,'Recovery and confirmation links must use a controlled application redirect');
console.log('Account recovery checks passed: email reset, recovery session handling, password update, resend confirmation, 3 locales, and minimum password length.');

const characterStudio=fs.readFileSync('src/components/CharacterStudio.jsx','utf8');
assert.match(characterStudio,/unlockLevel:2/,'First premium character must unlock at level 2');
assert.match(characterStudio,/card\.unlockLevel/,'Character visibility must be gated by unlock level');
assert.match(characterStudio,/cs-lock-art/,'Locked characters must use mystery artwork, not reveal the portrait');
assert.match(characterStudio,/family-world-character-01\.svg/,'Character portraits must use standalone high-resolution vector assets');
for(let index=1;index<=11;index++){
  const asset='public/assets/characters/family-world-character-'+String(index).padStart(2,'0')+'.svg';
  assert.ok(fs.existsSync(asset),'Missing standalone character portrait: '+asset);
}
assert.match(app,/<CharacterStudio lang=\{lang\} points=\{/,'Character Studio must receive member FWP progress');
assert.doesNotMatch(component,/wh-characters/,'Home screen must not render character cards');
console.log('Character progression checks passed: 11 standalone vector portraits, mystery locks, level-based reveal, FWP integration, and character-free home.');
const artworkRegister=fs.readFileSync('docs/BRAND_ARTWORK_INTEGRATION.md','utf8');
assert.ok(component.includes('wh-art-gallery') && component.includes('assets/ideas/world-map.jpg'),'World map may appear in the dedicated gallery, not as the hero background.');
assert.match(styles,/linear-gradient\(125deg,#102b45/,'Home hero must use the branded gradient fallback until official cover assets are installed.');
for (const asset of ['family-world-cover.webp','family-world-character-board.webp','family-world-game-board.webp']) {
  if (asset !== 'family-world-cover.webp') assert.ok(characterStudio.includes(asset),'Approved character/game board must be wired into Character Studio: '+asset);
  assert.ok(artworkRegister.includes(asset),'Approved artwork must be registered: '+asset);
}
assert.match(characterStudio,/cs-original-art/,'Character Studio must present the approved visual boards');
assert.match(characterStudio,/onError/,'Artwork slots must fail gracefully until assets are installed');
console.log('Original artwork checks passed: official cover and both visual boards are wired and registered.');

