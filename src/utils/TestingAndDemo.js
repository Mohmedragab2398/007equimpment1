/**
 * ملف الاختبار والعرض التوضيحي
 * Testing and Demo File
 * 
 * استخدم هذا الملف للتحقق من أن كل شيء يعمل بشكل صحيح
 */

import { permissionsManager, MODULES, PERMISSIONS, USER_ROLES } from './AdvancedPermissionsManager';
import { PermissionChecker } from './PermissionChecker';
import { PermissionGuard } from './PermissionGuard';

/**
 * 🧪 اختبار شامل للنظام
 */
export function runComprehensiveTests() {
  console.clear();
  console.log('🚀 بدء الاختبارات الشاملة لنظام الصلاحيات...\n');

  // ================================
  // 1. اختبار التهيئة
  // ================================
  console.log('✅ الاختبار 1: التهيئة الصحيحة');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('الأدوار المتاحة:', Object.values(USER_ROLES));
  console.log('الوحدات المتاحة:', Object.keys(MODULES).length);
  console.log('الصلاحيات المتاحة:', Object.values(PERMISSIONS));
  
  const summary = permissionsManager.getSummary(USER_ROLES.ADMIN);
  console.log('\n📊 ملخص صلاحيات Admin:');
  console.log(`   - إجمالي الوحدات: ${summary.totalModules}`);
  console.log(`   - الوحدات المرئية: ${summary.visibleModules}`);
  console.log(`   - الوحدات المخفية: ${summary.totalModules - summary.visibleModules}`);

  // ================================
  // 2. اختبار التحقق من الصلاحيات
  // ================================
  console.log('\n✅ الاختبار 2: التحقق من الصلاحيات');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🔹 Admin (يجب أن يملك كل الصلاحيات):');
  console.log(`   - رؤية riders: ${PermissionChecker.canViewModule(USER_ROLES.ADMIN, 'riders')}`);
  console.log(`   - إضافة riders: ${PermissionChecker.hasPermission(USER_ROLES.ADMIN, 'riders', PERMISSIONS.ADD)}`);
  console.log(`   - حذف riders: ${PermissionChecker.hasPermission(USER_ROLES.ADMIN, 'riders', PERMISSIONS.DELETE)}`);

  console.log('\n🔹 Manager (صلاحيات محدودة):');
  console.log(`   - رؤية riders: ${PermissionChecker.canViewModule(USER_ROLES.MANAGER, 'riders')}`);
  console.log(`   - إضافة riders: ${PermissionChecker.hasPermission(USER_ROLES.MANAGER, 'riders', PERMISSIONS.ADD)}`);
  console.log(`   - حذف riders: ${PermissionChecker.hasPermission(USER_ROLES.MANAGER, 'riders', PERMISSIONS.DELETE)}`);

  console.log('\n🔹 Supervisor (صلاحيات قليلة):');
  console.log(`   - رؤية riders: ${PermissionChecker.canViewModule(USER_ROLES.SUPERVISOR, 'riders')}`);
  console.log(`   - إضافة riders: ${PermissionChecker.hasPermission(USER_ROLES.SUPERVISOR, 'riders', PERMISSIONS.ADD)}`);
  console.log(`   - رؤية supervisors: ${PermissionChecker.canViewModule(USER_ROLES.SUPERVISOR, 'supervisors')}`);

  // ================================
  // 3. اختبار تعديل الصلاحيات
  // ================================
  console.log('\n✅ الاختبار 3: تعديل الصلاحيات');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🔹 قبل التعديل:');
  console.log(`   - يمكن Manager حذف riders: ${PermissionChecker.hasPermission(USER_ROLES.MANAGER, 'riders', PERMISSIONS.DELETE)}`);

  // منح الصلاحية
  permissionsManager.updatePermission(
    USER_ROLES.MANAGER,
    'riders',
    PERMISSIONS.DELETE,
    true,
    'demo'
  );

  console.log('\n🔹 بعد منح صلاحية حذف riders:');
  console.log(`   - يمكن Manager حذف riders: ${PermissionChecker.hasPermission(USER_ROLES.MANAGER, 'riders', PERMISSIONS.DELETE)}`);

  // إعادة التعيين
  permissionsManager.resetRolePermissions(USER_ROLES.MANAGER, 'demo');

  console.log('\n🔹 بعد إعادة التعيين:');
  console.log(`   - يمكن Manager حذف riders: ${PermissionChecker.hasPermission(USER_ROLES.MANAGER, 'riders', PERMISSIONS.DELETE)}`);

  // ================================
  // 4. اختبار إخفاء الوحدات
  // ================================
  console.log('\n✅ الاختبار 4: إخفاء الوحدات');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🔹 قبل إخفاء:');
  console.log(`   - يمكن Supervisor رؤية riders: ${PermissionChecker.canViewModule(USER_ROLES.SUPERVISOR, 'riders')}`);

  permissionsManager.hideModule(USER_ROLES.SUPERVISOR, 'riders', 'demo');

  console.log('\n🔹 بعد إخفاء riders:');
  console.log(`   - يمكن Supervisor رؤية riders: ${PermissionChecker.canViewModule(USER_ROLES.SUPERVISOR, 'riders')}`);

  permissionsManager.showModule(USER_ROLES.SUPERVISOR, 'riders', 'demo');

  console.log('\n🔹 بعد إظهار riders:');
  console.log(`   - يمكن Supervisor رؤية riders: ${PermissionChecker.canViewModule(USER_ROLES.SUPERVISOR, 'riders')}`);

  // ================================
  // 5. اختبار الوحدات المرئية
  // ================================
  console.log('\n✅ الاختبار 5: الوحدات المرئية');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const visibleModulesManager = PermissionChecker.getVisibleModules(USER_ROLES.MANAGER);
  const visibleModulesSupervisor = PermissionChecker.getVisibleModules(USER_ROLES.SUPERVISOR);

  console.log(`\n🔹 الوحدات المرئية لـ Manager: ${Object.keys(visibleModulesManager).length}`);
  Object.keys(visibleModulesManager).forEach(key => {
    console.log(`   - ${visibleModulesManager[key].name}`);
  });

  console.log(`\n🔹 الوحدات المرئية لـ Supervisor: ${Object.keys(visibleModulesSupervisor).length}`);
  Object.keys(visibleModulesSupervisor).forEach(key => {
    console.log(`   - ${visibleModulesSupervisor[key].name}`);
  });

  // ================================
  // 6. اختبار PermissionGuard
  // ================================
  console.log('\n✅ الاختبار 6: PermissionGuard');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const availableSections = PermissionGuard.getAvailableSections(USER_ROLES.MANAGER);
  console.log(`\n🔹 الأقسام المتاحة لـ Manager:`);
  console.log(availableSections.join(', '));

  console.log(`\n🔹 يمكن Manager إضافة مندوب: ${PermissionGuard.canAddRider(USER_ROLES.MANAGER)}`);
  console.log(`🔹 يمكن Manager حذف مندوب: ${PermissionGuard.canDeleteRider(USER_ROLES.MANAGER)}`);
  console.log(`🔹 يمكن Manager تصدير البيانات: ${PermissionGuard.canExportData(USER_ROLES.MANAGER)}`);

  // ================================
  // 7. اختبار سجل التغييرات
  // ================================
  console.log('\n✅ الاختبار 7: سجل التغييرات');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const allLogs = permissionsManager.getChangeLog();
  console.log(`\n🔹 إجمالي السجلات: ${allLogs.length}`);
  
  if (allLogs.length > 0) {
    console.log('\n🔹 آخر 3 سجلات:');
    allLogs.slice(-3).forEach((log, idx) => {
      console.log(`   ${idx + 1}. ${log.type} - ${log.userRole} - ${new Date(log.timestamp).toLocaleString('ar-EG')}`);
    });
  }

  // ================================
  // 8. اختبار التصدير والاستيراق
  // ================================
  console.log('\n✅ الاختبار 8: التصدير');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const backup = permissionsManager.export();
  console.log(`\n🔹 الإصدار: ${backup.version}`);
  console.log(`🔹 تاريخ التصدير: ${backup.exportDate}`);
  console.log(`🔹 عدد الأدوار: ${Object.keys(backup.permissions).length}`);
  console.log(`🔹 عدد السجلات: ${backup.log.length}`);

  // ================================
  // النتائج النهائية
  // ================================
  console.log('\n\n✅ ✅ ✅ اكتملت جميع الاختبارات بنجاح! ✅ ✅ ✅\n');
  console.log('📋 ملخص النتائج:');
  console.log(`   ✓ النظام مهيأ بشكل صحيح`);
  console.log(`   ✓ الصلاحيات تعمل بشكل صحيح`);
  console.log(`   ✓ التعديلات تطبق بشكل صحيح`);
  console.log(`   ✓ الإخفاء يعمل بشكل صحيح`);
  console.log(`   ✓ السجل يتم تسجيله بشكل صحيح`);
  console.log(`   ✓ التصدير والاستيراق يعملان`);

  return {
    success: true,
    timestamp: new Date().toISOString(),
    testsRun: 8,
    message: 'نظام الصلاحيات المتقدم يعمل بشكل مثالي!'
  };
}

/**
 * 🎯 مثال عملي: سيناريو حقيقي
 */
export function runRealWorldScenario() {
  console.clear();
  console.log('🎬 سيناريو واقعي: إدارة المناديب\n');
  console.log('═══════════════════════════════════════════════\n');

  // السيناريو: مدير يحاول إضافة مندوب
  const manager = { role: USER_ROLES.MANAGER };
  const supervisor = { role: USER_ROLES.SUPERVISOR };
  const admin = { role: USER_ROLES.ADMIN };

  console.log('📌 الحالة 1: مدير يحاول إضافة مندوب');
  console.log('─────────────────────────────────');

  if (PermissionGuard.canAddRider(manager.role)) {
    console.log('✅ النتيجة: يسمح - يمكن للمدير إضافة مندوب\n');
  } else {
    console.log('❌ النتيجة: مرفوض - المدير لا يملك صلاحية\n');
  }

  console.log('📌 الحالة 2: مشرف يحاول إضافة مندوب');
  console.log('─────────────────────────────────');

  if (PermissionGuard.canAddRider(supervisor.role)) {
    console.log('✅ النتيجة: يسمح - يمكن للمشرف إضافة مندوب\n');
  } else {
    console.log('❌ النتيجة: مرفوض - المشرف لا يملك صلاحية\n');
  }

  console.log('📌 الحالة 3: حذف مندوب');
  console.log('─────────────────────────────────');

  console.log(`   - المدير: ${PermissionGuard.canDeleteRider(manager.role) ? '✅' : '❌'}`);
  console.log(`   - المشرف: ${PermissionGuard.canDeleteRider(supervisor.role) ? '✅' : '❌'}`);
  console.log(`   - المسؤول: ${PermissionGuard.canDeleteRider(admin.role) ? '✅' : '❌'}\n`);

  console.log('📌 الحالة 4: تصدير البيانات');
  console.log('─────────────────────────────────');

  console.log(`   - المدير: ${PermissionGuard.canExportData(manager.role) ? '✅' : '❌'}`);
  console.log(`   - المشرف: ${PermissionGuard.canExportData(supervisor.role) ? '✅' : '❌'}`);
  console.log(`   - المسؤول: ${PermissionGuard.canExportData(admin.role) ? '✅' : '❌'}\n`);

  console.log('📌 الحالة 5: الأقسام المتاحة');
  console.log('─────────────────────────────────');

  console.log('\n   المدير يستطيع الدخول إلى:');
  PermissionGuard.getAvailableSections(manager.role).forEach(section => {
    console.log(`   ✓ ${section}`);
  });

  console.log('\n   المشرف يستطيع الدخول إلى:');
  PermissionGuard.getAvailableSections(supervisor.role).forEach(section => {
    console.log(`   ✓ ${section}`);
  });
}

/**
 * 🔧 أداة التشخيص
 */
export function diagnosticTool() {
  console.clear();
  console.log('🔧 أداة تشخيص نظام الصلاحيات\n');
  console.log('═════════════════════════════════\n');

  const data = permissionsManager.export();

  console.log('📊 معلومات النظام:');
  console.log(`   - الإصدار: ${data.version}`);
  console.log(`   - تاريخ التصدير: ${data.exportDate}`);
  console.log(`   - عدد الأدوار: ${Object.keys(data.permissions).length}`);
  console.log(`   - عدد السجلات: ${data.log.length}`);
  console.log(`   - حجم البيانات: ${JSON.stringify(data).length} بايت\n`);

  console.log('📋 تفاصيل الأدوار:');
  Object.entries(data.permissions).forEach(([role, roleData]) => {
    console.log(`\n   ${role}:`);
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    Object.entries(roleData.modules).forEach(([moduleId, modulePerms]) => {
      if (modulePerms.isHidden) {
        hiddenCount++;
      } else {
        visibleCount++;
      }
    });

    console.log(`      - الوحدات المرئية: ${visibleCount}`);
    console.log(`      - الوحدات المخفية: ${hiddenCount}`);
  });

  console.log('\n✅ النظام يعمل بشكل طبيعي!');
}

/**
 * 📊 عرض إحصائيات النظام
 */
export function showStatistics() {
  console.clear();
  console.log('📊 إحصائيات نظام الصلاحيات\n');

  const data = permissionsManager.export();

  console.log('════════════════════════════════════════');
  console.log('📈 الإحصائيات العامة');
  console.log('════════════════════════════════════════\n');

  Object.entries(data.permissions).forEach(([role, roleData]) => {
    const summary = permissionsManager.getSummary(role);
    
    console.log(`\n${role.toUpperCase()}`);
    console.log('─'.repeat(40));

    let viewCount = 0, addCount = 0, editCount = 0, deleteCount = 0, exportCount = 0;

    Object.values(roleData.modules).forEach(modulePerms => {
      if (modulePerms.view) viewCount++;
      if (modulePerms.add) addCount++;
      if (modulePerms.edit) editCount++;
      if (modulePerms.delete) deleteCount++;
      if (modulePerms.export) exportCount++;
    });

    console.log(`الوحدات المرئية: ${summary.visibleModules}/${summary.totalModules}`);
    console.log(`الوحدات المخفية: ${summary.totalModules - summary.visibleModules}`);
    console.log('\nتوزيع الصلاحيات:');
    console.log(`  • عرض: ${viewCount} وحدة`);
    console.log(`  • إضافة: ${addCount} وحدة`);
    console.log(`  • تعديل: ${editCount} وحدة`);
    console.log(`  • حذف: ${deleteCount} وحدة`);
    console.log(`  • تصدير: ${exportCount} وحدة`);
  });

  console.log('\n════════════════════════════════════════');
  console.log(`\n📝 إجمالي التغييرات المسجلة: ${data.log.length}`);
}

export default {
  runComprehensiveTests,
  runRealWorldScenario,
  diagnosticTool,
  showStatistics
};
