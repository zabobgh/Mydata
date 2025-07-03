
import React, { useState, useCallback } from 'react';
import { read, utils, WorkBook } from 'xlsx';
import { Drug } from '../types';
import { UploadIcon } from './icons/Icons';

interface DataImportViewProps {
  onImport: (drugs: Omit<Drug, 'id'>[]) => Promise<void>;
}

type ParsedDrug = Omit<Drug, 'id' | 'quantity' | 'image' | 'expiryDate'> & {
  quantity: string | number;
  expiryDate: Date | string;
};

const DataImportView: React.FC<DataImportViewProps> = ({ onImport }) => {
  const [parsedData, setParsedData] = useState<Omit<Drug, 'id'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);
    setError(null);
    setParsedData([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook: WorkBook = read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ParsedDrug[] = utils.sheet_to_json(worksheet, {
             // We expect columns in order, no headers needed in the file itself.
             // The UI will instruct the user on the required column order.
             header: ["name", "quantity", "unit", "expiryDate", "location", "notes"],
             range: 1 // Skip the first row, assuming it's a header.
        });

        const validatedData = jsonData.map((row, index) => {
          // Basic validation for required fields
          if (!row.name || !row.quantity || !row.unit || !row.expiryDate || !row.location) {
            throw new Error(`ข้อมูลไม่ครบถ้วนในแถวที่ ${index + 2} ของไฟล์ Excel (A-E must not be empty)`);
          }

          const quantity = Number(row.quantity);
          if (isNaN(quantity) || quantity < 0) {
              throw new Error(`จำนวน (quantity) ไม่ถูกต้องในแถวที่ ${index + 2}: '${row.quantity}'`);
          }

          let expiryDateStr: string;
          if (row.expiryDate instanceof Date) {
            // Dates from Excel can be off by one day due to timezone differences.
            // This adjustment helps ensure the date is interpreted as intended locally.
            const tempDate = new Date(Date.UTC(row.expiryDate.getFullYear(), row.expiryDate.getMonth(), row.expiryDate.getDate()));
            expiryDateStr = tempDate.toISOString().split('T')[0];
          } else {
             // Handle date as a string (e.g., "2025-12-31")
             const parsedDate = new Date(row.expiryDate);
             if (isNaN(parsedDate.getTime())) {
                throw new Error(`รูปแบบวันหมดอายุ (expiryDate) ไม่ถูกต้องในแถวที่ ${index + 2}: '${row.expiryDate}'. รูปแบบที่ต้องการคือ YYYY-MM-DD`);
             }
             expiryDateStr = parsedDate.toISOString().split('T')[0];
          }
          

          return {
            name: String(row.name).trim(),
            quantity: quantity,
            unit: String(row.unit).trim(),
            expiryDate: expiryDateStr,
            location: String(row.location).trim(),
            notes: row.notes ? String(row.notes).trim() : '',
          };
        });

        setParsedData(validatedData);
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์ Excel โปรดตรวจสอบว่าไฟล์มีรูปแบบที่ถูกต้อง');
        setFileName('');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input value to allow re-uploading the same file
    event.target.value = '';
  }, []);

  const handleImportClick = async () => {
    if (parsedData.length === 0) {
        alert("ไม่มีข้อมูลที่จะนำเข้า");
        return;
    }
    setIsProcessing(true);
    try {
        await onImport(parsedData);
        // Clear state on successful import
        setParsedData([]);
        setFileName('');
        setError(null);
    } catch (err) {
        // Error is handled by the parent component's alert
    } finally {
        setIsProcessing(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-xl font-bold text-gray-800">นำเข้าข้อมูลยาจาก Excel</h2>
        <div className="p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-800 rounded-r-lg">
          <p className="font-bold">คำแนะนำ:</p>
          <ul className="list-disc list-inside mt-2 text-sm space-y-1">
            <li>ไฟล์ Excel ของคุณควรมีชีตเดียว และระบบจะอ่านข้อมูลจากชีตนั้น</li>
            <li><strong>แถวแรกสุด (Row 1) จะถูกข้ามไป</strong> เพื่อใช้เป็นหัวตารางของคุณได้</li>
            <li>คอลัมน์ต้องเรียงตามลำดับดังนี้: <br />
                <code className="font-mono bg-blue-100 px-1 rounded">คอลัมน์ A: ชื่อยา</code>,{' '}
                <code className="font-mono bg-blue-100 px-1 rounded">B: จำนวน</code>,{' '}
                <code className="font-mono bg-blue-100 px-1 rounded">C: หน่วยนับ</code>,{' '}
                <code className="font-mono bg-blue-100 px-1 rounded">D: วันหมดอายุ (YYYY-MM-DD)</code>,{' '}
                <code className="font-mono bg-blue-100 px-1 rounded">E: ตำแหน่งจัดเก็บ</code>,{' '}
                <code className="font-mono bg-blue-100 px-1 rounded">F: หมายเหตุ (ถ้ามี)</code>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
            <label htmlFor="file-upload" className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                <span>เลือกไฟล์ Excel</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls" disabled={isProcessing} />
            </label>
            {fileName && <p className="mt-4 text-sm text-gray-600">ไฟล์ที่เลือก: {fileName}</p>}
            {isProcessing && !error && <p className="mt-2 text-sm text-blue-600">กำลังประมวลผลไฟล์...</p>}
            {error && <p className="mt-4 text-sm text-red-600 font-semibold">{error}</p>}
        </div>
      </div>

      {parsedData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                <h3 className="text-lg font-bold text-gray-800">ข้อมูลตัวอย่าง (5 รายการแรก)</h3>
                <button
                    onClick={handleImportClick}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition"
                >
                    {isProcessing ? `กำลังนำเข้า...` : `ยืนยันการนำเข้า (${parsedData.length} รายการ)`}
                </button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อยา</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันหมดอายุ</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ตำแหน่ง</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {parsedData.slice(0, 5).map((drug, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{drug.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{drug.quantity} {drug.unit}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{drug.expiryDate}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{drug.location}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
            {parsedData.length > 5 && <p className="text-sm text-gray-500 text-center mt-3">...และอีก {parsedData.length - 5} รายการ</p>}
        </div>
      )}
    </div>
  );
};

export default DataImportView;
