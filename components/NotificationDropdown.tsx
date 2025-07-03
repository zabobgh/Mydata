
import React from 'react';
import { DisbursementRecord } from '../types';

interface NotificationDropdownProps {
    requests: DisbursementRecord[];
    onNavigate: () => void;
    onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ requests, onNavigate, onClose }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
            <div className="p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-700">คำขอเบิกที่รอดำเนินการ</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {requests.length === 0 ? (
                    <p className="text-center text-gray-500 py-6 text-sm">ไม่มีการแจ้งเตือนใหม่</p>
                ) : (
                    <ul>
                        {requests.map(req => (
                            <li key={req.id}>
                                <button 
                                    onClick={onNavigate}
                                    className="w-full text-left p-3 hover:bg-gray-100 transition duration-150 ease-in-out border-b"
                                >
                                    <p className="text-sm font-medium text-gray-800">{req.drugName}</p>
                                    <p className="text-xs text-gray-500">
                                        ผู้ขอ: {req.requestedBy} | จำนวน: {req.quantityDisbursed} {req.unit}
                                    </p>
                                    <p className="text-xs text-blue-500 mt-1">
                                        {new Date(req.requestDate).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                                    </p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="p-2 bg-gray-50 text-center">
                 <button onClick={onNavigate} className="text-sm font-medium text-blue-600 hover:underline">
                    ดูคำขอทั้งหมด
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;
