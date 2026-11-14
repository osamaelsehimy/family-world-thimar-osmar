import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync('App.jsx','utf8');
const component=fs.readFileSync('src/components/HomeExperience.jsx','utf8');
const styles=fs.readFileSync('src/styles/home-experience.css','utf8');
const threeX=fs.readFileSync('src/components/ThreeXExperience.jsx','utf8');
const threeXStyles=fs.readFileSync('src/styles/three-x.css','utf8');
const guide=fs.readFileSync('docs/FAMILY_WORLD_VISION_GUIDE_AR_EN.md','utf8');

assert.match(app,/import HomeExperience from ['"]\.\/src\/components\/HomeExperience\.jsx['"]/,'Home experience component must be imported');
assert.match(app,/import ['"]\.\/src\/styles\/home-experience\.css['"]/,'Home experience stylesheet must be imported');
assert.match(app,/<HomeExperience[^>]*onExplore=\{\(\) => setTab\(['"]worlds['"]\)\}/,'Home route must render HomeExperience and link to worlds');
for (const locale of ['ar','en','zh']) assert.match(component,new RegExp('\\n'+locale+':\\{'),locale+' translation must exist');
for (const concept of ['SMART','OKR','PMO','star schema','quality','cost','time','value']) assert.ok(component.toLowerCase().includes(concept.toLowerCase()),'Missing concept: '+concept);
for (const feature of ['city-water','city-building','city-tree','city-rain']) assert.ok(component.includes(feature),'Missing sponge-city feature: '+feature);
assert.match(styles,/@media\s*\(max-width:\s*700px\)/,'Mobile layout breakpoint must exist');
assert.match(styles,/@media\s*\(prefers-reduced-motion:\s*no-preference\)/,'Animations must respect reduced-motion preference');
assert.match(component,/concept design|تصميم مفاهيمي|概念设计/i,'Concept city must not be presented as measured real-world data');
console.log('Home experience checks passed: route, 3 locales, sponge-city features, PMO/SMART/OKR/data/value concepts, mobile layout, reduced motion, and honest concept labeling.');

assert.match(app,/import ThreeXExperience/,'3X page must be imported');
assert.match(app,/\['threex', t\.threex, Map\]/,'3X page must be in navigation');
assert.match(app,/<ThreeXExperience lang=\{lang\} \/>/,'3X page must be routed');
for (const phrase of ['10,000 m²','1000 × 1000','FWP','OBS','WBS','PMO','Supply Chain','Work–life balance']) assert.ok(threeX.includes(phrase),'Missing 3X concept: '+phrase);
for (const phrase of ['100 م²','10,000 م²','1000 × 1000','FWP','OBS','WBS','PMO','سلسلة إمداد']) assert.ok(threeX.includes(phrase),'Missing Arabic 3X concept: '+phrase);
assert.match(guide,/### العربية/,'Bilingual guide must include Arabic');
assert.match(guide,/### English/,'Bilingual guide must include English');
assert.match(threeXStyles,/@media\(max-width:650px\)/,'3X page must have mobile layout');
assert.doesNotMatch(styles,/Sponge City/i,'Public-facing stylesheet must not use Sponge City branding');
console.log('3X checks passed: route, challenge areas, safeguards, supply chain, OBS/WBS/PMO, bilingual guide and responsive layout.');
