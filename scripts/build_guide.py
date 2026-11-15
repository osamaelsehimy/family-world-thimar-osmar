from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'OG01-Game-Guide-AR-EN.pdf'
ASSETS = ROOT / 'public' / 'assets' / 'ideas'
PAGE = landscape(A4)
W, H = PAGE
GREEN = HexColor('#164b3b'); LIGHT = HexColor('#eef4eb'); GOLD = HexColor('#c69a3b'); INK = HexColor('#20372e'); MUTED = HexColor('#65776b')
pdfmetrics.registerFont(TTFont('Arial', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('Tahoma', '/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf'))
pdfmetrics.registerFont(UnicodeCIDFont('STSong-Light'))

# Arabic joining forms: isolated, final, initial, medial (Unicode Arabic Presentation Forms).
FORMS = {
'ء':(0xFE80,None,None,None),'آ':(0xFE81,0xFE82,None,None),'أ':(0xFE83,0xFE84,None,None),'ؤ':(0xFE85,0xFE86,None,None),'إ':(0xFE87,0xFE88,None,None),'ئ':(0xFE89,0xFE8A,0xFE8B,0xFE8C),
'ا':(0xFE8D,0xFE8E,None,None),'ب':(0xFE8F,0xFE90,0xFE91,0xFE92),'ة':(0xFE93,0xFE94,None,None),'ت':(0xFE95,0xFE96,0xFE97,0xFE98),'ث':(0xFE99,0xFE9A,0xFE9B,0xFE9C),'ج':(0xFE9D,0xFE9E,0xFE9F,0xFEA0),'ح':(0xFEA1,0xFEA2,0xFEA3,0xFEA4),'خ':(0xFEA5,0xFEA6,0xFEA7,0xFEA8),'د':(0xFEA9,0xFEAA,None,None),'ذ':(0xFEAB,0xFEAC,None,None),'ر':(0xFEAD,0xFEAE,None,None),'ز':(0xFEAF,0xFEB0,None,None),'س':(0xFEB1,0xFEB2,0xFEB3,0xFEB4),'ش':(0xFEB5,0xFEB6,0xFEB7,0xFEB8),'ص':(0xFEB9,0xFEBA,0xFEBB,0xFEBC),'ض':(0xFEBD,0xFEBE,0xFEBF,0xFEC0),'ط':(0xFEC1,0xFEC2,0xFEC3,0xFEC4),'ظ':(0xFEC5,0xFEC6,0xFEC7,0xFEC8),'ع':(0xFEC9,0xFECA,0xFECB,0xFECC),'غ':(0xFECD,0xFECE,0xFECF,0xFED0),'ـ':(0x0640,0x0640,0x0640,0x0640),'ف':(0xFED1,0xFED2,0xFED3,0xFED4),'ق':(0xFED5,0xFED6,0xFED7,0xFED8),'ك':(0xFED9,0xFEDA,0xFEDB,0xFEDC),'ل':(0xFEDD,0xFEDE,0xFEDF,0xFEE0),'م':(0xFEE1,0xFEE2,0xFEE3,0xFEE4),'ن':(0xFEE5,0xFEE6,0xFEE7,0xFEE8),'ه':(0xFEE9,0xFEEA,0xFEEB,0xFEEC),'و':(0xFEED,0xFEEE,None,None),'ى':(0xFEEF,0xFEF0,None,None),'ي':(0xFEF1,0xFEF2,0xFEF3,0xFEF4),'پ':(0xFB56,0xFB57,0xFB58,0xFB59),'چ':(0xFB7A,0xFB7B,0xFB7C,0xFB7D),'ژ':(0xFB8A,0xFB8B,None,None),'گ':(0xFB92,0xFB93,0xFB94,0xFB95)
}
RIGHT_ONLY = set('ءاآأإؤدذرزوةى')
def shape_word(word):
    chars=list(word); out=[]
    for i,ch in enumerate(chars):
        if ch not in FORMS:
            out.append(ch); continue
        forms=FORMS[ch]
        prev=chars[i-1] if i else ''
        nxt=chars[i+1] if i+1<len(chars) else ''
        joins_prev=prev in FORMS and prev not in RIGHT_ONLY and ch not in ('ء',)
        joins_next=ch not in RIGHT_ONLY and nxt in FORMS and nxt not in ('ء',)
        form = forms[3] if joins_prev and joins_next and forms[3] else forms[1] if joins_prev and forms[1] else forms[2] if joins_next and forms[2] else forms[0]
        out.append(chr(form))
    return ''.join(reversed(out))
def arabic_visual(text):
    # Guide paragraphs are Arabic-first; preserve English and number runs within words.
    import re
    tokens=re.findall(r'\s+|[^\s]+', text)
    return ''.join(''.join(reversed(t)) if t.isspace() else shape_word(t) for t in reversed(tokens))
def draw_rtl(c, text, x, y, font='Tahoma', size=9, color=INK):
    c.setFont(font,size); c.setFillColor(color); c.drawRightString(x,y,arabic_visual(text))
def wrap_lines(text, font, size, max_width, rtl=False):
    words=text.split(); lines=[]; cur=''
    for word in words:
        test=(cur+' '+word).strip()
        measured=arabic_visual(test) if rtl else test
        if cur and pdfmetrics.stringWidth(measured,font,size)>max_width:
            lines.append(cur); cur=word
        else: cur=test
    if cur: lines.append(cur)
    return lines
def draw_copy(c, title, sections, x, top, width, rtl=False, bottom=38, fontsize=9.0):
    font='Tahoma' if rtl else 'Arial'
    if any('\u4e00' <= ch <= '\u9fff' for _, body in sections for paragraph in body for ch in paragraph): font='STSong-Light'
    y=top
    if rtl: draw_rtl(c,title,x+width,y,font,size=15,color=GREEN)
    else:
        c.setFont(font,15); c.setFillColor(GREEN); c.drawString(x,y,title)
    y-=24
    for heading, body in sections:
        if rtl: draw_rtl(c,heading,x+width,y,font,size=10,color=GOLD)
        else:
            c.setFont(font,10); c.setFillColor(GOLD); c.drawString(x,y,heading)
        y-=15
        for paragraph in body:
            lines=wrap_lines(paragraph,font,fontsize,width-6,rtl)
            for line in lines:
                if y<bottom: return y
                if rtl: draw_rtl(c,line,x+width-2,y,font,size=fontsize,color=INK)
                else:
                    c.setFont(font,fontsize); c.setFillColor(INK); c.drawString(x+2,y,line)
                y-=12.2
            y-=4
        y-=7
    return y
def page_base(c, number, en_title, ar_title):
    c.setFillColor(GREEN); c.rect(0,H-54,W,54,fill=1,stroke=0)
    c.setFillColor(white); c.setFont('Arial',10); c.drawString(30,H-32,'FAMILY WORLD  |  THIMAR OSMAR')
    draw_rtl(c,'عالم الأسرة  |  ثمار OSMAR',W-30,H-32,size=10,color=white)
    c.setFillColor(LIGHT); c.rect(20,35,W-40,H-105,fill=1,stroke=0)
    c.setFillColor(HexColor('#dce7dc')); c.setStrokeColor(HexColor('#dce7dc')); c.line(W/2,50,W/2,H-80)
    c.setFont('Arial',8); c.setFillColor(MUTED); c.drawString(30,20,'Family World · Quick guide · English + العربية')
    draw_rtl(c,'دليل مختصر · العربية + English',W-30,20,size=8,color=MUTED)
    c.drawCentredString(W/2,20,str(number))
def section_pair(c, n, en_title, ar_title, en_sections, ar_sections, font=9):
    page_base(c,n,en_title,ar_title)
    top=H-88
    draw_copy(c,en_title,en_sections,34,top,W/2-50,False,bottom=48,fontsize=font)
    draw_copy(c,ar_title,ar_sections,W/2+16,top,W/2-50,True,bottom=48,fontsize=font)
    c.showPage()

c=canvas.Canvas(str(OUT),pagesize=PAGE,pageCompression=1)
c.setTitle('Family World - Official Game Guide 2.0 - English and Arabic')
c.setAuthor('OSMAR Ecosystems')
# Cover
page_base(c,1,'A simple guide','دليل مبسّط')
c.setFillColor(white); c.roundRect(34,80,W-68,H-170,18,fill=1,stroke=0)
c.setFillColor(GREEN); c.setFont('Arial',24); c.drawString(58,H-135,'Family World')
c.setFont('Arial',13); c.setFillColor(GOLD); c.drawString(58,H-159,'THIMAR OSMAR')
draw_rtl(c,'عالم الأسرة',W-58,H-135,size=23,color=GREEN)
draw_rtl(c,'ثمار OSMAR',W-58,H-159,size=13,color=GOLD)
c.setFont('Arial',11); c.setFillColor(INK); c.drawString(58,H-202,'A family-friendly way to learn, play, and help together.')
draw_rtl(c,'مساحة عائلية للتعلم واللعب والتعاون على الخير.',W-58,H-202,size=11,color=INK)
BRAND = ROOT / 'public' / 'assets' / 'brand'
cover_path = BRAND / 'family-world-cover.webp'
map_img=ImageReader(str(cover_path if cover_path.exists() else ASSETS/'world-map.jpg'))
c.drawImage(map_img, W/2-205, 94, width=410,height=205,preserveAspectRatio=True,anchor='c',mask='auto')
c.setFont('Arial',8.5); c.setFillColor(MUTED); c.drawCentredString(W/2,79,'Early concept artwork · The app is a demo; progress is not saved.')
draw_rtl(c,'رسومات تصورية أولية · اللعبة نسخة تجريبية ولا تحفظ التقدم.',W/2,65,size=8.5,color=MUTED)
c.showPage()

section_pair(c,2,'What is Family World?','ما عالم الأسرة؟',[
('A shared family experience',[
'Family World brings family activities into seven everyday themes. Choose an activity, agree on a safe way to do it, then enjoy it together.',
'The project values kindness, learning, useful work, care for family, and faith-informed good conduct.',
'The concept map is an inspiration board. It is not a live location map or a route tracker.'
]),('The seven worlds',[
'Home & daily life · Family & relationships · Learning & skills · Nature & sustainability',
'Work & enterprise · Health & movement · Community & service'
])],[
('تجربة عائلية مشتركة',[
'يجمع عالم الأسرة أنشطة عائلية في سبعة موضوعات من الحياة اليومية. اختاروا نشاطًا، واتفقوا على طريقة آمنة لتنفيذه، ثم استمتعوا به معًا.',
'يركز المشروع على اللطف والتعلم والعمل النافع ورعاية الأسرة وحسن الخلق المستند إلى الإيمان.',
'خريطة المفاهيم لوحة إلهام من ملف الأفكار، وليست خريطة مواقع حية أو أداة لتتبع الحركة.'
]),('العوالم السبعة',[
'البيت والمعيشة · الأسرة والعلاقات · التعليم والمهارات · الطبيعة والاستدامة',
'الأعمال والتجارة · الصحة والحركة · المجتمع والعمل النافع'
])],9)
# put the concept map on a dedicated, bilingual visible page
page_base(c,3,'Explore the concept map','استكشف خريطة المفاهيم')
draw_copy(c,'How to use it',[
('Explore the worlds',[
'Tap a world in the app to read its description and browse activities.',
'This concept image connects Family World, Thimar OSMAR, the card game, and the Thimmy mascot.',
'It is an inspiration board, not a live location map or route tracker.'
])],34,H-88,W/2-50,False,bottom=340,fontsize=9)
draw_copy(c,'طريقة استخدامها',[
('استكشف العوالم',[
'اضغط على أي عالم في اللعبة لقراءة وصفه واستكشاف أنشطته.',
'تربط الصورة التصورية بين عالم الأسرة وثمار OSMAR وبطاقات اللعب وتميمة ثيمي.',
'إنها لوحة إلهام وليست خريطة مواقع حية أو أداة لتتبع الحركة.'
])],W/2+16,H-88,W/2-50,True,bottom=340,fontsize=9)
c.drawImage(map_img,105,57,width=632,height=285,preserveAspectRatio=True,anchor='c',mask='auto')
c.showPage()
section_pair(c,4,'How to play together','كيف تلعبون معًا',[
('A simple five-step round',[
'1. Choose a world or a family game.',
'2. Agree on a safe, age-appropriate activity and who will join.',
'3. Do it together. Keep it kind, fair, and fun.',
'4. Talk about what you learned or enjoyed.',
'5. Celebrate effort and helpful choices.'
]),('Try one of these games',[
'Family treasure hunt · Who am I? · Story chain · Charades · Memory match',
'Family quiz · Draw and guess · Category race · Secret kindness mission'
])],[
('جولة بسيطة من خمس خطوات',[
'١. اختاروا عالمًا أو لعبة عائلية.',
'٢. اتفقوا على نشاط آمن ومناسب للأعمار، ومن سيشارك.',
'٣. نفذوه معًا بلطف وعدل ومتعة.',
'٤. تحدثوا عما تعلمتموه أو استمتعتم به.',
'٥. قدّروا المحاولة والتصرفات النافعة.'
]),('جرّبوا إحدى الألعاب',[
'صيد الكنز العائلي · مين أنا؟ · حكاية على الدور · التمثيل · لعبة الذاكرة',
'مسابقة عائلية · ارسم وخمّن · سباق الفئات · مهمة سرية لفعل الخير'
])],9)
page_base(c,5,'Characters and collectible cards','الشخصيات والبطاقات')
en_cards=[
('Concept artwork',[
'The gallery in the app displays the project’s character and skill-card ideas: Osama, Thimmy, the Data Analyst, the Family Treasure card, Work Entity, Founder’s Vision, and Data Insight.',
'They are visual concepts. Card levels, scores, powers, and collectible rewards are not active game features yet.',
'Use the cards as conversation starters: What helpful skill does this person or team bring to the family?'
])]
ar_cards=[
('رسومات تصورية',[
'يعرض معرض اللعبة أفكار الشخصيات وبطاقات المهارات في المشروع: أسامة، وثيمي، ومحللة البيانات، وبطاقة كنز العائلة، وكيان العمل، ورؤية المؤسس، وبصيرة البيانات.',
'هذه نماذج بصرية. المستويات والدرجات والقدرات والمكافآت التجميعية غير مفعّلة بعد داخل اللعبة.',
'استخدموا البطاقات لبدء حوار: ما المهارة النافعة التي يضيفها هذا الشخص أو الفريق للأسرة؟'
])]
draw_copy(c,'Characters and collectible cards',en_cards,34,H-88,W/2-50,False,bottom=320,fontsize=9)
draw_copy(c,'الشخصيات والبطاقات',ar_cards,W/2+16,H-88,W/2-50,True,bottom=320,fontsize=9)
# selected card artwork, with context and clear concept label
for idx,(name,cap_en,cap_ar) in enumerate([
('analyst-card.jpg','Data Analyst','محللة البيانات'),('osama-card.jpg','Osama · Founder','أسامة · المؤسس'),('thimmy-card.jpg','Thimmy · Mascot','ثيمي · التميمة')]):
    x=92+idx*225
    c.drawImage(ImageReader(str(ASSETS/name)),x,57,width=190,height=225,preserveAspectRatio=True,anchor='c',mask='auto')
    c.setFont('Arial',8); c.setFillColor(GREEN); c.drawCentredString(x+95,48,cap_en)
    draw_rtl(c,cap_ar,x+190,37,size=8,color=GREEN)
c.showPage()
page_base(c,6,'Points, safety, and getting started','النقاط والأمان وطريقة البدء')
en_safety=[
('Demo and account',[
'Open the shared game link and choose “Play the demo” to start without an account. Demo points are only for the current session and are not saved.',
'Account sign-up is optional. An adult parent or guardian must supervise children. Confirm your email before signing in.'
]),('Safety',[
'Do not enter a child’s full name, contact details, photos, school, or location. Keep family activities private and age-appropriate.',
'Points are for encouragement. They do not measure a person’s worth or replace family judgment.'
]),('Install on a phone or computer',[
'Keep the game link online. On Windows or Android, open it in Chrome or Edge and choose Install app from the browser menu. On iPhone/iPad, open in Safari, tap Share, then Add to Home Screen.',
'This is an installable web app, not an APK or EXE installer. Internet access is needed.'
])]
ar_safety=[
('التجربة والحساب',[
'افتح رابط اللعبة واضغط «ادخل جرّب اللعبة» للبدء دون حساب. النقاط تجريبية لهذه الجلسة فقط ولا تُحفظ.',
'إنشاء الحساب اختياري. يجب أن يشرف ولي أمر بالغ على استخدام الأطفال. أكّد البريد الإلكتروني قبل تسجيل الدخول.'
]),('الأمان',[
'لا تدخل الاسم الكامل للطفل أو بيانات التواصل أو الصور أو المدرسة أو الموقع. اجعلوا أنشطة الأسرة خاصة ومناسبة للأعمار.',
'النقاط للتشجيع، ولا تقيس قيمة الإنسان أو تحل محل تقدير الأسرة.'
]),('التثبيت على الهاتف أو الكمبيوتر',[
'استخدم رابط اللعبة. على ويندوز أو أندرويد، افتحه في Chrome أو Edge واختر «تثبيت التطبيق» من قائمة المتصفح. على آيفون أو آيباد، افتحه في Safari واضغط «مشاركة» ثم «إضافة إلى الشاشة الرئيسية».',
'هذا تطبيق ويب قابل للتثبيت، وليس ملف APK أو EXE. يحتاج إلى الإنترنت.'
])]
draw_copy(c,'Points, safety, and getting started',en_safety,34,H-88,W/2-50,False,bottom=48,fontsize=8.5)
draw_copy(c,'النقاط والأمان وطريقة البدء',ar_safety,W/2+16,H-88,W/2-50,True,bottom=48,fontsize=8.5)
c.save()
print(OUT)

# Release update: current implementation truth, 3X and safeguards (15 Nov 2026)
section_pair(c,7,'Current app features and availability','الخصائص المتاحة وحالة التطبيق',[
('Available now',[
'Public guest demo; email/password account interface with guardian affirmation and email confirmation.',
'Dominoes against the computer, 1024, and Ludo are available game experiences.',
'Seven-world navigation, starter character cards, local card creation, and the 100 m² Thimar 3X home challenge path.',
'Family World is an installable Progressive Web App (PWA), not an APK or EXE.'
]),('Partial or planned',[
'Family Treasure Hunt, Who Am I?, Story Chain, Backgammon, Estimation, Sequence, Snakes & Ladders, Phase Challenge, Family Quiz, Memory Match and Connect Four are ideas/coming soon unless explicitly enabled.',
'Online Domino has a lobby foundation; synchronized turns, validated match completion and permanent online results remain future work.',
'The 10,000 m² enterprise and 1000 × 1000 city tracks, avatar progression, Thimar learning paths, full OSMAR dashboards and interactive Sponge City are planned or staged.'
]),('Account boundary',[
'Guest-demo progress is temporary. Character cards added in Character Studio are stored locally in the current browser/device and are not a shared family collection yet.'
])],[
('المتاح حاليًا',[
'تجربة عامة كضيف، وواجهة حساب بالبريد وكلمة المرور مع إقرار ولي الأمر وتأكيد البريد.',
'الألعاب المتاحة: الدومينو ضد الكمبيوتر، و1024، وليدو.',
'العوالم السبعة، ومجموعة بداية للشخصيات، وإضافة كروت محليًا، ومسار تحدي البيت 100 م² في ثلاثي الأثر.',
'اللعبة تطبيق ويب قابل للتثبيت PWA، مش APK أو EXE.'
]),('جزئي أو مخطط',[
'صيد الكنز ومين أنا وحكاية على الدور والطاولة والاستميشن وسيكوانس والسلم والثعبان وتحدي المراحل وتحدي المعلومات والذاكرة وأربعة على التوالي أفكار أو قادمة إلا لو اتفعلت صراحة.',
'ردهة الدومينو أونلاين لها أساس، لكن تزامن الأدوار والتحقق من نهاية المباراة وحفظ النتائج الدائمة ما زال تطويرًا مستقبليًا.',
'مسارا المشروع 10,000 م² والمدينة 1000×1000، وتطور الشخصيات ومسارات Thimar ولوحات OSMAR الكاملة وSponge City التفاعلية ما زالت مخططة أو مرحلية.'
]),('حدود الحساب',[
'التقدم في تجربة الضيف مؤقت. والكروت المضافة في استوديو الشخصيات محفوظة محليًا على نفس المتصفح والجهاز، وليست مجموعة عائلية مشتركة حتى الآن.'
])],8.2)
section_pair(c,8,'Thimar 3X: the three challenges','ثلاثي الأثر 3X: التحديات الثلاثة',[
('01 · Home challenge — 100 m²',[
'Design a 10 × 10 m concept home around family needs, room zoning, circulation, privacy, daylight, ventilation, water, energy, materials and an initial cost estimate.',
'Deliverables: concept plan, area schedule, user story, sustainability notes and initial cost range.'
]),('02 · Enterprise/campus — 10,000 m²',[
'Plan a 100 × 100 m project: value proposition, OBS roles, WBS work packages, site flows, suppliers, safety, schedule, cost, risks and KPIs.',
'This is a specialist-review track; no project is automatically approved for investment or construction.'
]),('03 · Egypt city-region — 1000 × 1000',[
'A virtual planning grid for neighbourhoods, housing, work, education, worship, health, mobility, water, energy, green/blue infrastructure, logistics and community services.',
'The map is an educational model, not a land-title map, official zoning plan or permit.'
]),('Sponge City layer',[
'Candidate systems: permeable streets, rain gardens, bioswales, green roofs, wetlands, retention ponds, rainwater harvesting, safely treated greywater reuse, floodable parks and safe overflow routes.',
'Water balance, soil, rainfall, water quality, maintenance and engineering capacities require local data and qualified review.'
])],[
('01 · تحدي البيت 100 م²',[
'تصميم بيت مفاهيمي 10×10 متر حسب احتياجات الأسرة وتوزيع الغرف والحركة والخصوصية والضوء والتهوية والمياه والطاقة والخامات والتكلفة المبدئية.',
'المخرجات: مخطط مبدئي، جدول مساحات، قصة استخدام، ملاحظات استدامة، ونطاق تكلفة أولي.'
]),('02 · المشروع 10,000 م²',[
'تخطيط مشروع 100×100 متر: القيمة المقترحة، المسؤوليات OBS، حزم العمل WBS، حركة الموقع، الموردون، السلامة، الجدول والتكلفة والمخاطر والمؤشرات.',
'ده مسار يحتاج مراجعة متخصصين؛ ومفيش مشروع بيتعتمد تلقائيًا للاستثمار أو البناء.'
]),('03 · مصر 1000×1000',[
'شبكة تخطيط افتراضية للأحياء والسكن والعمل والتعليم والعبادة والصحة والتنقل والمياه والطاقة والمساحات الخضراء والزرقاء واللوجستيات والخدمات المجتمعية.',
'الخريطة نموذج تعليمي، مش خريطة ملكية أو تقسيم رسمي أو ترخيص.'
]),('طبقة Sponge City',[
'أنظمة مقترحة: شوارع منفذة للمياه، حدائق مطرية، قنوات نباتية، أسطح خضراء، أراضٍ رطبة، أحواض احتجاز، حصاد مياه الأمطار، إعادة استخدام المياه الرمادية بعد المعالجة الآمنة، حدائق قابلة للغمر ومسارات فائض آمنة.',
'ميزان المياه والتربة والأمطار والجودة والصيانة والسعات الهندسية تحتاج بيانات محلية ومراجعة مختصين.'
])],8.2)
section_pair(c,9,'Points, supply chain and project methods','النقاط وسلسلة الإمداد وإدارة المشروعات',[
('FWP points',[
'FWP are progress indicators earned through eligible tasks and reviewed contributions. They are not money, shares, ownership, investments or promised returns.',
'There is no approved cash exchange rate, point purchase or trading. Demo points are temporary; permanent points require a live server-backed event and accepted record.'
]),('Supply chain',[
'The proposed connection is person → team → supplier → project → community. Record need, source, accountable owner, status, quality, timing, cost assumptions and impact evidence.',
'SMART objectives are Specific, Measurable, Achievable, Relevant and Time-bound. OKRs pair an objective with 2–5 measurable key results. KPIs need a definition, formula, owner, source, timestamp and review cadence.',
'OBS defines accountability; WBS decomposes work; PMO manages scope, schedule, cost, quality and risk; BI supports evidence-based decisions.'
])],[
('نقاط FWP',[
'نقاط FWP مؤشرات تقدم لمهام ومساهمات مؤهلة بعد مراجعتها. مش فلوس ولا أسهم ولا ملكية ولا استثمار ولا وعد بعائد.',
'مفيش سعر تحويل نقدي معتمد ولا شراء أو تداول نقاط. نقاط العرض التجريبي مؤقتة؛ والنقاط الدائمة تحتاج حدثًا مسجلًا ومقبولًا من السيرفر.'
]),('سلسلة الإمداد',[
'الربط المقترح: شخص ← فريق ← مورد ← مشروع ← مجتمع. نسجل الاحتياج والمصدر والمسؤول والحالة والجودة والوقت وافتراضات التكلفة ودليل الأثر.',
'أهداف SMART محددة وقابلة للقياس والتحقيق ومرتبطة بالاحتياج ومحددة بزمن. وOKR يربط هدفًا بنتيجتين إلى خمس نتائج قابلة للقياس. وكل KPI يحتاج تعريفًا ومعادلة ومسؤولًا ومصدرًا وتاريخًا ودورية مراجعة.',
'OBS يوضح المسؤوليات، وWBS يقسم العمل، وPMO يدير النطاق والوقت والتكلفة والجودة والمخاطر، وBI يدعم القرار بالبيانات.'
])],8.2)
section_pair(c,10,'Permissions, privacy and safe use','الصلاحيات والخصوصية والاستخدام الآمن',[
('Ordinary member by default',[
'Every new member is an ordinary user by default. Invitation labels and membership classifications do not grant admin permissions.',
'The owner retains OSMAR Admin. Delegated permissions are separate and owner-controlled; the permissions manager is inside Admin behind its own icon.',
'Server-side authorization, database policies and audit records—not hidden buttons—control protected actions.'
]),('Child and family privacy',[
'Do not enter children’s full names, photos, phone numbers, school, precise location or sensitive details. Keep family and organization workspaces separate.',
'The latest reviewed Supabase security advisor still flags leaked-password protection as disabled. Enable it before broad public launch; real-browser email confirmation and password-reset tests remain required.'
])],[
('العضو العادي هو الأصل',[
'كل عضو جديد مستخدم عادي افتراضيًا. نوع الدعوة أو تصنيف العضوية مش صلاحية إدارية.',
'المالك فقط يحتفظ بإدارة OSMAR. الصلاحيات المفوضة منفصلة وتحت تحكم المالك؛ ومدير الصلاحيات داخل الإدارة في أيقونة مستقلة.',
'التحقق من الصلاحيات يتم من السيرفر وسياسات قاعدة البيانات وسجل المراجعة، مش من إخفاء الأزرار.'
]),('خصوصية الأطفال والأمان',[
'ما تدخلش أسماء الأطفال الكاملة أو صورهم أو أرقامهم أو مدارسهم أو مواقعهم الدقيقة أو بيانات حساسة. وخلي مساحات الأسرة والمؤسسات منفصلة.',
'آخر مراجعة أمنية لـ Supabase لسه بتظهر إن حماية كلمات المرور المسرّبة غير مفعّلة. لازم تتفعل قبل الإطلاق العام الواسع، واختبارات البريد الحقيقي واستعادة كلمة المرور لسه مطلوبة.'
])],8.2)
section_pair(c,11,'Roadmap and Chinese quick guide','خطة التطوير والدليل الصيني المختصر',[
('Next milestones',[
'Install the exact approved cover and character/game artwork and verify desktop/mobile. Enable leaked-password protection and finish browser sign-up/recovery tests. Complete online Domino synchronization. Expand 3X with expert review. Build source-backed Thimar learning paths and OSMAR dashboards. Run clean migration replay and full release regression before broad launch.'
]),('中文快速指南',[
'Family World – Thimar OSMAR 是一个以家庭和社区为核心的学习与游戏体验，鼓励把数字活动转化为现实生活中的善行、合作与成长。',
'七大主题：家庭与日常、家庭关系、学习技能、自然与可持续、工作与事业、健康运动、社区服务。',
'当前可体验：访客演示、多米诺（对电脑）、1024、飞行棋。演示积分不会永久保存。企业与城市 3X 挑战仍在规划或分阶段开发。',
'FWP 是进度指标，不是货币、股票或所有权。新会员默认是普通用户。请保护儿童个人信息。'
])],[
('الخطوات القادمة',[
'تثبيت الغلاف ولوحات الشخصيات واللعبة الأصلية والتحقق من الكمبيوتر والموبايل. تفعيل حماية كلمات المرور المسرّبة واستكمال اختبارات التسجيل والاستعادة. إكمال تزامن الدومينو أونلاين. تطوير 3X بمراجعة متخصصين. بناء مسارات تعلم Thimar ولوحات OSMAR، ثم إعادة اختبار migrations واختبارات الإصدار قبل الإطلاق العام.'
]),('中文快速指南',[
'Family World – Thimar OSMAR 是一个以家庭和社区为核心的学习与游戏体验，鼓励把数字活动转化为现实生活中的善行、合作与成长。',
'七大主题：家庭与日常、家庭关系、学习技能、自然与可持续、工作与事业、健康运动、社区服务。',
'当前可体验：访客演示、多米诺（对电脑）、1024、飞行棋。演示积分不会永久保存。',
'FWP 积分是进度指标，不是货币、股票或所有权。新会员默认是普通用户。请保护儿童个人信息。'
])],8.2)
c.save()
