
import React, { useState } from 'react';
import { Drug } from '../types';

interface AdjustStockModalProps {
  onClose: () => void;
  onAdjustStock: (drugId: string, change: number, reason: string) => void;
  drug: Drug;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ onClose, onAdjustStock, drug }) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('กรุณากรอกจำนวนที่ถูกต้อง');
      return;
    }

    if (!reason.trim()) {
      setError('กรุณาระบุเหตุผลในการปรับปรุงสต็อก');
      return;
    }

    const change = adjustmentType === 'add' ? qty : -qty;

    if (adjustmentType === 'remove' && qty > drug.quantity) {
      setError(`จำนวนที่ต้องการนำออก (${qty}) มีมากกว่ายอดคงเหลือ (${drug.quantity})`);
      return;
    }

    onAdjustStock(drug.id, change, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onMouseDown={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4" onMouseDown={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
            <div>
                 <h2 className="text-2xl font-bold text-gray-800">ปรับปรุงสต็อกยา</h2>
                 <p className="text-gray-600">{drug.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <p className="mb-4 text-sm text-gray-700 bg-gray-100 p-3 rounded-md">ยอดคงเหลือปัจจุบัน: <span className="font-bold text-blue-600">{drug.quantity} {drug.unit}</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทการปรับปรุง</label>
            <div className="flex gap-4">
                <label className={`flex-1 p-3 border rounded-md cursor-pointer text-center ${adjustmentType === 'add' ? 'bg-blue-50 border-blue-500' : 'bg-white'}`}>
                    <input type="radio" name="adjustmentType" value="add" checked={adjustmentType === 'add'} onChange={() => setAdjustmentType('add')} className="sr-only"/>
                    <span className="font-medium text-green-700">รับเข้า / เพิ่มสต็อก</span>
                </label>
                 <label className={`flex-1 p-3 border rounded-md cursor-pointer text-center ${adjustmentType === 'remove' ? 'bg-red-50 border-red-500' : 'bg-white'}`}>
                    <input type="radio" name="adjustmentType" value="remove" checked={adjustmentType === 'remove'} onChange={() => setAdjustmentType('remove')} className="sr-only"/>
                    <span className="font-medium text-red-700">นำออก / ลดสต็อก</span>
                </label>
            </div>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">จำนวน <span className="text-red-500">*</span></label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">เหตุผลในการปรับปรุง <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="เช่น รับยาเข้าสต็อก, ยาชำรุด, ตรวจนับสต็อก"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {error && <p className="text-sm text-center text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">ยืนยันการปรับปรุง</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;
