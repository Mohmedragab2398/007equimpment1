## 🔐 نظام الصلاحيات المتقدم - دليل الاستخدام الكامل

### 📋 محتويات النظام

تم إنشاء نظام صلاحيات متقدم يتكون من:

```
src/
├── utils/
│   ├── AdvancedPermissionsManager.js   # فئة إدارة الصلاحيات الأساسية
│   ├── PermissionChecker.js            # فئة التحقق من الصلاحيات
│   ├── PermissionGuard.js              # فئات الحماية والفلترة
│   └── IntegrationExample.md           # أمثلة الدمج
└── components/
    └── AdminPermissionsPanel.jsx       # واجهة المسؤول
```

---

## 🚀 البدء السريع

### 1️⃣ الخطوة الأولى: استيراد النظام

```javascript
// في أي ملف تحتاج فيه للتحقق من الصلاحيات
import { permissionsManager, MODULES, PERMISSIONS, USER_ROLES } from '@/utils/AdvancedPermissionsManager';
import { PermissionChecker } from '@/utils/PermissionChecker';
import { PermissionGuard } from '@/utils/PermissionGuard';
```

### 2️⃣ التحقق البسيط من الصلاحيات

```javascript
// التحقق من صلاحية محددة
const canAdd = PermissionChecker.hasPermission(
  'manager',
  'riders',
  'add'
);

// التحقق من رؤية وحدة
const canSeeRiders = PermissionChecker.canViewModule('manager', 'riders');
```

### 3️⃣ إضافة واجهة المسؤول

```jsx
import AdminPermissionsPanel from '@/components/AdminPermissionsPanel';

// في الصفحة الرئيسية للمسؤول
<AdminPermissionsPanel currentUser={currentUser} />
```

---

## 🔍 الوحدات المتاحة (Modules)

```javascript
{
  DASHBOARD: 'dashboard',           // لوحة التحكم
  SUPERVISORS: 'supervisors',       // المشرفين
  RIDERS: 'riders',                 // المناديب
  INVENTORY: 'inventory',           // المخزون
  ORDERS: 'orders',                 // الطلبات
  REPORTS: 'reports',               // التقارير
  DEDUCTIONS: 'deductions',         // الخصومات
  SETTINGS: 'settings',             // الإعدادات
  PERMISSIONS_ADMIN: 'permissions_admin'  // إدارة الصلاحيات
}
```

## 🛡️ الصلاحيات المتاحة (Permissions)

```javascript
{
  VIEW: 'view',      // عرض
  ADD: 'add',        // إضافة
  EDIT: 'edit',      // تعديل
  DELETE: 'delete',  // حذف
  EXPORT: 'export'   // تصدير
}
```

## 👥 أنواع المستخدمين (User Roles)

```javascript
{
  ADMIN: 'admin',           // المسؤول - صلاحيات كاملة
  MANAGER: 'manager',       // المدير - صلاحيات محدودة
  SUPERVISOR: 'supervisor'  // المشرف - صلاحيات قليلة جداً
}
```

---

## 📚 أمثلة الاستخدام المتقدمة

### ✅ مثال 1: التحقق من صلاحيات متعددة

```javascript
// التحقق من كل الصلاحيات (AND)
const canManageRiders = PermissionChecker.hasAllPermissions(
  'manager',
  'riders',
  ['view', 'add', 'edit', 'delete']
);

// التحقق من واحد على الأقل (OR)
const canActOnRiders = PermissionChecker.hasAnyPermission(
  'manager',
  'riders',
  ['add', 'edit', 'delete']
);
```

### ✅ مثال 2: تصفية القائمة الجانبية

```javascript
// الحصول على الوحدات المرئية فقط
const visibleModules = PermissionChecker.getVisibleModules('manager');

// فلترة عناصر القائمة
const filteredMenu = PermissionChecker.filterMenuItems(
  'manager',
  menuItems
);
```

### ✅ مثال 3: التحكم في الأزرار

```jsx
function SomeComponent({ userRole }) {
  return (
    <div>
      {PermissionChecker.hasPermission(userRole, 'riders', 'add') && (
        <button onClick={addRider}>إضافة مندوب</button>
      )}
      
      {PermissionChecker.hasPermission(userRole, 'riders', 'delete') && (
        <button onClick={deleteRider}>حذف</button>
      )}
      
      {PermissionChecker.hasPermission(userRole, 'riders', 'export') && (
        <button onClick={exportData}>تصدير</button>
      )}
    </div>
  );
}
```

### ✅ مثال 4: تصفية البيانات المعروضة

```javascript
// تصفية الأقسام المتاحة
const availableSections = PermissionGuard.getAvailableSections('manager');
// ['overview', 'supervisors', 'riders', 'inventory', 'orders', 'deductions']

// تصفية الإجراءات المتاحة
const riderActions = PermissionFilter.getAvailableActions('manager', 'rider');
// ['view', 'add', 'edit', 'delete', 'upload_photo']
```

### ✅ مثال 5: الدمج مع React State

```jsx
import { useState } from 'react';
import { PermissionGuard } from '@/utils/PermissionGuard';

function EquipmentSystem() {
  const [currentUser, setCurrentUser] = useState({ role: 'manager' });
  const [activeSection, setActiveSection] = useState('overview');

  // التحقق من الصلاحية قبل تغيير القسم
  const changeSection = (section) => {
    if (PermissionGuard.canAccessSection(currentUser.role, section)) {
      setActiveSection(section);
    } else {
      alert('ليس لديك صلاحية لدخول هذا القسم');
    }
  };

  return (
    <div>
      <aside>
        {PermissionGuard.getAvailableSections(currentUser.role).map(section => (
          <button 
            key={section}
            onClick={() => changeSection(section)}
            className={activeSection === section ? 'active' : ''}
          >
            {section}
          </button>
        ))}
      </aside>

      <main>
        {activeSection === 'riders' && (
          <div>
            {PermissionGuard.canAddRider(currentUser.role) && (
              <button onClick={addRider}>إضافة مندوب</button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
```

### ✅ مثال 6: إدارة الصلاحيات برمجياً

```javascript
// تحديث صلاحية محددة
permissionsManager.updatePermission(
  'manager',           // الدور
  'riders',            // الوحدة
  'delete',            // الصلاحية
  true,                // القيمة الجديدة
  'admin'              // المسؤول عن التغيير
);

// إخفاء وحدة كاملة
permissionsManager.hideModule('supervisor', 'supervisors');

// إظهار وحدة
permissionsManager.showModule('supervisor', 'supervisors');

// منح كل الصلاحيات
permissionsManager.grantAllPermissions('manager');

// سحب كل الصلاحيات
permissionsManager.revokeAllPermissions('supervisor');

// إعادة التعيين للقيم الافتراضية
permissionsManager.resetRolePermissions('manager');
```

### ✅ مثال 7: سجل التغييرات

```javascript
// الحصول على سجل التغييرات
const allLogs = permissionsManager.getChangeLog();

// تصفية السجلات
const managerLogs = permissionsManager.getChangeLog({
  userRole: 'manager',
  type: 'permission_update'
});

// تصفية بنطاق زمني
const recentLogs = permissionsManager.getChangeLog({
  startDate: new Date(Date.now() - 7*24*60*60*1000), // آخر 7 أيام
  endDate: new Date()
});
```

### ✅ مثال 8: التصدير والاستيراد

```javascript
// تصدير كل الصلاحيات والسجلات
const backup = permissionsManager.export();
console.log(backup);
// {
//   version: '1.0.0',
//   exportDate: '2024-01-15T...',
//   permissions: { ... },
//   log: [ ... ]
// }

// حفظ النسخة الاحتياطية
const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
// ... حفظ الملف ...

// استيراد من نسخة احتياطية
permissionsManager.import(backup);
```

---

## 🔧 الدمج الآمن مع النظام الحالي

### الطريقة 1: إضافة التحقق في المكون الموجود

```jsx
// بدلاً من تعديل EquipmentManagementSystem.jsx مباشرة
// أنشئ wrapper component:

import EquipmentManagementSystem from './EquipmentManagementSystem';
import { PermissionGuard } from '@/utils/PermissionGuard';
import AdminPermissionsPanel from './AdminPermissionsPanel';

function SafeEquipmentSystem({ currentUser }) {
  return (
    <>
      {currentUser?.role === 'admin' && (
        <AdminPermissionsPanel currentUser={currentUser} />
      )}
      
      {/* النظام الأصلي يعمل كما هو */}
      <EquipmentManagementSystem />
    </>
  );
}
```

### الطريقة 2: استخدام Higher-Order Component

```javascript
import { PermissionChecker } from '@/utils/PermissionChecker';

export function withPermissionCheck(Component, requiredModule, requiredPermission) {
  return function ProtectedComponent(props) {
    const hasPermission = PermissionChecker.hasPermission(
      props.userRole,
      requiredModule,
      requiredPermission
    );

    if (!hasPermission) {
      return <div>ليس لديك صلاحية للدخول إلى هذا القسم</div>;
    }

    return <Component {...props} />;
  };
}

// الاستخدام
const ProtectedRidersSection = withPermissionCheck(
  RidersSection,
  'riders',
  'view'
);
```

### الطريقة 3: استخدام Custom Hook

```javascript
import { useState, useEffect } from 'react';
import { PermissionChecker } from '@/utils/PermissionChecker';

export function usePermission(userRole, moduleId, permission) {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const result = PermissionChecker.hasPermission(userRole, moduleId, permission);
    setHasPermission(result);
  }, [userRole, moduleId, permission]);

  return hasPermission;
}

// الاستخدام في Component
function RiderActions({ userRole, riderId }) {
  const canEdit = usePermission(userRole, 'riders', 'edit');
  const canDelete = usePermission(userRole, 'riders', 'delete');

  return (
    <div>
      {canEdit && <button>تعديل</button>}
      {canDelete && <button>حذف</button>}
    </div>
  );
}
```

---

## 📊 الصلاحيات الافتراضية

### 🔵 Admin (المسؤول)
- **جميع الوحدات**: ✅ كل الصلاحيات

### 🟢 Manager (المدير)
| الوحدة | View | Add | Edit | Delete | Export |
|--------|------|-----|------|--------|--------|
| Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supervisors | ✅ | ✅ | ✅ | ❌ | ❌ |
| Riders | ✅ | ✅ | ✅ | ❌ | ✅ |
| Inventory | ✅ | ✅ | ✅ | ❌ | ✅ |
| Orders | ✅ | ✅ | ✅ | ❌ | ✅ |
| Reports | ✅ | ❌ | ❌ | ❌ | ✅ |
| Deductions | ✅ | ✅ | ✅ | ❌ | ✅ |
| Settings | ❌ | ❌ | ❌ | ❌ | ❌ |

### 🟡 Supervisor (المشرف)
| الوحدة | View | Add | Edit | Delete | Export |
|--------|------|-----|------|--------|--------|
| Dashboard | ✅ | ❌ | ❌ | ❌ | ❌ |
| Supervisors | ❌ | ❌ | ❌ | ❌ | ❌ |
| Riders | ✅ | ❌ | ❌ | ❌ | ❌ |
| Inventory | ✅ | ❌ | ❌ | ❌ | ❌ |
| Orders | ✅ | ✅ | ❌ | ❌ | ❌ |
| Reports | ✅ | ❌ | ❌ | ❌ | ❌ |
| Deductions | ❌ | ❌ | ❌ | ❌ | ❌ |
| Settings | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## ⚙️ التخزين

جميع البيانات يتم تخزينها في `LocalStorage`:

```javascript
// مفاتيح التخزين
{
  'ems_permissions_v1': {...},      // الصلاحيات الحالية
  'ems_permissions_log_v1': [...]   // سجل التغييرات
}
```

---

## 🔒 الأمان والممارسات الأفضل

✅ **ما يجب فعله:**
- التحقق دائماً من الصلاحيات على الخادم أيضاً
- عدم الثقة الكاملة في التحقق من العميل
- تسجيل جميع التغييرات
- عمل نسخ احتياطية منتظمة

❌ **ما يجب تجنبه:**
- تخزين بيانات سرية في `LocalStorage`
- تعديل الصلاحيات من قبل المستخدم العادي
- عدم التحقق على الخادم

---

## 🐛 استكشاف الأخطاء

### المشكلة: الصلاحيات لا تطبق

```javascript
// 1. تحقق من أن الدور صحيح
console.log(currentUser.role);

// 2. تحقق من أن الوحدة موجودة
console.log(Object.values(MODULES).map(m => m.id));

// 3. تحقق من الصلاحيات المحفوظة
console.log(permissionsManager.permissions);
```

### المشكلة: النسيان حفظ بعد التغيير

```javascript
// تأكد من استدعاء savePermissions() بعد التعديل
permissionsManager.updatePermission(...);
permissionsManager.savePermissions(); // ✅ ضروري

// أو استخدم الدوال التي تحفظ تلقائياً
```

---

## 📞 الدعم والمساعدة

للأسئلة والمشاكل:
1. تحقق من سجل التغييرات: `getChangeLog()`
2. استخدم الكونسول للتصحيح
3. راجع الأمثلة أعلاه

---

## 📝 الملاحظات النهائية

✨ **المميزات الرئيسية:**
- ✅ نظام متقدم للصلاحيات
- ✅ إدارة سهلة من قبل المسؤول
- ✅ تسجيل كامل للتغييرات
- ✅ عدم التأثير على النظام الحالي
- ✅ سهل الاستخدام والتكامل
