from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf' / 'OG01-Game-Guide-AR-EN.pdf'
ASSETS = ROOT / 'public' / 'assets' / 'ideas'
PAGE = landscape(A4)
W, H = PAGE
GREEN = HexColor('#164b3b'); LIGHT = HexColor('#eef4eb'); GOLD = HexColor('#c69a3b'); INK = HexColor('#20372e'); MUTED = HexColor('#65776b')
pdfmetrics.registerFont(TTFont('Arial', r'C:\Windows\Fonts\arial.ttf'))
pdfmetrics.registerFont(TTFont('Tahoma', r'C:\Windows\Fonts\tahoma.ttf'))

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
    font='Tahoma' if rtl else 'Arial'; y=top
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
c.setTitle('Family World - Game Guide - English and Arabic')
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
map_img=ImageReader(str(ASSETS/'world-map.jpg'))
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
