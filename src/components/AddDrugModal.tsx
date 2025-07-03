
import React, { useState, useRef } from 'react';
import { Drug } from '../types';
import { PillIcon } from './icons/Icons';

interface AddDrugModalProps {
  onClose: () => void;
  onAddDrug: (newDrug: Omit<Drug, 'id'>) => void;
}

const AddDrugModal: React.FC<AddDrugModalProps> = ({ onClose, onAddDrug }) => {
  const today = new Date().toISOString().split('T')[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'เม็ด',
    expiryDate: '',
    location: '',
    notes: '',
  });
  
  const [customUnit, setCustomUnit] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (value !== 'custom') {
      setCustomUnit('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUnit = formData.unit === 'custom' ? customUnit : formData.unit;

    if (!formData.name || !formData.quantity || !formData.expiryDate || !formData.location || !finalUnit) {
        alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (รวมถึงหน่วยนับที่กำหนดเอง)");
        return;
    }
    onAddDrug({
      name: formData.name,
      quantity: parseInt(formData.quantity, 10),
      unit: finalUnit,
      expiryDate: formData.expiryDate,
      location: formData.location,
      notes: formData.notes,
      image: image || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onMouseDown={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4" onMouseDown={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">เพิ่มรายการยาใหม่</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">รูปภาพยา</label>
            <div className="mt-2 flex items-center gap-4">
              {image ? (
                  <img src={image} alt="Drug preview" className="h-20 w-20 rounded-md object-cover bg-gray-100" />
              ) : (
                  <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center">
                       <PillIcon className="w-10 h-10 text-gray-400" />
                  </div>
              )}
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
              />
              <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                อัปโหลดรูป
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่อยา <span className="text-red-500">*</span></label>
            <input type="text" name="name" id="name" required value={formData.name} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">จำนวน <span className="text-red-500">*</span></label>
              <input type="number" name="quantity" id="quantity" required value={formData.quantity} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">หน่วยนับ</label>
               <select name="unit" id="unit" value={formData.unit} onChange={handleUnitChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900">
                <option>เม็ด</option>
                <option>ซอง</option>
                <option>ขวด</option>
                <option>หลอด</option>
                <option>แผง</option>
                <option value="custom">อื่นๆ (โปรดระบุ)...</option>
              </select>
              {formData.unit === 'custom' && (
                <input
                    type="text"
                    name="customUnit"
                    id="customUnit"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                    placeholder="ระบุหน่วยนับใหม่"
                    required
                />
              )}
            </div>
          </div>
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">วันหมดอายุ <span className="text-red-500">*</span></label>
            <div className="relative mt-1">
              <input 
                  type="date" 
                  name="expiryDate" 
                  id="expiryDate" 
                  required 
                  min={today} 
                  value={formData.expiryDate} 
                  onChange={handleFormChange} 
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" 
              />
              <label 
                htmlFor="expiryDate" 
                className="absolute inset-0 w-full h-full bg-transparent cursor-pointer"
                aria-hidden="true"
              ></label>
            </div>
          </div>
           <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">ตำแหน่งจัดเก็บ <span className="text-red-500">*</span></label>
            <input type="text" name="location" id="location" required value={formData.location} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900 placeholder-gray-500" placeholder="เช่น ตู้ A1, ชั้น 2" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">หมายเหตุ</label>
            <textarea name="notes" id="notes" rows={3} value={formData.notes} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900 placeholder-gray-500" placeholder="เช่น ข้อบ่งใช้, คำเตือน"></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDrugModal;
