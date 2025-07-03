
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Sidebar from './Sidebar';
import DashboardView from './DashboardView';
import InventoryView from './InventoryView';
import DisbursementView from './DisbursementView';
import ApprovalView from './ApprovalView';
import UserManagementView from './UserManagementView';
import ReportsView from './ReportsView';
import SettingsView from './SettingsView';
import AuditTrailView from './AuditTrailView';
import AIAssistantView from './AIAssistantView';
import AddDrugModal from './AddDrugModal';
import EditDrugModal from './EditDrugModal';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import AdjustStockModal from './AdjustStockModal';
import NotificationDropdown from './NotificationDropdown';
import { Drug, DisbursementRecord, User, UserRole, DisbursementStatus, Transaction, TransactionType } from '../types';
import { PlusIcon, BellIcon, UserAddIcon, UsersIcon } from './icons/Icons';
import DataImportView from './DataImportView';
import { mockUsers, mockTransactions, mockDisbursementRecords, generateIdForNewItem } from '../services/mockData';
import EditDisbursementModal from './EditDisbursementModal';

interface DashboardProps {
    user: User;
    onLogout: () => void;
    appIcon: string;
    onUpdateAppIcon: (iconIdentifier: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, appIcon, onUpdateAppIcon }) => {
  const [activeView, setActiveView] = useState('dashboard');
  
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [disbursementRequests, setDisbursementRequests] = useState<DisbursementRecord[]>(mockDisbursementRecords);
  const [transactions, setTransactions] = useState<Transaction[]>(() => 
    mockTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  );
  
  const [isLoadingData, setIsLoadingData] = useState(true); 

  const [isAddDrugModalOpen, setIsAddDrugModalOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [adjustingDrug, setAdjustingDrug] = useState<Drug | null>(null);
  const [editingDisbursement, setEditingDisbursement] = useState<DisbursementRecord | null>(null);


  const [isNotificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const notificationContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationContainerRef.current && !notificationContainerRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        setIsLoadingData(true);
        const response = await fetch('/api/drugs');
        if (!response.ok) {
            throw new Error('Failed to fetch drugs');
        }
        const data = await response.json();
        setDrugs(data);
      } catch (error) {
        console.error(error);
        alert('ไม่สามารถโหลดข้อมูลยาจากฐานข้อมูลได้');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDrugs();
  }, []);

  const pendingRequests = useMemo(() => {
    return disbursementRequests
      .filter(req => req.status === DisbursementStatus.Pending)
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [disbursementRequests]);

  const hasUnreadNotifications = useMemo(() => {
      if (pendingRequests.length === 0) return false;
      return true; 
  }, [pendingRequests]);
  
  useEffect(() => {
    const adminOnlyViews = ['inventory', 'import_data', 'approvals', 'audit_trail', 'users', 'reports', 'settings'];
    if (user.role === UserRole.User && adminOnlyViews.includes(activeView)) {
      setActiveView('dashboard');
    }
  }, [user.role, activeView]);

  const addTransaction = useCallback((newTransaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{...newTransaction, id: generateIdForNewItem()}, ...prev]);
  }, []);

  const onAddUser = useCallback(async (newUser: Omit<User, 'id' | 'password'> & {password: string}) => {
    const userWithId = { ...newUser, id: generateIdForNewItem() };
    setUsers(prev => [...prev, userWithId]);
  }, []);

  const onUpdateUser = useCallback(async (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditingUser(null);
  }, []);

  const onDeleteUser = useCallback(async (userId: string) => {
    if (user && user.id === userId) {
      alert("ไม่สามารถลบบัญชีของตัวเองได้");
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, [user]);

  const addDrug = useCallback(async (newDrugData: Omit<Drug, 'id'>) => {
    try {
        const response = await fetch('/api/drugs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDrugData),
        });

        if (!response.ok) {
            throw new Error('Failed to add drug');
        }
        const newDrug = await response.json();

        setDrugs(prev => [...prev, newDrug]);

        addTransaction({
          drugId: newDrug.id,
          drugName: newDrug.name,
          type: TransactionType.Initial,
          quantityChange: newDrug.quantity,
          quantityAfter: newDrug.quantity,
          timestamp: new Date().toISOString(),
          user: user.username,
          reason: 'สร้างรายการยาใหม่'
        });

    } catch (error) {
        console.error(error);
        alert('เกิดข้อผิดพลาดในการเพิ่มยา');
    }
  }, [user.username, addTransaction]);

  const updateDrug = useCallback(async (updatedDrug: Drug) => {
    // TODO: Convert this to an API call to PUT /api/drugs/[id]
    const oldDrug = drugs.find(d => d.id === updatedDrug.id);
    setDrugs(prev => prev.map(d => d.id === updatedDrug.id ? updatedDrug : d));
    setEditingDrug(null);
    if (oldDrug && oldDrug.quantity !== updatedDrug.quantity) {
       addTransaction({
        drugId: updatedDrug.id,
        drugName: updatedDrug.name,
        type: TransactionType.Adjustment,
        quantityChange: updatedDrug.quantity - oldDrug.quantity,
        quantityAfter: updatedDrug.quantity,
        timestamp: new Date().toISOString(),
        user: user.username,
        reason: 'แก้ไขข้อมูลยา'
       });
    }
  }, [user.username, addTransaction, drugs]);
  
  const deleteDrug = async (drugId: string) => {
    // TODO: Convert this to an API call to DELETE /api/drugs/[id]
    const drugToDelete = drugs.find(d => d.id === drugId);
    if (!drugToDelete) return;
    setDrugs(prev => prev.filter(d => d.id !== drugId));
    addTransaction({
      drugId: drugToDelete.id,
      drugName: drugToDelete.name,
      type: TransactionType.Adjustment,
      quantityChange: -drugToDelete.quantity,
      quantityAfter: 0,
      timestamp: new Date().toISOString(),
      user: user.username,
      reason: 'ลบรายการยา'
    });
  };

  const handleBulkImport = useCallback(async (newDrugs: Omit<Drug, 'id'>[]) => {
    // TODO: Convert this to an API call to POST /api/drugs/bulk
    const drugsWithIds = newDrugs.map(d => ({ ...d, id: generateIdForNewItem() }));
    setDrugs(prev => [...prev, ...drugsWithIds]);
    
    const newTransactions = drugsWithIds.map(d => ({
        id: generateIdForNewItem(),
        drugId: d.id,
        drugName: d.name,
        type: TransactionType.StockIn,
        quantityChange: d.quantity,
        quantityAfter: d.quantity,
        timestamp: new Date().toISOString(),
        user: user.username,
        reason: 'นำเข้าข้อมูลจากไฟล์'
    }));
    setTransactions(prev => [...newTransactions, ...prev]);

    alert('นำเข้าข้อมูลยาสำเร็จ!');
    setActiveView('inventory');
  }, [user.username]);

  const handleStartEditDrug = (drug: Drug) => setEditingDrug(drug);
  const handleStartAdjustStock = (drug: Drug) => setAdjustingDrug(drug);
  const handleStartEditDisbursement = (request: DisbursementRecord) => setEditingDisbursement(request);

  const handleUpdateDisbursementRecord = useCallback(async (updatedRecord: DisbursementRecord) => {
      // In a real app, this would be an API call to update the disbursement record
      setDisbursementRequests(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
      setEditingDisbursement(null);
      alert('อัปเดตข้อมูลการเบิกจ่ายเรียบร้อยแล้ว');
  }, []);


  const handleDisbursementRequest = useCallback(async (drugId: string, quantity: number): Promise<boolean> => {
    // TODO: Convert this to an API call to POST /api/disbursements
    const drug = drugs.find(d => d.id === drugId);
    if (!drug) return false;

    const newRequest: DisbursementRecord = {
        id: generateIdForNewItem(),
        drugId,
        drugName: drug.name,
        quantityDisbursed: quantity,
        unit: drug.unit,
        requestDate: new Date().toISOString(),
        requestedBy: user.username,
        status: DisbursementStatus.Pending,
    };
    setDisbursementRequests(prev => [...prev, newRequest]);
    return true;
  }, [drugs, user.username]);

  const handleApprovalAction = useCallback(async (requestId: string, newStatus: DisbursementStatus.Approved | DisbursementStatus.Rejected) => {
    // TODO: Convert this to an API call to POST /api/disbursements/[id]/approve or /reject
    const request = disbursementRequests.find(r => r.id === requestId);
    if (!request) return;

    setDisbursementRequests(prev => prev.map(r => r.id === requestId ? {...r, status: newStatus, approvedBy: user.username, approvalDate: new Date().toISOString() } : r));
    
    if (newStatus === DisbursementStatus.Approved) {
        const drug = drugs.find(d => d.id === request.drugId);
        if (drug) {
            const newQuantity = drug.quantity - request.quantityDisbursed;
            if (newQuantity < 0) {
              alert(`เกิดข้อผิดพลาด: ยาในคลังไม่เพียงพอ`);
              // Revert status
              setDisbursementRequests(prev => prev.map(r => r.id === requestId ? {...r, status: DisbursementStatus.Pending, approvedBy: undefined, approvalDate: undefined } : r));
              return;
            }

            setDrugs(prev => prev.map(d => d.id === request.drugId ? {...d, quantity: newQuantity} : d));
            addTransaction({
                drugId: request.drugId,
                drugName: request.drugName,
                type: TransactionType.Disbursement,
                quantityChange: -request.quantityDisbursed,
                quantityAfter: newQuantity,
                timestamp: new Date().toISOString(),
                user: user.username,
                reason: `อนุมัติคำขอ #${request.id.slice(0,5)}`
            });
        }
    }
  }, [disbursementRequests, drugs, user.username, addTransaction]);
  
  const handleStockAdjustment = useCallback(async (drugId: string, change: number, reason: string) => {
      // TODO: Convert this to an API call to adjust stock
      const drug = drugs.find(d => d.id === drugId);
      if (!drug) return;

      const newQuantity = drug.quantity + change;
      setDrugs(prev => prev.map(d => d.id === drugId ? {...d, quantity: newQuantity } : d));
      addTransaction({
        drugId,
        drugName: drug.name,
        type: TransactionType.Adjustment,
        quantityChange: change,
        quantityAfter: newQuantity,
        reason: reason,
        timestamp: new Date().toISOString(),
        user: user.username
      });
      setAdjustingDrug(null);
  }, [drugs, user.username, addTransaction]);

  const handleBellClick = () => {
    setNotificationDropdownOpen(prev => !prev);
  };
  
  const handleNotificationClick = () => {
    setActiveView('approvals');
    setNotificationDropdownOpen(false);
  };

  const getHeaderTitle = () => {
    switch (activeView) {
        case 'inventory': return 'จัดการคลังยา';
        case 'import_data': return 'นำเข้าข้อมูลยา';
        case 'disbursement': return 'เบิกจ่ายยา';
        case 'approvals': return 'อนุมัติการเบิกจ่าย';
        case 'audit_trail': return 'ประวัติการทำรายการ';
        case 'users': return 'จัดการผู้ใช้งาน';
        case 'reports': return 'รายงาน';
        case 'settings': return 'ตั้งค่า';
        case 'ai_assistant': return 'ผู้ช่วย AI';
        case 'dashboard':
        default: return 'ภาพรวมระบบ';
    }
  };

  const renderView = () => {
    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }
    
    const adminOnlyView = (viewComponent: React.ReactNode) => {
        if (user.role !== UserRole.Admin) {
            return <DashboardView drugs={drugs} transactions={transactions} />;
        }
        return viewComponent;
    };

    switch (activeView) {
      case 'inventory':
        return adminOnlyView(<InventoryView drugs={drugs} onStartEdit={handleStartEditDrug} onDeleteDrug={deleteDrug} onStartAdjust={handleStartAdjustStock} />);
      case 'import_data':
        return adminOnlyView(<DataImportView onImport={handleBulkImport} />);
      case 'disbursement':
        return <DisbursementView drugs={drugs} history={disbursementRequests} onRequest={handleDisbursementRequest} />;
      case 'approvals':
         return adminOnlyView(<ApprovalView requests={disbursementRequests} onApprove={(id) => handleApprovalAction(id, DisbursementStatus.Approved)} onReject={(id) => handleApprovalAction(id, DisbursementStatus.Rejected)} onStartEdit={handleStartEditDisbursement} />);
      case 'audit_trail':
          return adminOnlyView(<AuditTrailView transactions={transactions} />);
      case 'users':
        return adminOnlyView(<UserManagementView users={users} currentUser={user} onStartEdit={setEditingUser} onDeleteUser={onDeleteUser} />);
      case 'reports':
        return adminOnlyView(<ReportsView requests={disbursementRequests} />);
      case 'settings':
        return adminOnlyView(<SettingsView 
                    drugs={drugs} 
                    onUpdateDrug={updateDrug} 
                    appIcon={appIcon}
                    onUpdateAppIcon={onUpdateAppIcon}
                />);
       case 'ai_assistant':
         return <AIAssistantView drugs={drugs} transactions={transactions} />;
      case 'dashboard':
      default:
        return <DashboardView drugs={drugs} transactions={transactions} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        user={user} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={onLogout} 
        appIcon={appIcon}
        pendingRequestCount={pendingRequests.length}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            {getHeaderTitle()}
          </h1>
          <div className="flex items-center space-x-4">
             {user.role === UserRole.Admin && activeView === 'inventory' && (
                <button
                onClick={() => setIsAddDrugModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                <PlusIcon className="w-5 h-5" />
                เพิ่มยาใหม่
                </button>
             )}
             {user.role === UserRole.Admin && activeView === 'users' && (
                <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                <UserAddIcon className="w-5 h-5" />
                เพิ่มผู้ใช้ใหม่
                </button>
             )}
             <div className="relative" ref={notificationContainerRef}>
                {user.role === UserRole.Admin && (
                    <>
                        <button onClick={handleBellClick} className="relative p-2 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-gray-600">
                            <BellIcon className="w-6 h-6" />
                            {hasUnreadNotifications && (
                                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                            )}
                        </button>
                        {isNotificationDropdownOpen && (
                            <NotificationDropdown 
                                requests={pendingRequests}
                                onNavigate={handleNotificationClick}
                            />
                        )}
                    </>
                )}
             </div>

            <div className="flex items-center">
              <span className="text-right">
                <p className="font-semibold text-gray-700">{user.username}</p>
                <p className="text-xs text-gray-500">{user.role === UserRole.Admin ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</p>
              </span>
               {user.avatar ? (
                    <img
                        className="w-10 h-10 ml-3 rounded-full object-cover bg-gray-200"
                        src={user.avatar}
                        alt="User avatar"
                    />
                ) : (
                    <div className="w-10 h-10 ml-3 rounded-full bg-gray-200 flex items-center justify-center">
                       <UsersIcon className="w-6 h-6 text-gray-500" />
                    </div>
                )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderView()}
        </main>
      </div>
      {isAddDrugModalOpen && user.role === UserRole.Admin && <AddDrugModal onClose={() => setIsAddDrugModalOpen(false)} onAddDrug={addDrug} />}
      {editingDrug && user.role === UserRole.Admin && (
        <EditDrugModal 
            drug={editingDrug}
            onClose={() => setEditingDrug(null)}
            onUpdateDrug={updateDrug}
        />
      )}
      {editingDisbursement && user.role === UserRole.Admin && (
        <EditDisbursementModal
          request={editingDisbursement}
          onClose={() => setEditingDisbursement(null)}
          onUpdate={handleUpdateDisbursementRecord}
        />
      )}
      {isAddUserModalOpen && user.role === UserRole.Admin && (
        <AddUserModal
            onClose={() => setIsAddUserModalOpen(false)}
            onAddUser={onAddUser}
        />
      )}
      {editingUser && user.role === UserRole.Admin && (
        <EditUserModal
            userToEdit={editingUser}
            currentUser={user}
            onClose={() => setEditingUser(null)}
            onUpdateUser={onUpdateUser}
        />
      )}
      {adjustingDrug && user.role === UserRole.Admin && (
        <AdjustStockModal
            drug={adjustingDrug}
            onClose={() => setAdjustingDrug(null)}
            onAdjustStock={handleStockAdjustment}
        />
      )}
    </div>
  );
};

export default Dashboard;
