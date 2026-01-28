/**
 * مكون إدارة الزونات
 * Zone Management Component
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Users } from 'lucide-react';
import {
  getAllZones,
  addZone,
  deleteZone,
  getAllSupervisorsWithZones,
  assignSupervisorToZone,
  moveSupervisorBetweenZones,
  initializeZoneSystem
} from '../utils/ZoneManagementSystem';

export default function ZoneManagement() {
  const [zones, setZones] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeZoneSystem();
    loadData();
  }, []);

  const loadData = () => {
    setZones(getAllZones());
    setSupervisors(getAllSupervisorsWithZones());
  };

  const handleAddZone = () => {
    if (!newZoneName.trim()) {
      alert('يرجى إدخال اسم الزون');
      return;
    }

    const result = addZone(newZoneName);
    if (result.success) {
      setNewZoneName('');
      loadData();
      alert('✅ تم إضافة الزون بنجاح');
    } else {
      alert(`❌ ${result.error}`);
    }
  };

  const handleDeleteZone = (zoneId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الزون؟ سيتم نقل المشرفين إلى "غير محدد"')) {
      return;
    }

    const result = deleteZone(zoneId);
    if (result.success) {
      if (selectedZone?.id === zoneId) {
        setSelectedZone(null);
      }
      loadData();
      alert('✅ تم حذف الزون بنجاح');
    }
  };

  const handleAssignSupervisor = (supervisorId, supervisorName, zoneId, zoneName) => {
    const result = assignSupervisorToZone(supervisorId, supervisorName, zoneId, zoneName);
    if (result.success) {
      loadData();
      alert('✅ تم تعيين المشرف بنجاح');
    }
  };

  const handleMoveSupervisor = (supervisorId, newZoneId, newZoneName) => {
    const result = moveSupervisorBetweenZones(supervisorId, newZoneId, newZoneName);
    if (result.success) {
      loadData();
      alert('✅ تم نقل المشرف بنجاح');
    }
  };

  const supervisorsInSelectedZone = selectedZone
    ? supervisors.filter(s => s.zoneId === selectedZone.id)
    : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MapPin className="w-7 h-7" />
        إدارة الزونات وتوزيع المشرفين
      </h2>

      {/* إضافة زون جديد */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">إضافة زون جديد</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            placeholder="اسم الزون (مثال: الغردقة)"
            className="flex-1 px-4 py-2 border rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleAddZone()}
          />
          <button
            onClick={handleAddZone}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة الزونات */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold mb-3">الزونات المتاحة</h3>
          <div className="space-y-2">
            {zones.map((zone) => (
              <div
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedZone?.id === zone.id
                    ? 'bg-blue-100 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{zone.name}</div>
                    <div className="text-sm text-gray-600">
                      {supervisors.filter(s => s.zoneId === zone.id).length} مشرف
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteZone(zone.id);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* تفاصيل الزون المختار */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold mb-3">
            {selectedZone ? `مشرفين ${selectedZone.name}` : 'اختر زون'}
          </h3>
          {selectedZone && (
            <div className="space-y-2">
              {supervisorsInSelectedZone.map((supervisor) => (
                <div
                  key={supervisor.code || supervisor.id}
                  className="p-3 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold">{supervisor.name}</div>
                    <div className="text-sm text-gray-600">{supervisor.code || supervisor.id}</div>
                  </div>
                  <select
                    value={supervisor.zoneId || ''}
                    onChange={(e) => {
                      const newZoneId = e.target.value;
                      const newZone = zones.find(z => z.id === newZoneId);
                      if (newZone) {
                        handleMoveSupervisor(
                          supervisor.code || supervisor.id,
                          newZoneId,
                          newZone.name
                        );
                      }
                    }}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="">غير محدد</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {supervisorsInSelectedZone.length === 0 && (
                <p className="text-gray-500 text-sm">لا يوجد مشرفين في هذا الزون</p>
              )}
            </div>
          )}
        </div>

        {/* جميع المشرفين */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold mb-3">جميع المشرفين</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {supervisors.map((supervisor) => (
              <div
                key={supervisor.code || supervisor.id}
                className="p-3 border rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-semibold">{supervisor.name}</div>
                    <div className="text-sm text-gray-600">
                      الزون الحالي: {supervisor.zoneName}
                    </div>
                  </div>
                </div>
                <select
                  value={supervisor.zoneId || ''}
                  onChange={(e) => {
                    const newZoneId = e.target.value;
                    const newZone = zones.find(z => z.id === newZoneId);
                    if (newZone) {
                      handleAssignSupervisor(
                        supervisor.code || supervisor.id,
                        supervisor.name,
                        newZoneId,
                        newZone.name
                      );
                    } else if (!newZoneId) {
                      handleAssignSupervisor(
                        supervisor.code || supervisor.id,
                        supervisor.name,
                        null,
                        'غير محدد'
                      );
                    }
                  }}
                  className="w-full text-sm border rounded px-2 py-1"
                >
                  <option value="">غير محدد</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {supervisors.length === 0 && (
              <p className="text-gray-500 text-sm">لا يوجد مشرفين</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
