import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface AuditTrailViewProps {
  transactions: Transaction[];
}

const TransactionTypeBadge: React.FC<{ type: TransactionType }> = ({ type }) => {
  const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full inline-block leading-tight";
  const typeClasses: Record<TransactionType, string> = {
    [TransactionType.Initial]: 'bg-blue-100 text-blue-800',
    [TransactionType.StockIn]: 'bg-green-100 text-green-800',
    [TransactionType.Disbursement]: 'bg-red-100 text-red-800',
    [TransactionType.Adjustment]: 'bg-yellow-100 text-yellow-800',
  };
  return <span className={`${baseClasses} ${typeClasses[type]}`}>{type}</span>;
};

const AuditTrailView: React.FC<AuditTrailViewProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.drugName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || t.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, filterType]);

  return (
    <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="search-term" className="text-sm font-medium text-gray-700">ค้นหารายการ</label>
                    <input
                        id="search-term"
                        type="text"
                        placeholder="ค้นหาชื่อยา, ผู้ใช้, เหตุผล..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="filter-type" className="text-sm font-medium text-gray-700">ประเภทรายการ</label>
                    <select
                        id="filter-type"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="all">ทั้งหมด</option>
                        {Object.values(TransactionType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อยา</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเปลี่ยนแปลง</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดคงเหลือ</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ดำเนินการ</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เหตุผล/หมายเหตุ</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(t.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{t.drugName}</div>
                        <div className="text-sm text-gray-500">{t.drugId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <TransactionTypeBadge type={t.type} />
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${t.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-800 font-medium">{t.quantityAfter}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{t.reason || '-'}</td>
                    </tr>
                    )) : (
                        <tr>
                            <td colSpan={7} className="text-center py-10 text-gray-500">ไม่พบข้อมูล</td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default AuditTrailView;