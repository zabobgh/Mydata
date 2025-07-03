
import React, { useRef } from 'react';
import { Drug } from '../types';
import { PillIcon, CapsuleIcon, MedicalBagIcon, HeartIcon } from './icons/Icons';

interface SettingsViewProps {
  drugs: Drug[];
  onUpdateDrug: (updatedDrug: Drug) => void;
  appIcon: string;
  onUpdateAppIcon: (iconIdentifier: string) => void;
}

const IconPreview: React.FC<{ icon: string }> = ({ icon }) => {
    const iconProps = { className: "w-20 h-20 text-blue-600" };
    
    if (icon && icon.startsWith('data:image/')) {
        return <img src={icon} alt="Current App Icon" className="w-20 h-20 rounded-lg object-cover shadow-md" />;
    }
    
    switch(icon) {
        case 'medical-bag': return <MedicalBagIcon {...iconProps} />;
        case 'heart': return <HeartIcon {...iconProps} />;
        case 'pill': return <PillIcon {...iconProps} />;
        case 'capsule':
        default:
            return <CapsuleIcon {...iconProps} />;
    }
}


const SettingsView: React.FC<SettingsViewProps> = ({ drugs, onUpdateDrug, appIcon, onUpdateAppIcon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDrugId, setSelectedDrugId] = React.useState<string | null>(null);
  const iconUploadInputRef = useRef<HTMLInputElement>(null);

  const handleIconUploadClick = () => {
    iconUploadInputRef.current?.click();
  };

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
       if (file.size > 1024 * 1024) { // 1MB size limit
          alert("ขนาดไฟล์รูปภาพต้องไม่เกิน 1MB");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateAppIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleUploadClick = (drugId: string) => {
    setSelectedDrugId(drugId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedDrugId) {
      const file = e.target.files[0];
      const drugToUpdate = drugs.find(d => d.id === selectedDrugId);
      if (!drugToUpdate) return;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateDrug({
          ...drugToUpdate,
          image: reader.result as string,
        });
        // Reset after upload
        setSelectedDrugId(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800">ตั้งค่าระบบ</h2>
        <p className="text-gray-600 mt-1">จัดการการตั้งค่าต่างๆ ของระบบ</p>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">เปลี่ยนไอคอนแอปพลิเคชัน</h3>
         <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex-shrink-0">
                <IconPreview icon={appIcon} />
            </div>
            <div className="flex-grow text-center sm:text-left">
                <p className="text-gray-600 mb-3">คุณสามารถอัปโหลดรูปภาพ (ไม่เกิน 1MB) เพื่อใช้เป็นไอคอนหลักของแอปพลิเคชันได้</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="file"
                        ref={iconUploadInputRef}
                        onChange={handleIconFileChange}
                        accept="image/png, image/jpeg, image/svg+xml, image/webp"
                        className="hidden"
                    />
                    <button
                        onClick={handleIconUploadClick}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                    >
                        อัปโหลดไอคอนใหม่
                    </button>
                    <button
                        onClick={() => onUpdateAppIcon('capsule')}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                        รีเซ็ตเป็นค่าเริ่มต้น
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">จัดการรูปภาพยา</h3>
        <p className="text-gray-600 mb-4">อัปโหลดหรือเปลี่ยนรูปภาพสำหรับยาแต่ละรายการ</p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {drugs.map(drug => (
            <div key={drug.id} className="border rounded-lg p-4 flex flex-col items-center text-center shadow hover:shadow-lg transition-shadow duration-200">
              {drug.image ? (
                <img src={drug.image} alt={drug.name} className="w-24 h-24 object-cover rounded-md mb-4 bg-gray-100" />
              ) : (
                <div className="w-24 h-24 rounded-md mb-4 bg-gray-100 flex items-center justify-center">
                  <PillIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <p className="font-semibold text-gray-800 flex-grow mb-2 h-10 flex items-center">{drug.name}</p>
              <button
                onClick={() => handleUploadClick(drug.id)}
                className="mt-auto w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                {drug.image ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
