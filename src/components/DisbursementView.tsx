
import React, { useState, useMemo } from 'react';
import { Drug, DisbursementRecord, DisbursementStatus } from '../types';

interface DisbursementViewProps {
  drugs: Drug[];
  history: DisbursementRecord[];
  onRequest: (drugId: string, quantity: number) => Promise<boolean>;
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


const DisbursementView: React.FC<DisbursementViewProps> = ({ drugs, history, onRequest }) => {
  const [selectedDrugId, setSelectedDrugId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedDrug = useMemo(() => {
    return drugs.find(d => d.id === selectedDrugId);
  }, [selectedDrugId, drugs]);
  
  const filteredDrugs = useMemo(() => {
    if (!searchTerm) {
      return drugs.filter(drug => drug.quantity > 0);
    }
    return drugs.filter(drug => 
        drug.quantity > 0 &&
        drug.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [drugs, searchTerm]);


  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const requestQty = parseInt(quantity, 10);

    if (!selectedDrug) {
      setError('กรุณาเลือกยา');
      return;
    }
    if (isNaN(requestQty) || requestQty <= 0) {
      setError('กรุณากรอกจำนวนที่ถูกต้อง');
      return;
    }
    if (requestQty > selectedDrug.quantity) {
      setError(`จำนวนที่ขอเบิกมีมากกว่าในคลัง (คงเหลือ: ${selectedDrug.quantity} ${selectedDrug.unit})`);
      return;
    }

    const success = await onRequest(selectedDrugId, requestQty);
    if (success) {
      setSelectedDrugId('');
      setQuantity('');
      setSearchTerm('');
      alert('ส่งคำขอเบิกยาเรียบร้อยแล้ว');
    } else {
      setError('เกิดข้อผิดพลาดในการส่งคำขอเบิกยา');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">สร้างคำขอเบิกยา</h2>
        <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">ค้นหาและเลือกยา</label>
              <input 
                type="text"
                id="search"
                placeholder="พิมพ์เพื่อค้นหายา..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedDrugId(''); // Reset selection when searching
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900 placeholder-gray-500"
              />
               <select
                id="drug"
                value={selectedDrugId}
                onChange={e => setSelectedDrugId(e.target.value)}
                className="mt-2 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                required
              >
                <option value="" disabled>-- กรุณาเลือกยา --</option>
                {filteredDrugs.map(drug => (
                  <option key={drug.id} value={drug.id}>
                    {drug.name} (คงเหลือ: {drug.quantity} {drug.unit})
                  </option>
                ))}
              </select>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">จำนวนที่ขอเบิก</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                min="1"
                max={selectedDrug?.quantity}
                disabled={!selectedDrugId}
                required
              />
            </div>
             <button
              type="submit"
              disabled={!selectedDrugId || !quantity}
              className="w-full md:w-auto justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition"
            >
              ส่งคำขอเบิก
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-bold text-gray-800 p-6">ประวัติการเบิกจ่าย</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อยา</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนที่เบิก</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ขอเบิก</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">ยังไม่มีประวัติการเบิกจ่าย</td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.drugName}</div>
                      <div className="text-sm text-gray-500">{record.drugId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.quantityDisbursed} {record.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.requestDate).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={record.status} />
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

export default DisbursementView;
