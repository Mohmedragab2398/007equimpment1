# 🚀 دليل رفع المشروع إلى حساب GitHub الجديد

## 📋 الخطوات المطلوبة

### الخطوة 1: إعداد المصادقة مع GitHub

لديك 3 خيارات:

#### الخيار 1: استخدام Personal Access Token (موصى به)

1. **إنشاء Token:**
   - اذهب إلى: https://github.com/settings/tokens
   - اضغط: "Generate new token" → "Generate new token (classic)"
   - اختر الاسم: "Vercel Deployment"
   - حدد الصلاحيات:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
   - اضغط: "Generate token"
   - **انسخ Token** (سيظهر مرة واحدة فقط!)

2. **استخدام Token:**
   ```bash
   git remote set-url newgithub https://YOUR_TOKEN@github.com/Mohmedragab2398/007equimpment1.git
   ```

#### الخيار 2: استخدام GitHub CLI

```bash
# تثبيت GitHub CLI (إذا لم يكن مثبتاً)
# Windows: winget install GitHub.cli
# أو حمّل من: https://cli.github.com/

# تسجيل الدخول
gh auth login

# اختيار GitHub.com
# اختيار HTTPS
# تسجيل الدخول بحساب Mohmedragab2398
```

#### الخيار 3: استخدام SSH (للاستخدام الدائم)

1. **إنشاء SSH Key:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **إضافة SSH Key إلى GitHub:**
   - انسخ المحتوى من: `C:\Users\YourUser\.ssh\id_ed25519.pub`
   - اذهب إلى: https://github.com/settings/keys
   - اضغط: "New SSH key"
   - الصق المفتاح واحفظه

3. **تغيير Remote إلى SSH:**
   ```bash
   git remote set-url newgithub git@github.com:Mohmedragab2398/007equimpment1.git
   ```

---

### الخطوة 2: رفع المشروع

بعد إعداد المصادقة:

```bash
cd D:\Download\007equimpment-main

# رفع جميع الفروع
git push newgithub main

# إذا كان هناك فروع أخرى
git push newgithub --all

# رفع جميع Tags (إن وجدت)
git push newgithub --tags
```

---

### الخطوة 3: إعداد Vercel مع المستودع الجديد

1. **في Vercel Dashboard:**
   - اذهب إلى: https://vercel.com/dashboard
   - اختر مشروعك: `007equimpment`
   - Settings → Git
   - اضغط: "Disconnect"

2. **إعادة الربط:**
   - اضغط: "Connect Git Repository"
   - اختر: GitHub
   - **تأكد من تسجيل الدخول بحساب Mohmedragab2398**
   - اختر المستودع: `Mohmedragab2398/007equimpment1`
   - تأكد من:
     - ✅ Framework Preset: `Vite`
     - ✅ Production Branch: `main`
     - ✅ Root Directory: `.`
     - ✅ Build Command: `npm run build`
     - ✅ Output Directory: `dist`
     - ✅ Auto-deploy: Enabled

3. **حفظ:**
   - اضغط: "Save" أو "Deploy"

---

### الخطوة 4: التحقق

1. **في GitHub:**
   - اذهب إلى: https://github.com/Mohmedragab2398/007equimpment1
   - تأكد من وجود جميع الملفات

2. **في Vercel:**
   - اذهب إلى: Deployments
   - يجب أن ترى deployment جديد

---

## 🔧 الأوامر السريعة

### إذا استخدمت Personal Access Token:

```bash
# استبدل YOUR_TOKEN بالـ Token الذي نسخته
git remote set-url newgithub https://YOUR_TOKEN@github.com/Mohmedragab2398/007equimpment1.git

# رفع المشروع
git push newgithub main
```

### إذا استخدمت SSH:

```bash
# تغيير Remote إلى SSH
git remote set-url newgithub git@github.com:Mohmedragab2398/007equimpment1.git

# رفع المشروع
git push newgithub main
```

---

## ⚠️ ملاحظات مهمة

1. **Personal Access Token:**
   - احفظه في مكان آمن
   - لا تشاركه مع أحد
   - يمكنك استخدامه في المستقبل

2. **SSH Keys:**
   - أكثر أماناً للاستخدام الدائم
   - لا تحتاج إدخال كلمة مرور في كل مرة

3. **Vercel:**
   - تأكد من تسجيل الدخول بحساب GitHub الجديد
   - أو أضف المستودع الجديد كمشروع جديد في Vercel

---

## 📞 إذا واجهت مشاكل

### المشكلة: Permission denied
**الحل:** تأكد من استخدام Token صحيح أو SSH Key مضاف

### المشكلة: Repository not found
**الحل:** تأكد من أن المستودع موجود وأن لديك صلاحيات

### المشكلة: Vercel لا تستقبل التحديثات
**الحل:** أعد ربط المستودع في Vercel Dashboard

---

## ✅ بعد الرفع الناجح

1. تحقق من GitHub: جميع الملفات موجودة ✅
2. تحقق من Vercel: deployment جديد ✅
3. تحقق من الموقع: يعمل بشكل صحيح ✅

---

**بعد إعداد المصادقة، سأرفع المشروع تلقائياً!** 🚀
