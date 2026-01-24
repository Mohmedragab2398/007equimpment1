# 🔐 نظام الصلاحيات المتقدم

## 🚀 البدء السريع (5 دقائق)

### الخطوة 1: استيراد النظام
```javascript
import { permissionsManager, USER_ROLES } from '@/utils/AdvancedPermissionsManager';
import { PermissionChecker } from '@/utils/PermissionChecker';
import AdminPermissionsPanel from '@/components/AdminPermissionsPanel';
```

### الخطوة 2: إضافة واجهة المسؤول
```jsx
// في صفحة المسؤول
<AdminPermissionsPanel currentUser={{ role: 'admin' }} />
```

### الخطوة 3: التحقق من الصلاحيات
```javascript
// في أي component
if (PermissionChecker.hasPermission('manager', 'riders', 'add')) {
  // اعرض زر الإضافة
}
```

---

## 📁 الملفات المضافة

```
src/
├── utils/
│   ├── AdvancedPermissionsManager.js  ✨ نظام الصلاحيات الأساسي
│   ├── PermissionChecker.js           ✨ فئة التحقق من الصلاحيات
│   ├── PermissionGuard.js             ✨ حماية الصلاحيات والفلترة
│   ├── IntegrationExample.jsx         ✨ أمثلة الدمج
│   └── TestingAndDemo.js              ✨ اختبارات وعروض توضيحية
└── components/
    └── AdminPermissionsPanel.jsx      ✨ واجهة إدارة الصلاحيات

ADVANCED_PERMISSIONS_GUIDE.md          📖 دليل شامل
PERMISSIONS_QUICK_START.md             📖 دليل البدء السريع (هذا الملف)
```

---

## ⚡ أمثلة سريعة

### 1️⃣ التحقق من صلاحية واحدة
```javascript
const canAdd = PermissionChecker.hasPermission('manager', 'riders', 'add');
```

### 2️⃣ التحقق من عدة صلاحيات (ALL)
```javascript
const canManage = PermissionChecker.hasAllPermissions(
  'manager', 
  'riders', 
  ['add', 'edit', 'delete']
);
```

### 3️⃣ التحقق من صلاحية واحدة على الأقل (OR)
```javascript
const canAct = PermissionChecker.hasAnyPermission(
  'manager', 
  'riders', 
  ['add', 'edit', 'delete']
);
```

### 4️⃣ الحصول على الأقسام المتاحة
```javascript
const sections = PermissionGuard.getAvailableSections('manager');
// ['overview', 'supervisors', 'riders', 'inventory', 'orders']
```

### 5️⃣ إخفاء زر بناءً على الصلاحيات
```jsx
{PermissionChecker.hasPermission(userRole, 'riders', 'delete') && (
  <button onClick={deleteRider}>حذف</button>
)}
```

### 6️⃣ تصفية البيانات
```javascript
const availableActions = PermissionFilter.getAvailableActions('manager', 'rider');
// ['view', 'add', 'edit', 'upload_photo']
```

---

## 🔧 العمليات الشائعة

### تحديث صلاحية
```javascript
permissionsManager.updatePermission(
  'manager',     // الدور
  'riders',      // الوحدة
  'delete',      // الصلاحية
  true,          // القيمة الجديدة
  'admin'        // من قام بالتغيير
);
```

### إخفاء وحدة كاملة
```javascript
permissionsManager.hideModule('supervisor', 'riders');
```

### إظهار وحدة
```javascript
permissionsManager.showModule('supervisor', 'riders');
```

### منح كل الصلاحيات
```javascript
permissionsManager.grantAllPermissions('manager');
```

### سحب كل الصلاحيات
```javascript
permissionsManager.revokeAllPermissions('supervisor');
```

### إعادة التعيين للقيم الافتراضية
```javascript
permissionsManager.resetRolePermissions('manager');
```

---

## 📊 الصلاحيات الافتراضية

### Admin 🔴
- **جميع الوحدات**: ✅ كل الصلاحيات

### Manager 🟢
| الوحدة | View | Add | Edit | Delete | Export |
|---------|------|-----|------|--------|--------|
| Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supervisors | ✅ | ✅ | ✅ | ❌ | ❌ |
| Riders | ✅ | ✅ | ✅ | ❌ | ✅ |
| Inventory | ✅ | ✅ | ✅ | ❌ | ✅ |
| Orders | ✅ | ✅ | ✅ | ❌ | ✅ |
| Reports | ✅ | ❌ | ❌ | ❌ | ✅ |
| Deductions | ✅ | ✅ | ✅ | ❌ | ✅ |

### Supervisor 🟡
| الوحدة | View | Add | Edit | Delete | Export |
|---------|------|-----|------|--------|--------|
| Dashboard | ✅ | ❌ | ❌ | ❌ | ❌ |
| Riders | ✅ | ❌ | ❌ | ❌ | ❌ |
| Inventory | ✅ | ❌ | ❌ | ❌ | ❌ |
| Orders | ✅ | ✅ | ❌ | ❌ | ❌ |
| Reports | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🧪 الاختبار

### تشغيل الاختبارات الشاملة
```javascript
import { runComprehensiveTests } from '@/utils/TestingAndDemo';

runComprehensiveTests();
```

### تشغيل سيناريو واقعي
```javascript
import { runRealWorldScenario } from '@/utils/TestingAndDemo';

runRealWorldScenario();
```

### أداة التشخيص
```javascript
import { diagnosticTool } from '@/utils/TestingAndDemo';

diagnosticTool();
```

### عرض الإحصائيات
```javascript
import { showStatistics } from '@/utils/TestingAndDemo';

showStatistics();
```

---

## 💾 التخزين

يتم تخزين جميع البيانات تلقائياً في `LocalStorage`:

```javascript
// يمكنك عرضها من الكونسول
console.log(localStorage.getItem('ems_permissions_v1'));
console.log(localStorage.getItem('ems_permissions_log_v1'));
```

---

## 🔒 الأمان

✅ **هام جداً:**
- هذا النظام **ليس بديلاً** عن التحقق من الخادم
- يجب التحقق من الصلاحيات على الخادم أيضاً
- هذا النظام فقط يتحكم في واجهة المستخدم

❌ **لا تفعل:**
- لا تخزن بيانات سرية في هذا النظام
- لا تعتمد عليه فقط للحماية

---

## 📝 الأنماط الموصى بها

### ✅ النمط الأول: Conditional Rendering
```jsx
{PermissionChecker.hasPermission(userRole, moduleId, permission) && (
  <Component />
)}
```

### ✅ النمط الثاني: Custom Hook
```javascript
const canEdit = usePermission(userRole, 'riders', 'edit');
```

### ✅ النمط الثالث: Permission Guard
```javascript
if (!PermissionGuard.canAddRider(userRole)) {
  throw new Error('No permission');
}
```

### ✅ النمط الرابع: Wrapper Component
```jsx
<ProtectedComponent permission="edit" module="riders">
  <EditForm />
</ProtectedComponent>
```

---

## 🆘 حل المشاكل الشائعة

### المشكلة: الصلاحيات لا تطبق

```javascript
// 1. تحقق من الدور
console.log(currentUser.role);

// 2. تحقق من اسم الوحدة
console.log(Object.values(MODULES).map(m => m.id));

// 3. تحقق من البيانات المحفوظة
console.log(permissionsManager.permissions);
```

### المشكلة: البيانات لا تُحفظ

```javascript
// تأكد من استدعاء savePermissions()
permissionsManager.updatePermission(...);
permissionsManager.savePermissions(); // ✅ ضروري
```

---

## 📞 الدعم

للمزيد من المعلومات:
- اقرأ `ADVANCED_PERMISSIONS_GUIDE.md` (شامل)
- اطلع على `IntegrationExample.jsx` (أمثلة الكود)
- شغّل `TestingAndDemo.js` (اختبرها بنفسك)

---

## 🎯 الخطوات التالية

1. ✅ أضف `AdminPermissionsPanel` إلى صفحة المسؤول
2. ✅ استخدم `PermissionChecker` للتحقق من الصلاحيات
3. ✅ أخفِ الأزرار/الأقسام بناءً على الصلاحيات
4. ✅ اختبر مع مستخدمين مختلفين

---

**تم بناء هذا النظام ليكون:**
- ✨ بسيط وسهل الاستخدام
- ✨ آمن وموثوق
- ✨ منفصل تماماً عن النظام الحالي
- ✨ سهل التكامل والتوسع
