# تشغيل «جينيسيس» بشكل دائم

## تسليم تحديث النموذج 2 — 12 أكتوبر 2026

- مصدر العمل المحلي: `C:\Users\alshi\Desktop\nto`. اقرأ ملخص Codex في بداية `HANDOFF.md` قبل متابعة التطوير.
- وجهة النشر: المستودع العام `YasirObaid5/genesis-evolution`، الفرع `main`، ثم مشروع Vercel الموجود `genesis-evolution` على https://genesis-evolution.vercel.app.
- قبل الرفع: `npm test` ثم `python build.py`؛ ارفع `index.html` المبني مع `src/` و`runner/` و`tests/` والتوثيق. لا ترفع `data/` أو تستبدل فرع `perpetual-data`.
- نسخة سطح المكتب ليست مستودع Git؛ يُجهز الإصدار من نسخة من `main`، مع الحفاظ على ملفات `.github/workflows/` الموجودة في المستودع. طابق أي تعديلات أحدث في المستودع قبل نسخ الملفات المحلية.
- نجاح رفع الكود لا يكفي: انتظر `READY` في Vercel، وتحقق من تطابق الصفحة المنشورة مع `index.html` ومن المقارنة والحفظ على الرابط العام. معرّف الإصدار وحالة التحقق يُسجلان في `HANDOFF.md`.
- نشر الموقع ورفع شيفرة المشغّلين لا يعيدان تشغيل العالم الأبدي فورًا؛ تستخدم مهام GitHub المجدولة النموذج 2 في تشغيلها التالي. لا توجد في هذه الدفعة إعادة ضبط للعالم أو تشغيل علمي طويل يدوي.
- يميّز المرصد بيانات النموذج القديم. يحفظ المشغّل انتقال الإصدار في `modelChanges` عند الاستئناف؛ يفصل مشغّل القوانين الأدلة القديمة عن الجديدة بدل دمجها.

## كيف يعمل
- **الموقع:** صفحة ثابتة واحدة (`index.html`) يستضيفها Vercel من الفرع `main`.
- **العالم الأبدي:** تديره GitHub Actions مجانًا (المستودع عام). كل 3 ساعات تقريبًا:
  1. يُستأنف من آخر حالة محفوظة.
  2. يتطور لمدة 40 دقيقة، أي قرابة مليون خطوة فيزيائية.
  3. تُنشر الحالة الجديدة في الفرع `perpetual-data` كـ commit واحد يُستبدل في كل مرة، فلا يتضخم المستودع.
- **مرصد القوانين:** يضيف تجارب جديدة مرة كل يوم في الفرع نفسه.
- **تبويب «المرصد»:** يقرأ البيانات مباشرة من `raw.githubusercontent.com`، فلا يحتاج الموقع إلى إعادة نشر عند كل تحديث.

## 1. GitHub
- المستودع: `YasirObaid5/genesis-evolution`.
- تبدأ الجدولة تلقائيًا بعد أول دفع للكود. لتشغيلها فورًا: **Actions → perpetual-world → Run workflow**.
- لتغيير مدة التشغيل أو تكراره، عدّل `.github/workflows/perpetual.yml`:
  - `cron` يحدد كل كم ساعة يعمل.
  - `minutes` يحدد مدة كل تشغيل.
- **مهم:** يوقف GitHub الجداول في المستودعات العامة إذا لم يحدث أي نشاط في المستودع لمدة 60 يومًا. إن حدث ذلك فأعد تفعيلها من **Actions → perpetual-world → Enable workflow**. أي commit على `main` يعدّ نشاطًا.

## 2. Vercel
- المشروع مربوط بالمستودع، وكل دفع إلى `main` ينشر الموقع.
- الفرع `perpetual-data` لا يُطلق أي نشر، لأن فيه `vercel.json` يمنع ذلك.

## 3. Hostinger (اختياري: تشغيل متواصل 24/7)
GitHub Actions تعطي دفعات منتظمة من الحساب. لتشغيل متواصل بلا توقف تحتاج إلى **VPS**. الاستضافة المشتركة لا تشغّل عمليات Node طويلة.

على VPS (Ubuntu):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs git
git clone https://github.com/YasirObaid5/genesis-evolution.git && cd genesis-evolution
# رمز وصول شخصي (Fine-grained token) بصلاحية Contents: Read and write على هذا المستودع فقط
export GENESIS_PUSH_URL="https://YasirObaid5:<TOKEN>@github.com/YasirObaid5/genesis-evolution.git"
nohup bash runner/daemon.sh > genesis.log 2>&1 &
```
- هذا السكربت يعيد التشغيل كل 30 دقيقة دون فاصل، ويضيف تجارب القوانين يوميًا، وينشر إلى `perpetual-data`.
- إن شغّلت الخادم فأوقف جدول GitHub (**Actions → perpetual-world → Disable workflow**) حتى لا يكتب الاثنان في الوقت نفسه.
- لاستضافة الموقع على Hostinger بدل Vercel: ارفع `index.html` إلى `public_html`، وسيقرأ المرصد البيانات من GitHub كما هو.

## تشغيل محلي
```bash
MINUTES=5 DATA_DIR=data node runner/perpetual.mjs   # يطوّر العالم 5 دقائق
MINUTES=10 DATA_DIR=data node runner/laws.mjs       # يضيف تجارب
python3 build.py                                    # يعيد بناء index.html من src/
python3 -m http.server                              # ثم افتح http://localhost:8000
```
عند وجود مجلد `data/` بجانب `index.html`، يقرأ المرصد منه أولًا.

---

# Running Genesis permanently (English)

- **Site:** static, served by Vercel from `main`.
- **Perpetual world:** a scheduled GitHub Action resumes the saved world every 3 hours, evolves it for 40 minutes, and force-pushes the state as a single commit to the `perpetual-data` branch.
- **Laws observatory:** adds replicate experiments daily to the same branch.
- **Observatory tab:** reads the data from `raw.githubusercontent.com`.
- **Scheduled workflows:** GitHub disables them in public repositories after 60 days without repository activity. Re-enable them from the Actions tab if that happens.
- **24/7 operation:** run `runner/daemon.sh` on a VPS with `GENESIS_PUSH_URL` set to a URL containing a token with contents write access.
