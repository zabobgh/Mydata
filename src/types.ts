export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  password?: string;
  avatar?: string;
}

export enum StockStatus {
  InStock = 'มีในสต็อก',
  LowStock = 'ใกล้หมด',
  OutOfStock = 'หมดสต็อก',
  ExpiringSoon = 'ใกล้หมดอายุ',
  Expired = 'หมดอายุ',
}

export interface Drug {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string; // YYYY-MM-DD
  location: string;
  notes?: string;
  image?: string; // Base64 encoded image
}

export enum DisbursementStatus {
  Pending = 'รอดำเนินการ',
  Approved = 'อนุมัติแล้ว',
  Rejected = 'ถูกปฏิเสธ',
}

export interface DisbursementRecord {
  id: string;
  drugId: string;
  drugName: string;
  quantityDisbursed: number;
  unit: string;
  requestDate: string; // ISO string
  requestedBy: string; // username
  status: DisbursementStatus;
  approvalDate?: string; // ISO string
  approvedBy?: string; // username of admin
}

export enum TransactionType {
    StockIn = 'รับเข้า',
    Disbursement = 'เบิกจ่าย',
    Adjustment = 'ปรับปรุง',
    Initial = 'สร้างรายการใหม่',
}

export interface Transaction {
    id: string;
    drugId: string;
    drugName: string;
    type: TransactionType;
    quantityChange: number; // Positive for additions, negative for removals
    quantityAfter: number;
    reason?: string; // For adjustments or other notes
    timestamp: string; // ISO string
    user: string; // username of the person performing the action
}
