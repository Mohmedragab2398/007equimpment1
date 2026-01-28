/**
 * مكون رفع ملف Excel للخصومات
 * Excel Deductions Upload Component
 */

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { parseDeductionsExcel, validateDeductionsData, saveDeductionsToStorage } from '../utils/ExcelDeductionsUploader';

export default function ExcelDeductionsUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setLoading(true);

    try {
      const parsed = await parseDeductionsExcel(selectedFile);
      setPreview(parsed);
      
      // التحقق من البيانات
      const validation = validateDeductionsData(parsed.data);
      setResult(validation);
    } catch (error) {
      setResult({
        isValid: false,
        errors: [error.message],
        warnings: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!preview || !result.isValid) {
      alert('يرجى التأكد من صحة البيانات أولاً');
      return;
    }

    setLoading(true);
    try {
      const saveResult = saveDeductionsToStorage(preview.data);
      
      if (saveResult.success) {
        alert(`✅ تم رفع ${saveResult.count} سجل بنجاح!`);
        setFile(null);
        setPreview(null);
        setResult(null);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        alert(`❌ فشل الحفظ: ${saveResult.error}`);
      }
    } catch (error) {
      alert(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileSpreadsheet className="w-6 h-6" />
        رفع ملف Excel للخصومات
      </h3>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">تعليمات مهمة:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>يجب أن يحتوي الملف على الأعمدة التالية بالترتيب:</li>
          <li><strong>1. كود المندوب</strong> → سيحفظ في Rider Code</li>
          <li><strong>2. اسم المندوب</strong> → سيحفظ في Rider Name</li>
          <li><strong>3. المبلغ</strong> → سيحفظ في Amount</li>
          <li><strong>4. الدورات</strong> → سيحفظ في Cycle</li>
          <li><strong>5. ملاحظات</strong> → سيحفظ في Reason</li>
          <li><strong>6. الزون</strong> → سيحفظ في Zone ✅ (عمود جديد)</li>
        </ul>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">اختر ملف Excel:</label>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            اختر الملف
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileSelect}
              disabled={loading}
            />
          </label>
          {file && (
            <span className="text-sm text-gray-600">
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">جاري معالجة الملف...</p>
        </div>
      )}

      {preview && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">معاينة البيانات:</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">كود المندوب</th>
                  <th className="border p-2">اسم المندوب</th>
                  <th className="border p-2">المبلغ</th>
                  <th className="border p-2">الدورات</th>
                  <th className="border p-2">ملاحظات</th>
                  <th className="border p-2 bg-green-100">الزون ✅</th>
                </tr>
              </thead>
              <tbody>
                {preview.data.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{row.riderCode}</td>
                    <td className="border p-2">{row.riderName}</td>
                    <td className="border p-2">{row.amount}</td>
                    <td className="border p-2">{row.cycle}</td>
                    <td className="border p-2">{row.notes}</td>
                    <td className="border p-2 bg-green-50 font-semibold">{row.zone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.data.length > 5 && (
              <p className="text-sm text-gray-500 mt-2">
                ... و {preview.data.length - 5} سطر إضافي
              </p>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            إجمالي السجلات: <strong>{preview.totalRows}</strong>
          </p>
        </div>
      )}

      {result && (
        <div className="mb-4">
          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                <XCircle className="w-5 h-5" />
                الأخطاء ({result.errors.length}):
              </div>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                {result.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                <AlertCircle className="w-5 h-5" />
                تحذيرات ({result.warnings.length}):
              </div>
              <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                {result.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {result.isValid && result.errors.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle className="w-5 h-5" />
                البيانات صحيحة وجاهزة للرفع!
              </div>
            </div>
          )}
        </div>
      )}

      {preview && result?.isValid && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري الرفع...' : `رفع ${preview.totalRows} سجل`}
        </button>
      )}
    </div>
  );
}
