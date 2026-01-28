/**
 * نظام إدارة الزونات
 * Zone Management System
 * 
 * يوفر:
 * - إدارة الزونات (إضافة، تعديل، حذف)
 * - توزيع المشرفين على الزونات
 * - نقل مشرفين بين الزونات
 * - عرض إحصائيات الزونات
 */

const ZONES_STORAGE_KEY = 'ems_zones_v1';
const SUPERVISOR_ZONES_STORAGE_KEY = 'ems_supervisor_zones_v1';

/**
 * تهيئة النظام
 */
export function initializeZoneSystem() {
  // إنشاء بيانات افتراضية إذا لم تكن موجودة
  if (!localStorage.getItem(ZONES_STORAGE_KEY)) {
    const defaultZones = [
      { id: 'zone_1', name: 'الغردقة', createdAt: new Date().toISOString() },
      { id: 'zone_2', name: 'القاهرة', createdAt: new Date().toISOString() },
      { id: 'zone_3', name: 'الإسكندرية', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(defaultZones));
  }
  
  if (!localStorage.getItem(SUPERVISOR_ZONES_STORAGE_KEY)) {
    localStorage.setItem(SUPERVISOR_ZONES_STORAGE_KEY, JSON.stringify([]));
  }
}

/**
 * جلب جميع الزونات
 */
export function getAllZones() {
  try {
    return JSON.parse(localStorage.getItem(ZONES_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * إضافة زون جديد
 */
export function addZone(zoneName) {
  if (!zoneName || zoneName.trim() === '') {
    return { success: false, error: 'اسم الزون مطلوب' };
  }
  
  const zones = getAllZones();
  
  // التحقق من عدم التكرار
  if (zones.some(z => z.name.toLowerCase() === zoneName.toLowerCase())) {
    return { success: false, error: 'الزون موجود بالفعل' };
  }
  
  const newZone = {
    id: `zone_${Date.now()}`,
    name: zoneName.trim(),
    createdAt: new Date().toISOString(),
    supervisorCount: 0,
    totalInventory: 0
  };
  
  zones.push(newZone);
  localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(zones));
  
  return { success: true, zone: newZone };
}

/**
 * تحديث زون
 */
export function updateZone(zoneId, updates) {
  const zones = getAllZones();
  const index = zones.findIndex(z => z.id === zoneId);
  
  if (index === -1) {
    return { success: false, error: 'الزون غير موجود' };
  }
  
  zones[index] = { ...zones[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(zones));
  
  return { success: true, zone: zones[index] };
}

/**
 * حذف زون
 */
export function deleteZone(zoneId) {
  const zones = getAllZones();
  const filtered = zones.filter(z => z.id !== zoneId);
  
  // نقل المشرفين إلى "غير محدد"
  const assignments = getSupervisorAssignments();
  assignments.forEach(assignment => {
    if (assignment.zoneId === zoneId) {
      assignment.zoneId = null;
      assignment.zoneName = 'غير محدد';
    }
  });
  localStorage.setItem(SUPERVISOR_ZONES_STORAGE_KEY, JSON.stringify(assignments));
  
  localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(filtered));
  
  return { success: true };
}

/**
 * جلب جميع تعيينات المشرفين
 */
export function getSupervisorAssignments() {
  try {
    return JSON.parse(localStorage.getItem(SUPERVISOR_ZONES_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * تعيين مشرف لزون
 */
export function assignSupervisorToZone(supervisorId, supervisorName, zoneId, zoneName) {
  const assignments = getSupervisorAssignments();
  
  // إزالة التعيين السابق إن وجد
  const filtered = assignments.filter(a => a.supervisorId !== supervisorId);
  
  // إضافة التعيين الجديد
  const newAssignment = {
    supervisorId,
    supervisorName,
    zoneId,
    zoneName,
    assignedDate: new Date().toISOString(),
    assignedBy: getCurrentUser()?.name || 'System'
  };
  
  filtered.push(newAssignment);
  localStorage.setItem(SUPERVISOR_ZONES_STORAGE_KEY, JSON.stringify(filtered));
  
  // تحديث عدد المشرفين في الزون
  updateZoneSupervisorCount(zoneId);
  
  return { success: true, assignment: newAssignment };
}

/**
 * نقل مشرف بين الزونات
 */
export function moveSupervisorBetweenZones(supervisorId, newZoneId, newZoneName) {
  return assignSupervisorToZone(
    supervisorId,
    getSupervisorName(supervisorId),
    newZoneId,
    newZoneName
  );
}

/**
 * جلب زون مشرف معين
 */
export function getSupervisorZone(supervisorId) {
  const assignments = getSupervisorAssignments();
  return assignments.find(a => a.supervisorId === supervisorId) || null;
}

/**
 * جلب جميع المشرفين في زون معين
 */
export function getSupervisorsInZone(zoneId) {
  const assignments = getSupervisorAssignments();
  return assignments.filter(a => a.zoneId === zoneId);
}

/**
 * تحديث عدد المشرفين في الزون
 */
function updateZoneSupervisorCount(zoneId) {
  const supervisors = getSupervisorsInZone(zoneId);
  updateZone(zoneId, { supervisorCount: supervisors.length });
}

/**
 * جلب اسم المشرف
 */
function getSupervisorName(supervisorId) {
  try {
    const supervisors = JSON.parse(localStorage.getItem('ems_supervisors_v1') || '[]');
    const supervisor = supervisors.find(s => s.code === supervisorId || s.id === supervisorId);
    return supervisor ? supervisor.name : 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * الحصول على المستخدم الحالي
 */
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('ems_current_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

/**
 * جلب جميع المشرفين مع زوناتهم
 */
export function getAllSupervisorsWithZones() {
  try {
    const supervisors = JSON.parse(localStorage.getItem('ems_supervisors_v1') || '[]');
    const assignments = getSupervisorAssignments();
    
    return supervisors.map(supervisor => {
      const assignment = assignments.find(a => 
        a.supervisorId === supervisor.code || a.supervisorId === supervisor.id
      );
      
      return {
        ...supervisor,
        zoneId: assignment?.zoneId || null,
        zoneName: assignment?.zoneName || 'غير محدد',
        assignedDate: assignment?.assignedDate || null
      };
    });
  } catch {
    return [];
  }
}
