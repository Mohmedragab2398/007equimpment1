/**
 * مثال: App.jsx محسّن مع نظام الصلاحيات
 * Enhanced App.jsx with Permissions System
 * 
 * هذا ملف مثال يوضح كيفية دمج نظام الصلاحيات
 * مع التطبيق الموجود بدون تعديل الملف الأصلي
 */

import React, { useState, useEffect } from 'react';
import EquipmentManagementSystem from './components/EquipmentManagementSystem';
import AdminPermissionsPanel from './components/AdminPermissionsPanel';
import './styles/globals.css';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';

// استيراد نظام الصلاحيات
import { USER_ROLES } from './utils/AdvancedPermissionsManager';

/**
 * 🎯 الطريقة الآمنة للدمج:
 * 
 * 1. أضف هذا المكون wrapper
 * 2. استخدمه بدلاً من App الأصلي
 * 3. أو استخدمه معه دون تعديل
 */

function AppWithPermissions() {
  // محاكاة: الحصول على المستخدم الحالي
  // في التطبيق الحقيقي، سيأتي من الخادم أو state أعلى
  const [currentUser, setCurrentUser] = useState({
    id: 'user123',
    name: 'مستخدم تجريبي',
    role: USER_ROLES.MANAGER, // غيّر هذا للاختبار
    email: 'user@example.com'
  });

  const [adminMode, setAdminMode] = useState(false);

  // التحقق من أن المستخدم مسؤول
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط التحكم العلوي - مرئي للجميع */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🚀 نظام إدارة المعدات
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* معلومات المستخدم */}
            <div className="text-right">
              <p className="font-bold text-gray-800">{currentUser.name}</p>
              <p className="text-sm text-gray-600">
                الدور: <span className="font-semibold">{currentUser.role}</span>
              </p>
            </div>

            {/* زر الدخول لوضع الصلاحيات - للمسؤول فقط */}
            {isAdmin && (
              <button
                onClick={() => setAdminMode(!adminMode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  adminMode
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {adminMode ? '← العودة' : '🔐 الصلاحيات'}
              </button>
            )}

            {/* قائمة تبديل المستخدم - للاختبار */}
            <div className="border-l pl-4">
              <select
                value={currentUser.role}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, role: e.target.value })
                }
                className="p-2 border rounded-lg text-sm"
              >
                <option value={USER_ROLES.ADMIN}>👤 Admin</option>
                <option value={USER_ROLES.MANAGER}>👤 Manager</option>
                <option value={USER_ROLES.SUPERVISOR}>👤 Supervisor</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto">
        {adminMode && isAdmin ? (
          // 🔐 واجهة إدارة الصلاحيات
          <div className="p-6">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔐</div>
                <div>
                  <h3 className="font-bold text-blue-900">وضع إدارة الصلاحيات</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    أنت في وضع الإدارة. يمكنك التحكم في صلاحيات جميع المستخدمين.
                    استخدم الأزرار أعلاه للعودة إلى النظام العادي.
                  </p>
                </div>
              </div>
            </div>

            <AdminPermissionsPanel currentUser={currentUser} />
          </div>
        ) : (
          // 📊 النظام الأصلي - بدون تعديل
          <div className="p-6">
            <EquipmentManagementSystem />
          </div>
        )}
      </main>

      {/* تذكير بالمعلومات الحالية */}
      <footer className="bg-gray-100 border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <div>
              🧪 هذا وضع الاختبار - المستخدم الحالي: <strong>{currentUser.role}</strong>
            </div>
            <div>
              💾 جميع البيانات محفوظة في LocalStorage
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * ✨ الطريقة الثانية: استخدام Conditional Rendering
 * أبسط للدمج في التطبيق الموجود
 */
function AppWithOptionalPermissions() {
  const [currentUser] = useState({
    id: 'user123',
    name: 'مستخدم',
    role: USER_ROLES.MANAGER
  });

  return (
    <>
      {/* أضف واجهة الصلاحيات فقط للمسؤول */}
      {currentUser.role === USER_ROLES.ADMIN && (
        <AdminPermissionsPanel currentUser={currentUser} />
      )}

      {/* النظام الأصلي يعمل كما هو */}
      <EquipmentManagementSystem />
    </>
  );
}

/**
 * ⭐ الاستخدام الموصى به:
 * 
 * استبدل:
 *   export default App;
 * 
 * بـ:
 *   export default AppWithPermissions;
 */

export default AppWithPermissions;

// يمكنك أيضاً تصدير النسخة الأخرى للاختبار
export { AppWithOptionalPermissions };

/*
 * 📝 ملاحظات مهمة:
 * 
 * 1. هذا الملف مثال فقط - يمكنك تعديله حسب احتياجاتك
 * 2. لا تعدّل EquipmentManagementSystem.jsx الأصلي
 * 3. استخدم currentUser من state التطبيق الحقيقي
 * 4. اختبر مع أدوار مختلفة قبل النشر
 * 
 * 🔐 الأمان:
 * - تأكد من التحقق من الصلاحيات على الخادم أيضاً
 * - لا تخزن بيانات حساسة في LocalStorage
 */
