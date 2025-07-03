
import React, { useState } from 'react';
import { DisbursementRecord, DisbursementStatus } from '../types';
import { utils, writeFile } from 'xlsx';
import { DocumentDownloadIcon } from './icons/Icons';

interface ReportsViewProps {
  requests: DisbursementRecord[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ requests }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // Default to current month, e.g., "2024-07"
  );

  const handleExport = () => {
    if (!selectedMonth) {
      alert("กรุณาเลือกเดือนที่ต้องการสร้างรายงาน");
      return;
    }

    const [year, month] = selectedMonth.split('-').map(Number);

    const filteredRequests = requests.filter(req => {
      if (req.status !== DisbursementStatus.Approved || !req.approvalDate) {
        return false;
      }
      const approvalDate = new Date(req.approvalDate);
      return approvalDate.getFullYear() === year && approvalDate.getMonth() + 1 === month;
    });

    if (filteredRequests.length === 0) {
      alert(`ไม่พบข้อมูลการเบิกจ่ายที่อนุมัติแล้วสำหรับเดือน ${selectedMonth}`);
      return;
    }

    const reportData = filteredRequests.map(req => ({
      "วันที่อนุมัติ": new Date(req.approvalDate!).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short'}),
      "ชื่อยา": req.drugName,
      "จำนวนที่เบิก": req.quantityDisbursed,
      "หน่วยนับ": req.unit,
      "ผู้ขอเบิก": req.requestedBy,
      "ผู้อนุมัติ": req.approvedBy,
    }));

    const worksheet = utils.json_to_sheet(reportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'รายงานการเบิกจ่าย');

    // Set column widths for better readability
    worksheet['!cols'] = [
        { wch: 20 }, // วันที่อนุมัติ
        { wch: 35 }, // ชื่อยา
        { wch: 15 }, // จำนวนที่เบิก
        { wch: 15 }, // หน่วยนับ
        { wch: 20 }, // ผู้ขอเบิก
        { wch: 20 }, // ผู้อนุมัติ
    ];

    writeFile(workbook, `รายงานการเบิกจ่าย-${selectedMonth}.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">สร้างรายงานการเบิกจ่าย</h2>
        <p className="text-gray-600 mt-1">เลือกเดือนที่ต้องการและส่งออกข้อมูลเป็นไฟล์ Excel</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex-grow">
          <label htmlFor="report-month" className="block text-sm font-medium text-gray-700 mb-1">
            เลือกเดือนและปี
          </label>
          <input
            type="month"
            id="report-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
        >
          <DocumentDownloadIcon className="w-5 h-5" />
          ส่งออกเป็น Excel
        </button>
      </div>
    </div>
  );
};

export default ReportsView;
