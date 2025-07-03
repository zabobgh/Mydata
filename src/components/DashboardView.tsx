
import React, { useState, useEffect, useMemo } from 'react';
import { Drug, StockStatus, Transaction, TransactionType } from '../types';
import { generateStockAnalysis } from '../services/geminiService';
import { getStockStatus } from '../utils/stockUtils';
import { ExclamationIcon, CalendarIcon, SparklesIcon, ClockIcon } from './icons/Icons';

interface DashboardViewProps {
  drugs: Drug[];
  transactions: Transaction[];
}

const StatCard: React.FC<{ title: string; value: string | number; description: string; className?: string }> = ({ title, value, description, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{description}</p>
    </div>
);

const TransactionTypeBadge: React.FC<{ type: TransactionType }> = ({ type }) => {
  const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full inline-block leading-tight";
  const typeClasses: Record<TransactionType, string> = {
    [TransactionType.Initial]: 'bg-blue-100 text-blue-800',
    [TransactionType.StockIn]: 'bg-green-100 text-green-800',
    [TransactionType.Disbursement]: 'bg-red-100 text-red-800',
    [TransactionType.Adjustment]: 'bg-yellow-100 text-yellow-800',
  };
  return <span className={`${baseClasses} ${typeClasses[type]}`}>{type}</span>;
};


const DashboardView: React.FC<DashboardViewProps> = ({ drugs, transactions }) => {
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const stats = useMemo(() => {
        let lowStockCount = 0;
        let expiringSoonCount = 0;
        let expiredCount = 0;

        drugs.forEach(drug => {
            const status = getStockStatus(drug);
            if (status === StockStatus.LowStock) lowStockCount++;
            if (status === StockStatus.ExpiringSoon) expiringSoonCount++;
            if (status === StockStatus.Expired) expiredCount++;
        });

        return {
            totalItems: drugs.length,
            lowStockCount,
            expiringSoonCount,
            expiredCount
        };
    }, [drugs]);
    
    const lowStockDrugs = useMemo(() => {
        return drugs.filter(drug => getStockStatus(drug) === StockStatus.LowStock);
    }, [drugs]);

    const expiringOrExpiredDrugs = useMemo(() => {
        return drugs
            .filter(drug => [StockStatus.ExpiringSoon, StockStatus.Expired].includes(getStockStatus(drug)))
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }, [drugs]);

    const recentTransactions = useMemo(() => {
        return transactions.slice(0, 5);
    }, [transactions]);


    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        try {
            const result = await generateStockAnalysis(drugs);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
            setAnalysis("เกิดข้อผิดพลาดในการสร้างรายงานวิเคราะห์ โปรดตรวจสอบ Console สำหรับรายละเอียดเพิ่มเติม");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (drugs.length > 0) {
           handleGenerateAnalysis();
        }
    }, [drugs]);

    const renderActionableItem = (drug: Drug, type: 'low_stock' | 'expiry') => {
        const isExpired = getStockStatus(drug) === StockStatus.Expired;
        return (
            <li key={drug.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                    {type === 'low_stock' ? (
                        <ExclamationIcon className="w-5 h-5 text-yellow-500" />
                    ) : (
                        <CalendarIcon className={`w-5 h-5 ${isExpired ? 'text-red-500' : 'text-orange-500'}`} />
                    )}
                    <span className="text-sm font-medium text-gray-800">{drug.name}</span>
                </div>
                {type === 'low_stock' ? (
                    <span className="text-sm font-bold text-yellow-600">{drug.quantity} {drug.unit}</span>
                ) : (
                    <span className={`text-sm font-bold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                        {new Date(drug.expiryDate).toLocaleDateString('th-TH')}
                    </span>
                )}
            </li>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="รายการยาทั้งหมด" value={stats.totalItems} description="จำนวนรายการยาในคลัง" />
                <StatCard title="ยาใกล้หมด" value={stats.lowStockCount} description="น้อยกว่า 20 หน่วย" className={stats.lowStockCount > 0 ? 'bg-yellow-50 border border-yellow-200' : ''} />
                <StatCard title="ยาใกล้หมดอายุ" value={stats.expiringSoonCount} description="ภายใน 90 วัน" className={stats.expiringSoonCount > 0 ? 'bg-orange-50 border border-orange-200' : ''} />
                <StatCard title="ยาหมดอายุ" value={stats.expiredCount} description="รายการที่หมดอายุแล้ว" className={stats.expiredCount > 0 ? 'bg-red-100 border border-red-200' : ''} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 p-4 border-b flex items-center gap-2"><ExclamationIcon className="w-6 h-6 text-yellow-500"/>ยาใกล้หมดสต็อก</h3>
                        <div className="p-4">
                            {lowStockDrugs.length > 0 ? (
                                <ul className="divide-y divide-gray-100">{lowStockDrugs.map(drug => renderActionableItem(drug, 'low_stock'))}</ul>
                            ) : (
                                <p className="text-center text-gray-500 py-4">ไม่พบรายการยาที่ใกล้หมดสต็อก</p>
                            )}
                        </div>
                    </div>
                     <div className="bg-white rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 p-4 border-b flex items-center gap-2"><CalendarIcon className="w-6 h-6 text-orange-500"/>ยาใกล้หมดอายุ / หมดอายุแล้ว</h3>
                        <div className="p-4">
                            {expiringOrExpiredDrugs.length > 0 ? (
                                <ul className="divide-y divide-gray-100">{expiringOrExpiredDrugs.map(drug => renderActionableItem(drug, 'expiry'))}</ul>
                            ) : (
                                <p className="text-center text-gray-500 py-4">ไม่พบรายการยาที่ใกล้หมดอายุหรือหมดอายุแล้ว</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                           <SparklesIcon className="w-6 h-6 text-blue-500"/>
                           บทวิเคราะห์จาก AI
                        </h2>
                        <button
                            onClick={handleGenerateAnalysis}
                            disabled={isLoading}
                            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition flex-shrink-0"
                        >
                            {isLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ใหม่'}
                        </button>
                    </div>
                     <div className="flex-grow overflow-y-auto text-sm">
                        {isLoading && !analysis ? (
                            <div className="text-center py-8">
                                <div className="w-8 h-8 border-2 border-blue-500 border-dashed rounded-full animate-spin mx-auto"></div>
                                <p className="mt-3 text-gray-600">AI กำลังวิเคราะห์...</p>
                            </div>
                        ) : (
                             <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-sans leading-relaxed" dangerouslySetInnerHTML={{ __html: analysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />').replace(/-\s(.*?)(<br \/>)/g, '<li class="ml-4 list-disc">$1</li>') || "คลิก 'วิเคราะห์ใหม่' เพื่อสร้างรายงาน" }}>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 p-4 border-b flex items-center gap-2"><ClockIcon className="w-6 h-6 text-gray-500"/>ประวัติการทำรายการล่าสุด</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อยา</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {recentTransactions.length > 0 ? (
                                recentTransactions.map((t) => (
                                    <tr key={t.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(t.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{t.drugName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><TransactionTypeBadge type={t.type} /></td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{t.user}</td>
                                    </tr>
                                ))
                           ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                        ยังไม่มีประวัติการทำรายการ
                                    </td>
                                </tr>
                           )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
