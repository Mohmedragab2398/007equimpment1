/**
 * نظام حساب مخزون الزونات
 * Zone Inventory Calculator
 * 
 * يحسب مخزون كل زون بناءً على مخزون المشرفين فيه
 */

import { getSupervisorsInZone, getAllZones } from './ZoneManagementSystem';

const INVENTORY_STORAGE_KEY = 'ems_inventory_v1';
const SUPERVISORS_STORAGE_KEY = 'ems_supervisors_v1';

/**
 * حساب مخزون زون معين
 */
export function calculateZoneInventory(zoneId) {
  const supervisors = getSupervisorsInZone(zoneId);
  
  if (supervisors.length === 0) {
    return {
      zoneId,
      zoneName: getZoneName(zoneId),
      supervisorCount: 0,
      supervisorInventories: [],
      totalInventory: {
        motorcyclePouches: 0,
        bicyclePouches: 0,
        tshirts: 0
      },
      averagePerSupervisor: {
        motorcyclePouches: 0,
        bicyclePouches: 0,
        tshirts: 0
      }
    };
  }
  
  const supervisorInventories = [];
  let totalMotorcyclePouches = 0;
  let totalBicyclePouches = 0;
  let totalTshirts = 0;
  
  supervisors.forEach(assignment => {
    const inventory = getSupervisorInventory(assignment.supervisorId);
    
    supervisorInventories.push({
      supervisorId: assignment.supervisorId,
      supervisorName: assignment.supervisorName,
      inventory: inventory
    });
    
    totalMotorcyclePouches += inventory.motorcyclePouches || 0;
    totalBicyclePouches += inventory.bicyclePouches || 0;
    totalTshirts += inventory.tshirts || 0;
  });
  
  const totalInventory = {
    motorcyclePouches: totalMotorcyclePouches,
    bicyclePouches: totalBicyclePouches,
    tshirts: totalTshirts
  };
  
  const averagePerSupervisor = {
    motorcyclePouches: Math.round(totalMotorcyclePouches / supervisors.length),
    bicyclePouches: Math.round(totalBicyclePouches / supervisors.length),
    tshirts: Math.round(totalTshirts / supervisors.length)
  };
  
  return {
    zoneId,
    zoneName: getZoneName(zoneId),
    supervisorCount: supervisors.length,
    supervisorInventories,
    totalInventory,
    averagePerSupervisor,
    lastCalculated: new Date().toISOString()
  };
}

/**
 * حساب مخزون جميع الزونات
 */
export function calculateAllZonesInventory() {
  const zones = getAllZones();
  const results = [];
  
  zones.forEach(zone => {
    const zoneInventory = calculateZoneInventory(zone.id);
    results.push(zoneInventory);
  });
  
  // إضافة إحصائيات عامة
  const totals = results.reduce((acc, zone) => {
    acc.totalMotorcyclePouches += zone.totalInventory.motorcyclePouches;
    acc.totalBicyclePouches += zone.totalInventory.bicyclePouches;
    acc.totalTshirts += zone.totalInventory.tshirts;
    acc.totalSupervisors += zone.supervisorCount;
    return acc;
  }, {
    totalMotorcyclePouches: 0,
    totalBicyclePouches: 0,
    totalTshirts: 0,
    totalSupervisors: 0
  });
  
  return {
    zones: results,
    totals,
    calculatedAt: new Date().toISOString()
  };
}

/**
 * جلب مخزون مشرف معين
 */
function getSupervisorInventory(supervisorId) {
  try {
    const supervisors = JSON.parse(localStorage.getItem(SUPERVISORS_STORAGE_KEY) || '[]');
    const supervisor = supervisors.find(s => 
      s.code === supervisorId || s.id === supervisorId
    );
    
    if (supervisor && supervisor.inventory) {
      return {
        motorcyclePouches: supervisor.inventory.motorcyclePouches || 0,
        bicyclePouches: supervisor.inventory.bicyclePouches || 0,
        tshirts: supervisor.inventory.tshirts || 0
      };
    }
    
    return {
      motorcyclePouches: 0,
      bicyclePouches: 0,
      tshirts: 0
    };
  } catch {
    return {
      motorcyclePouches: 0,
      bicyclePouches: 0,
      tshirts: 0
    };
  }
}

/**
 * جلب اسم الزون
 */
function getZoneName(zoneId) {
  const zones = getAllZones();
  const zone = zones.find(z => z.id === zoneId);
  return zone ? zone.name : 'غير محدد';
}

/**
 * الحصول على إحصائيات مقارنة بين الزونات
 */
export function getZoneComparisonStats() {
  const allZonesData = calculateAllZonesInventory();
  
  // ترتيب الزونات حسب إجمالي المخزون
  const sortedZones = [...allZonesData.zones].sort((a, b) => {
    const totalA = a.totalInventory.motorcyclePouches + 
                   a.totalInventory.bicyclePouches + 
                   a.totalInventory.tshirts;
    const totalB = b.totalInventory.motorcyclePouches + 
                   b.totalInventory.bicyclePouches + 
                   b.totalInventory.tshirts;
    return totalB - totalA;
  });
  
  // حساب النسب المئوية
  const grandTotal = allZonesData.totals.totalMotorcyclePouches +
                     allZonesData.totals.totalBicyclePouches +
                     allZonesData.totals.totalTshirts;
  
  const zonesWithPercentages = sortedZones.map(zone => {
    const zoneTotal = zone.totalInventory.motorcyclePouches +
                     zone.totalInventory.bicyclePouches +
                     zone.totalInventory.tshirts;
    
    return {
      ...zone,
      percentage: grandTotal > 0 ? Math.round((zoneTotal / grandTotal) * 100) : 0,
      totalItems: zoneTotal
    };
  });
  
  return {
    zones: zonesWithPercentages,
    grandTotal,
    calculatedAt: new Date().toISOString()
  };
}
