/**
 * مثال: كيفية دمج نظام الصلاحيات مع EquipmentManagementSystem
 * Integration Example - Safe and Non-Breaking
 * 
 * هذا الملف يوضح الطرق الآمنة لإضافة الصلاحيات
 * بدون تعديل الملف الأصلي
 */

// ============================================
// ✅ الطريقة الأولى: استخدام Wrapper Component
// ============================================

import React, { useState } from 'react';
import EquipmentManagementSystem from './EquipmentManagementSystem';
import { AdminPermissionsPanel } from './AdminPermissionsPanel';
import { PermissionGuard, PermissionFilter } from '../utils/PermissionGuard';
import { PermissionChecker } from '../utils/PermissionChecker';
import { USER_ROLES } from '../utils/AdvancedPermissionsManager';

/**
 * Wrapper آمن لـ EquipmentManagementSystem
 * يضيف الصلاحيات بدون تعديل الكود الأصلي
 */
export function SecureEquipmentSystem({ currentUser }) {
  const [adminMode, setAdminMode] = useState(false);

  // التحقق من أن المستخدم مسؤول
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  return (
    <div>
      {/* شريط التحكم العلوي للمسؤول */}
      {isAdmin && (
        <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
          <div className="font-bold">🔐 وضع إدارة الصلاحيات</div>
          <button
            onClick={() => setAdminMode(!adminMode)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            {adminMode ? 'العودة للنظام' : 'إدارة الصلاحيات'}
          </button>
        </div>
      )}

      {/* واجهة إدارة الصلاحيات */}
      {adminMode && isAdmin && (
        <AdminPermissionsPanel currentUser={currentUser} />
      )}

      {/* النظام الأصلي - بدون تعديل */}
      {!adminMode && <EquipmentManagementSystem />}
    </div>
  );
}

// ============================================
// ✅ الطريقة الثانية: Enhanced Version
// مع إضافة فلاتر الصلاحيات دون تعديل الملف الأصلي
// ============================================

/**
 * Version محسّنة من EquipmentManagementSystem
 * تضيف الصلاحيات كـ wrapper
 */
export function EnhancedEquipmentSystem({ currentUser, ...props }) {
  // احصل على الأقسام المتاحة فقط
  const availableSections = PermissionGuard.getAvailableSections(currentUser?.role);

  // مثال: إذا كان المستخدم ليس لديه صلاحية لرؤية المشرفين
  const canViewSupervisors = PermissionChecker.canViewModule(
    currentUser?.role,
    'supervisors'
  );

  // يمكنك إضافة منطق إضافي هنا
  // مثلاً: تصفية البيانات المعروضة، إخفاء الأزرار، إلخ

  return <EquipmentManagementSystem {...props} />;
}

// ============================================
// ✅ الطريقة الثالثة: Custom Hook للصلاحيات
// ============================================

/**
 * Custom Hook للتحقق من الصلاحيات
 * يمكن استخدامه في أي Component
 */
export function usePermissions(userRole) {
  return {
    // فحوصات الأقسام
    canAccessOverview: () => PermissionGuard.canAccessSection(userRole, 'overview'),
    canAccessSupervisors: () => PermissionGuard.canAccessSection(userRole, 'supervisors'),
    canAccessRiders: () => PermissionGuard.canAccessSection(userRole, 'riders'),
    canAccessInventory: () => PermissionGuard.canAccessSection(userRole, 'inventory'),
    canAccessOrders: () => PermissionGuard.canAccessSection(userRole, 'orders'),

    // فحوصات العمليات
    canAddSupervisor: () => PermissionGuard.canAddSupervisor(userRole),
    canEditSupervisor: () => PermissionGuard.canEditSupervisor(userRole),
    canDeleteSupervisor: () => PermissionGuard.canDeleteSupervisor(userRole),

    canAddRider: () => PermissionGuard.canAddRider(userRole),
    canEditRider: () => PermissionGuard.canEditRider(userRole),
    canDeleteRider: () => PermissionGuard.canDeleteRider(userRole),

    canEditInventory: () => PermissionGuard.canEditInventory(userRole),
    canExportData: () => PermissionGuard.canExportData(userRole),

    // الحصول على الأقسام والإجراءات المتاحة
    availableSections: () => PermissionGuard.getAvailableSections(userRole),
    availableRiderActions: () => PermissionFilter.getAvailableActions(userRole, 'rider'),
    availableSupervisorActions: () => PermissionFilter.getAvailableActions(userRole, 'supervisor'),
  };
}

// ============================================
// ✅ الطريقة الرابعة: Middleware للتحكم في السلوك
// ============================================

/**
 * Middleware للتحقق من الصلاحيات قبل العمليات
 */
export class OperationGuard {
  /**
   * تنفيذ عملية مع التحقق من الصلاحيات
   */
  static async executeWithPermissionCheck(
    userRole,
    moduleId,
    permission,
    operation,
    fallback = null
  ) {
    const hasPermission = PermissionChecker.hasPermission(
      userRole,
      moduleId,
      permission
    );

    if (!hasPermission) {
      console.warn(`❌ عملية مرفوضة: ${userRole} لا يملك صلاحية ${permission} في ${moduleId}`);
      
      if (fallback) {
        return fallback();
      }
      
      throw new Error(`ليس لديك صلاحية لتنفيذ هذه العملية`);
    }

    return await operation();
  }

  /**
   * تنفيذ عملية مع تسجيل المحاولة
   */
  static async executeWithLogging(
    userRole,
    moduleId,
    permission,
    operation,
    operationName = 'unknown'
  ) {
    const hasPermission = PermissionChecker.hasPermission(
      userRole,
      moduleId,
      permission
    );

    const logEntry = {
      timestamp: new Date().toISOString(),
      userRole,
      moduleId,
      permission,
      operationName,
      allowed: hasPermission
    };

    // يمكن إرسال السجل إلى الخادم
    console.log('📝 محاولة عملية:', logEntry);

    if (!hasPermission) {
      throw new Error(`ليس لديك صلاحية لتنفيذ: ${operationName}`);
    }

    try {
      const result = await operation();
      logEntry.status = 'success';
      return result;
    } catch (error) {
      logEntry.status = 'failed';
      logEntry.error = error.message;
      throw error;
    }
  }
}

// ============================================
// ✅ الطريقة الخامسة: Conditional Rendering Helper
// ============================================

/**
 * Helper للعرض الشرطي بناءً على الصلاحيات
 */
export const RenderIfPermission = ({
  userRole,
  moduleId,
  permission,
  children,
  fallback = null,
  requireAll = true,
  permissions = [permission]
}) => {
  const hasPermission = requireAll
    ? PermissionChecker.hasAllPermissions(userRole, moduleId, permissions)
    : PermissionChecker.hasAnyPermission(userRole, moduleId, permissions);

  if (!hasPermission) {
    return fallback;
  }

  return children;
};

// مثال الاستخدام:
/*
<RenderIfPermission
  userRole="manager"
  moduleId="riders"
  permission="add"
>
  <button onClick={addRider}>إضافة مندوب</button>
</RenderIfPermission>
*/

// ============================================
// ✅ مثال كامل: Integration Pattern
// ============================================

/**
 * مثال شامل لكيفية الدمج في تطبيق React
 */
export function EquipmentSystemWithPermissions() {
  // محاكاة: الحصول على المستخدم الحالي
  const currentUser = {
    id: 'user123',
    name: 'أحمد محمد',
    role: 'manager'
  };

  const [activeSection, setActiveSection] = useState('overview');
  const permissions = usePermissions(currentUser.role);

  // التحقق من الصلاحية قبل تغيير القسم
  const handleSectionChange = (section) => {
    const sectionPermissions = {
      overview: permissions.canAccessOverview(),
      supervisors: permissions.canAccessSupervisors(),
      riders: permissions.canAccessRiders(),
      inventory: permissions.canAccessInventory(),
      orders: permissions.canAccessOrders()
    };

    if (!sectionPermissions[section]) {
      alert('ليس لديك صلاحية للدخول إلى هذا القسم');
      return;
    }

    setActiveSection(section);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط الملاحة */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">نظام إدارة المعدات</h1>
            <div className="text-right">
              <p className="text-gray-600">مرحباً: {currentUser.name}</p>
              <p className="text-sm text-gray-500">الدور: {currentUser.role}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto p-4">
        {/* القائمة الجانبية بالأقسام المتاحة فقط */}
        <aside className="mb-4 p-4 bg-white rounded shadow">
          <h3 className="font-bold mb-3">الأقسام المتاحة:</h3>
          <div className="space-y-2">
            {permissions.availableSections().map(section => (
              <button
                key={section}
                onClick={() => handleSectionChange(section)}
                className={`w-full text-right px-4 py-2 rounded ${
                  activeSection === section
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </aside>

        {/* محتوى القسم */}
        <main className="bg-white rounded shadow p-6">
          {activeSection === 'overview' && (
            <div>
              <h2 className="text-xl font-bold mb-4">لوحة التحكم</h2>
              {/* محتوى لوحة التحكم */}
            </div>
          )}

          {activeSection === 'riders' && (
            <div>
              <h2 className="text-xl font-bold mb-4">إدارة المناديب</h2>
              
              {/* الأزرار المتاحة فقط */}
              <div className="flex gap-2 mb-4">
                {permissions.canAddRider() && (
                  <button className="bg-green-600 text-white px-4 py-2 rounded">
                    إضافة مندوب
                  </button>
                )}
                
                {permissions.canExportData() && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded">
                    تصدير
                  </button>
                )}
              </div>

              {/* محتوى المناديب */}
            </div>
          )}

          {/* أقسام أخرى ... */}
        </main>
      </div>
    </div>
  );
}

// ============================================
// ✅ Export للاستخدام
// ============================================

export {
  OperationGuard,
  RenderIfPermission
};
