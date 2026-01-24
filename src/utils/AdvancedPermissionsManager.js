/**
 * نظام الصلاحيات المتقدم
 * Advanced Permissions Management System
 * 
 * يوفر:
 * - إدارة صلاحيات محدودة للمستخدمين
 * - تحكم كامل للمسؤول فقط
 * - إخفاء/إظهار الوحدات والمميزات
 * - سجل كامل للتغييرات
 * - بدون التأثير على النظام الحالي
 */

const PERMISSIONS_STORAGE_KEY = 'ems_permissions_v1';
const PERMISSIONS_LOG_KEY = 'ems_permissions_log_v1';

/**
 * الوحدات المتاحة في النظام
 */
export const MODULES = {
  DASHBOARD: { id: 'dashboard', name: 'لوحة التحكم', icon: '📊', critical: true },
  SUPERVISORS: { id: 'supervisors', name: 'المشرفين', icon: '👥', critical: false },
  RIDERS: { id: 'riders', name: 'المناديب', icon: '🚴', critical: false },
  INVENTORY: { id: 'inventory', name: 'المخزون', icon: '📦', critical: false },
  ORDERS: { id: 'orders', name: 'الطلبات', icon: '📋', critical: false },
  REPORTS: { id: 'reports', name: 'التقارير', icon: '📈', critical: false },
  DEDUCTIONS: { id: 'deductions', name: 'الخصومات', icon: '💰', critical: false },
  SETTINGS: { id: 'settings', name: 'الإعدادات', icon: '⚙️', critical: true },
  PERMISSIONS_ADMIN: { id: 'permissions_admin', name: 'إدارة الصلاحيات', icon: '🔐', critical: true }
};

/**
 * أنواع الصلاحيات المتاحة
 */
export const PERMISSIONS = {
  VIEW: 'view',
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export'
};

/**
 * أدوار المستخدمين
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor'
};

/**
 * فئة إدارة الصلاحيات المتقدمة
 */
class AdvancedPermissionsManager {
  constructor() {
    this.permissions = this.loadPermissions();
    this.log = this.loadLog();
    this.initializeDefaultPermissions();
  }

  /**
   * تحميل البيانات من LocalStorage
   */
  loadPermissions() {
    try {
      const data = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('خطأ في تحميل الصلاحيات:', error);
      return {};
    }
  }

  /**
   * تحميل سجل التغييرات
   */
  loadLog() {
    try {
      const data = localStorage.getItem(PERMISSIONS_LOG_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('خطأ في تحميل السجل:', error);
      return [];
    }
  }

  /**
   * حفظ الصلاحيات إلى LocalStorage
   */
  savePermissions() {
    try {
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(this.permissions));
    } catch (error) {
      console.error('خطأ في حفظ الصلاحيات:', error);
    }
  }

  /**
   * حفظ السجل إلى LocalStorage
   */
  saveLog() {
    try {
      localStorage.setItem(PERMISSIONS_LOG_KEY, JSON.stringify(this.log));
    } catch (error) {
      console.error('خطأ في حفظ السجل:', error);
    }
  }

  /**
   * تهيئة الصلاحيات الافتراضية
   */
  initializeDefaultPermissions() {
    // إذا لم تكن هناك صلاحيات محفوظة، أنشئ قيماً افتراضية
    if (Object.keys(this.permissions).length === 0) {
      // المسؤول لديه كل الصلاحيات
      this.permissions[USER_ROLES.ADMIN] = {
        role: USER_ROLES.ADMIN,
        modules: this.createFullPermissionsForAllModules(),
        isActive: true,
        createdAt: new Date().toISOString()
      };

      // المدير - صلاحيات محدودة
      this.permissions[USER_ROLES.MANAGER] = {
        role: USER_ROLES.MANAGER,
        modules: {
          dashboard: this.createModulePermissions(true, true, false, false, false),
          supervisors: this.createModulePermissions(true, true, true, false, false),
          riders: this.createModulePermissions(true, true, true, false, true),
          inventory: this.createModulePermissions(true, true, true, false, true),
          orders: this.createModulePermissions(true, true, true, false, true),
          reports: this.createModulePermissions(true, false, false, false, true),
          deductions: this.createModulePermissions(true, true, true, false, true),
          settings: this.createModulePermissions(false, false, false, false, false),
          permissions_admin: this.createModulePermissions(false, false, false, false, false)
        },
        isActive: true,
        createdAt: new Date().toISOString()
      };

      // المشرف - صلاحيات محدودة جداً
      this.permissions[USER_ROLES.SUPERVISOR] = {
        role: USER_ROLES.SUPERVISOR,
        modules: {
          dashboard: this.createModulePermissions(true, false, false, false, false),
          supervisors: this.createModulePermissions(false, false, false, false, false),
          riders: this.createModulePermissions(true, false, false, false, false),
          inventory: this.createModulePermissions(true, false, false, false, false),
          orders: this.createModulePermissions(true, true, false, false, false),
          reports: this.createModulePermissions(true, false, false, false, false),
          deductions: this.createModulePermissions(false, false, false, false, false),
          settings: this.createModulePermissions(false, false, false, false, false),
          permissions_admin: this.createModulePermissions(false, false, false, false, false)
        },
        isActive: true,
        createdAt: new Date().toISOString()
      };

      this.savePermissions();
    }
  }

  /**
   * إنشاء صلاحيات كاملة لجميع الوحدات
   */
  createFullPermissionsForAllModules() {
    const modules = {};
    Object.values(MODULES).forEach(module => {
      modules[module.id] = this.createModulePermissions(true, true, true, true, true);
    });
    return modules;
  }

  /**
   * إنشاء صلاحيات لوحدة معينة
   */
  createModulePermissions(view, add, edit, delete_, export_) {
    return {
      [PERMISSIONS.VIEW]: view,
      [PERMISSIONS.ADD]: add,
      [PERMISSIONS.EDIT]: edit,
      [PERMISSIONS.DELETE]: delete_,
      [PERMISSIONS.EXPORT]: export_,
      isHidden: false,
      customName: null
    };
  }

  /**
   * التحقق من أن المستخدم مسؤول
   */
  isAdmin(userRole) {
    return userRole === USER_ROLES.ADMIN;
  }

  /**
   * التحقق من صلاحية معينة
   */
  checkPermission(userRole, moduleId, permission) {
    // المسؤول لديه كل الصلاحيات
    if (this.isAdmin(userRole)) {
      return true;
    }

    // البحث عن الصلاحيات
    const rolePerms = this.permissions[userRole];
    if (!rolePerms) {
      return false;
    }

    const modulePerms = rolePerms.modules[moduleId];
    if (!modulePerms) {
      return false;
    }

    // التحقق من إذا كانت الوحدة مخفية
    if (modulePerms.isHidden) {
      return false;
    }

    // التحقق من الصلاحية المحددة
    return modulePerms[permission] === true;
  }

  /**
   * التحقق من رؤية الوحدة
   */
  canViewModule(userRole, moduleId) {
    // المسؤول يرى كل شيء
    if (this.isAdmin(userRole)) {
      return true;
    }

    const rolePerms = this.permissions[userRole];
    if (!rolePerms) {
      return false;
    }

    const modulePerms = rolePerms.modules[moduleId];
    if (!modulePerms) {
      return false;
    }

    // تحقق من الرؤية والإخفاء
    return modulePerms[PERMISSIONS.VIEW] === true && !modulePerms.isHidden;
  }

  /**
   * تعديل صلاحية معينة
   */
  updatePermission(userRole, moduleId, permission, value, adminId = 'system') {
    if (!this.permissions[userRole]) {
      throw new Error(`الدور '${userRole}' غير موجود`);
    }

    if (!this.permissions[userRole].modules[moduleId]) {
      throw new Error(`الوحدة '${moduleId}' غير موجودة`);
    }

    const oldValue = this.permissions[userRole].modules[moduleId][permission];
    this.permissions[userRole].modules[moduleId][permission] = value;

    // تسجيل التغيير
    this.logChange({
      type: 'permission_update',
      userRole,
      moduleId,
      permission,
      oldValue,
      newValue: value,
      timestamp: new Date().toISOString(),
      changedBy: adminId
    });

    this.savePermissions();
  }

  /**
   * إخفاء وحدة لدور معين
   */
  hideModule(userRole, moduleId, adminId = 'system') {
    if (!this.permissions[userRole]) {
      throw new Error(`الدور '${userRole}' غير موجود`);
    }

    if (!this.permissions[userRole].modules[moduleId]) {
      throw new Error(`الوحدة '${moduleId}' غير موجودة`);
    }

    this.permissions[userRole].modules[moduleId].isHidden = true;

    this.logChange({
      type: 'module_hidden',
      userRole,
      moduleId,
      timestamp: new Date().toISOString(),
      changedBy: adminId
    });

    this.savePermissions();
  }

  /**
   * إظهار وحدة لدور معين
   */
  showModule(userRole, moduleId, adminId = 'system') {
    if (!this.permissions[userRole]) {
      throw new Error(`الدور '${userRole}' غير موجود`);
    }

    if (!this.permissions[userRole].modules[moduleId]) {
      throw new Error(`الوحدة '${moduleId}' غير موجودة`);
    }

    this.permissions[userRole].modules[moduleId].isHidden = false;

    this.logChange({
      type: 'module_shown',
      userRole,
      moduleId,
      timestamp: new Date().toISOString(),
      changedBy: adminId
    });

    this.savePermissions();
  }

  /**
   * منح كل الصلاحيات لدور معين
   */
  grantAllPermissions(userRole, adminId = 'system') {
    if (!this.permissions[userRole]) {
      throw new Error(`الدور '${userRole}' غير موجود`);
    }

    this.permissions[userRole].modules = this.createFullPermissionsForAllModules();

    this.logChange({
      type: 'all_permissions_granted',
      userRole,
      timestamp: new Date().toISOString(),
      changedBy: adminId
    });

    this.savePermissions();
  }

  /**
   * سحب كل الصلاحيات من دور معين
   */
  revokeAllPermissions(userRole, adminId = 'system') {
    if (!this.permissions[userRole]) {
      throw new Error(`الدور '${userRole}' غير موجود`);
    }

    const modules = {};
    Object.keys(this.permissions[userRole].modules).forEach(moduleId => {
      modules[moduleId] = this.createModulePermissions(false, false, false, false, false);
    });

    this.permissions[userRole].modules = modules;

    this.logChange({
      type: 'all_permissions_revoked',
      userRole,
      timestamp: new Date().toISOString(),
      changedBy: adminId
    });

    this.savePermissions();
  }

  /**
   * إعادة تعيين صلاحيات الدور إلى القيم الافتراضية
   */
  resetRolePermissions(userRole, adminId = 'system') {
    // احفظ القيم الافتراضية
    const defaults = {
      [USER_ROLES.ADMIN]: this.createFullPermissionsForAllModules(),
      [USER_ROLES.MANAGER]: {
        dashboard: this.createModulePermissions(true, true, false, false, false),
        supervisors: this.createModulePermissions(true, true, true, false, false),
        riders: this.createModulePermissions(true, true, true, false, true),
        inventory: this.createModulePermissions(true, true, true, false, true),
        orders: this.createModulePermissions(true, true, true, false, true),
        reports: this.createModulePermissions(true, false, false, false, true),
        deductions: this.createModulePermissions(true, true, true, false, true),
        settings: this.createModulePermissions(false, false, false, false, false),
        permissions_admin: this.createModulePermissions(false, false, false, false, false)
      },
      [USER_ROLES.SUPERVISOR]: {
        dashboard: this.createModulePermissions(true, false, false, false, false),
        supervisors: this.createModulePermissions(false, false, false, false, false),
        riders: this.createModulePermissions(true, false, false, false, false),
        inventory: this.createModulePermissions(true, false, false, false, false),
        orders: this.createModulePermissions(true, true, false, false, false),
        reports: this.createModulePermissions(true, false, false, false, false),
        deductions: this.createModulePermissions(false, false, false, false, false),
        settings: this.createModulePermissions(false, false, false, false, false),
        permissions_admin: this.createModulePermissions(false, false, false, false, false)
      }
    };

    if (!defaults[userRole]) {
      throw new Error(`الدور '${userRole}' غير موجود`);
    }

    this.permissions[userRole].modules = defaults[userRole];

    this.logChange({
      type: 'role_permissions_reset',
      userRole,
      timestamp: new Date().toISOString(),
      changedBy: adminId
    });

    this.savePermissions();
  }

  /**
   * تسجيل التغييرات
   */
  logChange(changeRecord) {
    this.log.push(changeRecord);
    // احتفظ بآخر 1000 سجل فقط
    if (this.log.length > 1000) {
      this.log = this.log.slice(-1000);
    }
    this.saveLog();
  }

  /**
   * الحصول على سجل التغييرات
   */
  getChangeLog(filter = {}) {
    let filtered = [...this.log];

    if (filter.userRole) {
      filtered = filtered.filter(log => log.userRole === filter.userRole);
    }

    if (filter.type) {
      filtered = filtered.filter(log => log.type === filter.type);
    }

    if (filter.startDate) {
      const start = new Date(filter.startDate).getTime();
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= start);
    }

    if (filter.endDate) {
      const end = new Date(filter.endDate).getTime();
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() <= end);
    }

    return filtered;
  }

  /**
   * حصول على ملخص الصلاحيات لدور معين
   */
  getSummary(userRole) {
    if (!this.permissions[userRole]) {
      return null;
    }

    const rolePerms = this.permissions[userRole];
    const summary = {
      role: userRole,
      totalModules: Object.keys(MODULES).length,
      visibleModules: 0,
      permissions: {}
    };

    Object.entries(rolePerms.modules).forEach(([moduleId, modulePerms]) => {
      if (!modulePerms.isHidden) {
        summary.visibleModules++;
      }

      const permCount = Object.values(PERMISSIONS).filter(perm => modulePerms[perm] === true).length;
      summary.permissions[moduleId] = {
        hidden: modulePerms.isHidden,
        permissionCount: permCount,
        canView: modulePerms.view,
        canAdd: modulePerms.add,
        canEdit: modulePerms.edit,
        canDelete: modulePerms.delete,
        canExport: modulePerms.export
      };
    });

    return summary;
  }

  /**
   * تصدير الصلاحيات
   */
  export() {
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      permissions: this.permissions,
      log: this.log
    };
  }

  /**
   * استيراد الصلاحيات
   */
  import(data) {
    if (!data.permissions) {
      throw new Error('بيانات الصلاحيات غير صحيحة');
    }

    this.permissions = data.permissions;
    this.savePermissions();

    this.logChange({
      type: 'permissions_imported',
      timestamp: new Date().toISOString(),
      changedBy: 'system'
    });
  }
}

// إنشاء instance واحد
export const permissionsManager = new AdvancedPermissionsManager();

// تصدير الفئة أيضاً للاختبار
export default AdvancedPermissionsManager;
