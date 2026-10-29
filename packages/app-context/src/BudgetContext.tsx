'use client';

import React, { createContext, useContext } from 'react';
import { useDemoState } from './useDemoState';

export interface BudgetPlanItem {
  id: string;
  budgetYear: string;
  budgetCode: string;
  departmentCode: string;
  departmentName: string;
  budgetCategory: 'งบบุคลากร (Personnel)' | 'งบดำเนินงาน - ยาและเวชภัณฑ์ (Medical Supplies)' | 'งบลงทุน - ครุภัณฑ์การแพทย์ (Capital Medical Equipment)' | 'งบสาธารณูปโภคและซ่อมบำรุง (Facility & Maintenance)' | 'งบพัฒนาวิชาชีพและวิจัย (Training & R&D)';
  fundSource: 'เงินงบประมาณแผ่นดิน' | 'เงินบำรุงโรงพยาบาล (รายรับค่ารักษา)' | 'เงินกองทุน สปสช. / ประกันสังคม' | 'เงินบริจาคเพื่อการกุศล';
  projectName: string;
  requestedAmount: number;
  approvedAmount: number;
  allocatedAmount: number;
  reservedAmount: number; // รายการกันงบประมาณ (PR รออนุมัติ / ขอใช้งบ)
  commitmentAmount: number; // ภาระผูกพัน (PO อนุมัติแล้ว รอส่งมอบ/รอเบิกจ่าย) - ไม่นับซ้ำกับ Actual
  actualAmount: number; // ค่าใช้จ่ายจริงที่ Finance บันทึกจ่ายแล้ว (ตัดออกจาก Commitment แล้ว)
  purpose: string;
  attachmentName?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ALLOCATED' | 'REJECTED';
  createdAt: string;
}

export interface BudgetAllocationRecord {
  id: string;
  allocNo: string;
  budgetYear: string;
  budgetCode: string;
  departmentName: string;
  budgetCategory: string;
  projectName: string;
  approvedBudget: number;
  allocatedAmount: number;
  q1Amount: number;
  q2Amount: number;
  q3Amount: number;
  q4Amount: number;
  status: 'APPROVED' | 'PENDING_APPROVAL';
  approvedBy: string;
  allocatedDate: string;
}

export interface BudgetAdjustmentRecord {
  id: string;
  adjNo: string;
  date: string;
  adjustmentType: 'โอนงบระหว่างหน่วยงาน' | 'โอนงบระหว่างหมวด' | 'ขอเพิ่มกรอบงบประมาณ' | 'ขอลดกรอบงบประมาณ';
  fromBudgetCode: string;
  fromDepartment: string;
  fromBeforeAmount: number;
  toBudgetCode: string;
  toDepartment: string;
  toBeforeAmount: number;
  transferAmount: number;
  reason: string;
  requestedBy: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export interface BudgetTransactionItem {
  id: string;
  txNo: string;
  date: string;
  refDocNo: string; // PR / PO / PV
  sourceSystem: 'PROCUREMENT (PR)' | 'PROCUREMENT (PO)' | 'FINANCE (AP/PV)' | 'BUDGET';
  budgetCode: string;
  departmentName: string;
  description: string;
  txType: 'RESERVATION' | 'COMMITMENT' | 'ACTUAL' | 'RELEASE';
  amount: number;
  status: 'ACTIVE' | 'CONVERTED_TO_PO' | 'CONVERTED_TO_ACTUAL';
}

export interface BudgetAuditItem {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  docNo: string;
  actor: string;
  detail: string;
}

// Initial Data calibrated so Total Approved = 50,000,000 (50.00 ลบ.), Allocated = 45.00 ลบ., Reserved = 3.00 ลบ., Commitment = 12.00 ลบ., Actual = 18.00 ลบ.
// Available = Approved (50.00) - Reserved (3.00) - Commitment (12.00) - Actual (18.00) = 17.00 ลบ. (or from Allocated 45.00 -> 12.00 ลบ.)
const INITIAL_PLANS: BudgetPlanItem[] = [
  {
    id: 'bp-1',
    budgetYear: '2569',
    budgetCode: 'BG-69-PHARM-01',
    departmentCode: 'PHARM',
    departmentName: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    budgetCategory: 'งบดำเนินงาน - ยาและเวชภัณฑ์ (Medical Supplies)',
    fundSource: 'เงินบำรุงโรงพยาบาล (รายรับค่ารักษา)',
    projectName: 'โครงการจัดหายาจำเป็นและเวชภัณฑ์ปลอดเชื้อตามเกณฑ์ FEFO',
    requestedAmount: 20000000,
    approvedAmount: 18500000,
    allocatedAmount: 17000000,
    reservedAmount: 1200000,
    commitmentAmount: 4800000,
    actualAmount: 7500000,
    purpose: 'สำรองยาชีวิตและสารน้ำสำหรับผู้ป่วยในและฉุกเฉินตลอดปีงบประมาณ 2569',
    attachmentName: 'แผนการจัดซื้อยาประจำปี_2569.pdf',
    status: 'ALLOCATED',
    createdAt: '2026-09-15',
  },
  {
    id: 'bp-2',
    budgetYear: '2569',
    budgetCode: 'BG-69-OR-01',
    departmentCode: 'OR',
    departmentName: 'กลุ่มงานศัลยกรรมและห้องผ่าตัด (OR & ICU)',
    budgetCategory: 'งบลงทุน - ครุภัณฑ์การแพทย์ (Capital Medical Equipment)',
    fundSource: 'เงินงบประมาณแผ่นดิน',
    projectName: 'โครงการจัดซื้อเครื่องช่วยหายใจวิกฤตและชุดผ่าตัดส่องกล้อง',
    requestedAmount: 13500000,
    approvedAmount: 12500000,
    allocatedAmount: 11500000,
    reservedAmount: 800000,
    commitmentAmount: 3500000,
    actualAmount: 4200000,
    purpose: 'ทดแทนเครื่องช่วยหายใจเดิมที่ครบอายุการใช้งานและเพิ่มศักยภาพห้องผ่าตัด',
    attachmentName: 'TOR_ครุภัณฑ์การแพทย์_ICU_2569.pdf',
    status: 'ALLOCATED',
    createdAt: '2026-09-18',
  },
  {
    id: 'bp-3',
    budgetYear: '2569',
    budgetCode: 'BG-69-LAB-01',
    departmentCode: 'LAB',
    departmentName: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)',
    budgetCategory: 'งบดำเนินงาน - ยาและเวชภัณฑ์ (Medical Supplies)',
    fundSource: 'เงินกองทุน สปสช. / ประกันสังคม',
    projectName: 'โครงการจัดหาน้ำยาตรวจวิเคราะห์โลหิตวิทยาและเคมีคลินิก',
    requestedAmount: 8500000,
    approvedAmount: 8000000,
    allocatedAmount: 7000000,
    reservedAmount: 450000,
    commitmentAmount: 1900000,
    actualAmount: 2800000,
    purpose: 'รองรับการตรวจทางห้องปฏิบัติการผู้ป่วยนอกและผู้ป่วยใน 24 ชั่วโมง',
    attachmentName: 'ประมาณการน้ำยาชันสูตร_2569.xlsx',
    status: 'ALLOCATED',
    createdAt: '2026-09-20',
  },
  {
    id: 'bp-4',
    budgetYear: '2569',
    budgetCode: 'BG-69-HR-01',
    departmentCode: 'HR',
    departmentName: 'ฝ่ายทรัพยากรบุคคล (Human Resource)',
    budgetCategory: 'งบบุคลากร (Personnel)',
    fundSource: 'เงินบำรุงโรงพยาบาล (รายรับค่ารักษา)',
    projectName: 'โครงการค่าตอบแทนเวรผลัดบ่าย-ดึก แพทย์เวร และพัฒนาวิชาชีพ HA',
    requestedAmount: 7500000,
    approvedAmount: 7000000,
    allocatedAmount: 6000000,
    reservedAmount: 350000,
    commitmentAmount: 1100000,
    actualAmount: 2400000,
    purpose: 'เบิกจ่ายค่าเวรปฏิบัติงาน 24 ชม. และส่งบุคลากรฝึกอบรมเก็บหน่วยกิต CME/CNEU',
    attachmentName: 'กรอบอัตรากำลังและค่าเวร_2569.pdf',
    status: 'ALLOCATED',
    createdAt: '2026-09-22',
  },
  {
    id: 'bp-5',
    budgetYear: '2569',
    budgetCode: 'BG-69-ADM-01',
    departmentCode: 'ADM',
    departmentName: 'ฝ่ายบริหารและซ่อมบำรุงอาคาร (Facility)',
    budgetCategory: 'งบสาธารณูปโภคและซ่อมบำรุง (Facility & Maintenance)',
    fundSource: 'เงินบำรุงโรงพยาบาล (รายรับค่ารักษา)',
    projectName: 'โครงการบำรุงรักษาระบบก๊าซทางการแพทย์และระบบปรับอากาศปลอดเชื้อ',
    requestedAmount: 4500000,
    approvedAmount: 4000000,
    allocatedAmount: 3500000,
    reservedAmount: 200000,
    commitmentAmount: 700000,
    actualAmount: 1100000,
    purpose: 'สอบเทียบและบำรุงรักษาระบบท่อส่งออกซิเจนและห้องความดันลบ',
    attachmentName: 'แผนซ่อมบำรุงเชิงป้องกัน_2569.pdf',
    status: 'PENDING_APPROVAL',
    createdAt: '2026-10-05',
  },
];

const INITIAL_ALLOCATIONS: BudgetAllocationRecord[] = [
  {
    id: 'al-1',
    allocNo: 'ALC-2569-001',
    budgetYear: '2569',
    budgetCode: 'BG-69-PHARM-01',
    departmentName: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    budgetCategory: 'งบดำเนินงาน - ยาและเวชภัณฑ์ (Medical Supplies)',
    projectName: 'โครงการจัดหายาจำเป็นและเวชภัณฑ์ปลอดเชื้อตามเกณฑ์ FEFO',
    approvedBudget: 18500000,
    allocatedAmount: 17000000,
    q1Amount: 4500000,
    q2Amount: 4500000,
    q3Amount: 4000000,
    q4Amount: 4000000,
    status: 'APPROVED',
    approvedBy: 'นพ. เกียรติศักดิ์ วงศ์เวชช์ (ผอ.รพ.)',
    allocatedDate: '2026-10-01',
  },
  {
    id: 'al-2',
    allocNo: 'ALC-2569-002',
    budgetYear: '2569',
    budgetCode: 'BG-69-OR-01',
    departmentName: 'กลุ่มงานศัลยกรรมและห้องผ่าตัด (OR & ICU)',
    budgetCategory: 'งบลงทุน - ครุภัณฑ์การแพทย์ (Capital Medical Equipment)',
    projectName: 'โครงการจัดซื้อเครื่องช่วยหายใจวิกฤตและชุดผ่าตัดส่องกล้อง',
    approvedBudget: 12500000,
    allocatedAmount: 11500000,
    q1Amount: 4000000,
    q2Amount: 3500000,
    q3Amount: 2000000,
    q4Amount: 2000000,
    status: 'APPROVED',
    approvedBy: 'นพ. เกียรติศักดิ์ วงศ์เวชช์ (ผอ.รพ.)',
    allocatedDate: '2026-10-01',
  },
  {
    id: 'al-3',
    allocNo: 'ALC-2569-003',
    budgetYear: '2569',
    budgetCode: 'BG-69-LAB-01',
    departmentName: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)',
    budgetCategory: 'งบดำเนินงาน - ยาและเวชภัณฑ์ (Medical Supplies)',
    projectName: 'โครงการจัดหาน้ำยาตรวจวิเคราะห์โลหิตวิทยาและเคมีคลินิก',
    approvedBudget: 8000000,
    allocatedAmount: 7000000,
    q1Amount: 1750000,
    q2Amount: 1750000,
    q3Amount: 1750000,
    q4Amount: 1750000,
    status: 'APPROVED',
    approvedBy: 'นพ. เกียรติศักดิ์ วงศ์เวชช์ (ผอ.รพ.)',
    allocatedDate: '2026-10-02',
  },
  {
    id: 'al-4',
    allocNo: 'ALC-2569-004',
    budgetYear: '2569',
    budgetCode: 'BG-69-HR-01',
    departmentName: 'ฝ่ายทรัพยากรบุคคล (Human Resource)',
    budgetCategory: 'งบบุคลากร (Personnel)',
    projectName: 'โครงการค่าตอบแทนเวรผลัดบ่าย-ดึก แพทย์เวร และพัฒนาวิชาชีพ HA',
    approvedBudget: 7000000,
    allocatedAmount: 6000000,
    q1Amount: 1500000,
    q2Amount: 1500000,
    q3Amount: 1500000,
    q4Amount: 1500000,
    status: 'APPROVED',
    approvedBy: 'นพ. เกียรติศักดิ์ วงศ์เวชช์ (ผอ.รพ.)',
    allocatedDate: '2026-10-02',
  },
  {
    id: 'al-5',
    allocNo: 'ALC-2569-005',
    budgetYear: '2569',
    budgetCode: 'BG-69-ADM-01',
    departmentName: 'ฝ่ายบริหารและซ่อมบำรุงอาคาร (Facility)',
    budgetCategory: 'งบสาธารณูปโภคและซ่อมบำรุง (Facility & Maintenance)',
    projectName: 'โครงการบำรุงรักษาระบบก๊าซทางการแพทย์และระบบปรับอากาศปลอดเชื้อ',
    approvedBudget: 4000000,
    allocatedAmount: 3500000,
    q1Amount: 1000000,
    q2Amount: 1000000,
    q3Amount: 750000,
    q4Amount: 750000,
    status: 'APPROVED',
    approvedBy: 'นพ. เกียรติศักดิ์ วงศ์เวชช์ (ผอ.รพ.)',
    allocatedDate: '2026-10-03',
  },
];

const INITIAL_ADJUSTMENTS: BudgetAdjustmentRecord[] = [
  {
    id: 'adj-1',
    adjNo: 'BADJ-2569-004',
    date: '2026-10-27',
    adjustmentType: 'โอนงบระหว่างหน่วยงาน',
    fromBudgetCode: 'BG-69-ADM-01',
    fromDepartment: 'ฝ่ายบริหารและซ่อมบำรุงอาคาร',
    fromBeforeAmount: 3500000,
    toBudgetCode: 'BG-69-PHARM-01',
    toDepartment: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    toBeforeAmount: 17000000,
    transferAmount: 500000,
    reason: 'โอนเสริมวงเงินจัดซื้อวัคซีนไข้หวัดใหญ่และยาต้านไวรัสสำหรับผู้ป่วยกลุ่มเสี่ยง',
    requestedBy: 'ภก. ธนากร เจริญสุข',
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'adj-2',
    adjNo: 'BADJ-2569-003',
    date: '2026-10-20',
    adjustmentType: 'โอนงบระหว่างหมวด',
    fromBudgetCode: 'BG-69-OR-01',
    fromDepartment: 'กลุ่มงานศัลยกรรมและห้องผ่าตัด',
    fromBeforeAmount: 11800000,
    toBudgetCode: 'BG-69-LAB-01',
    toDepartment: 'แผนกพยาธิวิทยาและชันสูตร',
    toBeforeAmount: 6700000,
    transferAmount: 300000,
    reason: 'เกลี่ยงบประมาณรองรับการตรวจวิเคราะห์ทางห้องปฏิบัติการเคสผ่าตัดด่วน',
    requestedBy: 'พญ. พิมพ์ชนก อัศวเดช',
    status: 'APPROVED',
  },
  {
    id: 'adj-3',
    adjNo: 'BADJ-2569-005',
    date: '2026-10-28',
    adjustmentType: 'ขอเพิ่มกรอบงบประมาณ',
    fromBudgetCode: 'CENTRAL-RES-69',
    fromDepartment: 'งบกลางสำรองฉุกเฉินโรงพยาบาล',
    fromBeforeAmount: 5000000,
    toBudgetCode: 'BG-69-OR-01',
    toDepartment: 'กลุ่มงานศัลยกรรมและห้องผ่าตัด (OR & ICU)',
    toBeforeAmount: 11500000,
    transferAmount: 800000,
    reason: 'ขออนุมัติขยายกรอบวงเงินจัดซื้อชุดเครื่องมือช่วยชีวิตขั้นสูง ICU เพิ่มเติม 1 ชุด',
    requestedBy: 'พว. ศิริพร วงศ์สวัสดิ์',
    status: 'PENDING_APPROVAL',
  },
];

const INITIAL_TRANSACTIONS: BudgetTransactionItem[] = [
  {
    id: 'btx-1',
    txNo: 'BTX-202610-091',
    date: '2026-10-28',
    refDocNo: 'PR-202610-018',
    sourceSystem: 'PROCUREMENT (PR)',
    budgetCode: 'BG-69-PHARM-01',
    departmentName: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    description: 'กันวงเงินใบขอซื้อ (PR) ยาปฏิชีวนะ Meropenem 1g และสารน้ำ NSS',
    txType: 'RESERVATION',
    amount: 450000,
    status: 'ACTIVE',
  },
  {
    id: 'btx-2',
    txNo: 'BTX-202610-090',
    date: '2026-10-27',
    refDocNo: 'PO-202610-032',
    sourceSystem: 'PROCUREMENT (PO)',
    budgetCode: 'BG-69-OR-01',
    departmentName: 'กลุ่มงานศัลยกรรมและห้องผ่าตัด (OR & ICU)',
    description: 'ผูกพันงบประมาณตามใบสั่งซื้อ (PO) เครื่องติดตามสัญญาณชีพข้างเตียง ICU',
    txType: 'COMMITMENT',
    amount: 1200000,
    status: 'ACTIVE',
  },
  {
    id: 'btx-3',
    txNo: 'BTX-202610-089',
    date: '2026-10-26',
    refDocNo: 'PV-202610-089',
    sourceSystem: 'FINANCE (AP/PV)',
    budgetCode: 'BG-69-PHARM-01',
    departmentName: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    description: 'บันทึกค่าใช้จ่ายจริง (Actual) จากใบสำคัญจ่ายค่ายา บจก. ซิลลิค ฟาร์มา (ตัดยอด Commitment แล้ว)',
    txType: 'ACTUAL',
    amount: 850000,
    status: 'CONVERTED_TO_ACTUAL',
  },
  {
    id: 'btx-4',
    txNo: 'BTX-202610-088',
    date: '2026-10-25',
    refDocNo: 'PR-202610-015',
    sourceSystem: 'PROCUREMENT (PR)',
    budgetCode: 'BG-69-LAB-01',
    departmentName: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)',
    description: 'กันวงเงินใบขอซื้อน้ำยาตรวจวิเคราะห์ CBC และแผ่นตรวจกรุ๊ปเลือด',
    txType: 'RESERVATION',
    amount: 280000,
    status: 'ACTIVE',
  },
  {
    id: 'btx-5',
    txNo: 'BTX-202610-087',
    date: '2026-10-25',
    refDocNo: 'PV-202610-084',
    sourceSystem: 'FINANCE (AP/PV)',
    budgetCode: 'BG-69-HR-01',
    departmentName: 'ฝ่ายทรัพยากรบุคคล (Human Resource)',
    description: 'เบิกจ่ายจริงค่าตอบแทนเวรผลัดบ่าย-ดึก และ OT พยาบาลวิชาชีพประจำเดือน',
    txType: 'ACTUAL',
    amount: 640000,
    status: 'CONVERTED_TO_ACTUAL',
  },
];

const INITIAL_AUDITS: BudgetAuditItem[] = [
  {
    id: 'baud-1',
    timestamp: '2026-10-28 15:40',
    module: 'BUDGET_CONTROL',
    action: 'CONVERT_PO_TO_ACTUAL',
    docNo: 'PV-202610-089',
    actor: 'System Finance Sync',
    detail: 'รับยอดจ่ายจริง ฿850,000 จากระบบ Finance และตัดลดยอด Commitment ของ PO-202610-021 อัตโนมัติเพื่อไม่ให้นับซ้ำ',
  },
  {
    id: 'baud-2',
    timestamp: '2026-10-28 11:20',
    module: 'BUDGET_ADJUSTMENT',
    action: 'REQUEST_BUDGET_INCREASE',
    docNo: 'BADJ-2569-005',
    actor: 'พว. ศิริพร วงศ์สวัสดิ์',
    detail: 'ยื่นคำขอขยายกรอบวงเงิน BG-69-OR-01 จำนวน ฿800,000 จากงบกลางสำรองฉุกเฉิน',
  },
  {
    id: 'baud-3',
    timestamp: '2026-10-27 14:15',
    module: 'BUDGET_CONTROL',
    action: 'RESERVE_PR_BUDGET',
    docNo: 'PR-202610-018',
    actor: 'ภก. ธนากร เจริญสุข',
    detail: 'ตรวจสอบวงเงินคงเหลือผ่านเกณฑ์ และกันงบประมาณ (Reserved) ฿450,000 สำหรับใบขอซื้อยา',
  },
];

interface BudgetContextType {
  plans: BudgetPlanItem[];
  addBudgetPlan: (plan: Omit<BudgetPlanItem, 'id'>) => void;
  updatePlanStatus: (id: string, status: BudgetPlanItem['status']) => void;
  allocations: BudgetAllocationRecord[];
  addAllocation: (alloc: Omit<BudgetAllocationRecord, 'id'>) => { ok: boolean; error?: string };
  adjustments: BudgetAdjustmentRecord[];
  addAdjustment: (adj: Omit<BudgetAdjustmentRecord, 'id'>) => void;
  approveAdjustment: (id: string, approved: boolean) => void;
  transactions: BudgetTransactionItem[];
  convertCommitmentToActual: (budgetCode: string, amount: number, refDocNo: string) => void;
  reserveBudget: (budgetCode: string, amount: number, refDocNo: string, description: string) => void;
  commitBudget: (budgetCode: string, amount: number, refDocNo: string, description: string) => void;
  releaseBudget: (budgetCode: string, amount: number, refDocNo: string, description: string) => void;
  getAllocationBudgetInfo: (allocNoOrBudgetCode: string) => {
    allocation?: BudgetAllocationRecord;
    plan?: BudgetPlanItem;
    allocatedAmount: number;
    remainingBudget: number;
    reservedAmount: number;
    commitmentAmount: number;
    actualAmount: number;
  };
  audits: BudgetAuditItem[];
  logBudgetAudit: (module: string, action: string, docNo: string, detail: string) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useDemoState<BudgetPlanItem[]>('budget.plans', INITIAL_PLANS);
  const [allocations, setAllocations] = useDemoState<BudgetAllocationRecord[]>('budget.allocations', INITIAL_ALLOCATIONS);
  const [adjustments, setAdjustments] = useDemoState<BudgetAdjustmentRecord[]>('budget.adjustments', INITIAL_ADJUSTMENTS);
  const [transactions, setTransactions] = useDemoState<BudgetTransactionItem[]>('budget.transactions', INITIAL_TRANSACTIONS);
  const [audits, setAudits] = useDemoState<BudgetAuditItem[]>('budget.audits', INITIAL_AUDITS);

  const logBudgetAudit = (module: string, action: string, docNo: string, detail: string) => {
    setAudits((prev) => [
      {
        id: `baud-${Date.now()}`,
        timestamp: new Date().toLocaleString('sv-SE').slice(0, 16),
        module,
        action,
        docNo,
        actor: 'วิชัย เกียรติบูรพา (Budget Controller)',
        detail,
      },
      ...prev,
    ]);
  };

  const addBudgetPlan = (plan: Omit<BudgetPlanItem, 'id'>) => {
    const newPlan: BudgetPlanItem = { ...plan, id: `bp-${Date.now()}` };
    setPlans((prev) => [newPlan, ...prev]);
    logBudgetAudit(
      'BUDGET_PLANNING',
      'SUBMIT_BUDGET_PROPOSAL',
      plan.budgetCode,
      `สร้างคำของบประมาณประจำปี ${plan.budgetYear}: ${plan.projectName} วงเงินขอ ฿${plan.requestedAmount.toLocaleString()}`
    );
  };

  const updatePlanStatus = (id: string, status: BudgetPlanItem['status']) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          logBudgetAudit(
            'BUDGET_PLANNING',
            `PLAN_${status}`,
            p.budgetCode,
            `เปลี่ยนสถานะแผนงบประมาณ ${p.budgetCode} เป็น ${status}`
          );
          return { ...p, status };
        }
        return p;
      })
    );
  };

  // Rule enforcement: ยอดจัดสรรรวมต้องไม่เกินวงเงินที่ได้รับอนุมัติ
  const addAllocation = (alloc: Omit<BudgetAllocationRecord, 'id'>) => {
    if (alloc.allocatedAmount > alloc.approvedBudget) {
      return {
        ok: false,
        error: `ยอดจัดสรร (฿${alloc.allocatedAmount.toLocaleString()}) เกินวงเงินที่ได้รับอนุมัติ (฿${alloc.approvedBudget.toLocaleString()}) กรุณาทำเรื่องขอเพิ่มกรอบงบประมาณก่อน`,
      };
    }
    const newAlloc: BudgetAllocationRecord = { ...alloc, id: `al-${Date.now()}` };
    setAllocations((prev) => [newAlloc, ...prev]);
    setPlans((prev) =>
      prev.map((p) =>
        p.budgetCode === alloc.budgetCode
          ? { ...p, allocatedAmount: alloc.allocatedAmount, status: 'ALLOCATED' }
          : p
      )
    );
    logBudgetAudit(
      'BUDGET_ALLOCATION',
      'APPROVE_ALLOCATION',
      alloc.allocNo,
      `จัดสรรงบประมาณ ${alloc.budgetCode} ให้ ${alloc.departmentName} จำนวน ฿${alloc.allocatedAmount.toLocaleString()}`
    );
    return { ok: true };
  };

  const addAdjustment = (adj: Omit<BudgetAdjustmentRecord, 'id'>) => {
    const newAdj: BudgetAdjustmentRecord = { ...adj, id: `adj-${Date.now()}` };
    setAdjustments((prev) => [newAdj, ...prev]);
    logBudgetAudit(
      'BUDGET_ADJUSTMENT',
      'CREATE_ADJUSTMENT_REQ',
      adj.adjNo,
      `ส่งคำขอ${adj.adjustmentType} จำนวน ฿${adj.transferAmount.toLocaleString()} (${adj.fromBudgetCode} → ${adj.toBudgetCode})`
    );
  };

  const approveAdjustment = (id: string, approved: boolean) => {
    const target = adjustments.find((a) => a.id === id);
    if (!target) return;

    setAdjustments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: approved ? 'APPROVED' : 'REJECTED' } : a
      )
    );

    if (approved) {
      setPlans((prev) =>
        prev.map((p) => {
          if (p.budgetCode === target.fromBudgetCode) {
            return {
              ...p,
              approvedAmount: Math.max(0, p.approvedAmount - target.transferAmount),
              allocatedAmount: Math.max(0, p.allocatedAmount - target.transferAmount),
            };
          }
          if (p.budgetCode === target.toBudgetCode) {
            return {
              ...p,
              approvedAmount: p.approvedAmount + target.transferAmount,
              allocatedAmount: p.allocatedAmount + target.transferAmount,
            };
          }
          return p;
        })
      );
      logBudgetAudit(
        'BUDGET_ADJUSTMENT',
        'APPROVE_ADJUSTMENT',
        target.adjNo,
        `อนุมัติ${target.adjustmentType} ${target.adjNo} วงเงิน ฿${target.transferAmount.toLocaleString()} เรียบร้อยแล้ว`
      );
    } else {
      logBudgetAudit(
        'BUDGET_ADJUSTMENT',
        'REJECT_ADJUSTMENT',
        target.adjNo,
        `ไม่อนุมัติคำขอเปลี่ยนแปลงงบประมาณ ${target.adjNo}`
      );
    }
  };

  // Deduplicate Commitment when converting to Actual Expense
  const convertCommitmentToActual = (budgetCode: string, amount: number, refDocNo: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.budgetCode === budgetCode) {
          return {
            ...p,
            commitmentAmount: Math.max(0, p.commitmentAmount - amount),
            actualAmount: p.actualAmount + amount,
          };
        }
        return p;
      })
    );
    setTransactions((prev) => [
      {
        id: `btx-${Date.now()}`,
        txNo: `BTX-202610-${prev.length + 92}`,
        date: '2026-10-28',
        refDocNo,
        sourceSystem: 'FINANCE (AP/PV)',
        budgetCode,
        departmentName: plans.find((x) => x.budgetCode === budgetCode)?.departmentName || 'หน่วยงาน รพ.',
        description: `โอนยอดภาระผูกพัน (Commitment) ไปเป็นค่าใช้จ่ายจริง (Actual) ตามเอกสาร ${refDocNo} (ตัดยอดผูกพันเดิมออกไม่ให้นับซ้ำ)`,
        txType: 'ACTUAL',
        amount,
        status: 'CONVERTED_TO_ACTUAL',
      },
      ...prev,
    ]);
    logBudgetAudit(
      'BUDGET_CONTROL',
      'CONVERT_COMMITMENT_TO_ACTUAL',
      refDocNo,
      `ตัดยอด Commitment ฿${amount.toLocaleString()} และบันทึกเป็น Actual Expense ของรหัสงบ ${budgetCode} สำเร็จ`
    );
  };

  // Reserve budget when PR is created/approved
  const reserveBudget = (budgetCode: string, amount: number, refDocNo: string, description: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.budgetCode === budgetCode) {
          return {
            ...p,
            reservedAmount: p.reservedAmount + amount,
          };
        }
        return p;
      })
    );
    setTransactions((prev) => [
      {
        id: `btx-${Date.now()}`,
        txNo: `BTX-202610-${prev.length + 95}`,
        date: new Date().toISOString().slice(0, 10),
        refDocNo,
        sourceSystem: 'PROCUREMENT (PR)',
        budgetCode,
        departmentName: plans.find((x) => x.budgetCode === budgetCode)?.departmentName || 'หน่วยงาน รพ.',
        description,
        txType: 'RESERVATION',
        amount,
        status: 'ACTIVE',
      },
      ...prev,
    ]);
    logBudgetAudit(
      'BUDGET_CONTROL',
      'RESERVE_BUDGET',
      refDocNo,
      `กันงบประมาณ (Reserved) ฿${amount.toLocaleString()} สำหรับ ${refDocNo} (${budgetCode})`
    );
  };

  // Commit budget when PO is created/approved (moves from reserved to commitment)
  const commitBudget = (budgetCode: string, amount: number, refDocNo: string, description: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.budgetCode === budgetCode) {
          return {
            ...p,
            reservedAmount: Math.max(0, p.reservedAmount - amount),
            commitmentAmount: p.commitmentAmount + amount,
          };
        }
        return p;
      })
    );
    setTransactions((prev) => [
      {
        id: `btx-${Date.now()}`,
        txNo: `BTX-202610-${prev.length + 96}`,
        date: new Date().toISOString().slice(0, 10),
        refDocNo,
        sourceSystem: 'PROCUREMENT (PO)',
        budgetCode,
        departmentName: plans.find((x) => x.budgetCode === budgetCode)?.departmentName || 'หน่วยงาน รพ.',
        description,
        txType: 'COMMITMENT',
        amount,
        status: 'ACTIVE',
      },
      ...prev,
    ]);
    logBudgetAudit(
      'BUDGET_CONTROL',
      'COMMIT_BUDGET',
      refDocNo,
      `บันทึกภาระผูกพัน (Commitment) ฿${amount.toLocaleString()} สำหรับใบสั่งซื้อ ${refDocNo} (${budgetCode})`
    );
  };

  // Release budget if PR/PO is cancelled or reduced
  const releaseBudget = (budgetCode: string, amount: number, refDocNo: string, description: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.budgetCode === budgetCode) {
          return {
            ...p,
            reservedAmount: Math.max(0, p.reservedAmount - amount),
          };
        }
        return p;
      })
    );
    setTransactions((prev) => [
      {
        id: `btx-${Date.now()}`,
        txNo: `BTX-202610-${prev.length + 97}`,
        date: new Date().toISOString().slice(0, 10),
        refDocNo,
        sourceSystem: 'PROCUREMENT (PR)',
        budgetCode,
        departmentName: plans.find((x) => x.budgetCode === budgetCode)?.departmentName || 'หน่วยงาน รพ.',
        description,
        txType: 'RELEASE',
        amount,
        status: 'ACTIVE',
      },
      ...prev,
    ]);
    logBudgetAudit(
      'BUDGET_CONTROL',
      'RELEASE_BUDGET',
      refDocNo,
      `คืนวงเงินกันงบประมาณ ฿${amount.toLocaleString()} สำหรับ ${refDocNo} (${budgetCode})`
    );
  };

  // Query allocation details with available remaining budget
  const getAllocationBudgetInfo = (allocNoOrBudgetCode: string) => {
    const alloc = allocations.find(
      (a) => a.allocNo === allocNoOrBudgetCode || a.budgetCode === allocNoOrBudgetCode
    );
    const plan = plans.find(
      (p) => p.budgetCode === alloc?.budgetCode || p.budgetCode === allocNoOrBudgetCode
    );

    const allocatedAmount = alloc ? alloc.allocatedAmount : plan ? plan.allocatedAmount : 0;
    const reservedAmount = plan ? plan.reservedAmount : 0;
    const commitmentAmount = plan ? plan.commitmentAmount : 0;
    const actualAmount = plan ? plan.actualAmount : 0;

    const remainingBudget = Math.max(
      0,
      allocatedAmount - reservedAmount - commitmentAmount - actualAmount
    );

    return {
      allocation: alloc,
      plan,
      allocatedAmount,
      remainingBudget,
      reservedAmount,
      commitmentAmount,
      actualAmount,
    };
  };

  return (
    <BudgetContext.Provider
      value={{
        plans,
        addBudgetPlan,
        updatePlanStatus,
        allocations,
        addAllocation,
        adjustments,
        addAdjustment,
        approveAdjustment,
        transactions,
        convertCommitmentToActual,
        reserveBudget,
        commitBudget,
        releaseBudget,
        getAllocationBudgetInfo,
        audits,
        logBudgetAudit,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within a BudgetProvider');
  return ctx;
}

