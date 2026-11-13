# لوحة تحكم لينكار

مشروع Next.js 16 مستقل جوه ريبو الموقع (`admin/`)، مبني على «Linkar - Frontend guide» (249 صفحة) والتصميم
`Jg1QS1kTQMFGU99S6LIu3R` صفحة `linkar-control-panel v3`.

## التشغيل محلياً

```bash
cd admin
npm install
npm run dev        # http://localhost:3200
```

## الدخول التجريبي (لحد ما الـAPI يجهز)

- البريد: أي بريد `@linkar.sa` أو `@linkarksa.com`
- كلمة المرور: أي 8 حروف أو أكتر
- رمز التحقق: أي 6 أرقام (ماعدا `000000` عشان تجرّب رسالة الخطأ)

## الهيكل

- `src/app/(auth)` شاشات الدخول (CON5-L1 · L2 · L0) وتعيين كلمة مرور جديدة
- `src/app/(panel)` هيكل اللوحة (القائمة الجانبية + الشريط العلوي) وكل الشاشات
- `src/components/ui` المكونات الأساسية (القسم 3.5) · `src/components/panel` عناصر اللوحة المتكررة
- `src/lib/api` طبقة الـAPI: بيانات تجريبية بنفس شكل الخادم — لما الخادم يجهز بنغيّر جسم الدوال بس
- `src/proxy.ts` حماية الصفحات (من غير جلسة → `/login`)

## النشر

خدمة `admin` في `docker-compose.yml` الرئيسي (بورت `ADMIN_PORT`، الافتراضي 3001) — على `admin.linkarksa.com` من خلال nginx.
