
import { User, UserRole, Drug, Transaction, TransactionType, DisbursementRecord, DisbursementStatus } from '../types';

// Simple ID generator
export const generateIdForNewItem = () => Math.random().toString(36).substring(2, 11);

export const mockUsers: User[] = [
  { id: 'adminuser', username: 'admin', role: UserRole.Admin, password: 'password123', avatar: 'https://i.pravatar.cc/150?u=admin' },
  { id: 'normaluser', username: 'user', role: UserRole.User, password: 'password123', avatar: 'https://i.pravatar.cc/150?u=user' },
];

const initialDrugs: Omit<Drug, 'id'>[] = [
  {
    name: 'พาราเซตามอล 500mg',
    quantity: 150,
    unit: 'เม็ด',
    expiryDate: '2025-12-31',
    location: 'ตู้ A1, ชั้น 1',
    notes: 'ยาลดไข้อรรถประโยชน์',
    image: 'https://i.imgur.com/8aJ4dJc.jpeg'
  },
  {
    name: 'ไอบูโพรเฟน 400mg',
    quantity: 18, // Low stock
    unit: 'เม็ด',
    expiryDate: '2026-06-30',
    location: 'ตู้ A2, ชั้น 2',
    notes: 'ยาแก้ปวด ลดการอักเสบ'
  },
  {
    name: 'ยาแก้แพ้ (Cetirizine)',
    quantity: 60,
    unit: 'เม็ด',
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString().split('T')[0], // Expiring soon
    location: 'ตู้ B1, ชั้น 1',
  },
  {
    name: 'ยาธาตุน้ำขาว',
    quantity: 30,
    unit: 'ขวด',
    expiryDate: '2025-08-01',
    location: 'ตู้ C1, ชั้น 3',
    image: 'https://i.imgur.com/O6SgP91.jpeg'
  },
  {
    name: 'แอลกอฮอล์ 70%',
    quantity: 0, // Out of stock
    unit: 'ขวด',
    expiryDate: '2026-01-01',
    location: 'ตู้ C2, ชั้น 3'
  },
  {
    name: 'เกลือแร่ ORS',
    quantity: 100,
    unit: 'ซอง',
    expiryDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Expired
    location: 'ตู้ B2, ชั้น 2',
  },
];

export const mockDrugs: Drug[] = initialDrugs.map(d => ({...d, id: generateIdForNewItem()}));

export const mockTransactions: Transaction[] = mockDrugs.map(drug => ({
    id: generateIdForNewItem(),
    drugId: drug.id,
    drugName: drug.name,
    type: TransactionType.Initial,
    quantityChange: drug.quantity,
    quantityAfter: drug.quantity,
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    user: 'system',
    reason: 'ตั้งค่าระบบเริ่มต้น'
}));

export const mockDisbursementRecords: DisbursementRecord[] = [
    {
        id: generateIdForNewItem(),
        drugId: mockDrugs[0].id,
        drugName: mockDrugs[0].name,
        quantityDisbursed: 10,
        unit: 'เม็ด',
        requestDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        requestedBy: 'user',
        status: DisbursementStatus.Approved,
        approvalDate: new Date(Date.now() - 80000000).toISOString(),
        approvedBy: 'admin',
    },
    {
        id: generateIdForNewItem(),
        drugId: mockDrugs[2].id,
        drugName: mockDrugs[2].name,
        quantityDisbursed: 5,
        unit: 'เม็ด',
        requestDate: new Date().toISOString(),
        requestedBy: 'user',
        status: DisbursementStatus.Pending,
    }
];

// Add transaction for the approved request
const approvedRequest = mockDisbursementRecords.find(r => r.status === DisbursementStatus.Approved);
if (approvedRequest) {
    const drug = mockDrugs.find(d => d.id === approvedRequest.drugId);
    if (drug) {
        drug.quantity -= approvedRequest.quantityDisbursed; // Adjust initial quantity
        mockTransactions.unshift({
            id: generateIdForNewItem(),
            drugId: approvedRequest.drugId,
            drugName: approvedRequest.drugName,
            type: TransactionType.Disbursement,
            quantityChange: -approvedRequest.quantityDisbursed,
            quantityAfter: drug.quantity,
            timestamp: approvedRequest.approvalDate!,
            user: 'admin',
            reason: 'อนุมัติคำขอเบิก'
        });
    }
}
