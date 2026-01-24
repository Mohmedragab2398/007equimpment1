/**
 * مثال الدمج الآمن للصلاحيات مع النظام الحالي
 * Safe Integration Example
 * 
 * هذا الملف يوضح كيفية دمج نظام الصلاحيات
 * مع EquipmentManagementSystem بدون تعديل الملف الأصلي
 */

import { PermissionChecker } from './PermissionChecker';
import { MODULES, PERMISSIONS, USER_ROLES } from './AdvancedPermissionsManager';

/**
 * wrapper للتحقق من الصلاحيات قبل العمليات
 */
export class PermissionGuard {
  /**
   * التحقق قبل عرض قسم
   */
  static canAccessSection(userRole, sectionName) {
    const moduleMap = {
      'overview': MODULES.DASHBOARD.id,
      'supervisors': MODULES.SUPERVISORS.id,
      'riders': MODULES.RIDERS.id,
      'inventory': MODULES.INVENTORY.id,
      'orders': MODULES.ORDERS.id,
      'deductions': MODULES.DEDUCTIONS.id
    };

    const moduleId = moduleMap[sectionName];
    if (!moduleId) return false;

    return PermissionChecker.canViewModule(userRole, moduleId);
  }

  /**
   * التحقق قبل إضافة مشرف
   */
  static canAddSupervisor(userRole) {
    return PermissionChecker.hasPermission(
      userRole,
      MODULES.SUPERVISORS.id,
      PERMISSIONS.ADD
    );
  }

  /**
   * التحقق قبل تعديل مشرف
   */
  static canEditSupervisor(userRole) {
    return PermissionChecker.hasPermission(
      userRole,
      MODULES.SUPERVISORS.id,
      PERMISSIONS.EDIT
    );
  }

  /**
   * التحقق قبل حذف مشرف
   */
  static canDeleteSupervisor(userRole) {
    return PermissionChecker.hasPermission(
      userRole,
      MODULES.SUPERVISORS.id,
      PERMISSIONS.DELETE
    );
  }

  /**
   * التحقق قبل إضافة مندوب
   */
  static canAddRider(userRole) {
    return PermissionChecker.hasPermission(
      userRole,
      MODULES.RIDERS.id,
      PERMISSIONS.ADD
    );
  }

  /**
   * التحقق قبل تعديل مندوب
   */
  static canEditRider(userRole) {
    return PermissionChecker.hasPermission(
      userRole,
      MODULES.RIDERS.id,
      PERMISSIONS.EDIT
    );
  }

  /**
   * التحقق قبل حذف مندوب
   */
  static canDeleteRider(userRole) {
    return PermissionChecker.hasPermission(
      userRole,
      MODULES.RIDERS.id,
      PERMISSIONS.DELETE
    );
  }

  /**
   * التحقق قبل إضافة طلب
   */
  static canAddOrder(userRole) {
    return PermissionChecker.hasPermission(
      userRole,
      MODULES.ORDERS.id,
      PERMISSIONS.ADD
    );
  }

  /**
   * التحقق قبل تعديل المخزون
   */
  static canEditInventory(userRole) {
    return PermissionChecker.hasPermission(
      userRole,
      MODULES.INVENTORY.id,
      PERMISSIONS.EDIT
    );
  }

  /**
   * التحقق قبل تصدير البيانات
   */
  static canExportData(userRole) {
    return PermissionChecker.hasPermission(
      userRole,
      MODULES.DASHBOARD.id,
      PERMISSIONS.EXPORT
    );
  }

  /**
   * التحقق قبل إضافة خصم
   */
  static canAddDeduction(userRole) {
    return PermissionChecker.hasPermission(
      userRole,
      MODULES.DEDUCTIONS.id,
      PERMISSIONS.ADD
    );
  }

  /**
   * فلترة الأقسام المتاحة
   */
  static getAvailableSections(userRole) {
    const allSections = ['overview', 'supervisors', 'riders', 'inventory', 'orders', 'deductions'];
    return allSections.filter(section => this.canAccessSection(userRole, section));
  }
}

/**
 * helper لتصفية البيانات بناءً على الصلاحيات
 */
export class PermissionFilter {
  /**
   * تصفية الأزرار في الواجهة
   */
  static getAvailableActions(userRole, itemType) {
    const actions = {
      supervisor: ['view', 'add', 'edit', 'delete'],
      rider: ['view', 'add', 'edit', 'delete', 'upload_photo'],
      inventory: ['view', 'edit', 'export'],
      order: ['view', 'add', 'approve', 'reject'],
      deduction: ['view', 'add', 'delete']
    };

    const availableActions = actions[itemType] || [];
    
    return availableActions.filter(action => {
      switch (itemType) {
        case 'supervisor':
          switch (action) {
            case 'view': return PermissionChecker.canViewModule(userRole, MODULES.SUPERVISORS.id);
            case 'add': return PermissionGuard.canAddSupervisor(userRole);
            case 'edit': return PermissionGuard.canEditSupervisor(userRole);
            case 'delete': return PermissionGuard.canDeleteSupervisor(userRole);
            default: return false;
          }
        case 'rider':
          switch (action) {
            case 'view': return PermissionChecker.canViewModule(userRole, MODULES.RIDERS.id);
            case 'add': return PermissionGuard.canAddRider(userRole);
            case 'edit': return PermissionGuard.canEditRider(userRole);
            case 'delete': return PermissionGuard.canDeleteRider(userRole);
            default: return false;
          }
        case 'order':
          switch (action) {
            case 'view': return PermissionChecker.canViewModule(userRole, MODULES.ORDERS.id);
            case 'add': return PermissionGuard.canAddOrder(userRole);
            default: return false;
          }
        case 'deduction':
          switch (action) {
            case 'add': return PermissionGuard.canAddDeduction(userRole);
            default: return false;
          }
        default:
          return false;
      }
    });
  }
}

export { PermissionGuard, PermissionFilter };
