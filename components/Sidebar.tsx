import React from 'react';
import { ChartBarIcon, PillIcon, LogoutIcon, UsersIcon, ClipboardListIcon, CheckCircleIcon, DocumentDownloadIcon, CogIcon, CapsuleIcon, MedicalBagIcon, HeartIcon, ClockIcon, SparklesIcon, UploadIcon } from './icons/Icons';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  appIcon: string;
  pendingRequestCount: number;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-md ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-200'
    }`}
  >
    {icon}
    <span className="mx-4 font-medium flex-grow">{label}</span>
    {badge && badge > 0 && (
      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
        {badge}
      </span>
    )}
  </button>
);

const AppIcon: React.FC<{ icon: string }> = ({ icon }) => {
    const iconProps = { className: "h-10 w-10 text-blue-600" };

    if (icon && icon.startsWith('data:image/')) {
        return <img src={icon} alt="App Icon" className="h-10 w-10 rounded-md object-cover" />;
    }
    
    switch(icon) {
        case 'medical-bag': return <MedicalBagIcon {...iconProps} />;
        case 'heart': return <HeartIcon {...iconProps} />;
        case 'pill': return <PillIcon {...iconProps} />;
        case 'capsule':
        default:
            return <CapsuleIcon {...iconProps} />;
    }
};

const Sidebar: React.FC<SidebarProps> = ({ user, activeView, setActiveView, onLogout, appIcon, pendingRequestCount }) => {
  const adminNavs = [
      { id: 'inventory', icon: <PillIcon className="w-6 h-6" />, label: 'จัดการคลังยา' },
      { id: 'import_data', icon: <UploadIcon className="w-6 h-6" />, label: 'นำเข้าข้อมูล' },
      { id: 'approvals', icon: <CheckCircleIcon className="w-6 h-6" />, label: 'อนุมัติการเบิก', badge: pendingRequestCount },
      { id: 'audit_trail', icon: <ClockIcon className="w-6 h-6" />, label: 'ประวัติการทำรายการ' },
      { id: 'users', icon: <UsersIcon className="w-6 h-6" />, label: 'จัดการผู้ใช้งาน' },
      { id: 'reports', icon: <DocumentDownloadIcon className="w-6 h-6" />, label: 'รายงาน' },
      { id: 'settings', icon: <CogIcon className="w-6 h-6" />, label: 'ตั้งค่า' },
  ];
  
  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 shadow-lg">
      <div className="flex items-center justify-center h-20 border-b gap-2 px-4">
        <AppIcon icon={appIcon} />
        <div className="flex flex-col items-start">
          <span className="text-lg font-bold text-gray-800 leading-tight">คลังยา</span>
          <span className="text-sm text-gray-500 leading-tight">รพ.สต.บ้านกาหลง</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavItem 
            icon={<ChartBarIcon className="w-6 h-6" />} 
            label="ภาพรวม"
            isActive={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
        />
        <NavItem 
            icon={<SparklesIcon className="w-6 h-6" />} 
            label="ผู้ช่วย AI"
            isActive={activeView === 'ai_assistant'}
            onClick={() => setActiveView('ai_assistant')}
        />
         <NavItem 
            icon={<ClipboardListIcon className="w-6 h-6" />} 
            label="เบิกจ่ายยา"
            isActive={activeView === 'disbursement'}
            onClick={() => setActiveView('disbursement')}
        />
        {user.role === UserRole.Admin && (
            <div className="pt-2">
                 <p className="px-4 text-xs font-semibold text-gray-400 uppercase">ส่วนผู้ดูแลระบบ</p>
                 <div className="mt-2 space-y-2">
                    {adminNavs.map(nav => (
                        <NavItem
                            key={nav.id}
                            icon={nav.icon}
                            label={nav.label}
                            isActive={activeView === nav.id}
                            onClick={() => setActiveView(nav.id)}
                            badge={nav.badge}
                        />
                    ))}
                 </div>
            </div>
        )}
      </nav>
      
      <div className="px-4 py-4 border-t">
        <NavItem 
            icon={<LogoutIcon className="w-6 h-6" />} 
            label="ออกจากระบบ"
            isActive={false}
            onClick={onLogout}
        />
      </div>
    </div>
  );
};

export default Sidebar;