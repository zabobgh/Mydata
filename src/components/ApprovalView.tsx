
import React, { useMemo } from 'react';
import { DisbursementRecord, DisbursementStatus } from '../types';
import { PencilIcon } from './icons/Icons';

interface ApprovalViewProps {
  requests: DisbursementRecord[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onStartEdit: (request: DisbursementRecord) => void;
}

const StatusBadge: React.FC<{ status: DisbursementStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-1 text-xs font-medium rounded-full inline-block";
  const statusClasses: Record<DisbursementStatus, string> = {
    [DisbursementStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    [DisbursementStatus.Approved]: 'bg-green-100 text-green-800',
    [DisbursementStatus.Rejected]: 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};


const ApprovalView: React.FC<ApprovalViewProps> = ({ requests, onApprove, onReject, onStartEdit }) => {
  const pendingRequests = useMemo(() => {
    return requests
      .filter(req => req.status === DisbursementStatus.Pending)
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [requests]);

  const completedRequests = useMemo(() => {
    return requests
        .filter(req => req.status !== DisbursementStatus.Pending)
        .sort((a, b) => {
            const dateA = a.approvalDate || a.requestDate;
            const dateB = b.approvalDate || b.requestDate;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
  }, [requests]);


  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-bold text-gray-800 p-6 border-b">คำขอเบิกที่รอดำเนินการ ({pendingRequests.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ขอ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อยา</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ขอเบิก</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">ไม่มีคำขอที่รอดำเนินการ</td>
                </tr>
              ) : (
                pendingRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestDate).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.drugName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.quantityDisbursed} {request.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.requestedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => onStartEdit(request)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100" title="แก้ไขวันที่"><PencilIcon className="w-5 h-5"/></button>
                      <button 
                        onClick={() => onApprove(request.id)} 
                        className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                      >
                        อนุมัติ
                      </button>
                      <button 
                        onClick={() => onReject(request.id)} 
                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                      >
                        ปฏิเสธ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-bold text-gray-800 p-6 border-b">รายการที่อนุมัติ/ปฏิเสธแล้ว</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อยา</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่อนุมัติ/ปฏิเสธ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้อนุมัติ</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {completedRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">ยังไม่มีรายการที่ดำเนินการแล้ว</td>
                </tr>
              ) : (
                completedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.drugName}</div>
                      <div className="text-xs text-gray-500">ขอโดย: {request.requestedBy}</div>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.approvalDate ? new Date(request.approvalDate).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.approvedBy || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <button onClick={() => onStartEdit(request)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100" title="แก้ไขวันที่"><PencilIcon className="w-5 h-5"/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApprovalView;
