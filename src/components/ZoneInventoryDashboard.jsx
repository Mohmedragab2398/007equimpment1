/**
 * صفحة مخزون الزونات العام
 * Zone Inventory Dashboard Component
 */

import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, BarChart3, MapPin } from 'lucide-react';
import {
  calculateAllZonesInventory,
  getZoneComparisonStats
} from '../utils/ZoneInventoryCalculator';

export default function ZoneInventoryDashboard() {
  const [inventoryData, setInventoryData] = useState(null);
  const [comparisonStats, setComparisonStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = () => {
    setLoading(true);
    try {
      const allZones = calculateAllZonesInventory();
      const comparison = getZoneComparisonStats();
      
      setInventoryData(allZones);
      setComparisonStats(comparison);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (!inventoryData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-gray-600">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  const { zones, totals } = inventoryData;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-7 h-7" />
          مخزون الزونات العام
        </h2>

        {/* بطاقات الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الزونات</p>
                <p className="text-2xl font-bold text-blue-600">{zones.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المشرفين</p>
                <p className="text-2xl font-bold text-green-600">{totals.totalSupervisors}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المخزون</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totals.totalMotorcyclePouches + totals.totalBicyclePouches + totals.totalTshirts}
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط لكل مشرف</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totals.totalSupervisors > 0
                    ? Math.round(
                        (totals.totalMotorcyclePouches +
                          totals.totalBicyclePouches +
                          totals.totalTshirts) /
                          totals.totalSupervisors
                      )
                    : 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* جدول تفاصيل مخزون كل زون */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-right">اسم الزون</th>
                <th className="border p-3 text-right">عدد المشرفين</th>
                <th className="border p-3 text-right">مخزون المشرفين</th>
                <th className="border p-3 text-right">إجمالي المخزون</th>
                <th className="border p-3 text-right">النسبة</th>
              </tr>
            </thead>
            <tbody>
              {comparisonStats?.zones.map((zone) => (
                <tr key={zone.zoneId} className="hover:bg-gray-50">
                  <td className="border p-3 font-semibold">{zone.zoneName}</td>
                  <td className="border p-3">{zone.supervisorCount}</td>
                  <td className="border p-3">
                    <div className="text-sm space-y-1">
                      {zone.supervisorInventories.map((sup, idx) => (
                        <div key={idx} className="text-gray-600">
                          {sup.supervisorName}: {sup.inventory.motorcyclePouches + sup.inventory.bicyclePouches + sup.inventory.tshirts}
                        </div>
                      ))}
                      {zone.supervisorInventories.length === 0 && (
                        <span className="text-gray-400">لا يوجد</span>
                      )}
                    </div>
                  </td>
                  <td className="border p-3 font-bold">
                    {zone.totalInventory.motorcyclePouches +
                      zone.totalInventory.bicyclePouches +
                      zone.totalInventory.tshirts}
                  </td>
                  <td className="border p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-600 h-4 rounded-full"
                          style={{ width: `${zone.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{zone.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* تفاصيل إضافية */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">تفاصيل المخزون:</h4>
            <div className="text-sm space-y-1">
              <div>حافظات موتوسيكل: {totals.totalMotorcyclePouches}</div>
              <div>حافظات دراجة: {totals.totalBicyclePouches}</div>
              <div>قمصان: {totals.totalTshirts}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">آخر تحديث:</h4>
            <p className="text-sm text-gray-600">
              {new Date(inventoryData.calculatedAt).toLocaleString('ar-EG')}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <button
              onClick={loadInventoryData}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              تحديث البيانات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
