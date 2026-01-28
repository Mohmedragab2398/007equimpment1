/**
 * نظام رفع ملف Excel للخصومات مع إصلاح عمود الزون
 * Excel Deductions Upload System with Zone Column Fix
 * 
 * هذا الملف يحل مشكلة تعيين عمود "الزون" بشكل صحيح
 */

// xlsx will be imported dynamically when needed

const DEDUCTIONS_STORAGE_KEY = 'ems_deductions_v1';

/**
 * هيكل البيانات الصحيح للخصومات
 */
const DEDUCTIONS_COLUMNS = {
  RIDER_CODE: 'كود المندوب',
  RIDER_NAME: 'اسم المندوب',
  AMOUNT: 'المبلغ',
  CYCLE: 'الدورات',
  NOTES: 'ملاحظات',
  ZONE: 'الزون'
};

/**
 * قراءة ملف Excel وتحويله إلى بيانات منظمة
 */
export async function parseDeductionsExcel(file) {
  // Dynamic import for xlsx
  const XLSXModule = await import('xlsx');
  const XLSX = XLSXModule.default || XLSXModule;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // قراءة أول ورقة
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // تحويل إلى JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: ''
        });
        
        if (jsonData.length < 2) {
          reject(new Error('الملف فارغ أو لا يحتوي على بيانات'));
          return;
        }
        
        // استخراج العناوين من الصف الأول
        const headers = jsonData[0].map(h => String(h).trim());
        
        // البحث عن أعمدة البيانات
        const columnMap = findColumnIndices(headers);
        
        // معالجة البيانات
        const parsedData = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;
          
          const deduction = {
            riderCode: getCellValue(row, columnMap.riderCode) || '',
            riderName: getCellValue(row, columnMap.riderName) || '',
            amount: parseFloat(getCellValue(row, columnMap.amount)) || 0,
            cycle: getCellValue(row, columnMap.cycle) || '',
            notes: getCellValue(row, columnMap.notes) || '',
            zone: getCellValue(row, columnMap.zone) || '', // ✅ عمود الزون
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('ar-EG'),
            addedBy: getCurrentUser()?.name || 'System',
            actor: getCurrentUser()?.role || 'supervisor',
            operationType: 'Excel Upload'
          };
          
          parsedData.push(deduction);
        }
        
        resolve({
          success: true,
          data: parsedData,
          totalRows: parsedData.length,
          headers: headers,
          columnMap: columnMap
        });
      } catch (error) {
        reject(new Error(`خطأ في قراءة الملف: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('فشل قراءة الملف'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * البحث عن فهارس الأعمدة في الملف
 */
function findColumnIndices(headers) {
  const map = {};
  
  // البحث عن كل عمود بطرق مختلفة
  headers.forEach((header, index) => {
    const headerLower = String(header).toLowerCase().trim();
    
    // كود المندوب
    if (!map.riderCode && (
      headerLower.includes('كود') && headerLower.includes('مندوب') ||
      headerLower.includes('code') ||
      headerLower.includes('rider')
    )) {
      map.riderCode = index;
    }
    
    // اسم المندوب
    if (!map.riderName && (
      headerLower.includes('اسم') && headerLower.includes('مندوب') ||
      headerLower.includes('name') ||
      headerLower.includes('rider name')
    )) {
      map.riderName = index;
    }
    
    // المبلغ
    if (!map.amount && (
      headerLower.includes('مبلغ') ||
      headerLower.includes('amount') ||
      headerLower.includes('قيمة')
    )) {
      map.amount = index;
    }
    
    // الدورات
    if (!map.cycle && (
      headerLower.includes('دورة') ||
      headerLower.includes('cycle') ||
      headerLower.includes('دورات')
    )) {
      map.cycle = index;
    }
    
    // الملاحظات
    if (!map.notes && (
      headerLower.includes('ملاحظ') ||
      headerLower.includes('note') ||
      headerLower.includes('سبب') ||
      headerLower.includes('reason')
    )) {
      map.notes = index;
    }
    
    // الزون - ✅ هذا هو المهم!
    if (!map.zone && (
      headerLower.includes('زون') ||
      headerLower.includes('zone') ||
      headerLower.includes('منطقة')
    )) {
      map.zone = index;
    }
  });
  
  // إذا لم نجد الزون، نستخدم آخر عمود كاحتياطي
  if (!map.zone && headers.length > 5) {
    map.zone = headers.length - 1;
  }
  
  return map;
}

/**
 * الحصول على قيمة خلية
 */
function getCellValue(row, index) {
  if (index === undefined || index === null) return '';
  return String(row[index] || '').trim();
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
 * التحقق من صحة البيانات قبل الحفظ
 */
export function validateDeductionsData(data) {
  const errors = [];
  const warnings = [];
  
  data.forEach((item, index) => {
    const rowNum = index + 2; // +2 لأن الصف الأول هو العناوين
    
    // التحقق من البيانات الأساسية
    if (!item.riderCode || item.riderCode.trim() === '') {
      errors.push(`السطر ${rowNum}: كود المندوب مطلوب`);
    }
    
    if (!item.riderName || item.riderName.trim() === '') {
      errors.push(`السطر ${rowNum}: اسم المندوب مطلوب`);
    }
    
    if (!item.amount || isNaN(item.amount) || item.amount <= 0) {
      errors.push(`السطر ${rowNum}: المبلغ غير صالح (${item.amount})`);
    }
    
    // تحذيرات
    if (item.zone && item.zone.trim() !== '') {
      console.log(`✅ السطر ${rowNum}: الزون = "${item.zone}" - سيتم حفظه في عمود Zone`);
    } else {
      warnings.push(`السطر ${rowNum}: لا يوجد زون محدد`);
    }
    
    // التحقق من أن الملاحظات ليست في عمود الزون
    if (item.notes && item.notes.includes('زون')) {
      warnings.push(`السطر ${rowNum}: قد تكون الملاحظات تحتوي على بيانات الزون`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * حفظ البيانات في LocalStorage (مؤقت - سيتم التكامل مع Google Sheets لاحقاً)
 */
export function saveDeductionsToStorage(deductions) {
  try {
    const existing = JSON.parse(localStorage.getItem(DEDUCTIONS_STORAGE_KEY) || '[]');
    const updated = [...existing, ...deductions];
    localStorage.setItem(DEDUCTIONS_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, count: deductions.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * جلب جميع الخصومات
 */
export function getAllDeductions() {
  try {
    return JSON.parse(localStorage.getItem(DEDUCTIONS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * جلب الخصومات حسب الزون
 */
export function getDeductionsByZone(zone) {
  const all = getAllDeductions();
  return all.filter(d => d.zone === zone);
}

/**
 * تصدير البيانات إلى Excel
 */
export async function exportDeductionsToExcel(deductions = null) {
  // Dynamic import for xlsx
  const XLSXModule = await import('xlsx');
  const XLSX = XLSXModule.default || XLSXModule;
  
  const data = deductions || getAllDeductions();
  
  if (data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }
  
  // تحويل البيانات إلى صيغة Excel
  const worksheetData = [
    ['Date', 'Time', 'Rider Code', 'Rider Name', 'Supervisor Code', 'Supervisor Name', 
     'Deduction Type', 'Amount', 'Reason', 'Cycle', 'Added By', 'Actor', 'Operation Type', 'Zone']
  ];
  
  data.forEach(item => {
    worksheetData.push([
      item.date || '',
      item.time || '',
      item.riderCode || '',
      item.riderName || '',
      item.supervisorCode || '',
      item.supervisorName || '',
      'Manual',
      item.amount || 0,
      item.notes || '',
      item.cycle || '',
      item.addedBy || '',
      item.actor || '',
      item.operationType || '',
      item.zone || '' // ✅ عمود الزون
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Deductions');
  
  // تصدير الملف
  XLSX.writeFile(workbook, `deductions_${new Date().toISOString().split('T')[0]}.xlsx`);
}
