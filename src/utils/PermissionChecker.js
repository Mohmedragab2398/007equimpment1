/**
 * فئة التحقق من الصلاحيات
 * Permission Checker Class
 * 
 * توفر طرقاً للتحقق من صلاحيات المستخدمين
 * في جميع أنحاء التطبيق
 */

import { permissionsManager, PERMISSIONS, MODULES } from './AdvancedPermissionsManager';

export class PermissionChecker {
  /**
   * التحقق من صلاحية معينة
   */
  static hasPermission(userRole, moduleId, permission) {
    return permissionsManager.checkPermission(userRole, moduleId, permission);
  }

  /**
   * التحقق من رؤية الوحدة
   */
  static canViewModule(userRole, moduleId) {
    return permissionsManager.canViewModule(userRole, moduleId);
  }

  /**
   * التحقق من عدة صلاحيات (AND)
   */
  static hasAllPermissions(userRole, moduleId, permissions = []) {
    return permissions.every(perm => this.hasPermission(userRole, moduleId, perm));
  }

  /**
   * التحقق من واحد على الأقل من الصلاحيات (OR)
   */
  static hasAnyPermission(userRole, moduleId, permissions = []) {
    return permissions.some(perm => this.hasPermission(userRole, moduleId, perm));
  }

  /**
   * تصفية الوحدات بناءً على الرؤية
   */
  static getVisibleModules(userRole) {
    const visible = {};
    
    Object.entries(MODULES).forEach(([key, module]) => {
      if (this.canViewModule(userRole, module.id)) {
        visible[key] = module;
      }
    });

    return visible;
  }

  /**
   * الحصول على صلاحيات المستخدم لوحدة معينة
   */
  static getModulePermissions(userRole, moduleId) {
    const rolePerms = permissionsManager.permissions[userRole];
    if (!rolePerms) return null;

    return rolePerms.modules[moduleId] || null;
  }

  /**
   * الحصول على ملخص صلاحيات المستخدم
   */
  static getUserSummary(userRole) {
    return permissionsManager.getSummary(userRole);
  }

  /**
   * فلترة عناصر القائمة
   */
  static filterMenuItems(userRole, menuItems) {
    return menuItems.filter(item => {
      // إذا لم يكن للعنصر صلاحية مطلوبة، أظهره
      if (!item.requiresModule) {
        return true;
      }

      // التحقق من الرؤية
      return this.canViewModule(userRole, item.requiresModule);
    });
  }

  /**
   * فلترة الأزرار
   */
  static canShowButton(userRole, moduleId, action) {
    const actionToPermission = {
      'view': PERMISSIONS.VIEW,
      'add': PERMISSIONS.ADD,
      'edit': PERMISSIONS.EDIT,
      'delete': PERMISSIONS.DELETE,
      'export': PERMISSIONS.EXPORT
    };

    const permission = actionToPermission[action];
    if (!permission) return false;

    return this.hasPermission(userRole, moduleId, permission);
  }

  /**
   * إخفاء العنصر إذا لم يكن لديه الصلاحية
   */
  static getElementVisibility(userRole, moduleId, action) {
    return this.canShowButton(userRole, moduleId, action) ? 'visible' : 'hidden';
  }
}

export default PermissionChecker;
