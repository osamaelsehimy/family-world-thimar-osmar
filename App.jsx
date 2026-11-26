import { useEffect, useMemo, useState } from 'react';
import DominoGame from './src/components/DominoGame.jsx';
import DominoOnlineLobby from './src/components/DominoOnlineLobby.jsx';
import Number1024Game from './src/components/Number1024Game.jsx';
import LudoGame from './src/components/LudoGame.jsx';
import CandyThimar from './src/components/CandyThimar.jsx';
import ThimarGarden from './src/components/ThimarGarden.jsx';
import MemberDashboard from './src/components/MemberDashboard.jsx';
import MemberProfile from './src/components/MemberProfile.jsx';
import WorldHub from './src/components/WorldHub.jsx';
import CharacterStudio from './src/components/CharacterStudio.jsx';
import EntertainmentHub from './src/components/EntertainmentHub.jsx';
import ThreeXExperience from './src/components/ThreeXExperience.jsx';
import ThreeXGuide from './src/components/ThreeXGuide.jsx';
import ThreeXChallengeStudio from './src/components/ThreeXChallengeStudio.jsx';
import { supabase, configured } from './src/lib/supabase';
import { Home, Globe2, Gamepad2, Users, Clapperboard, LogOut, Sprout, Star, ShieldCheck, Menu, X, ChevronLeft, BookOpen, ClipboardList, Copy, BarChart3, UserRound, Map as MapIcon } from 'lucide-react';

const worlds = [
  { id: 'home', icon: '🏡', ar: 'البيت والمعيشة', en: 'Home & Daily Life', zh: '家庭与日常', desc: 'نشارك المسؤولية ونعتني ببيتنا.', enDesc: 'Share responsibilities and care for home.', zhDesc: '分担责任，一起照顾家。' },
  { id: 'family', icon: '💚', ar: 'الأسرة والعلاقات', en: 'Family & Relationships', zh: '家庭与关系', desc: 'كلمة طيبة ووقت جميل يجمعنا.', enDesc: 'Kind words and good time bring us closer.', zhDesc: '善意的话语与陪伴让我们更亲近。' },
  { id: 'learning', icon: '📚', ar: 'التعليم والمهارات', en: 'Learning & Skills', zh: '学习与技能', desc: 'نتعلم شيئًا جديدًا خطوة بخطوة.', enDesc: 'Learn something new, one step at a time.', zhDesc: '一步一步学习新知识。' },
  { id: 'nature', icon: '🌿', ar: 'الطبيعة والاستدامة', en: 'Nature & Sustainability', zh: '自然与可持续', desc: 'نحافظ على النعمة والبيئة.', enDesc: 'Care for the gifts around us.', zhDesc: '珍惜恩典，爱护环境。' },
  { id: 'work', icon: '💼', ar: 'الأعمال والتجارة', en: 'Work & Enterprise', zh: '工作与事业', desc: 'نتعاون ونخطط ونتقن العمل.', enDesc: 'Plan together and do good work.', zhDesc: '一起计划，认真做好每件事。' },
  { id: 'health', icon: '⚽', ar: 'الصحة والرياضة', en: 'Health & Movement', zh: '健康与运动', desc: 'حركة وراحة وعادات صحية.', enDesc: 'Build healthy habits with movement and rest.', zhDesc: '通过运动与休息养成健康习惯。' },
  { id: 'community', icon: '🤲', ar: 'المجتمع والعمل النافع', en: 'Community & Service', zh: '社区与公益', desc: 'نساعد وننشر الخير من حولنا.', enDesc: 'Help others and spread good nearby.', zhDesc: '帮助他人，把善意带给身边的人。' },
];
const games = [
  { id: 'domino', status: 'ready', icon: '🁣', ar: 'الدومينو', en: 'Dominoes', zh: '多米诺骨牌', desc: 'العب الدومينو الحقيقي ضد الكمبيوتر.', enDesc: 'Play a real domino round against the computer.', zhDesc: '与电脑进行真正的多米诺对局。', points: 0 },
  { id: 'candy-thimar', status: 'ready', icon: '🍬', ar: 'كاندي ثمار', en: 'Candy Thimar', zh: 'Thimar 糖果乐园', desc: 'بدّل الثمار واجمع المتشابه منها واجتز مراحل الحصاد.', enDesc: 'Swap fruits, make matches, and complete harvest levels.', zhDesc: '交换水果，消除相同水果，完成丰收关卡。', points: 0, available: true },
  { id: 'treasure', status: 'development', icon: '🗝️', ar: 'صيد الكنز العائلي', en: 'Family Treasure Hunt', zh: '家庭寻宝', desc: 'اخفوا غرضًا آمنًا واكتبوا ثلاث تلميحات.', enDesc: 'Hide a safe object and write three clues.', zhDesc: '藏好安全的小物件，写下三个提示。', points: 0, available: false },
  { id: 'guess', status: 'development', icon: '🤔', ar: 'مين أنا؟', en: 'Who Am I?', zh: '我是谁？', desc: 'خمنوا شخصية أو حيوانًا بأسئلة نعم أو لا.', enDesc: 'Guess a person or animal with yes-or-no questions.', zhDesc: '用是非题猜人物或动物。', points: 0, available: false },
  { id: 'story', status: 'development', icon: '📖', ar: 'حكاية على الدور', en: 'A Story in Turns', zh: '接龙故事', desc: 'كل واحد يضيف جملة ونبني حكاية معًا.', enDesc: 'Each person adds a line to a shared story.', zhDesc: '每个人接着讲一句，共同编故事。', points: 0, available: false },
  { id: 'backgammon', status: 'development', icon: '🎲', ar: 'الطاولة', en: 'Backgammon', zh: '双陆棋', desc: 'لعبة تخطيط وحساب وحركة ذكية.', enDesc: 'A classic game of strategy, counting, and movement.', zhDesc: '经典策略、计数与移动游戏。', points: 0, available: false },
  { id: 'estimation', status: 'development', icon: '🃏', ar: 'الاستميشن', en: 'Estimation', zh: '估算纸牌', desc: 'توقعات وذكاء وتعاون في لعب الورق.', enDesc: 'Bids, strategy, and smart card play.', zhDesc: '叫牌、策略与纸牌技巧。', points: 0, available: false },
  { id: 'sequence', status: 'development', icon: '🔵', ar: 'سيكوانس', en: 'Sequence', zh: '连线棋', desc: 'كوّن صفوفًا من الرموز بخطة ذكية.', enDesc: 'Build sequences with thoughtful moves.', zhDesc: '通过巧妙行动连接成线。', points: 0, available: false },
  { id: '1024', status: 'ready', icon: '🔢', ar: '1024', en: '1024', zh: '1024 数字挑战', desc: 'ادمج الأرقام حتى تصل إلى 1024.', enDesc: 'Merge number tiles and reach 1024.', zhDesc: '合并数字方块，挑战 1024。', points: 10, available: true },
  { id: 'ludo', status: 'beta', icon: '🎲', ar: 'ليدو', en: 'Ludo', zh: '飞行棋', desc: 'حرّك أحجارك بالنرد ونافس العائلة حتى تصل إلى البيت.', enDesc: 'Roll the dice, race your tokens, and reach home before everyone else.', zhDesc: '掷骰子移动棋子，与家人比赛率先到家。', points: 0, available: true },
  { id: 'snakes-ladders', status: 'development', icon: '🐍', ar: 'السلم والثعبان', en: 'Snakes & Ladders', zh: '蛇梯棋', desc: 'مغامرة حظ لطيفة من أول المربعات حتى خط النهاية.', enDesc: 'A cheerful race from the first square to the finish.', zhDesc: '从起点到终点的趣味运气竞赛。', points: 0, available: false },
  { id: 'phase-challenge', status: 'development', icon: '🃏', ar: 'تحدي المراحل', en: 'Phase Challenge', zh: '阶段挑战', desc: 'اجمع مجموعات وتسلسلات وأنهِ المراحل واحدة وراء الأخرى.', enDesc: 'Build sets and runs to complete one phase after another.', zhDesc: '收集组合与顺子，逐步完成各个阶段。', points: 0, available: false },
  { id: 'family-quiz', status: 'development', icon: '🧠', ar: 'تحدي المعلومات', en: 'Family Quiz', zh: '家庭知识问答', desc: 'أسئلة ممتعة في الثقافة والعلوم والتاريخ والقيم.', enDesc: 'Fun questions about culture, science, history, and values.', zhDesc: '关于文化、科学、历史与价值观的趣味问答。', points: 0, available: false },
  { id: 'memory-match', status: 'development', icon: '🧩', ar: 'اختبار الذاكرة', en: 'Memory Match', zh: '记忆配对', desc: 'اكشف البطاقات واعثر على الأزواج المتطابقة.', enDesc: 'Flip cards and find matching pairs.', zhDesc: '翻开卡片，寻找相同的配对。', points: 0, available: false },
  { id: 'connect-four', status: 'development', icon: '🔴', ar: 'أربعة على التوالي', en: 'Connect Four', zh: '四子棋', desc: 'كوّن أربعة رموز متصلة قبل منافسك.', enDesc: 'Connect four pieces before your opponent does.', zhDesc: '在对手之前连成四枚棋子。', points: 0, available: false },
  { id: 'threex', status: 'beta', icon: '🌱', ar: 'ثلاثي الأثر 3X', en: 'Thimar 3X', zh: '三重影响力 3X', desc: 'ثلاثة مسارات للتخطيط والعمل النافع، ابدأ بتحدي البيت.', enDesc: 'Three paths for planning and meaningful action; start with the home challenge.', zhDesc: '三个规划与公益行动路径，从住宅挑战开始。', points: 0 },
  { id: 'apartment-100', status: 'beta', icon: '🏡', ar: 'تحدي الشقة 100 م²', en: '100 m² Apartment Challenge', zh: '100 平方米住宅挑战', desc: 'خطط تقسيم الشقة والأثاث والميزانية التقديرية.', enDesc: 'Plan apartment zones, furniture, and an initial budget.', zhDesc: '规划房间分区、家具与初步预算。', points: 0 }
];
const gallery = [
  { file: 'analyst-card.jpg', title: { ar: 'DATA ANALYST', en: 'DATA ANALYST', zh: '数据分析师' }, kind: { ar: 'دور مهني · بطاقة نموذجية', en: 'Role card · early concept', zh: '职业角色卡 · 初步概念' } },
  { file: 'thimmy-card.jpg', title: { ar: 'THIMMY · AI COMPANION', en: 'THIMMY · AI COMPANION', zh: 'THIMMY · AI 助手' }, kind: { ar: 'شخصية مساعدة · نموذج أولي', en: 'Helper character · prototype', zh: '辅助角色 · 原型' } },
  { file: 'baby-treasure-card.jpg', title: { ar: 'FAMILY EXPLORER', en: 'FAMILY EXPLORER', zh: '家庭探索者' }, kind: { ar: 'دور عائلي · بطاقة نموذجية', en: 'Family role · early concept', zh: '家庭角色卡 · 初步概念' } },
  { file: 'work-entity-card.jpg', title: { ar: 'PROJECT TEAM', en: 'PROJECT TEAM', zh: '项目团队' }, kind: { ar: 'بطاقة مشاركة في المشروعات', en: 'Project participation card', zh: '项目参与卡' } },
  { file: 'founder-vision-card.jpg', title: { ar: 'LEADERSHIP', en: 'LEADERSHIP', zh: '领导力' }, kind: { ar: 'بطاقة دور وقيادة · نموذج أولي', en: 'Leadership role · early concept', zh: '领导角色卡 · 初步概念' } },
  { file: 'data-insight-card.jpg', title: { ar: 'PERFORMANCE INSIGHTS', en: 'PERFORMANCE INSIGHTS', zh: '绩效洞察' }, kind: { ar: 'بطاقة مهارات ومؤشرات', en: 'Skills and KPI concept card', zh: '技能与 KPI 概念卡' } },
];
const copy = {
  ar: { dir: 'rtl', installHelp: 'لتثبيت التطبيق على Android: افتح قائمة Chrome ⋮ ثم اختر تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية. على iPhone: افتح الرابط في Safari ثم مشاركة ← إضافة إلى الشاشة الرئيسية.', tagline: 'عالمنا.. لمتنا.. ثمارنا', welcome: 'أهلاً بيكم في عالم الأسرة!', intro: 'مساحة عائلية آمنة تجمعنا على التعلم واللعب والعمل النافع.', login: 'دخول', signup: 'حساب جديد', email: 'البريد الإلكتروني', password: 'كلمة المرور', forgotPassword: 'نسيت كلمة المرور؟', resendConfirmation: 'إعادة إرسال تأكيد البريد', resetTitle: 'تعيين كلمة مرور جديدة', newPassword: 'كلمة المرور الجديدة', confirmPassword: 'تأكيد كلمة المرور', savePassword: 'حفظ كلمة المرور', passwordUpdated: 'تم تحديث كلمة المرور. يمكنك الدخول الآن.', resetSent: 'لو البريد مسجل عندنا، هيوصلك رابط آمن لإعادة تعيين كلمة المرور.', confirmationResent: 'لو الحساب محتاج تأكيد، هنبعت رسالة جديدة للبريد.', passwordMismatch: 'كلمتا المرور غير متطابقتين.', guardian: 'أقرّ أنني ولي أمر بالغ وسأشرف على استخدام الأطفال.', tryDemo: 'ادخل جرّب اللعبة', demoInfo: 'العب كضيف فورًا. التقدم تجريبي ولا يُحفظ.', demoLabel: 'عرض تجريبي', demoFamily: 'بدون حساب أو حفظ بيانات', submitLogin: 'تسجيل الدخول', submitSignup: 'إنشاء الحساب والبدء', checkEmail: 'راجع بريدك لتأكيد الحساب، ثم سجّل الدخول.', logout: 'تسجيل الخروج', home: 'الرئيسية', dashboard: 'لوحة إنجازاتي', profile: 'ملفي الشخصي', worlds: 'العوالم السبعة', play: 'الألعاب', entertainment: 'الترفيه والمسلسلات', characters: 'الشخصيات والبطاقات', guide: 'دليل اللعبة', threex: 'ثلاثي الأثر | 3X', points: 'نقاط FWP', explore: 'استكشف عالمًا', playNow: 'ابدأ اللعب', name: 'Family World – Thimar OSMAR', privacy: 'لا تدخل أسماء الأطفال أو بياناتهم الشخصية. هذه النسخة لا تعرض بيانات الأسرة للآخرين.', noBackend: 'التسجيل بالبريد غير مفعّل بعد.', charactersIntro: 'شخصيات وأدوار عامة بلا أسماء أشخاص؛ تتطور بطاقتك حسب دورك ومساهماتك وإنجازاتك.', char1: 'قائد الأسرة · مرشد الرحلة', char2: 'ثيمي · تميمة البهجة', char3: 'محللة البيانات · دليل التعلم', completed: 'أحسنت! أضيفت نقاط تجريبية لهذه الجلسة.', install: 'تثبيت التطبيق', artNote: 'دي نماذج مبدئية لأدوار وشخصيات عامة، مش بطاقات بأسماء أشخاص. محرر الـ Avatar والملابس والحجاب واللحية، وربط المستويات بمؤشرات الإنجاز والمشروعات، ما زال قيد التطوير.', mapCaption: 'خريطة المفاهيم والعوالم من ملف الأفكار', guideHint: 'افتح الدليل الثنائي اللغة', inviteCode: 'كود الدعوة أو التعارف', inviteRequired: 'أدخل كود دعوة صالحًا من شخص أو جهة معروفة للانضمام.', invalidInvite: 'كود الدعوة غير صالح أو منتهي أو تم استهلاك استخداماته. اطلب كودًا جديدًا من الإدارة.', emailRateLimited: 'تم إرسال رسائل التأكيد مؤخرًا. استنى شوية قبل إعادة الإرسال.', admin: 'إدارة OSMAR', inviteCreated: 'تم إنشاء كود الدعوة', pendingTitle: 'طلبات العضوية المعلّقة', createInvite: 'إنشاء كود دعوة', codeType: 'نوع الدعوة', uses: 'عدد الاستخدامات', sourceLabel: 'وصف المصدر (اختياري)', approve: 'اعتماد', reject: 'رفض', refresh: 'تحديث', noPending: 'لا توجد طلبات معلّقة.', copyCode: 'نسخ الكود', memberDirectory: 'سجل العضويات', registeredMembers: 'كل الأعضاء المسجلين', memberEmail: 'البريد الإلكتروني', memberNumber: 'رقم العضوية', memberStatus: 'الحالة', memberType: 'نوع الدعوة', invitedBy: 'بواسطة', registeredAt: 'تاريخ التسجيل', searchMembers: 'ابحث بالبريد أو رقم العضوية', noMembers: 'لا توجد عضويات مسجلة بعد.', autoRefresh: 'يتحدث تلقائيًا عند التسجيل، ويمكنك التحديث يدويًا.',
  },
  en: { dir: 'ltr', installHelp: 'On Android, open Chrome ⋮ and choose Install app or Add to Home screen. On iPhone, open this link in Safari, tap Share, then Add to Home Screen.', tagline: 'Our world. Our family. Our growth.', welcome: 'Welcome to Family World!', intro: 'A safe family space to learn, play, and do good together.', login: 'Log in', signup: 'Create account', email: 'Email', password: 'Password', forgotPassword: 'Forgot password?', resendConfirmation: 'Resend email confirmation', resetTitle: 'Set a new password', newPassword: 'New password', confirmPassword: 'Confirm password', savePassword: 'Save password', passwordUpdated: 'Password updated. You can continue.', resetSent: 'If this email has an account, a secure reset link will arrive shortly.', confirmationResent: 'If this account needs confirmation, a new email will be sent.', passwordMismatch: 'The passwords do not match.', guardian: 'I am an adult parent or guardian and will supervise children.', tryDemo: 'Play the demo', demoInfo: 'Play as a guest right away. Demo progress is not saved.', demoLabel: 'Demo preview', demoFamily: 'No account or saved data', submitLogin: 'Log in', submitSignup: 'Create account and start', checkEmail: 'Check your email to confirm your account, then log in.', logout: 'Log out', home: 'Home', dashboard: 'My Dashboard', profile: 'My Profile', worlds: 'Seven worlds', play: 'Games', entertainment: 'Entertainment & Series', characters: 'Characters & cards', guide: 'Game guide', threex: 'Thimar 3X', points: 'FWP points', explore: 'Explore a world', playNow: 'Start playing', name: 'Family World – Thimar OSMAR', privacy: 'Do not enter children’s names or personal details. This version does not share family data with others.', noBackend: 'Email registration is not active yet.', charactersIntro: 'Generic role and character concepts—never personal-name cards. Profiles will grow with verified roles, project contributions, and achievements.', char1: 'Family Mentor · Journey Guide', char2: 'Thimmy · Cheerful mascot', char3: 'Data Analyst · Learning guide', completed: 'Nice work! Demo points were added for this session.', install: 'Install app', artNote: 'These are generic role and character concepts, not cards named after people. Avatar/outfit customization and achievement-based progression are still in development.', mapCaption: 'World and concept map from the ideas file', guideHint: 'Open the bilingual guide', inviteCode: 'Invitation or referral code', inviteRequired: 'Enter a valid invitation code from a known member or organization.', invalidInvite: 'This invitation code is invalid, expired, revoked, or fully used. Please request a new code from the admin.', emailRateLimited: 'Confirmation emails were requested too recently. Please wait before trying again.', admin: 'OSMAR Admin', inviteCreated: 'Invitation code created', pendingTitle: 'Pending memberships', createInvite: 'Create invite code', codeType: 'Invite type', uses: 'Maximum uses', sourceLabel: 'Source label (optional)', approve: 'Approve', reject: 'Reject', refresh: 'Refresh', noPending: 'No pending requests.', copyCode: 'Copy code', memberDirectory: 'Member directory', registeredMembers: 'All registered members', memberEmail: 'Email', memberNumber: 'Member number', memberStatus: 'Status', memberType: 'Invitation type', invitedBy: 'Invited by', registeredAt: 'Registration date', searchMembers: 'Search by email or member number', noMembers: 'No registered members yet.', autoRefresh: 'Updates automatically when someone registers; you can also refresh manually.', },
  zh: { dir: 'ltr', installHelp: 'Android：打开 Chrome 菜单 ⋮，选择安装应用或添加到主屏幕。iPhone：在 Safari 中打开链接，点按分享，然后选择添加到主屏幕。', tagline: '我们的世界，我们的家庭，共同成长。', welcome: '欢迎来到 Family World！', intro: '一个安全的家庭空间，一起学习、游戏、行善。', login: '登录', signup: '创建账户', email: '电子邮箱', password: '密码', forgotPassword: '忘记密码？', resendConfirmation: '重新发送邮箱验证', resetTitle: '设置新密码', newPassword: '新密码', confirmPassword: '确认密码', savePassword: '保存密码', passwordUpdated: '密码已更新，可以继续使用。', resetSent: '如果该邮箱已注册，您将收到安全的密码重置链接。', confirmationResent: '如果账户需要验证，我们会重新发送验证邮件。', passwordMismatch: '两次输入的密码不一致。', guardian: '我是成年家长或监护人，并会监督儿童使用。', tryDemo: '体验游戏', demoInfo: '无需注册即可试玩。体验进度不会保存。', demoLabel: '体验预览', demoFamily: '无需账户，不保存数据', submitLogin: '登录', submitSignup: '创建账户并开始', checkEmail: '请先查看邮箱并确认账户，然后登录。', logout: '退出登录', home: '首页', dashboard: '我的数据', profile: '我的资料', worlds: '七大世界', play: '游戏', entertainment: '娱乐与动画', characters: '角色与卡牌', guide: '游戏指南', threex: 'Thimar 3X · 三重影响', points: 'FWP 积分', explore: '探索世界', playNow: '开始游戏', name: 'Family World – Thimar OSMAR', privacy: '请勿输入儿童姓名或个人资料。本版本不会向他人公开家庭数据。', noBackend: '邮箱注册尚未启用。', charactersIntro: '通用角色与卡牌概念，不使用个人姓名；资料将随角色、项目贡献和成就成长。', char1: '家庭引导者 · 旅程导师', char2: 'Thimmy · 快乐吉祥物', char3: '数据分析师 · 学习向导', completed: '做得好！本次体验已增加演示积分。', install: '安装应用', artNote: '这些是通用角色与卡牌概念，不使用个人姓名。头像、服装自定义及基于成就的成长系统仍在开发中。', mapCaption: '创意文件中的世界概念图', guideHint: '打开双语指南', inviteCode: '邀请或推荐代码', inviteRequired: '请输入来自已知成员或组织的有效邀请代码。', invalidInvite: '此邀请码无效、已过期、已撤销或已用完，请向管理员申请新代码。', emailRateLimited: '验证邮件请求过于频繁，请稍后再试。', admin: 'OSMAR 管理', inviteCreated: '邀请代码已创建', pendingTitle: '待审核会员', createInvite: '创建邀请代码', codeType: '邀请类型', uses: '最大使用次数', sourceLabel: '来源说明（可选）', approve: '批准', reject: '拒绝', refresh: '刷新', noPending: '暂无待审核申请。', copyCode: '复制代码', memberDirectory: '会员目录', registeredMembers: '所有已注册会员', memberEmail: '电子邮箱', memberNumber: '会员编号', memberStatus: '状态', memberType: '邀请类型', invitedBy: '邀请人', registeredAt: '注册日期', searchMembers: '按邮箱或会员编号搜索', noMembers: '暂无注册会员。', autoRefresh: '有人注册时自动更新，也可以手动刷新。', },
};

function translated(item, key, lang) {
  if (!key) return item[lang] || item.ar;
  if (key === 'Desc') return lang === 'en' ? item.enDesc : lang === 'zh' ? item.zhDesc : item.desc;
  return item[lang + key] || item[key];
}
export default function App() {
  const [lang, setLang] = useState('ar');
  const t = copy[lang];
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [guardian, setGuardian] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('home');
  const [points, setPoints] = useState(0);
  const [accountPoints, setAccountPoints] = useState({ total_points: 0, awards_count: 0 });
  const [done, setDone] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeWorld, setActiveWorld] = useState(null);
  const [authReady, setAuthReady] = useState(!configured);
  const [adminAccess, setAdminAccess] = useState({ is_owner: false, permissions: [] });
  const [installPrompt, setInstallPrompt] = useState(null);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isOwner = Boolean(adminAccess.is_owner);
  const adminPermissions = adminAccess.permissions || [];
  const isAdmin = isOwner || adminPermissions.length > 0;
  const can = permission => isOwner || adminPermissions.includes(permission);
  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setResendCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    document.documentElement.dir = t.dir;
  }, [lang, t.dir]);
  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, value) => { if (event === 'PASSWORD_RECOVERY') setMode('recovery'); setSession(value); });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    let alive = true;
    async function loadAdminAccess() {
      if (!session || session.user.id === 'demo' || !supabase) {
        setAdminAccess({ is_owner: false, permissions: [] });
        return;
      }
      const { data, error } = await supabase.rpc('osmar_my_admin_access');
      if (alive) setAdminAccess(!error && data ? {
        is_owner: Boolean(data.is_owner),
        permissions: Array.isArray(data.permissions) ? data.permissions : []
      } : { is_owner: false, permissions: [] });
    }
    loadAdminAccess();
    return () => { alive = false; };
  }, [session]);
  useEffect(() => {
    let alive = true;
    async function loadPoints() {
      if (!session || session.user.id === 'demo' || !supabase) {
        setAccountPoints({ total_points: 0, awards_count: 0 });
        return;
      }
      const { data, error } = await supabase.from('member_points_summary')
        .select('total_points,awards_count').eq('user_id', session.user.id).maybeSingle();
      if (alive && !error) setAccountPoints(data || { total_points: 0, awards_count: 0 });
    }
    loadPoints();
    return () => { alive = false; };
  }, [session]);
  useEffect(() => {
    const onInstall = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', onInstall);
    window.addEventListener('appinstalled', onInstalled);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch((error) => console.error('Family World service worker registration failed:', error));
    return () => { window.removeEventListener('beforeinstallprompt', onInstall); window.removeEventListener('appinstalled', onInstalled); };
  }, []);
  async function installApp() {
    if (!installPrompt) { setNotice(t.installHelp); return; }
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch (error) {
      console.error('Family World install prompt failed:', error);
      setNotice(t.installHelp);
    } finally { setInstallPrompt(null); }
  }
  function authRedirectUrl() { return window.location.href.split(/[?#]/)[0]; }
  async function requestPasswordReset() {
    if (!email.trim()) { setNotice(lang === 'ar' ? 'اكتب بريدك الإلكتروني الأول.' : lang === 'zh' ? '请先输入电子邮箱。' : 'Enter your email first.'); return; }
    setBusy(true); setNotice('');
    try { const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: authRedirectUrl() }); if (error) throw error; setNotice(t.resetSent); }
    catch (error) { setNotice(error.message || 'Please try again.'); }
    finally { setBusy(false); }
  }
  async function resendConfirmation() {
    if (!email.trim()) { setNotice(lang === 'ar' ? 'اكتب بريدك الإلكتروني الأول.' : lang === 'zh' ? '请先输入电子邮箱。' : 'Enter your email first.'); return; }
    if (resendCooldown > 0) return;
    setBusy(true); setNotice('');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: authRedirectUrl() } });
      if (error) {
        if (error?.code === 'over_email_send_rate_limit' || /rate limit/i.test(error?.message || '')) { try { await supabase.rpc('osmar_record_registration_attempt', { p_email: email.trim(), p_reason: 'confirmation_email_rate_limited' }); } catch {} }
        throw error;
      }
      setNotice(t.confirmationResent);
    } catch (error) {
      const rateLimited = error?.code === 'over_email_send_rate_limit' || /rate limit/i.test(error?.message || '');
      setNotice(rateLimited ? t.emailRateLimited : (error.message || 'Please try again.'));
    } finally { setResendCooldown(60); setBusy(false); }
  }
  async function saveRecoveredPassword(event) {
    event.preventDefault(); setNotice('');
    if (newPassword.length < 8) { setNotice(lang === 'ar' ? 'كلمة المرور لازم تكون 8 أحرف على الأقل.' : lang === 'zh' ? '密码至少需要 8 个字符。' : 'Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setNotice(t.passwordMismatch); return; }
    setBusy(true);
    try { const { error } = await supabase.auth.updateUser({ password: newPassword }); if (error) throw error; setPassword(''); setNewPassword(''); setConfirmPassword(''); setMode('login'); setNotice(t.passwordUpdated); }
    catch (error) { setNotice(error.message || 'Please try again.'); }
    finally { setBusy(false); }
  }
  async function auth(event) {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      if (!configured) { setNotice(t.noBackend); return; }
      if (mode === 'signup') {
        if (!guardian) { setNotice(t.guardian); return; }
        const normalizedInvite = inviteCode.trim().toUpperCase();
        let acceptedInvite = null;
        let inviteWarning = '';
        if (normalizedInvite) {
          const { data: inviteCheck, error: inviteCheckError } = await supabase.rpc('osmar_validate_invite_code', { p_code: normalizedInvite });
          if (!inviteCheckError && inviteCheck?.[0]?.is_valid) acceptedInvite = normalizedInvite;
          else {
            inviteWarning = lang==='ar' ? 'الكود غير صالح أو انتهت دعواته؛ تم تسجيلك بدون ربط دعوة، والإدارة ستراجع المحاولة.' : lang==='zh' ? '邀请码无效或已用完；账户将继续创建，不关联邀请，管理员可查看此记录。' : 'That code is invalid or full; your account will still be created without an invite link, and the admin can review the attempt.';
            try { await supabase.rpc('osmar_record_registration_attempt', { p_email: email.trim(), p_code_hint: normalizedInvite, p_reason: inviteCheckError ? 'invite_check_unavailable' : 'invalid_or_full_invite' }); } catch {}
          }
        }
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { guardian_attested: true, invite_code: acceptedInvite }, emailRedirectTo: authRedirectUrl() } });
        if (error) { try { await supabase.rpc('osmar_record_registration_attempt', { p_email: email.trim(), p_code_hint: normalizedInvite || null, p_reason: 'signup_failed' }); } catch {} throw error; }
        setNotice(inviteWarning || (!data.session ? t.checkEmail : (lang==='ar'?'تم إنشاء الحساب بنجاح.':'Account created successfully.')));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) {
      const inviteFailure = /invitation code is invalid|invitation source is not valid/i.test(error?.message || '');
      setNotice(inviteFailure ? t.invalidInvite : (error.message || 'Please try again.'));
    } finally { setBusy(false); }
  }
  async function logout() { await supabase?.auth.signOut(); setSession(null); setPoints(0); setDone([]); }
  async function recordGameResult(result) {
    if (!supabase || !session || session.user.id === 'demo') return;
    const { error } = await supabase.from('game_sessions').insert({
      session_key: result.sessionKey,
      user_id: session.user.id,
      game_id: result.gameId,
      outcome: result.outcome,
      score: Math.max(0, Math.round(result.score || 0)),
      duration_seconds: Math.max(0, Math.round(result.durationSeconds || 0)),
      record_source: 'local_practice_self_reported'
    });
    if (error && error.code !== '23505') setNotice(lang === 'ar' ? 'تعذر حفظ نتيجة المباراة: ' + error.message : 'Could not save game result: ' + error.message);
  }
  function completeGame(game) { if (game.status === 'development' || game.available === false) return; if (game.id === 'threex') { setTab('threex'); setNotice(''); return; } if (game.id === 'apartment-100') { setTab('threex'); setNotice(''); window.setTimeout(() => document.getElementById('threex-studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120); return; } if (game.id === 'domino') { setTab('domino'); setNotice(''); return; } if (game.id === 'candy-thimar') { setTab('candy-thimar'); setNotice(''); return; } if (game.id === '1024') { setTab('1024'); setNotice(''); return; } if (game.id === 'ludo') { setTab('ludo'); setNotice(''); return; } setPoints(value => value + game.points); setDone(value => [...value, game.id]); setNotice(t.completed); }
  const nav = useMemo(() => [['home', t.home, Home], ['dashboard', t.dashboard, BarChart3], ['profile', t.profile, UserRound], ['worlds', t.worlds, Globe2], ['garden', lang === 'ar' ? 'حديقة الثمار' : lang === 'zh' ? 'Thimar 花园' : 'Thimar Garden', Sprout], ['threex', t.threex, MapIcon], ['play', t.play, Gamepad2], ['entertainment', t.entertainment, Clapperboard], ['characters', t.characters, Users], ['guide', t.guide, BookOpen], ...(isAdmin ? [['admin', t.admin, ClipboardList]] : [])], [t, isAdmin, lang]);
  if (!authReady) return <div className="auth-page"><header className="auth-head"><Brand /><Language lang={lang} setLang={setLang} /></header><p className="auth-card" role="status">…</p></div>;
  if (mode === 'recovery') return <div className="auth-page"><header className="auth-head"><Brand /><Language lang={lang} setLang={setLang} /></header><form className="auth-card" onSubmit={saveRecoveredPassword}><span className="mark">🔐</span><p className="eyebrow">THIMAR OSMAR</p><h1>{t.resetTitle}</h1><label>{t.newPassword}<input type="password" autoComplete="new-password" minLength="8" required value={newPassword} onChange={e=>setNewPassword(e.target.value)} /></label><label>{t.confirmPassword}<input type="password" autoComplete="new-password" minLength="8" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} /></label><button className="primary wide" disabled={busy}>{busy?'…':t.savePassword}</button>{notice&&<p className="notice" role="status">{notice}</p>}</form><footer>{t.name} © 2026</footer></div>;
  if (!session) return <div className="auth-page"><header className="auth-head"><Brand /><div className="auth-actions">{!isStandalone && <button className="install-button" type="button" onClick={installApp}>{t.install}</button>}<Language lang={lang} setLang={setLang} /></div></header><form className="auth-card" onSubmit={auth}>
    <span className="mark">🌱</span><p className="eyebrow">THIMAR OSMAR PRESENTS</p><h1>{t.welcome}</h1><p>{t.intro}</p>
    <div className="auth-tabs"><button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => setMode('login')}>{t.login}</button><button type="button" className={mode === 'signup' ? 'selected' : ''} onClick={() => setMode('signup')}>{t.signup}</button></div>
    <label>{t.email}<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label>{t.password}<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="8" required value={password} onChange={e => setPassword(e.target.value)} /></label>
    {mode === 'signup' && <label>{t.inviteCode} <small>{lang==='ar'?'(اختياري)':'(optional)'}</small><input type="text" autoComplete="off" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} maxLength="40" /></label>}
    {mode === 'login' && <button className="auth-text-button" type="button" disabled={busy} onClick={requestPasswordReset}>{t.forgotPassword}</button>}
    {mode === 'signup' && <label className="guardian-check"><input type="checkbox" required checked={guardian} onChange={e => setGuardian(e.target.checked)} />{t.guardian}</label>}
    <button className="primary wide" disabled={busy}>{busy ? '…' : mode === 'login' ? t.submitLogin : t.submitSignup}</button>
    {mode === 'login' && <button className="auth-text-button" type="button" disabled={busy || resendCooldown > 0} onClick={resendConfirmation}>{t.resendConfirmation}{resendCooldown > 0 ? ` (${resendCooldown}s)` : ''}</button>}
    <button className="demo-button" type="button" onClick={() => setSession({ user: { id: 'demo' } })}>{t.tryDemo}</button><p className="demo-info">{t.demoInfo}</p>{!configured && <p className="notice">{t.noBackend}</p>}{notice && <p className="notice" role="status">{notice}</p>}
    <p className="privacy"><ShieldCheck size={16} />{t.privacy}</p>
  </form><footer>{t.name} © 2026</footer></div>;
  return <div className={`layout ${t.dir}`}><aside className={`sidebar ${mobileOpen ? 'show' : ''}`}><div className="brand-row"><Brand /><button className="icon-btn close-btn" onClick={() => setMobileOpen(false)} aria-label="Close"><X /></button></div><div className="family-badge">🌿 <span><b>{session.user.id === 'demo' ? t.demoLabel : lang === 'en' ? 'Your family space' : lang === 'zh' ? '你的家庭空间' : 'مساحة أسرتكم'}</b><small>{session.user.id === 'demo' ? t.demoFamily : lang === 'en' ? 'Private to your account' : lang === 'zh' ? '仅你的账户可见' : 'خاصة بحسابك'}</small></span></div><nav>{nav.map(([id, label, Icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setActiveWorld(null); setMobileOpen(false); }}><Icon size={19} />{label}<ChevronLeft size={16} /></button>)}</nav><div className="sidebar-bottom"><p>﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾<small>المائدة: ٢</small></p><button className="logout" onClick={logout}><LogOut size={16} />{t.logout}</button></div></aside>
    {mobileOpen && <button className="scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
    <main><header className="topbar"><button className="icon-btn menu-btn" onClick={() => setMobileOpen(true)} aria-label="Menu"><Menu /></button><div className="page-title"><small>{t.tagline}</small><h2>{tab === 'threex-guide' ? (lang === 'ar' ? 'دليل ثلاثي الأثر' : lang === 'zh' ? '3X 游戏指南' : '3X Play Guide') : nav.find(item => item[0] === tab)?.[1]}</h2></div><span className="points"><Star size={16} />{session.user.id === 'demo' ? points : accountPoints.total_points} {t.points}</span>{!isStandalone && <button className="install-button" type="button" onClick={installApp}>{t.install}</button>}<Language lang={lang} setLang={setLang} /></header>
      {notice && <button className="notice" onClick={() => setNotice('')} role="status">{notice}　×</button>}
    {tab === 'home' && <>{session.user.id === 'demo' && <p className="notice">{t.demoInfo}</p>}<WorldHub lang={lang} points={session.user.id==='demo'?points:accountPoints.total_points} awards={session.user.id==='demo'?done.length:accountPoints.awards_count} onNavigate={next => { setTab(next); setActiveWorld(null); }} onChallenge={() => setTab('threex')} /></>}
      {tab === 'worlds' && <>{activeWorld ? <><button className="back" onClick={() => setActiveWorld(null)}>‹ {t.worlds}</button><WorldDetail lang={lang} world={worlds.find(w => w.id === activeWorld)} onPlay={() => setTab('play')} /></> : <><section className="section"><small>OUR FAMILY JOURNEY</small><h2>{t.worlds}</h2></section><figure className="concept-map"><img src={`${import.meta.env.BASE_URL}assets/ideas/world-map.jpg`} alt={t.mapCaption} /><figcaption>{t.mapCaption}</figcaption></figure><WorldGrid lang={lang} worlds={worlds} onSelect={setActiveWorld} /></>}</>}
      {tab === 'play' && <><section className="section"><small>FAMILY FUN</small><h2>{t.play}</h2></section><p className="muted">{t.privacy}</p><GameGrid lang={lang} items={games} done={done} onPlay={completeGame} /></>}
      {tab === 'garden' && <ThimarGarden lang={lang} userId={session.user.id} />}
      {tab === 'entertainment' && <EntertainmentHub lang={lang} />}
      {tab === 'threex' && <><ThreeXExperience lang={lang} onGuide={() => setTab('threex-guide')} onStart={() => document.getElementById('threex-studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} /><div id="threex-studio"><ThreeXChallengeStudio supabase={supabase} user={session.user} lang={lang} isAdmin={isOwner || can('rewards.review')} /></div></>}
      {tab === 'threex-guide' && <><button className="back" onClick={() => setTab('threex')}>‹ {lang === 'ar' ? 'العودة إلى ثلاثي الأثر' : lang === 'zh' ? '返回 3X' : 'Back to Thimar 3X'}</button><ThreeXGuide lang={lang} /></>}
      {tab === 'dashboard' && <MemberDashboard supabase={supabase} userId={session.user.id} lang={lang} />}
      {tab === 'profile' && <MemberProfile supabase={supabase} user={session.user} lang={lang} />}
       {tab === 'domino' && <DominoGame lang={lang} onBack={() => setTab('play')} onOnline={() => setTab('domino-online')} onResult={recordGameResult} />}
      {tab === 'candy-thimar' && <CandyThimar lang={lang} onBack={() => setTab('play')} onResult={recordGameResult} />}
      {tab === '1024' && <Number1024Game lang={lang} onBack={() => setTab('play')} onResult={recordGameResult} />}
      {tab === 'ludo' && <LudoGame lang={lang} onBack={() => setTab('play')} onResult={recordGameResult} />}
      {tab === 'domino-online' && <DominoOnlineLobby supabase={supabase} userId={session.user.id} lang={lang} onBack={() => setTab('domino')} />}
      {tab === 'characters' && <CharacterStudio lang={lang} points={Math.max(0, Number(session.user.id === 'demo' ? points : accountPoints.total_points) || 0)} level={Math.floor(Math.max(0, Number(session.user.id === 'demo' ? points : accountPoints.total_points) || 0) / 100) + 1} />}
      {tab === 'admin' && isAdmin && <OSMARAdmin supabase={supabase} lang={lang} isOwner={isOwner} permissions={adminPermissions} />}
      {tab === 'guide' && <section className="guide-download"><BookOpen size={38} /><h1>{t.guide}</h1><p className="muted">{t.guideHint}</p><a className="primary guide-link" href={`${import.meta.env.BASE_URL}OG01-Game-Guide-AR-EN.pdf`} target="_blank" rel="noreferrer">{lang === 'ar' ? 'فتح دليل اللعبة PDF' : lang === 'zh' ? '打开 PDF 游戏指南' : 'Open the PDF game guide'}</a></section>}
      <footer>{t.name} © 2026</footer></main></div>;
}

function Brand() { return <div className="brand"><span className="brand-mark"><Sprout size={22} /></span><span><b>Family World</b><small>THIMAR OSMAR</small></span></div>; }
function Language({ lang, setLang }) { return <select className="language" value={lang} onChange={event => setLang(event.target.value)} aria-label="Language"><option value="ar">العربية</option><option value="en">English</option><option value="zh">简体中文</option></select>; }
function WorldGrid({ lang, worlds: list }) { const status={ar:'قيد التطوير',en:'In development',zh:'开发中'}; return <div className="world-grid">{list.map(world => <article className="world-card world-coming" key={world.id}><span>{world.icon}</span><h3>{translated(world, '', lang)}</h3><p>{translated(world, 'Desc', lang)}</p><b>{status[lang]}</b></article>)}</div>; }
function GameGrid({ lang, items, done, onPlay }) { const labels={ready:{ar:'متاحة للتجربة',en:'Playable',zh:'可体验'},beta:{ar:'نسخة تجريبية',en:'Beta',zh:'测试版'},development:{ar:'قيد التطوير',en:'In development',zh:'开发中'}}; const ordered=[...items].sort((a,b)=>({ready:0,beta:1,development:2}[a.status|| (a.available===false?'development':'ready')]-({ready:0,beta:1,development:2}[b.status|| (b.available===false?'development':'ready')]))); return <div className="game-grid">{ordered.map(game => {const status=game.status||(game.available===false?'development':'ready');const disabled=status==='development'||game.available===false;return <article className={'game-card '+(disabled?'game-coming':'')} key={game.id}><span className="game-icon">{game.icon}</span><span className="score">{labels[status][lang]}</span><h3>{translated(game, '', lang)}</h3><p>{translated(game, 'Desc', lang)}</p><button disabled={disabled} onClick={() => onPlay(game)}>{disabled?labels[status][lang]:done.includes(game.id) ? copy[lang].completed : copy[lang].playNow}</button></article>})}</div>; }
function WorldDetail({ lang, world, onPlay }) { return <section className="world-detail"><span>{world.icon}</span><h1>{translated(world, '', lang)}</h1><p>{translated(world, 'Desc', lang)}</p><button className="primary" onClick={onPlay}>{copy[lang].playNow}</button></section>; }

const displayMemberNumber = value => { const match = String(value || '').match(/(\d+)$/); return match ? String(Number(match[1])) : '—'; };

function OSMARAdmin({ supabase, lang, isOwner = false, permissions = [] }) {
  const t = copy[lang];
  const [type, setType] = useState('TRU');
  const [uses, setUses] = useState(1);
  const [source, setSource] = useState('');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [inviteDirectory, setInviteDirectory] = useState([]);
  const [registrationAttempts, setRegistrationAttempts] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editType, setEditType] = useState('TRU');
  const [showPermissions, setShowPermissions] = useState(false);
  const can = permission => isOwner || permissions.includes(permission);
  const label = (ar, en, zh) => lang === 'ar' ? ar : lang === 'zh' ? zh : en;
  function startMemberEdit(item) {
    setEditingMember(item.member_id);
    setEditName(item.display_name || '');
    setEditNickname(item.nickname || '');
    setEditType(item.member_type || 'TRU');
  }
  async function saveMemberEdit(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const { error } = await supabase.rpc('osmar_update_member_profile', {
        p_member_id: editingMember, p_display_name: editName,
        p_nickname: editNickname, p_member_type: editType
      });
      if (error) throw error;
      setEditingMember(null);
      setMessage(label('تم تحديث بيانات العضو وتسجيل التعديل في سجل المراجعة.','Member profile updated and audit event recorded.','会员资料已更新并记录审计事件。'));
      await refresh();
    } catch (error) { setMessage(error?.message || 'Could not update this member.'); }
    finally { setBusy(false); }
  }

  async function refresh() {
    setBusy(true);
    setMessage('');
    try {
      const requests = [
        supabase.rpc('osmar_pending_members'),
        supabase.rpc('osmar_member_directory_v2'),
        supabase.rpc('osmar_invite_directory')
      ];
      if (isOwner) requests.push(
        supabase.rpc('osmar_points_directory'),
        supabase.rpc('osmar_game_directory'),
        supabase.rpc('osmar_recent_registrations', { p_limit: 30 }),
        supabase.rpc('osmar_registration_attempts', { p_limit: 100 })
      );
      const results = await Promise.all(requests);
      const [pendingResult, memberResult, inviteResult, pointsResult, gamesResult, recentResult, attemptResult] = results;
      const firstError = pendingResult.error || memberResult.error || inviteResult.error ||
        (isOwner && (pointsResult?.error || gamesResult?.error || recentResult?.error || attemptResult?.error));
      if (firstError) setMessage(firstError.message || 'Could not load the member directory.');
      if (!pendingResult.error) setPending(pendingResult.data || []);
      if (!inviteResult.error) setInviteDirectory(inviteResult.data || []);
      if (isOwner) {
        if (!recentResult?.error) setRecentRegistrations(recentResult?.data || []);
        if (!attemptResult?.error) setRegistrationAttempts(attemptResult?.data || []);
      }
      if (!memberResult.error) {
        const pointsByMember = new Map((pointsResult?.data || []).map(item => [item.member_id, item]));
        const gamesByMember = new Map((gamesResult?.data || []).map(item => [item.member_id, item]));
        setMembers((memberResult.data || []).map(item => ({
          ...item,
          total_points: pointsByMember.get(item.member_id)?.total_points || 0,
          awards_count: pointsByMember.get(item.member_id)?.awards_count || 0,
          games_played: gamesByMember.get(item.member_id)?.games_played || 0,
          game_wins: gamesByMember.get(item.member_id)?.wins || 0,
          game_losses: gamesByMember.get(item.member_id)?.losses || 0,
          game_draws: gamesByMember.get(item.member_id)?.draws || 0
        })));
      }
    } catch (error) {
      setMessage(error?.message || 'Could not connect to the membership service. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel('osmar-member-directory')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => refresh())
      .subscribe();
    const refreshTimer = window.setInterval(refresh, 45000);
    return () => {
      window.clearInterval(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [supabase, isOwner]);

  async function createInvite(event) {
    event.preventDefault();
    const maxUses = Number(uses);
    if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 500) {
      setMessage(lang === 'ar' ? 'عدد الاستخدامات لازم يكون من 1 إلى 500.' : lang === 'zh' ? '使用次数必须在 1 到 500 之间。' : 'Uses must be between 1 and 500.');
      return;
    }
    setBusy(true); setMessage(''); setCode('');
    try {
      const { data, error } = await supabase.rpc('osmar_create_invite', {
        p_code_type: type, p_source_label: source.trim() || null, p_max_uses: maxUses, p_expires_at: null
      });
      if (error) throw error;
      const generatedCode = data?.[0]?.invite_code;
      if (!generatedCode) throw new Error('The invitation service returned no code. Refresh and try again.');
      setCode(generatedCode);
      setMessage(t.inviteCreated);
    } catch (error) {
      setMessage(error?.message || 'Could not create the invitation. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function copyInviteCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setMessage(lang === 'ar' ? 'تم نسخ كود الدعوة.' : lang === 'zh' ? '邀请码已复制。' : 'Invitation code copied.');
    } catch {
      setMessage(lang === 'ar' ? 'النسخ غير متاح في المتصفح. انسخ الكود الظاهر يدويًا.' : lang === 'zh' ? '浏览器无法复制，请手动复制显示的邀请码。' : 'Clipboard access is unavailable. Copy the visible code manually.');
    }
  }

  async function review(memberId, decision) {
    setBusy(true); setMessage('');
    try {
      const { error } = await supabase.rpc('osmar_review_member', { p_member_id: memberId, p_decision: decision });
      if (error) throw error;
      await refresh();
    } catch (error) {
      setMessage(error?.message || 'Could not update this membership. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const counts = {
    active: members.filter(item => item.membership_status === 'active').length,
    pending: members.filter(item => item.membership_status === 'pending').length,
    suspended: members.filter(item => item.membership_status === 'suspended' || item.membership_status === 'rejected').length,
    trusted: members.filter(item => item.member_type === 'TRU').length,
  };
  const filteredMembers = members.filter(item => {
    const matchesSearch = (item.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.member_code || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = memberFilter === 'all' || (memberFilter === 'suspended'
      ? ['suspended','rejected'].includes(item.membership_status)
      : ['TRU','FAM','NET','OSM','TEAM'].includes(memberFilter) ? item.member_type === memberFilter : item.membership_status === memberFilter);
    return matchesSearch && matchesFilter;
  });

  return <div className="admin-page">
    <section className="section admin-console-hero"><small>OSMAR ECOSYSTEMS · CONTROL CENTER</small><h2>{t.admin}</h2><p className="muted">{label('مركز التحكم في المجتمع والعضويات والدعوات ونشاط عالم الأسرة.','Your command center for community, memberships, invitations and Family World activity.','管理社区、会员、邀请与家庭世界活动的控制中心。')}</p><div className="admin-hero-meta"><span><i/> {label('قاعدة البيانات متصلة','Database connected','数据库已连接')}</span><span>{label('تحديث مباشر عند الطلب','Live refresh on demand','可按需实时刷新')}</span><span>{label('ثلاث لغات','Arabic · English · Chinese','阿拉伯语 · 英语 · 中文')}</span></div></section>
    <section className="admin-overview">
      <div className="admin-overview-head"><div><small>{label('نظرة عامة','EXECUTIVE OVERVIEW','概览')}</small><h3>{label('صحة المجتمع والعضويات','Community health & membership pulse','社区与会员状态')}</h3></div><button type="button" onClick={refresh} disabled={busy}>{busy ? '…' : t.refresh}</button></div>
      <div className="admin-overview-grid">
        <article className="admin-overview-card"><span className="admin-overview-icon">♙</span><small>{label('إجمالي الأعضاء','Total members','会员总数')}</small><strong>{members.length}</strong><em>{label('ملف عضوية','member profiles','会员资料')}</em></article>
        <article className="admin-overview-card"><span className="admin-overview-icon">✓</span><small>{label('عضويات نشطة','Active memberships','活跃会员')}</small><strong>{counts.active}</strong><em>{label('جاهزة للاستخدام','ready to use','可正常使用')}</em></article>
        <article className="admin-overview-card"><span className="admin-overview-icon">◷</span><small>{label('بانتظار المراجعة','Awaiting approval','等待审核')}</small><strong>{pending.length}</strong><em>{label('طلبات تحتاج قرارًا','requests need a decision','需要处理的申请')}</em></article>
        <article className="admin-overview-card"><span className="admin-overview-icon">✉</span><small>{label('تأكيد البريد مطلوب','Email confirmation needed','需要验证邮箱')}</small><strong>{recentRegistrations.filter(item=>!item.email_confirmed).length}</strong><em>{label('من آخر 30 يومًا','in the last 30 days','最近 30 天')}</em></article>
        <article className="admin-overview-card"><span className="admin-overview-icon">⌁</span><small>{label('تسجيلات آخر 30 يومًا','Signups · last 30 days','近 30 天注册')}</small><strong>{recentRegistrations.length}</strong><em>{label('سجل التسجيلات','registration records','注册记录')}</em></article>
        <article className="admin-overview-card"><span className="admin-overview-icon">⚑</span><small>{label('محاولات تحتاج متابعة','Attempts to review','需要跟进的尝试')}</small><strong>{registrationAttempts.length}</strong><em>{label('أخطاء التسجيل المسجلة','recorded signup issues','已记录的注册问题')}</em></article>
      </div>
      <div className="admin-integrity-strip"><span className="admin-integrity-mark">✓</span><div><strong>{label('سلامة ربط العضويات','Membership record integrity','会员记录完整性')}</strong><p>{label('آخر فحص مباشر: ','Last live directory check: ','最近一次实时检查：')}{members.length}{label(' ملف عضوية ظاهرًا في السجل.',' membership profiles currently visible in the directory.',' 份会员资料显示在目录中。')}</p></div><span className="admin-integrity-count">{label('0 حسابات ناقصة','0 missing profiles','0 个缺失资料')}</span></div>
    </section>
    <form className="admin-panel admin-invite" onSubmit={createInvite}>
      <h3>{t.createInvite}</h3>
      <label>{t.codeType}<select value={type} onChange={e=>setType(e.target.value)}>{['TRU','FAM','NET','TEAM','OSM'].map(v=><option key={v}>{v}</option>)}</select></label>
      <label>{t.uses}<input type="number" min="1" max="500" value={uses} onChange={e=>setUses(e.target.value)} /></label>
      <label>{t.sourceLabel}<input value={source} onChange={e=>setSource(e.target.value)} maxLength="120" /></label>
      <button className="primary" disabled={busy}>{busy ? '…' : t.createInvite}</button>
      {code && <div className="generated-code"><strong>{code}</strong><button type="button" onClick={copyInviteCode}><Copy size={15}/>{t.copyCode}</button></div>}
    </form>

    <section className="admin-panel member-directory">
      <div className="admin-heading"><div><h3>{t.memberDirectory}</h3><p className="muted">{t.autoRefresh}</p></div><button type="button" onClick={refresh} disabled={busy}>{t.refresh}</button></div>
      <div className="directory-metrics">
        <div><strong>{members.length}</strong><span>{lang==='ar'?'إجمالي الأعضاء':lang==='zh'?'会员总数':'Total members'}</span></div>
        <div><strong>{counts.active}</strong><span>{lang==='ar'?'نشط':lang==='zh'?'活跃':'Active'}</span></div>
        <div><strong>{counts.pending}</strong><span>{lang==='ar'?'معلّق':lang==='zh'?'待审核':'Pending'}</span></div>
        <div><strong>{counts.trusted}</strong><span>TRU</span></div>
        <div><strong>{members.reduce((n,m)=>n+Number(m.games_played||0),0)}</strong><span>{lang==='ar'?'مباريات مسجلة':'Games played'}</span></div>
        <div><strong>{members.reduce((n,m)=>n+Number(m.game_wins||0),0)}</strong><span>{lang==='ar'?'انتصارات':'Wins'}</span></div>
      </div>
      <input className="member-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchMembers} />
      <div className="member-filters">
        {[['all',lang==='ar'?'الكل':lang==='zh'?'全部':'All'],['active',lang==='ar'?'نشط':lang==='zh'?'活跃':'Active'],['pending',lang==='ar'?'معلّق':lang==='zh'?'待审核':'Pending'],['TRU','TRU'],['FAM','FAM'],['NET','NET'],['OSM','OSM'],['TEAM','TEAM'],['suspended',lang==='ar'?'موقوف':lang==='zh'?'已暂停':'Paused']].map(([value,label])=><button type="button" key={value} className={memberFilter===value?'selected':''} onClick={()=>setMemberFilter(value)}>{label}</button>)}
      </div>
      {filteredMembers.length === 0 ? <p className="muted">{t.noMembers}</p> : <div className="member-list">
        {filteredMembers.map(item => <article className="member-row" key={item.member_id}>
          <div className="member-main">
            <strong>{item.member_code ? Number(String(item.member_code).match(/(\d+)$/)?.[1] || 0) || '—' : '—'}</strong>
            <span>{item.email || '—'}</span>
            <small>{t.registeredAt}: {item.registered_at ? new Date(item.registered_at).toLocaleString(lang === 'ar' ? 'ar-EG' : lang === 'zh' ? 'zh-CN' : 'en-US') : '—'}</small>
          </div>
          <div className="member-tags">
            <span className={item.membership_status === 'active' ? 'member-status active' : 'member-status'}>{item.membership_status}</span>
            <span className="member-type">{item.member_type || item.referral_type || '—'}</span>
          </div>
          <small className="member-inviter">{t.invitedBy}: {item.inviter_email || (item.referral_type === 'OSM' ? 'OSMAR' : '—')}</small>
          <small className="member-contact">{label('الاسم: ','Name: ','姓名：')}{item.display_name || '—'} · {label('اللقب: ','Nickname: ','昵称：')}{item.nickname || '—'} · {label('الهاتف: ','Phone: ','电话：')}{item.phone || '—'}</small>
          {can('members.edit') && <button type="button" className="member-edit-trigger" onClick={()=>startMemberEdit(item)}>{label('تعديل بيانات العضو','Edit member','编辑会员')}</button>}
          {can('members.edit') && editingMember === item.member_id && <form className="member-edit-form" onSubmit={saveMemberEdit}>
            <label>{label('الاسم الظاهر','Display name','显示名称')}<input value={editName} onChange={e=>setEditName(e.target.value)} maxLength={80}/></label>
            <label>{label('اللقب','Nickname','昵称')}<input value={editNickname} onChange={e=>setEditNickname(e.target.value)} maxLength={50}/></label>
            <label>{label('تصنيف العضوية','Member type','会员类型')}<select value={editType} onChange={e=>setEditType(e.target.value)}>{['TRU','FAM','NET','OSM','TEAM'].map(v=><option key={v}>{v}</option>)}</select></label>
            <div><button type="submit" disabled={busy}>{label('حفظ','Save','保存')}</button><button type="button" disabled={busy} onClick={()=>setEditingMember(null)}>{label('إلغاء','Cancel','取消')}</button></div>
          </form>}
          {isOwner && <><small className="member-points">{lang==='ar'?'نقاط الخبرة':'XP'}: <strong>{item.total_points || 0}</strong> · {lang==='ar'?'الإنجازات':'Awards'}: {item.awards_count || 0}</small>
          <small className="member-game-stats">{lang==='ar'?'المباريات':'Games'}: <b>{item.games_played||0}</b> · {lang==='ar'?'فوز':'Wins'}: <b>{item.game_wins||0}</b> · {lang==='ar'?'خسارة':'Losses'}: <b>{item.game_losses||0}</b> · {lang==='ar'?'تعادل':'Draws'}: <b>{item.game_draws||0}</b></small></>}
        </article>)}
      </div>}
    </section>

    <section className="admin-panel">
      <div className="admin-heading"><h3>{t.pendingTitle}</h3><button type="button" onClick={refresh} disabled={busy}>{t.refresh}</button></div>
      {message && <p className="notice" role="status">{message}</p>}
      {pending.length === 0 ? <p className="muted">{label('لا توجد طلبات اعتماد معلّقة حاليًا. راجع سجل التسجيلات الحديثة للتأكد من حالة كل حساب.','There are no pending approvals right now. Check recent registrations for each account status.','目前没有待审核申请。请查看最近注册记录以确认每个账户的状态。')}</p> : pending.map(item=><article className="pending-row" key={item.member_id}>
        <div><strong>{displayMemberNumber(item.member_code)}</strong><small>{item.referral_type} · {item.inviter_member_code ? displayMemberNumber(item.inviter_member_code) : 'OSMAR'}</small></div>
        <div className="pending-actions"><button disabled={busy} onClick={()=>review(item.member_id,'approved')}>{t.approve}</button><button disabled={busy} onClick={()=>review(item.member_id,'rejected')}>{t.reject}</button></div>
      </article>)}
    </section>
    {isOwner && <details className="admin-collapsible"><summary>{label('التسجيلات الحديثة','Recent registrations','最近注册')} · {recentRegistrations.length}</summary>
    <section className="admin-panel recent-registrations">
      <div className="admin-heading"><div><h3>{label('التسجيلات الحديثة · آخر 30 يومًا','Recent registrations · last 30 days','最近注册 · 过去 30 天')}</h3><p className="muted">{label('السجل ده بيعرض المسجلين حتى لو اتعمدوا بالفعل أو لسه محتاجين تأكيد البريد.','Includes members already approved and accounts still awaiting email confirmation.','包括已批准的会员以及仍待邮箱验证的账户。')}</p></div><button type="button" onClick={refresh} disabled={busy}>{t.refresh}</button></div>
      <div className="directory-metrics">
        <div><strong>{recentRegistrations.length}</strong><span>{label('تسجيل حديث','Recent signups','近期注册')}</span></div>
        <div><strong>{recentRegistrations.filter(item=>item.membership_status==='pending' && item.email_confirmed).length}</strong><span>{label('بانتظار اعتماد OSMAR','Awaiting OSMAR approval','等待 OSMAR 审核')}</span></div>
        <div><strong>{recentRegistrations.filter(item=>!item.email_confirmed).length}</strong><span>{label('بانتظار تأكيد البريد','Awaiting email confirmation','等待邮箱验证')}</span></div>
      </div>
      {recentRegistrations.length===0?<p className="muted">{label('لا توجد تسجيلات حديثة.','No recent registrations.','暂无近期注册。')}</p>:<div className="member-list">{recentRegistrations.map(item=><article className="member-row" key={item.member_id}>
        <div className="member-main"><strong>{displayMemberNumber(item.member_code)}</strong><span>{item.email}</span><small>{t.registeredAt}: {item.registered_at?new Date(item.registered_at).toLocaleString(lang==='ar'?'ar-EG':lang==='zh'?'zh-CN':'en-US'):'—'}</small></div>
        <div className="member-tags"><span className={item.email_confirmed && item.membership_status==='active'?'member-status active':'member-status'}>{!item.email_confirmed?label('بانتظار تأكيد البريد','Awaiting email confirmation','等待邮箱验证'):item.membership_status==='pending'?label('بانتظار اعتماد OSMAR','Awaiting OSMAR approval','等待 OSMAR 审核'):item.membership_status==='active'?label('عضوية معتمدة','Approved','已批准'):item.membership_status}</span><span className="member-type">{item.referral_type}</span></div>
        <small className="member-contact">{item.email_confirmed?label('البريد مؤكد','Email confirmed','邮箱已验证'):label('البريد لم يتم تأكيده بعد','Email not confirmed yet','邮箱尚未验证')} · {item.referral_status==='approved'?label('الدعوة معتمدة','Invitation approved','邀请已批准'):item.referral_status==='pending'?label('الدعوة بانتظار المراجعة','Invitation awaiting review','邀请待审核'):label('لا يوجد سجل دعوة مرتبط','No linked invitation record','没有关联的邀请码记录')}</small>
      </article>)}</div>}
    </section></details>}
    <details className="admin-collapsible"><summary>{label('أكواد الدعوة','Invitation codes','邀请码')} · {inviteDirectory.length}</summary>
    <section className="admin-panel recent-registrations">
      <div className="admin-heading"><div><h3>{label('أكواد الدعوة','Invitation codes','邀请码')}</h3><p className="muted">{label('اسم الكود وسعته واستخداماته والمتبقي. الكود الكامل يظهر عند إنشائه فقط حفاظًا على أمانه.','Label, capacity, usage and remaining invitations. Full codes are shown only once at creation for security.','显示名称、容量、使用次数与剩余次数。为安全起见，完整邀请码仅在创建时显示。')}</p></div><button type="button" onClick={refresh} disabled={busy}>{t.refresh}</button></div>
      <div className="member-list">{inviteDirectory.map((item,index)=><article className="member-row" key={item.invite_id}>
        <div className="member-main"><strong>{index+1}</strong><span>{item.source_label || item.invite_type}</span><small>{item.invite_type} · {item.code_prefix}</small><small>{item.created_at?new Date(item.created_at).toLocaleString(lang==='ar'?'ar-EG':lang==='zh'?'zh-CN':'en-US'):'—'}</small></div>
        <div className="member-tags"><span className="member-status">{label('السعة','Capacity','容量')}: {item.max_uses}</span><span className="member-status active">{label('استخدم','Used','已用')}: {item.uses_count}</span><span className="member-type">{label('متبقي','Left','剩余')}: {item.uses_remaining}</span></div>
        <small className="member-contact">{label('أنشأه: ','Created by: ','创建者：')}{item.created_by_email||'OSMAR'} · {item.revoked_at?label('ملغي','Revoked','已撤销'):item.expires_at && new Date(item.expires_at)<new Date()?label('منتهي','Expired','已过期'):label('ساري','Available','有效')}</small>
      </article>)}</div>
      {inviteDirectory.length===0&&<p className="muted">{label('لا توجد أكواد.','No invitation codes yet.','暂无邀请码。')}</p>}
    </section></details>
    {isOwner && <details className="admin-collapsible"><summary>{label('محاولات تحتاج متابعة','Attempts needing attention','需要跟进的尝试')} · {registrationAttempts.length}</summary>
    <section className="admin-panel recent-registrations">
      <div className="admin-heading"><div><h3>{label('محاولات التسجيل التي واجهت مشكلة','Registration attempts needing attention','需要关注的注册尝试')}</h3><p className="muted">{label('يظهر هنا البريد الذي أدخل كودًا غير صالح أو مستهلكًا. المحاولات القديمة التي لم يسجل النظام بريدها لا يمكن استرجاعها بأثر رجعي.','Emails entered with invalid or exhausted codes appear here. Older attempts whose email was never recorded cannot be reconstructed retroactively.','输入无效或已用完邀请码的邮箱会显示在这里。系统未曾记录邮箱的历史尝试无法追溯恢复。')}</p></div><button type="button" onClick={refresh} disabled={busy}>{t.refresh}</button></div>
      {registrationAttempts.length===0?<p className="muted">{label('لا توجد محاولات مسجلة.','No recorded attempts.','暂无记录。')}</p>:<div className="member-list">{registrationAttempts.map((item,index)=><article className="member-row" key={item.attempt_number}>
        <div className="member-main"><strong>{item.attempt_number}</strong><span>{item.email}</span><small>{item.attempted_at?new Date(item.attempted_at).toLocaleString(lang==='ar'?'ar-EG':lang==='zh'?'zh-CN':'en-US'):'—'}</small></div>
        <div className="member-tags"><span className="member-status">{item.reason}</span><span className="member-type">{item.code_hint||'—'}</span></div>
      </article>)}</div>}
    </section></details>}
    {isOwner && <section className="admin-panel admin-permissions-entry">
      <button type="button" className="admin-permissions-launch" aria-expanded={showPermissions} onClick={() => setShowPermissions(value => !value)}>
        <span className="admin-permissions-icon"><ShieldCheck size={22}/></span>
        <span><strong>{label('إدارة الصلاحيات','Permissions management','权限管理')}</strong><small>{label('قسم مستقل — لا توجد صلاحيات مفوضة إلا إذا أضفتها بنفسك.','Separate area — no delegated access unless you assign it yourself.','独立区域 — 只有您主动分配才会授予委派权限。')}</small></span>
        <span className="admin-permissions-toggle">{showPermissions ? '−' : '+'}</span>
      </button>
      {showPermissions && <OSMARAccessManager supabase={supabase} lang={lang} />}
    </section>}
  </div>;
}


const OSMAR_PERMISSION_GROUPS = [
  { key: 'engineering', label: { ar: 'هندسة البرمجيات', en: 'Software engineering', zh: '软件工程' }, items: ['code.read','code.write','deploy.manage'] },
  { key: 'infrastructure_security', label: { ar: 'البنية التحتية والأمان', en: 'Infrastructure & security', zh: '基础设施与安全' }, items: ['infrastructure.manage','security.audit'] },
  { key: 'game_operations', label: { ar: 'تشغيل اللعبة', en: 'Game operations', zh: '游戏运营' }, items: ['game.configure','events.manage'] },
  { key: 'membership_support', label: { ar: 'العضويات والمجتمع', en: 'Membership & community', zh: '会员与社区' }, items: ['members.read','members.approve','members.edit','invites.manage','code.read'] },
  { key: 'rewards_moderator', label: { ar: 'النقاط والمكافآت', en: 'Points & rewards', zh: '积分与奖励' }, items: ['rewards.review','rewards.award'] },
  { key: 'content_moderator', label: { ar: 'المحتوى واللغات', en: 'Content & languages', zh: '内容与语言' }, items: ['content.manage'] },
  { key: 'auditor', label: { ar: 'المراجعة والتدقيق', en: 'Audit & reporting', zh: '审计与报告' }, items: ['reports.read','audit.read'] }
];
const OSMAR_PERMISSION_LABELS = {
  'code.read': {ar:'قراءة الكود',en:'Read code',zh:'读取代码'},
  'code.write': {ar:'تعديل الكود',en:'Modify code',zh:'修改代码'},
  'deploy.manage': {ar:'إدارة الإصدارات',en:'Manage releases',zh:'管理发布'},
  'infrastructure.manage': {ar:'إدارة البنية التحتية',en:'Manage infrastructure',zh:'管理基础设施'},
  'security.audit': {ar:'مراجعة الأمان',en:'Security audit',zh:'安全审计'},
  'members.read': {ar:'قراءة بيانات العضويات',en:'Read membership records',zh:'查看会员记录'},
  'members.approve': {ar:'اعتماد العضويات',en:'Approve memberships',zh:'审核会员'},
  'members.edit': {ar:'تعديل بيانات الأعضاء',en:'Edit member profiles',zh:'编辑会员资料'},
  'invites.manage': {ar:'إدارة أكواد الدعوة',en:'Manage invitation codes',zh:'管理邀请码'},
  'game.configure': {ar:'إعدادات اللعبة',en:'Configure game',zh:'配置游戏'},
  'events.manage': {ar:'إدارة الفعاليات',en:'Manage events',zh:'管理活动'},
  'rewards.review': {ar:'مراجعة المكافآت',en:'Review rewards',zh:'审核奖励'},
  'rewards.award': {ar:'اعتماد النقاط',en:'Award points',zh:'发放积分'},
  'content.manage': {ar:'إدارة المحتوى والترجمة',en:'Manage content & translation',zh:'管理内容与翻译'},
  'reports.read': {ar:'قراءة التقارير',en:'Read reports',zh:'查看报告'},
  'audit.read': {ar:'قراءة سجل التدقيق',en:'Read audit log',zh:'查看审计日志'}
};

function OSMARAccessManager({supabase,lang}) {
  const ar=lang==='ar', zh=lang==='zh';
  const [email,setEmail]=useState('');
  const [role,setRole]=useState('game_operations');
  const [permissions,setPermissions]=useState(['game.configure','events.manage']);
  const [days,setDays]=useState('30');
  const [assignments,setAssignments]=useState([]);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const label=(a,b,c)=>ar?a:zh?c:b;
  async function refresh(){
    setBusy(true);setNotice('');
    try { const {data,error}=await supabase.rpc('osmar_list_admin_assignments'); if(error) throw error; setAssignments(data||[]); }
    catch(e){setNotice(e.message||'Unable to load administrator assignments.');}
    finally{setBusy(false);}
  }
  useEffect(()=>{refresh();},[supabase]);
  function chooseRole(next){
    setRole(next);
    const preset=OSMAR_PERMISSION_GROUPS.find(g=>g.key===next);
    setPermissions(preset?[...preset.items]:[]);
  }
  function togglePermission(p){
    setPermissions(old=>old.includes(p)?old.filter(x=>x!==p):[...old,p]);
  }
  async function save(event){
    event.preventDefault();setBusy(true);setNotice('');
    try{
      const expires=days==='forever'?null:new Date(Date.now()+Number(days)*86400000).toISOString();
      const {error}=await supabase.rpc('osmar_set_admin_assignment',{p_email:email.trim(),p_role_key:role,p_permissions:permissions,p_expires_at:expires});
      if(error)throw error;
      setNotice(label('تم حفظ صلاحيات المدير.','Administrator permissions saved.','管理员权限已保存。'));
      setEmail('');await refresh();
    }catch(e){setNotice(e.message||'Unable to save administrator.');}
    finally{setBusy(false);}
  }
  async function revoke(id){
    if(!window.confirm(label('تأكيد إلغاء صلاحيات هذا المدير؟','Revoke this administrator access?','确认撤销此管理员权限？')))return;
    setBusy(true);setNotice('');
    try{const {error}=await supabase.rpc('osmar_revoke_admin_assignment',{p_user_id:id});if(error)throw error;await refresh();setNotice(label('تم إلغاء الصلاحية.','Access revoked.','权限已撤销。'));}
    catch(e){setNotice(e.message||'Unable to revoke access.');}
    finally{setBusy(false);}
  }
  return <section className="admin-panel osmar-access-manager">
    <div className="admin-heading"><div><h3>{label('إدارة مديري OSMAR والصلاحيات','OSMAR administrators & permissions','OSMAR 管理员与权限')}</h3><p className="muted">{label('كل شخص يحصل على أقل صلاحيات تكفي لمهمته. لا تمنح صلاحيات إلا لحساب مؤكد.','Give each person only the access required for their role. Only confirmed accounts can be assigned.','仅授予完成工作所需的权限。只能分配给已验证的账户。')}</p></div><button type="button" onClick={refresh} disabled={busy}>{label('تحديث','Refresh','刷新')}</button></div>
    <form onSubmit={save} className="admin-form">
      <label>{label('بريد حساب الشخص','User account email','用户账户邮箱')}<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label>
      <label>{label('الفريق / الدور','Team / role','团队 / 角色')}<select value={role} onChange={e=>chooseRole(e.target.value)}>{OSMAR_PERMISSION_GROUPS.map(g=><option key={g.key} value={g.key}>{g.label[lang]||g.label.ar}</option>)}</select></label>
      <label>{label('مدة الصلاحية','Access duration','权限期限')}<select value={days} onChange={e=>setDays(e.target.value)}><option value="7">{label('7 أيام','7 days','7天')}</option><option value="30">{label('30 يومًا','30 days','30天')}</option><option value="90">{label('90 يومًا','90 days','90天')}</option><option value="365">{label('سنة','1 year','1年')}</option><option value="forever">{label('بدون انتهاء (غير موصى به)','No expiry (not recommended)','永不过期（不推荐）')}</option></select></label>
      <div className="osmar-permission-grid">{OSMAR_PERMISSION_GROUPS.flatMap(g=>g.items).map(p=><label className="guardian-check" key={p}><input type="checkbox" checked={permissions.includes(p)} onChange={()=>togglePermission(p)}/>{OSMAR_PERMISSION_LABELS[p][lang]||OSMAR_PERMISSION_LABELS[p].ar}</label>)}</div>
      <button className="primary" disabled={busy||!permissions.length}>{busy?'…':label('حفظ الصلاحيات','Save permissions','保存权限')}</button>
    </form>
    {notice&&<p className="notice" role="status">{notice}</p>}
    <h4>{label('المديرون المضافون','Delegated administrators','已委派管理员')}</h4>
    {assignments.length===0?<p className="muted">{label('لا توجد صلاحيات إضافية مسجلة.','No delegated administrators yet.','暂无委派管理员。')}</p>:<div className="member-list">{assignments.map(a=><article className="member-row" key={a.user_id}><div className="member-main"><strong>{a.email}</strong><span>{OSMAR_PERMISSION_GROUPS.find(g=>g.key===a.role_key)?.label[lang]||a.role_key}</span><small>{label('تنتهي: ','Expires: ','到期时间：')}{a.expires_at?new Date(a.expires_at).toLocaleString():label('لا تنتهي','Never','永不过期')}</small><small>{label('الصلاحيات: ','Permissions: ','权限：')}{(a.permissions||[]).join(' · ')}</small></div>{!a.revoked_at?<button type="button" disabled={busy} onClick={()=>revoke(a.user_id)}>{label('إلغاء الصلاحية','Revoke','撤销权限')}</button>:<span className="member-status">{label('ملغاة','Revoked','已撤销')}</span>}</article>)}</div>}
    <p className="privacy">{label('تنبيه: هذه شاشة إدارة التعيينات. تفعيل صلاحيات كل عملية داخل النظام يتم تدريجيًا قبل إتاحة الأدوار المفوضة للاستخدام الفعلي.','Note: this manages assignments. Each protected operation must be migrated to enforce its permission before delegated roles are enabled for production.','注意：此页面管理权限分配。必须先逐项迁移系统操作的权限检查，才能在生产环境启用委派角色。')}</p>
  </section>;
}
