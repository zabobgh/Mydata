
import React, { useState, useEffect } from 'react';
import { DisbursementRecord, DisbursementStatus } from '../types';

// Helper to convert ISO string to YYYY-MM-DDTHH:mm format for datetime-local input
const toDateTimeLocal = (isoString?: string): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        // Adjust for timezone offset to display correctly in user's local time
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    } catch (e) {
        console.error("Error formatting date:", e);
        return '';
    }
};

interface EditDisbursementModalProps {
  request: DisbursementRecord;
  onClose: () => void;
  onUpdate: (updatedRecord: DisbursementRecord) => void;
}

const EditDisbursementModal: React.FC<EditDisbursementModalProps> = ({ request, onClose, onUpdate }) => {
  const [requestDate, setRequestDate] = useState('');
  const [approvalDate, setApprovalDate] = useState('');

  useEffect(() => {
    setRequestDate(toDateTimeLocal(request.requestDate));
    if (request.status !== DisbursementStatus.Pending && request.approvalDate) {
      setApprovalDate(toDateTimeLocal(request.approvalDate));
    } else {
      setApprovalDate('');
    }
  }, [request]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestDate) {
        alert('กรุณากรอกวันที่ขอเบิก');
        return;
    }
    
    const updatedRecord: DisbursementRecord = {
        ...request,
        requestDate: new Date(requestDate).toISOString(),
    };
    
    if (request.status !== DisbursementStatus.Pending) {
         if (!approvalDate) {
            alert('กรุณากรอกวันที่อนุมัติ/ปฏิเสธ');
            return;
        }
        updatedRecord.approvalDate = new Date(approvalDate).toISOString();
    }

    onUpdate(updatedRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onMouseDown={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4" onMouseDown={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">แก้ไขข้อมูลการเบิกจ่าย</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="mb-4 bg-gray-50 p-3 rounded-md border">
            <p><span className="font-semibold">ยา:</span> {request.drugName}</p>
            <p><span className="font-semibold">ผู้ขอ:</span> {request.requestedBy}</p>
            <p><span className="font-semibold">สถานะ:</span> {request.status}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="requestDate" className="block text-sm font-medium text-gray-700">วันที่และเวลาที่ขอเบิก</label>
                <input
                    type="datetime-local"
                    id="requestDate"
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
          
            {request.status !== DisbursementStatus.Pending && (
                <div>
                    <label htmlFor="approvalDate" className="block text-sm font-medium text-gray-700">วันที่และเวลาที่อนุมัติ/ปฏิเสธ</label>
                    <input
                        type="datetime-local"
                        id="approvalDate"
                        value={approvalDate}
                        onChange={(e) => setApprovalDate(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            )}
          
            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">บันทึกการเปลี่ยนแปลง</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditDisbursementModal;
