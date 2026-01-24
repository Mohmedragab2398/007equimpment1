import React, { useState, useEffect } from 'react';
import { ShieldCheck, Eye, EyeOff, Plus, Trash2, RotateCcw, Copy, Download, Upload } from 'lucide-react';
import { permissionsManager, MODULES, PERMISSIONS, USER_ROLES } from '../utils/AdvancedPermissionsManager';

/**
 * لوحة التحكم لإدارة الصلاحيات المتقدمة
 * Advanced Permissions Admin Panel
 */
export const AdminPermissionsPanel = ({ currentUser }) => {
  // التحقق من أن المستخدم مسؤول
  if (currentUser?.role !== USER_ROLES.ADMIN) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-700">
          <ShieldCheck className="w-6 h-6" />
          <p className="font-bold">⛔ هذا القسم للمسؤولين فقط</p>
        </div>
      </div>
    );
  }

  const [selectedRole, setSelectedRole] = useState(USER_ROLES.MANAGER);
  const [summary, setSummary] = useState(null);
  const [changeLog, setChangeLog] = useState([]);
  const [activeTab, setActiveTab] = useState('manage');
  const [showLogFilter, setShowLogFilter] = useState(false);

  // تحميل البيانات
  useEffect(() => {
    updateSummary();
    updateChangeLog();
  }, [selectedRole]);

  const updateSummary = () => {
    const data = permissionsManager.getSummary(selectedRole);
    setSummary(data);
  };

  const updateChangeLog = () => {
    const logs = permissionsManager.getChangeLog({ userRole: selectedRole });
    setChangeLog(logs);
  };

  // التحكم في الصلاحيات
  const handlePermissionToggle = (moduleId, permission) => {
    const currentPerms = permissionsManager.permissions[selectedRole]?.modules[moduleId];
    const newValue = !currentPerms[permission];
    
    permissionsManager.updatePermission(
      selectedRole,
      moduleId,
      permission,
      newValue,
      currentUser.id || 'admin'
    );
    
    updateSummary();
    updateChangeLog();
  };

  const handleToggleModuleVisibility = (moduleId) => {
    const currentPerms = permissionsManager.permissions[selectedRole]?.modules[moduleId];
    
    if (currentPerms.isHidden) {
      permissionsManager.showModule(selectedRole, moduleId, currentUser.id || 'admin');
    } else {
      permissionsManager.hideModule(selectedRole, moduleId, currentUser.id || 'admin');
    }
    
    updateSummary();
    updateChangeLog();
  };

  // الإجراءات السريعة
  const grantAllPermissions = () => {
    if (confirm(`هل تريد منح كل الصلاحيات للدور "${selectedRole}"؟`)) {
      permissionsManager.grantAllPermissions(selectedRole, currentUser.id || 'admin');
      updateSummary();
      updateChangeLog();
    }
  };

  const revokeAllPermissions = () => {
    if (confirm(`هل تريد سحب كل الصلاحيات من الدور "${selectedRole}"؟`)) {
      permissionsManager.revokeAllPermissions(selectedRole, currentUser.id || 'admin');
      updateSummary();
      updateChangeLog();
    }
  };

  const resetToDefaults = () => {
    if (confirm(`هل تريد إعادة تعيين صلاحيات الدور "${selectedRole}" إلى القيم الافتراضية؟`)) {
      permissionsManager.resetRolePermissions(selectedRole, currentUser.id || 'admin');
      updateSummary();
      updateChangeLog();
    }
  };

  // التصدير والاستيراد
  const handleExport = () => {
    const data = permissionsManager.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        permissionsManager.import(data);
        updateSummary();
        updateChangeLog();
        alert('✅ تم استيراد الصلاحيات بنجاح');
      } catch (error) {
        alert('❌ خطأ في استيراد الصلاحيات: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  if (!summary) {
    return <div className="text-center py-10">جاري التحميل...</div>;
  }

  const rolePerms = permissionsManager.permissions[selectedRole];

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* الرأس */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">🔐 نظام التحكم في الصلاحيات المتقدم</h2>
            <p className="text-blue-100">إدارة صلاحيات المستخدمين والوحدات</p>
          </div>
        </div>
      </div>

      {/* اختيار الدور */}
      <div className="px-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(USER_ROLES)
            .filter(role => role !== USER_ROLES.ADMIN)
            .map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRole === role
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-bold text-lg">{role}</div>
                <div className="text-sm text-gray-600">
                  وحدات مرئية: {summary.visibleModules}
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* التبويبات */}
      <div className="border-b">
        <div className="px-6 flex gap-4">
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-4 px-4 border-b-2 font-semibold transition-colors ${
              activeTab === 'manage'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            إدارة الصلاحيات
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`py-4 px-4 border-b-2 font-semibold transition-colors ${
              activeTab === 'log'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            سجل التغييرات ({changeLog.length})
          </button>
        </div>
      </div>

      {/* المحتوى */}
      <div className="px-6 pb-6">
        {activeTab === 'manage' && (
          <div className="space-y-6">
            {/* الإجراءات السريعة */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-4">⚡ إجراءات سريعة</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <button
                  onClick={grantAllPermissions}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  ✅ منح كل الصلاحيات
                </button>
                <button
                  onClick={revokeAllPermissions}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  ❌ سحب كل الصلاحيات
                </button>
                <button
                  onClick={resetToDefaults}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> إعادة تعيين
                </button>
                <button
                  onClick={handleExport}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> تصدير
                </button>
              </div>

              {/* الاستيراد */}
              <div className="mt-3">
                <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  استيراد
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* شبكة الصلاحيات */}
            <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
              <h3 className="font-bold mb-4">📋 تفاصيل الصلاحيات</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-right p-3">الوحدة</th>
                    <th className="text-center p-3">عرض</th>
                    <th className="text-center p-3">إضافة</th>
                    <th className="text-center p-3">تعديل</th>
                    <th className="text-center p-3">حذف</th>
                    <th className="text-center p-3">تصدير</th>
                    <th className="text-center p-3">إخفاء</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(rolePerms.modules).map(([moduleId, modulePerms]) => (
                    <tr
                      key={moduleId}
                      className={`border-b ${
                        modulePerms.isHidden ? 'bg-red-50' : 'hover:bg-white'
                      }`}
                    >
                      <td className="p-3 font-semibold">
                        {MODULES[moduleId.toUpperCase().replace(/_/g, '')] ? 
                          MODULES[moduleId.toUpperCase().replace(/_/g, '')].name : moduleId}
                      </td>

                      {/* الصلاحيات */}
                      {Object.values(PERMISSIONS).map(perm => (
                        <td key={perm} className="text-center p-3">
                          <label className="flex items-center justify-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={modulePerms[perm] === true}
                              onChange={() => handlePermissionToggle(moduleId, perm)}
                              className="w-4 h-4"
                              disabled={modulePerms.isHidden}
                            />
                            <span
                              className={`inline-block w-5 h-5 rounded text-xs flex items-center justify-center ${
                                modulePerms[perm]
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-300 text-gray-500'
                              }`}
                            >
                              {modulePerms[perm] ? '✓' : '✗'}
                            </span>
                          </label>
                        </td>
                      ))}

                      {/* الإخفاء */}
                      <td className="text-center p-3">
                        <button
                          onClick={() => handleToggleModuleVisibility(moduleId)}
                          className={`inline-flex items-center justify-center p-2 rounded ${
                            modulePerms.isHidden
                              ? 'bg-red-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          {modulePerms.isHidden ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* الملخص */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold mb-3">📊 ملخص الصلاحيات</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-600">إجمالي الوحدات</div>
                  <div className="text-2xl font-bold text-blue-600">{summary.totalModules}</div>
                </div>
                <div>
                  <div className="text-gray-600">الوحدات المرئية</div>
                  <div className="text-2xl font-bold text-green-600">{summary.visibleModules}</div>
                </div>
                <div>
                  <div className="text-gray-600">الوحدات المخفية</div>
                  <div className="text-2xl font-bold text-red-600">
                    {summary.totalModules - summary.visibleModules}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">📝 سجل التغييرات</h3>
              <button
                onClick={() => setShowLogFilter(!showLogFilter)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {showLogFilter ? '▼ إخفاء الفلاتر' : '▶ عرض الفلاتر'}
              </button>
            </div>

            {changeLog.length === 0 ? (
              <div className="text-center py-10 text-gray-500">لا توجد تغييرات حتى الآن</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {changeLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-blue-600">{log.type}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString('ar-EG')}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      {log.moduleId && (
                        <>
                          <div>الوحدة: {log.moduleId}</div>
                          {log.permission && <div>الصلاحية: {log.permission}</div>}
                        </>
                      )}
                      {log.oldValue !== undefined && (
                        <div>
                          من: {log.oldValue} → إلى: {log.newValue}
                        </div>
                      )}
                      <div>بواسطة: {log.changedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPermissionsPanel;
