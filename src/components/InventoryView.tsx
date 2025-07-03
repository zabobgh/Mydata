
import React from 'react';
import { Drug, StockStatus } from '../types';
import { TrashIcon, PencilIcon, PillIcon, SwitchHorizontalIcon } from './icons/Icons';
import { getStockStatus } from '../utils/stockUtils';

interface InventoryViewProps {
  drugs: Drug[];
  onStartEdit: (drug: Drug) => void;
  onDeleteDrug: (drugId: string) => void;
  onStartAdjust: (drug: Drug) => void;
}

const StatusBadge: React.FC<{ status: StockStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
  const statusClasses: Record<StockStatus, string> = {
    [StockStatus.InStock]: 'bg-green-100 text-green-800',
    [StockStatus.LowStock]: 'bg-yellow-100 text-yellow-800',
    [StockStatus.OutOfStock]: 'bg-red-100 text-red-800',
    [StockStatus.ExpiringSoon]: 'bg-orange-100 text-orange-800',
    [StockStatus.Expired]: 'bg-red-200 text-red-900 font-bold',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};


const InventoryView: React.FC<InventoryViewProps> = ({ drugs, onStartEdit, onDeleteDrug, onStartAdjust }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รูปภาพ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อยา</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนคงเหลือ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันหมดอายุ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ตำแหน่ง</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drugs.map((drug) => {
              const status = getStockStatus(drug);
              return (
                <tr key={drug.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {drug.image ? (
                        <img src={drug.image} alt={drug.name} className="h-12 w-12 rounded-md object-cover bg-gray-100" />
                    ) : (
                        <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                            <PillIcon className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{drug.name}</div>
                    <div className="text-sm text-gray-500">{drug.id}</div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <StatusBadge status={status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{drug.quantity} {drug.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(drug.expiryDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{drug.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => onStartAdjust(drug)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-gray-100" title="ปรับปรุงสต็อก"><SwitchHorizontalIcon className="w-5 h-5"/></button>
                    <button onClick={() => onStartEdit(drug)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100" title="แก้ไขข้อมูลยา"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => confirm(`ต้องการลบ ${drug.name} ใช่หรือไม่?`) && onDeleteDrug(drug.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-gray-100" title="ลบยา"><TrashIcon className="w-5 h-5"/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryView;
