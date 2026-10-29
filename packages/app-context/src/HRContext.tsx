'use client';

import React, { createContext, useContext } from 'react';
import { useDemoState } from './useDemoState';

export interface HREmployee {
  id: string;
  empCode: string;
  title: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: 'ชาย' | 'หญิง';
  birthDate: string;
  idCard: string;
  phone: string;
  email: string;
  departmentCode: string;
  departmentName: string;
  position: string;
  staffCategory: 'แพทย์ (Physician)' | 'พยาบาล (Nurse)' | 'เภสัชกร (Pharmacist)' | 'สหวิชาชีพ (Allied Health)' | 'สายสนับสนุน (Support)';
  employmentType: 'พนักงานประจำ' | 'ข้าราชการ/พกส.' | 'สัญญาจ้าง' | 'Part-time / แพทย์เวร';
  hireDate: string;
  probationEndDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'RESIGNED';
  baseSalary: number;
  positionAllowance: number;
  licenseAllowance: number;
  bankName: string;
  bankAccount: string;
  taxId: string;
  socialSecurityStatus: string;
  licenseNo?: string;
  licenseType?: string;
  licenseExpiry?: string;
  education: string;
  bloodGroup: string;
  emergencyContact: string;
}

export interface HRRecruitment {
  id: string;
  reqNo: string;
  positionTitle: string;
  departmentName: string;
  staffCategory: string;
  employmentType: string;
  headcountRequested: number;
  headcountFilled: number;
  urgency: 'URGENT' | 'NORMAL';
  status: 'OPEN' | 'INTERVIEWING' | 'OFFERED' | 'CLOSED';
  postedDate: string;
  applicantsCount: number;
  salaryRange: string;
  qualification: string;
  applicants: {
    id: string;
    name: string;
    applyDate: string;
    phone: string;
    education: string;
    licenseNo?: string;
    stage: 'SCREENING' | 'INTERVIEW' | 'PASSED' | 'HIRED' | 'REJECTED';
    interviewDate?: string;
    interviewer?: string;
    score?: number;
  }[];
}

export interface HRAttendance {
  id: string;
  date: string;
  empCode: string;
  empName: string;
  departmentName: string;
  position: string;
  shiftType: 'เวรเช้า (M)' | 'เวรบ่าย (A)' | 'เวรดึก (N)' | 'Office (08:00-17:00)';
  checkIn: string;
  checkOut: string;
  status: 'NORMAL' | 'LATE' | 'ABSENT' | 'ON_LEAVE' | 'OT';
  lateMinutes: number;
  otHours: number;
  device: string;
}

export interface HRShiftAssignment {
  id: string;
  empCode: string;
  empName: string;
  position: string;
  departmentName: string;
  roleBadge: string;
  schedule: Record<number, 'M' | 'A' | 'N' | 'OFF' | 'OT' | 'L'>; // Day 1-7 of current week
}

export interface HRShiftSwap {
  id: string;
  swapNo: string;
  requestDate: string;
  requesterCode: string;
  requesterName: string;
  departmentName: string;
  fromDate: string;
  fromShift: 'เวรเช้า (M)' | 'เวรบ่าย (A)' | 'เวรดึก (N)';
  targetCode: string;
  targetName: string;
  toDate: string;
  toShift: 'เวรเช้า (M)' | 'เวรบ่าย (A)' | 'เวรดึก (N)';
  reason: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export interface HROTRequest {
  id: string;
  otNo: string;
  date: string;
  empCode: string;
  empName: string;
  departmentName: string;
  position: string;
  otType: 'OT วันทำงานปกติ (1.5x)' | 'OT วันหยุดประจำสัปดาห์ (2.0x)' | 'OT วันหยุดนักขัตฤกษ์ (3.0x)' | 'เวรเสริมวิชาชีพ (On-Call)';
  startTime: string;
  endTime: string;
  hours: number;
  ratePerHour: number;
  totalAmount: number;
  reason: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export interface HRLeaveRequest {
  id: string;
  leaveNo: string;
  empCode: string;
  empName: string;
  departmentName: string;
  position: string;
  leaveType: 'ลาป่วย (Sick Leave)' | 'ลากิจ (Personal Leave)' | 'ลาพักร้อน (Annual Leave)' | 'ลาคลอด (Maternity Leave)' | 'ลาฝึกอบรม/ประชุมวิชาการ';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  substitutePerson: string;
  medicalCert: boolean;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface HRPayrollRecord {
  id: string;
  period: string;
  empCode: string;
  empName: string;
  departmentName: string;
  position: string;
  baseSalary: number;
  positionAllowance: number;
  licenseAllowance: number;
  shiftAllowance: number;
  otPay: number;
  taxDeduction: number;
  ssoDeduction: number;
  providentFund: number;
  otherDeduction: number;
  netSalary: number;
  paymentStatus: 'PAID' | 'PENDING' | 'PROCESSING';
  paymentDate: string;
}

export interface HRLicenseCredential {
  id: string;
  empCode: string;
  empName: string;
  departmentName: string;
  position: string;
  licenseType: 'ใบประกอบวิชาชีพเวชกรรม (แพทยสภา)' | 'ใบประกอบวิชาชีพการพยาบาลและผดุงครรภ์' | 'ใบประกอบวิชาชีพเภสัชกรรม' | 'ใบประกอบวิชาชีพเทคนิคการแพทย์' | 'ใบประกอบวิชาชีพกายภาพบำบัด' | 'ใบรับรอง ACLS / BLS';
  licenseNo: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  cmeCreditsRequired: number;
  cmeCreditsEarned: number;
  status: 'ACTIVE' | 'NEAR_EXPIRY' | 'EXPIRED' | 'RENEWING';
}

export interface HRTrainingCourse {
  id: string;
  courseCode: string;
  title: string;
  category: 'บังคับตามมาตรฐาน HA / JCI' | 'พัฒนาทักษะทางคลินิก (Clinical)' | 'ช่วยชีวิตขั้นสูง (BLS / ACLS)' | 'บริหารจัดการและผู้นำ' | 'ความปลอดภัยและอาชีวอนามัย (IC / ENV)';
  instructor: string;
  date: string;
  hours: number;
  cmePoints: number;
  seatsTotal: number;
  seatsEnrolled: number;
  location: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

export interface HRPerformanceReview {
  id: string;
  empCode: string;
  empName: string;
  departmentName: string;
  position: string;
  reviewType: 'ประเมินประจำปี (Annual KPI)' | 'ประเมินครึ่งปี (Mid-Year)' | 'ประเมินผ่านทดลองงาน (Probation 119 วัน)';
  period: string;
  kpiScore: number; // 0-100
  coreCompetencyScore: number; // 0-100
  clinicalCompetencyScore: number; // 0-100
  totalScore: number;
  grade: 'A+ (ดีเยี่ยม)' | 'A (ดีมาก)' | 'B+ (ดี)' | 'B (ตามเกณฑ์)' | 'C (ต้องพัฒนา)';
  evaluator: string;
  status: 'COMPLETED' | 'PENDING_REVIEW' | 'ACKNOWLEDGED';
}

export interface HRAuditItem {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  docNo: string;
  actor: string;
  detail: string;
}

const INITIAL_EMPLOYEES: HREmployee[] = [
  {
    id: 'emp-1',
    empCode: 'EMP-67001',
    title: 'นพ.',
    firstName: 'กิตติภพ',
    lastName: 'รัตนโชติ',
    fullName: 'นพ. กิตติภพ รัตนโชติ',
    gender: 'ชาย',
    birthDate: '1984-05-14',
    idCard: '1-1005-00234-56-7',
    phone: '081-234-5678',
    email: 'kittipop.md@hospital.org',
    departmentCode: 'MED',
    departmentName: 'แผนกอายุรกรรม (Internal Medicine)',
    position: 'แพทย์ผู้เชี่ยวชาญอายุรศาสตร์โรคหัวใจ',
    staffCategory: 'แพทย์ (Physician)',
    employmentType: 'พนักงานประจำ',
    hireDate: '2018-04-01',
    probationEndDate: '2018-07-31',
    status: 'ACTIVE',
    baseSalary: 145000,
    positionAllowance: 45000,
    licenseAllowance: 35000,
    bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
    bankAccount: '402-8-91234-5',
    taxId: '1100500234567',
    socialSecurityStatus: 'ขึ้นทะเบียน ม.33',
    licenseNo: 'ว.38912',
    licenseType: 'ใบประกอบวิชาชีพเวชกรรม (แพทยสภา)',
    licenseExpiry: '2028-12-31',
    education: 'พ.บ. จุฬาลงกรณ์มหาวิทยาลัย, วุฒิบัตรอายุรศาสตร์โรคหัวใจ',
    bloodGroup: 'O',
    emergencyContact: 'พญ. ปิยะดา รัตนโชติ (081-998-7766)',
  },
  {
    id: 'emp-2',
    empCode: 'EMP-67002',
    title: 'พว.',
    firstName: 'ศิริพร',
    lastName: 'วงศ์สวัสดิ์',
    fullName: 'พว. ศิริพร วงศ์สวัสดิ์',
    gender: 'หญิง',
    birthDate: '1989-11-20',
    idCard: '1-5099-00412-88-1',
    phone: '089-456-1234',
    email: 'siriporn.rn@hospital.org',
    departmentCode: 'ICU',
    departmentName: 'หอผู้ป่วยวิกฤต (ICU)',
    position: 'หัวหน้าพยาบาลหอผู้ป่วยวิกฤต (Head Nurse ICU)',
    staffCategory: 'พยาบาล (Nurse)',
    employmentType: 'พนักงานประจำ',
    hireDate: '2016-06-15',
    probationEndDate: '2016-10-15',
    status: 'ACTIVE',
    baseSalary: 52000,
    positionAllowance: 12000,
    licenseAllowance: 8000,
    bankName: 'ธนาคารกสิกรไทย (KBANK)',
    bankAccount: '018-3-45678-9',
    taxId: '1509900412881',
    socialSecurityStatus: 'ขึ้นทะเบียน ม.33',
    licenseNo: 'พย.451029',
    licenseType: 'ใบประกอบวิชาชีพการพยาบาลและผดุงครรภ์ ชั้น 1',
    licenseExpiry: '2026-11-18',
    education: 'พย.บ. มหาวิทยาลัยมหิดล (เกียรตินิยมอันดับ 1)',
    bloodGroup: 'A',
    emergencyContact: 'นายสมศักดิ์ วงศ์สวัสดิ์ (081-333-4455)',
  },
  {
    id: 'emp-3',
    empCode: 'EMP-67003',
    title: 'ภก.',
    firstName: 'ธนากร',
    lastName: 'เจริญสุข',
    fullName: 'ภก. ธนากร เจริญสุข',
    gender: 'ชาย',
    birthDate: '1992-03-08',
    idCard: '1-1014-00876-12-3',
    phone: '086-789-0123',
    email: 'thanakorn.rx@hospital.org',
    departmentCode: 'PHARM',
    departmentName: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    position: 'หัวหน้าเภสัชกรคลินิกและคลังเวชภัณฑ์',
    staffCategory: 'เภสัชกร (Pharmacist)',
    employmentType: 'พนักงานประจำ',
    hireDate: '2019-01-10',
    probationEndDate: '2019-05-10',
    status: 'ACTIVE',
    baseSalary: 58000,
    positionAllowance: 10000,
    licenseAllowance: 12000,
    bankName: 'ธนาคารกรุงไทย (KTB)',
    bankAccount: '112-0-45901-2',
    taxId: '1101400876123',
    socialSecurityStatus: 'ขึ้นทะเบียน ม.33',
    licenseNo: 'ภ.29841',
    licenseType: 'ใบประกอบวิชาชีพเภสัชกรรม',
    licenseExpiry: '2026-11-05',
    education: 'ภ.บ. (บริบาลทางเภสัชกรรม) มหาวิทยาลัยเชียงใหม่',
    bloodGroup: 'B',
    emergencyContact: 'นางสมศรี เจริญสุข (089-112-3344)',
  },
  {
    id: 'emp-4',
    empCode: 'EMP-67004',
    title: 'พว.',
    firstName: 'นภัสสร',
    lastName: 'เกียรติไพบูลย์',
    fullName: 'พว. นภัสสร เกียรติไพบูลย์',
    gender: 'หญิง',
    birthDate: '1996-08-25',
    idCard: '1-1020-01122-33-4',
    phone: '092-345-6789',
    email: 'napatsorn.rn@hospital.org',
    departmentCode: 'ER',
    departmentName: 'แผนกฉุกเฉินและอุบัติเหตุ (ER)',
    position: 'พยาบาลวิชาชีพชำนาญการ (ER Trauma Nurse)',
    staffCategory: 'พยาบาล (Nurse)',
    employmentType: 'พนักงานประจำ',
    hireDate: '2021-05-01',
    probationEndDate: '2021-08-31',
    status: 'ACTIVE',
    baseSalary: 36500,
    positionAllowance: 5000,
    licenseAllowance: 6000,
    bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
    bankAccount: '409-2-11987-0',
    taxId: '1102001122334',
    socialSecurityStatus: 'ขึ้นทะเบียน ม.33',
    licenseNo: 'พย.519283',
    licenseType: 'ใบประกอบวิชาชีพการพยาบาลและผดุงครรภ์ ชั้น 1',
    licenseExpiry: '2027-06-30',
    education: 'พย.บ. วิทยาลัยพยาบาลบรมราชชนนี',
    bloodGroup: 'O',
    emergencyContact: 'นายพิชัย เกียรติไพบูลย์ (084-556-7788)',
  },
  {
    id: 'emp-5',
    empCode: 'EMP-67005',
    title: 'พญ.',
    firstName: 'พิมพ์ชนก',
    lastName: 'อัศวเดช',
    fullName: 'พญ. พิมพ์ชนก อัศวเดช',
    gender: 'หญิง',
    birthDate: '1991-02-19',
    idCard: '1-1007-00554-19-8',
    phone: '085-990-8877',
    email: 'pimchanok.md@hospital.org',
    departmentCode: 'OR',
    departmentName: 'กลุ่มงานศัลยกรรมและห้องผ่าตัด (OR)',
    position: 'ศัลยแพทย์ตกแต่งและผ่าตัดส่องกล้อง',
    staffCategory: 'แพทย์ (Physician)',
    employmentType: 'พนักงานประจำ',
    hireDate: '2020-09-01',
    probationEndDate: '2020-12-31',
    status: 'ACTIVE',
    baseSalary: 138000,
    positionAllowance: 40000,
    licenseAllowance: 35000,
    bankName: 'ธนาคารกสิกรไทย (KBANK)',
    bankAccount: '099-1-88723-4',
    taxId: '1100700554198',
    socialSecurityStatus: 'ขึ้นทะเบียน ม.33',
    licenseNo: 'ว.44510',
    licenseType: 'ใบประกอบวิชาชีพเวชกรรม (แพทยสภา)',
    licenseExpiry: '2029-09-30',
    education: 'พ.บ. คณะแพทยศาสตร์ศิริราชพยาบาล',
    bloodGroup: 'AB',
    emergencyContact: 'นพ. ธีรภัทร อัศวเดช (081-777-8899)',
  },
  {
    id: 'emp-6',
    empCode: 'EMP-67006',
    title: 'ทนพ.',
    firstName: 'ณัฐวุฒิ',
    lastName: 'สายชล',
    fullName: 'ทนพ. ณัฐวุฒิ สายชล',
    gender: 'ชาย',
    birthDate: '1995-12-10',
    idCard: '1-2001-00982-44-5',
    phone: '083-445-6677',
    email: 'nattawut.mt@hospital.org',
    departmentCode: 'LAB',
    departmentName: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)',
    position: 'นักเทคนิคการแพทย์ชำนาญการ',
    staffCategory: 'สหวิชาชีพ (Allied Health)',
    employmentType: 'พนักงานประจำ',
    hireDate: '2022-03-15',
    probationEndDate: '2022-07-15',
    status: 'ACTIVE',
    baseSalary: 34000,
    positionAllowance: 4000,
    licenseAllowance: 5000,
    bankName: 'ธนาคารกรุงไทย (KTB)',
    bankAccount: '201-4-88912-3',
    taxId: '1200100982445',
    socialSecurityStatus: 'ขึ้นทะเบียน ม.33',
    licenseNo: 'ท.18492',
    licenseType: 'ใบประกอบวิชาชีพเทคนิคการแพทย์',
    licenseExpiry: '2026-10-20',
    education: 'วท.บ. (เทคนิคการแพทย์) มหาวิทยาลัยธรรมศาสตร์',
    bloodGroup: 'A',
    emergencyContact: 'นางวรรณา สายชล (083-111-2233)',
  },
  {
    id: 'emp-7',
    empCode: 'EMP-67007',
    title: 'พว.',
    firstName: 'กัญญาณัฐ',
    lastName: 'สุขสวัสดิ์',
    fullName: 'พว. กัญญาณัฐ สุขสวัสดิ์',
    gender: 'หญิง',
    birthDate: '2000-04-12',
    idCard: '1-1033-02918-77-2',
    phone: '095-667-8890',
    email: 'kanyanat.rn@hospital.org',
    departmentCode: 'IPD',
    departmentName: 'หอผู้ป่วยในสามัญ (IPD Ward 4)',
    position: 'พยาบาลวิชาชีพปฏิบัติการ',
    staffCategory: 'พยาบาล (Nurse)',
    employmentType: 'ทดลองงาน' as any,
    hireDate: '2026-08-01',
    probationEndDate: '2026-11-28',
    status: 'PROBATION',
    baseSalary: 29500,
    positionAllowance: 3000,
    licenseAllowance: 5000,
    bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
    bankAccount: '415-9-00123-8',
    taxId: '1103302918772',
    socialSecurityStatus: 'ขึ้นทะเบียน ม.33',
    licenseNo: 'พย.601245',
    licenseType: 'ใบประกอบวิชาชีพการพยาบาลและผดุงครรภ์ ชั้น 1',
    licenseExpiry: '2031-05-31',
    education: 'พย.บ. มหาวิทยาลัยขอนแก่น',
    bloodGroup: 'B',
    emergencyContact: 'นายสุรพล สุขสวัสดิ์ (087-654-3210)',
  },
  {
    id: 'emp-8',
    empCode: 'EMP-67008',
    title: 'นาย',
    firstName: 'ปรเมศวร์',
    lastName: 'อินทร์จันทร์',
    fullName: 'นาย ปรเมศวร์ อินทร์จันทร์',
    gender: 'ชาย',
    birthDate: '1993-07-02',
    idCard: '1-4002-00345-99-0',
    phone: '088-223-4455',
    email: 'porames.hr@hospital.org',
    departmentCode: 'HR',
    departmentName: 'ฝ่ายทรัพยากรบุคคล (Human Resource)',
    position: 'หัวหน้างานบริหารทรัพยากรบุคคลและค่าตอบแทน',
    staffCategory: 'สายสนับสนุน (Support)',
    employmentType: 'พนักงานประจำ',
    hireDate: '2020-02-01',
    probationEndDate: '2020-05-31',
    status: 'ACTIVE',
    baseSalary: 46000,
    positionAllowance: 8000,
    licenseAllowance: 0,
    bankName: 'ธนาคารกสิกรไทย (KBANK)',
    bankAccount: '044-2-77611-9',
    taxId: '1400200345990',
    socialSecurityStatus: 'ขึ้นทะเบียน ม.33',
    education: 'บธ.ม. (การจัดการทรัพยากรมนุษย์) สถาบันบัณฑิตพัฒนบริหารศาสตร์ (NIDA)',
    bloodGroup: 'O',
    emergencyContact: 'น.ส. อารยา อินทร์จันทร์ (088-998-1122)',
  },
];

const INITIAL_RECRUITMENTS: HRRecruitment[] = [
  {
    id: 'rec-1',
    reqNo: 'MRF-2026-001',
    positionTitle: 'พยาบาลวิชาชีพหอผู้ป่วยวิกฤต (ICU Registered Nurse)',
    departmentName: 'หอผู้ป่วยวิกฤต (ICU)',
    staffCategory: 'พยาบาล (Nurse)',
    employmentType: 'พนักงานประจำ',
    headcountRequested: 4,
    headcountFilled: 2,
    urgency: 'URGENT',
    status: 'INTERVIEWING',
    postedDate: '2026-10-01',
    applicantsCount: 7,
    salaryRange: '32,000 - 45,000 บาท (+ค่าใบประกอบ/ค่าเวร)',
    qualification: 'วุฒิ พย.บ. มีใบประกอบวิชาชีพการพยาบาลชั้น 1 ประสบการณ์ ICU 1 ปีขึ้นไป',
    applicants: [
      {
        id: 'app-1',
        name: 'พว. มนัสนันท์ ศรีสุวรรณ',
        applyDate: '2026-10-12',
        phone: '089-234-9900',
        education: 'พย.บ. มหาวิทยาลัยมหิดล',
        licenseNo: 'พย.588120',
        stage: 'INTERVIEW',
        interviewDate: '2026-10-30 10:00',
        interviewer: 'พว. ศิริพร วงศ์สวัสดิ์',
        score: 88,
      },
      {
        id: 'app-2',
        name: 'พว. ชลธิชา ภักดี',
        applyDate: '2026-10-15',
        phone: '081-556-7789',
        education: 'พย.บ. จุฬาลงกรณ์มหาวิทยาลัย',
        licenseNo: 'พย.590441',
        stage: 'PASSED',
        interviewDate: '2026-10-24 14:00',
        interviewer: 'พว. ศิริพร วงศ์สวัสดิ์',
        score: 94,
      },
    ],
  },
  {
    id: 'rec-2',
    reqNo: 'MRF-2026-002',
    positionTitle: 'แพทย์เวชศาสตร์ฉุกเฉิน (Emergency Physician)',
    departmentName: 'แผนกฉุกเฉินและอุบัติเหตุ (ER)',
    staffCategory: 'แพทย์ (Physician)',
    employmentType: 'พนักงานประจำ',
    headcountRequested: 2,
    headcountFilled: 1,
    urgency: 'URGENT',
    status: 'OPEN',
    postedDate: '2026-10-10',
    applicantsCount: 3,
    salaryRange: '130,000 - 180,000 บาท (+DF/ค่าเวร)',
    qualification: 'แพทยศาสตรบัณฑิต ได้รับวุฒิบัตรสาขาเวชศาสตร์ฉุกเฉิน มีใบประกอบวิชาชีพเวชกรรม',
    applicants: [
      {
        id: 'app-3',
        name: 'นพ. ภาคภูมิ วัฒนชัย',
        applyDate: '2026-10-19',
        phone: '082-991-4455',
        education: 'พ.บ. ม.ขอนแก่น, วว.เวชศาสตร์ฉุกเฉิน',
        licenseNo: 'ว.51209',
        stage: 'INTERVIEW',
        interviewDate: '2026-11-02 09:30',
        interviewer: 'นพ. กิตติภพ รัตนโชติ',
        score: 91,
      },
    ],
  },
  {
    id: 'rec-3',
    reqNo: 'MRF-2026-003',
    positionTitle: 'เภสัชกรคลินิกประจำหอผู้ป่วยใน (IPD Clinical Pharmacist)',
    departmentName: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    staffCategory: 'เภสัชกร (Pharmacist)',
    employmentType: 'พนักงานประจำ',
    headcountRequested: 2,
    headcountFilled: 2,
    urgency: 'NORMAL',
    status: 'OFFERED',
    postedDate: '2026-09-20',
    applicantsCount: 5,
    salaryRange: '42,000 - 55,000 บาท (+ค่าใบประกอบวิชาชีพ 10,000)',
    qualification: 'วุฒิ ภ.บ. หลักสูตร 6 ปี มีใบประกอบวิชาชีพเภสัชกรรม',
    applicants: [
      {
        id: 'app-4',
        name: 'ภญ. อรพรรณ เลิศวิทยา',
        applyDate: '2026-09-28',
        phone: '086-412-9090',
        education: 'ภ.บ. มหาวิทยาลัยศิลปากร',
        licenseNo: 'ภ.34102',
        stage: 'HIRED',
        interviewDate: '2026-10-10 13:30',
        interviewer: 'ภก. ธนากร เจริญสุข',
        score: 95,
      },
    ],
  },
];

const INITIAL_ATTENDANCE: HRAttendance[] = [
  {
    id: 'att-1',
    date: '2026-10-28',
    empCode: 'EMP-67001',
    empName: 'นพ. กิตติภพ รัตนโชติ',
    departmentName: 'แผนกอายุรกรรม (Internal Medicine)',
    position: 'แพทย์ผู้เชี่ยวชาญอายุรศาสตร์โรคหัวใจ',
    shiftType: 'เวรเช้า (M)',
    checkIn: '07:45',
    checkOut: '16:15',
    status: 'NORMAL',
    lateMinutes: 0,
    otHours: 0,
    device: 'FaceScan-OPD-1',
  },
  {
    id: 'att-2',
    date: '2026-10-28',
    empCode: 'EMP-67002',
    empName: 'พว. ศิริพร วงศ์สวัสดิ์',
    departmentName: 'หอผู้ป่วยวิกฤต (ICU)',
    position: 'หัวหน้าพยาบาลหอผู้ป่วยวิกฤต (Head Nurse ICU)',
    shiftType: 'เวรเช้า (M)',
    checkIn: '07:38',
    checkOut: '19:40',
    status: 'OT',
    lateMinutes: 0,
    otHours: 4,
    device: 'FaceScan-ICU-Main',
  },
  {
    id: 'att-3',
    date: '2026-10-28',
    empCode: 'EMP-67003',
    empName: 'ภก. ธนากร เจริญสุข',
    departmentName: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    position: 'หัวหน้าเภสัชกรคลินิกและคลังเวชภัณฑ์',
    shiftType: 'Office (08:00-17:00)',
    checkIn: '07:52',
    checkOut: '17:10',
    status: 'NORMAL',
    lateMinutes: 0,
    otHours: 0,
    device: 'FaceScan-PHARM',
  },
  {
    id: 'att-4',
    date: '2026-10-28',
    empCode: 'EMP-67004',
    empName: 'พว. นภัสสร เกียรติไพบูลย์',
    departmentName: 'แผนกฉุกเฉินและอุบัติเหตุ (ER)',
    position: 'พยาบาลวิชาชีพชำนาญการ (ER Trauma Nurse)',
    shiftType: 'เวรบ่าย (A)',
    checkIn: '15:48',
    checkOut: '23:55',
    status: 'NORMAL',
    lateMinutes: 0,
    otHours: 0,
    device: 'FaceScan-ER-Gate',
  },
  {
    id: 'att-5',
    date: '2026-10-28',
    empCode: 'EMP-67006',
    empName: 'ทนพ. ณัฐวุฒิ สายชล',
    departmentName: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)',
    position: 'นักเทคนิคการแพทย์ชำนาญการ',
    shiftType: 'เวรเช้า (M)',
    checkIn: '08:19',
    checkOut: '16:30',
    status: 'LATE',
    lateMinutes: 19,
    otHours: 0,
    device: 'BioFinger-LAB',
  },
  {
    id: 'att-6',
    date: '2026-10-28',
    empCode: 'EMP-67007',
    empName: 'พว. กัญญาณัฐ สุขสวัสดิ์',
    departmentName: 'หอผู้ป่วยในสามัญ (IPD Ward 4)',
    position: 'พยาบาลวิชาชีพปฏิบัติการ',
    shiftType: 'เวรดึก (N)',
    checkIn: '23:45',
    checkOut: '08:05',
    status: 'NORMAL',
    lateMinutes: 0,
    otHours: 0,
    device: 'FaceScan-IPD-4',
  },
];

const INITIAL_SHIFTS: HRShiftAssignment[] = [
  {
    id: 'sh-1',
    empCode: 'EMP-67002',
    empName: 'พว. ศิริพร วงศ์สวัสดิ์',
    position: 'หัวหน้าพยาบาล ICU',
    departmentName: 'หอผู้ป่วยวิกฤต (ICU)',
    roleBadge: 'In-Charge / RN',
    schedule: { 1: 'M', 2: 'M', 3: 'M', 4: 'A', 5: 'A', 6: 'OFF', 7: 'OFF' },
  },
  {
    id: 'sh-2',
    empCode: 'EMP-67004',
    empName: 'พว. นภัสสร เกียรติไพบูลย์',
    position: 'พยาบาลวิชาชีพ ER',
    departmentName: 'แผนกฉุกเฉินและอุบัติเหตุ (ER)',
    roleBadge: 'Trauma RN',
    schedule: { 1: 'A', 2: 'A', 3: 'N', 4: 'N', 5: 'OFF', 6: 'M', 7: 'OT' },
  },
  {
    id: 'sh-3',
    empCode: 'EMP-67007',
    empName: 'พว. กัญญาณัฐ สุขสวัสดิ์',
    position: 'พยาบาลวิชาชีพ IPD',
    departmentName: 'หอผู้ป่วยในสามัญ (IPD Ward 4)',
    roleBadge: 'Staff RN',
    schedule: { 1: 'N', 2: 'N', 3: 'OFF', 4: 'M', 5: 'M', 6: 'A', 7: 'A' },
  },
  {
    id: 'sh-4',
    empCode: 'EMP-67001',
    empName: 'นพ. กิตติภพ รัตนโชติ',
    position: 'อายุรแพทย์โรคหัวใจ',
    departmentName: 'แผนกอายุรกรรม (Internal Medicine)',
    roleBadge: 'Cardiologist On-Call',
    schedule: { 1: 'M', 2: 'M', 3: 'OT', 4: 'M', 5: 'M', 6: 'OFF', 7: 'OFF' },
  },
  {
    id: 'sh-5',
    empCode: 'EMP-67003',
    empName: 'ภก. ธนากร เจริญสุข',
    position: 'หัวหน้าเภสัชกร',
    departmentName: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    roleBadge: 'Senior Pharmacist',
    schedule: { 1: 'M', 2: 'M', 3: 'M', 4: 'M', 5: 'M', 6: 'OT', 7: 'OFF' },
  },
  {
    id: 'sh-6',
    empCode: 'EMP-67006',
    empName: 'ทนพ. ณัฐวุฒิ สายชล',
    position: 'นักเทคนิคการแพทย์',
    departmentName: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)',
    roleBadge: 'Lab MT',
    schedule: { 1: 'M', 2: 'A', 3: 'A', 4: 'N', 5: 'OFF', 6: 'M', 7: 'M' },
  },
];

const INITIAL_SWAPS: HRShiftSwap[] = [
  {
    id: 'sw-1',
    swapNo: 'SWP-2026-014',
    requestDate: '2026-10-27',
    requesterCode: 'EMP-67004',
    requesterName: 'พว. นภัสสร เกียรติไพบูลย์',
    departmentName: 'แผนกฉุกเฉินและอุบัติเหตุ (ER)',
    fromDate: '2026-10-30',
    fromShift: 'เวรบ่าย (A)',
    targetCode: 'EMP-67007',
    targetName: 'พว. กัญญาณัฐ สุขสวัสดิ์',
    toDate: '2026-10-31',
    toShift: 'เวรเช้า (M)',
    reason: 'ติดภารกิจอบรมฟื้นฟูการช่วยชีวิตขั้นสูง ACLS รอบบ่าย',
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'sw-2',
    swapNo: 'SWP-2026-013',
    requestDate: '2026-10-24',
    requesterCode: 'EMP-67002',
    requesterName: 'พว. ศิริพร วงศ์สวัสดิ์',
    departmentName: 'หอผู้ป่วยวิกฤต (ICU)',
    fromDate: '2026-10-26',
    fromShift: 'เวรเช้า (M)',
    targetCode: 'EMP-67004',
    targetName: 'พว. นภัสสร เกียรติไพบูลย์',
    toDate: '2026-10-26',
    toShift: 'เวรบ่าย (A)',
    reason: 'เข้าร่วมประชุมคณะกรรมการมาตรฐาน HA โรงพยาบาลช่วงเช้า',
    status: 'APPROVED',
  },
];

const INITIAL_OTS: HROTRequest[] = [
  {
    id: 'ot-1',
    otNo: 'OT-2026-089',
    date: '2026-10-28',
    empCode: 'EMP-67002',
    empName: 'พว. ศิริพร วงศ์สวัสดิ์',
    departmentName: 'หอผู้ป่วยวิกฤต (ICU)',
    position: 'หัวหน้าพยาบาลหอผู้ป่วยวิกฤต',
    otType: 'เวรเสริมวิชาชีพ (On-Call)',
    startTime: '16:00',
    endTime: '20:00',
    hours: 4,
    ratePerHour: 350,
    totalAmount: 1400,
    reason: 'ดูแลเคสผู้ป่วยวิกฤต Post-Cardiac Arrest ต่อเนื่องจากเวรเช้า',
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'ot-2',
    otNo: 'OT-2026-088',
    date: '2026-10-27',
    empCode: 'EMP-67004',
    empName: 'พว. นภัสสร เกียรติไพบูลย์',
    departmentName: 'แผนกฉุกเฉินและอุบัติเหตุ (ER)',
    position: 'พยาบาลวิชาชีพชำนาญการ',
    otType: 'OT วันหยุดนักขัตฤกษ์ (3.0x)',
    startTime: '08:00',
    endTime: '16:00',
    hours: 8,
    ratePerHour: 300,
    totalAmount: 2400,
    reason: 'เสริมอัตรากำลังห้องฉุกเฉินช่วงอุบัติเหตุหมู่',
    status: 'APPROVED',
  },
  {
    id: 'ot-3',
    otNo: 'OT-2026-087',
    date: '2026-10-26',
    empCode: 'EMP-67006',
    empName: 'ทนพ. ณัฐวุฒิ สายชล',
    departmentName: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)',
    position: 'นักเทคนิคการแพทย์ชำนาญการ',
    otType: 'OT วันหยุดประจำสัปดาห์ (2.0x)',
    startTime: '08:00',
    endTime: '16:00',
    hours: 8,
    ratePerHour: 260,
    totalAmount: 2080,
    reason: 'ตรวจวิเคราะห์ผลเลือดด่วนและ Crossmatch ธนาคารเลือด',
    status: 'APPROVED',
  },
];

const INITIAL_LEAVES: HRLeaveRequest[] = [
  {
    id: 'lv-1',
    leaveNo: 'LV-2026-041',
    empCode: 'EMP-67004',
    empName: 'พว. นภัสสร เกียรติไพบูลย์',
    departmentName: 'แผนกฉุกเฉินและอุบัติเหตุ (ER)',
    position: 'พยาบาลวิชาชีพชำนาญการ',
    leaveType: 'ลาพักร้อน (Annual Leave)',
    startDate: '2026-11-05',
    endDate: '2026-11-07',
    days: 3,
    reason: 'เดินทางไปต่างจังหวัดกับครอบครัว (แจ้งล่วงหน้าตามระเบียบ)',
    substitutePerson: 'พว. กัญญาณัฐ สุขสวัสดิ์',
    medicalCert: false,
    status: 'PENDING_APPROVAL',
    createdAt: '2026-10-27',
  },
  {
    id: 'lv-2',
    leaveNo: 'LV-2026-040',
    empCode: 'EMP-67006',
    empName: 'ทนพ. ณัฐวุฒิ สายชล',
    departmentName: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)',
    position: 'นักเทคนิคการแพทย์ชำนาญการ',
    leaveType: 'ลาป่วย (Sick Leave)',
    startDate: '2026-10-22',
    endDate: '2026-10-23',
    days: 2,
    reason: 'ไข้หวัดใหญ่ มีใบรับรองแพทย์จากคลินิกประกันสังคม',
    substitutePerson: 'ทนพ. สมเกียรติ ใจดี',
    medicalCert: true,
    status: 'APPROVED',
    createdAt: '2026-10-22',
  },
  {
    id: 'lv-3',
    leaveNo: 'LV-2026-039',
    empCode: 'EMP-67001',
    empName: 'นพ. กิตติภพ รัตนโชติ',
    departmentName: 'แผนกอายุรกรรม (Internal Medicine)',
    position: 'แพทย์ผู้เชี่ยวชาญอายุรศาสตร์โรคหัวใจ',
    leaveType: 'ลาฝึกอบรม/ประชุมวิชาการ',
    startDate: '2026-11-12',
    endDate: '2026-11-14',
    days: 3,
    reason: 'ร่วมงานประชุมวิชาการสมาคมแพทย์โรคหัวใจแห่งประเทศไทย (เก็บหน่วยกิต CME)',
    substitutePerson: 'พญ. พิมพ์ชนก อัศวเดช',
    medicalCert: false,
    status: 'APPROVED',
    createdAt: '2026-10-18',
  },
];

const INITIAL_PAYROLLS: HRPayrollRecord[] = [
  {
    id: 'pay-1',
    period: 'ตุลาคม 2569 (Oct 2026)',
    empCode: 'EMP-67001',
    empName: 'นพ. กิตติภพ รัตนโชติ',
    departmentName: 'แผนกอายุรกรรม (Internal Medicine)',
    position: 'แพทย์ผู้เชี่ยวชาญอายุรศาสตร์โรคหัวใจ',
    baseSalary: 145000,
    positionAllowance: 45000,
    licenseAllowance: 35000,
    shiftAllowance: 28000,
    otPay: 12000,
    taxDeduction: 24500,
    ssoDeduction: 750,
    providentFund: 7250,
    otherDeduction: 0,
    netSalary: 232500,
    paymentStatus: 'PAID',
    paymentDate: '2026-10-28',
  },
  {
    id: 'pay-2',
    period: 'ตุลาคม 2569 (Oct 2026)',
    empCode: 'EMP-67002',
    empName: 'พว. ศิริพร วงศ์สวัสดิ์',
    departmentName: 'หอผู้ป่วยวิกฤต (ICU)',
    position: 'หัวหน้าพยาบาลหอผู้ป่วยวิกฤต',
    baseSalary: 52000,
    positionAllowance: 12000,
    licenseAllowance: 8000,
    shiftAllowance: 7500,
    otPay: 5600,
    taxDeduction: 4200,
    ssoDeduction: 750,
    providentFund: 2600,
    otherDeduction: 0,
    netSalary: 77550,
    paymentStatus: 'PAID',
    paymentDate: '2026-10-28',
  },
  {
    id: 'pay-3',
    period: 'ตุลาคม 2569 (Oct 2026)',
    empCode: 'EMP-67003',
    empName: 'ภก. ธนากร เจริญสุข',
    departmentName: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    position: 'หัวหน้าเภสัชกรคลินิกและคลังเวชภัณฑ์',
    baseSalary: 58000,
    positionAllowance: 10000,
    licenseAllowance: 12000,
    shiftAllowance: 4500,
    otPay: 3200,
    taxDeduction: 4850,
    ssoDeduction: 750,
    providentFund: 2900,
    otherDeduction: 0,
    netSalary: 79200,
    paymentStatus: 'PAID',
    paymentDate: '2026-10-28',
  },
  {
    id: 'pay-4',
    period: 'ตุลาคม 2569 (Oct 2026)',
    empCode: 'EMP-67004',
    empName: 'พว. นภัสสร เกียรติไพบูลย์',
    departmentName: 'แผนกฉุกเฉินและอุบัติเหตุ (ER)',
    position: 'พยาบาลวิชาชีพชำนาญการ',
    baseSalary: 36500,
    positionAllowance: 5000,
    licenseAllowance: 6000,
    shiftAllowance: 9200,
    otPay: 6400,
    taxDeduction: 2150,
    ssoDeduction: 750,
    providentFund: 1825,
    otherDeduction: 0,
    netSalary: 58375,
    paymentStatus: 'PAID',
    paymentDate: '2026-10-28',
  },
  {
    id: 'pay-5',
    period: 'ตุลาคม 2569 (Oct 2026)',
    empCode: 'EMP-67005',
    empName: 'พญ. พิมพ์ชนก อัศวเดช',
    departmentName: 'กลุ่มงานศัลยกรรมและห้องผ่าตัด (OR)',
    position: 'ศัลยแพทย์ตกแต่งและผ่าตัดส่องกล้อง',
    baseSalary: 138000,
    positionAllowance: 40000,
    licenseAllowance: 35000,
    shiftAllowance: 32000,
    otPay: 15000,
    taxDeduction: 23100,
    ssoDeduction: 750,
    providentFund: 6900,
    otherDeduction: 0,
    netSalary: 229250,
    paymentStatus: 'PAID',
    paymentDate: '2026-10-28',
  },
  {
    id: 'pay-6',
    period: 'ตุลาคม 2569 (Oct 2026)',
    empCode: 'EMP-67006',
    empName: 'ทนพ. ณัฐวุฒิ สายชล',
    departmentName: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)',
    position: 'นักเทคนิคการแพทย์ชำนาญการ',
    baseSalary: 34000,
    positionAllowance: 4000,
    licenseAllowance: 5000,
    shiftAllowance: 5400,
    otPay: 4160,
    taxDeduction: 1450,
    ssoDeduction: 750,
    providentFund: 1700,
    otherDeduction: 0,
    netSalary: 48660,
    paymentStatus: 'PAID',
    paymentDate: '2026-10-28',
  },
];

const INITIAL_LICENSES: HRLicenseCredential[] = [
  {
    id: 'lic-1',
    empCode: 'EMP-67006',
    empName: 'ทนพ. ณัฐวุฒิ สายชล',
    departmentName: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)',
    position: 'นักเทคนิคการแพทย์ชำนาญการ',
    licenseType: 'ใบประกอบวิชาชีพเทคนิคการแพทย์',
    licenseNo: 'ท.18492',
    issuedBy: 'สภาเทคนิคการแพทย์',
    issueDate: '2021-10-21',
    expiryDate: '2026-10-20',
    daysRemaining: -8,
    cmeCreditsRequired: 50,
    cmeCreditsEarned: 48,
    status: 'EXPIRED',
  },
  {
    id: 'lic-2',
    empCode: 'EMP-67003',
    empName: 'ภก. ธนากร เจริญสุข',
    departmentName: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    position: 'หัวหน้าเภสัชกรคลินิกและคลังเวชภัณฑ์',
    licenseType: 'ใบประกอบวิชาชีพเภสัชกรรม',
    licenseNo: 'ภ.29841',
    issuedBy: 'สภาเภสัชกรรม',
    issueDate: '2021-11-05',
    expiryDate: '2026-11-05',
    daysRemaining: 8,
    cmeCreditsRequired: 100,
    cmeCreditsEarned: 105,
    status: 'NEAR_EXPIRY',
  },
  {
    id: 'lic-3',
    empCode: 'EMP-67002',
    empName: 'พว. ศิริพร วงศ์สวัสดิ์',
    departmentName: 'หอผู้ป่วยวิกฤต (ICU)',
    position: 'หัวหน้าพยาบาลหอผู้ป่วยวิกฤต',
    licenseType: 'ใบประกอบวิชาชีพการพยาบาลและผดุงครรภ์',
    licenseNo: 'พย.451029',
    issuedBy: 'สภาการพยาบาล',
    issueDate: '2021-11-19',
    expiryDate: '2026-11-18',
    daysRemaining: 21,
    cmeCreditsRequired: 50,
    cmeCreditsEarned: 54,
    status: 'NEAR_EXPIRY',
  },
  {
    id: 'lic-4',
    empCode: 'EMP-67001',
    empName: 'นพ. กิตติภพ รัตนโชติ',
    departmentName: 'แผนกอายุรกรรม (Internal Medicine)',
    position: 'แพทย์ผู้เชี่ยวชาญอายุรศาสตร์โรคหัวใจ',
    licenseType: 'ใบประกอบวิชาชีพเวชกรรม (แพทยสภา)',
    licenseNo: 'ว.38912',
    issuedBy: 'แพทยสภา (Medical Council of Thailand)',
    issueDate: '2018-01-01',
    expiryDate: '2028-12-31',
    daysRemaining: 794,
    cmeCreditsRequired: 100,
    cmeCreditsEarned: 92,
    status: 'ACTIVE',
  },
  {
    id: 'lic-5',
    empCode: 'EMP-67004',
    empName: 'พว. นภัสสร เกียรติไพบูลย์',
    departmentName: 'แผนกฉุกเฉินและอุบัติเหตุ (ER)',
    position: 'พยาบาลวิชาชีพชำนาญการ',
    licenseType: 'ใบรับรอง ACLS / BLS',
    licenseNo: 'ACLS-TH-2024-882',
    issuedBy: 'สมาคมแพทย์โรคหัวใจแห่งประเทศไทย',
    issueDate: '2024-11-15',
    expiryDate: '2026-11-15',
    daysRemaining: 18,
    cmeCreditsRequired: 20,
    cmeCreditsEarned: 20,
    status: 'NEAR_EXPIRY',
  },
  {
    id: 'lic-6',
    empCode: 'EMP-67005',
    empName: 'พญ. พิมพ์ชนก อัศวเดช',
    departmentName: 'กลุ่มงานศัลยกรรมและห้องผ่าตัด (OR)',
    position: 'ศัลยแพทย์ตกแต่งและผ่าตัดส่องกล้อง',
    licenseType: 'ใบประกอบวิชาชีพเวชกรรม (แพทยสภา)',
    licenseNo: 'ว.44510',
    issuedBy: 'แพทยสภา (Medical Council of Thailand)',
    issueDate: '2020-10-01',
    expiryDate: '2029-09-30',
    daysRemaining: 1067,
    cmeCreditsRequired: 100,
    cmeCreditsEarned: 85,
    status: 'ACTIVE',
  },
];

const INITIAL_TRAININGS: HRTrainingCourse[] = [
  {
    id: 'tr-1',
    courseCode: 'TRN-2026-011',
    title: 'การช่วยฟื้นคืนชีพขั้นสูง (Advanced Cardiovascular Life Support: ACLS 2026)',
    category: 'ช่วยชีวิตขั้นสูง (BLS / ACLS)',
    instructor: 'นพ. กิตติภพ รัตนโชติ และทีมวิทยากรศูนย์โรคหัวใจ',
    date: '2026-11-10',
    hours: 12,
    cmePoints: 15,
    seatsTotal: 40,
    seatsEnrolled: 36,
    location: 'ศูนย์ฝึกปฏิบัติการจำลองทางการแพทย์ ชั้น 5',
    status: 'UPCOMING',
  },
  {
    id: 'tr-2',
    courseCode: 'TRN-2026-012',
    title: 'มาตรฐานความปลอดภัยของผู้ป่วยและการรับรองคุณภาพโรงพยาบาล (HA & Patient Safety Goals)',
    category: 'บังคับตามมาตรฐาน HA / JCI',
    instructor: 'คณะกรรมการพัฒนาคุณภาพโรงพยาบาล (QMR)',
    date: '2026-10-28',
    hours: 6,
    cmePoints: 8,
    seatsTotal: 120,
    seatsEnrolled: 118,
    location: 'ห้องประชุมใหญ่ ชั้น 9 อาคารอำนวยการ',
    status: 'ONGOING',
  },
  {
    id: 'tr-3',
    courseCode: 'TRN-2026-009',
    title: 'การใช้ยาความเสี่ยงสูงและการบริหารจัดการคลังเวชภัณฑ์ตามหลัก FEFO (High Alert Drug & FEFO)',
    category: 'พัฒนาทักษะทางคลินิก (Clinical)',
    instructor: 'ภก. ธนากร เจริญสุข',
    date: '2026-10-15',
    hours: 6,
    cmePoints: 10,
    seatsTotal: 60,
    seatsEnrolled: 60,
    location: 'ห้องประชุมเภสัชกรรม ชั้น 2',
    status: 'COMPLETED',
  },
  {
    id: 'tr-4',
    courseCode: 'TRN-2026-010',
    title: 'การป้องกันและควบคุมการติดเชื้อในโรงพยาบาล (Hospital Infection Control: IC)',
    category: 'ความปลอดภัยและอาชีวอนามัย (IC / ENV)',
    instructor: 'ทีมพยาบาลควบคุมโรคติดเชื้อ (ICWN)',
    date: '2026-10-05',
    hours: 6,
    cmePoints: 6,
    seatsTotal: 100,
    seatsEnrolled: 95,
    location: 'ห้องประชุมใหญ่ ชั้น 9 อาคารอำนวยการ',
    status: 'COMPLETED',
  },
];

const INITIAL_PERFORMANCES: HRPerformanceReview[] = [
  {
    id: 'perf-1',
    empCode: 'EMP-67001',
    empName: 'นพ. กิตติภพ รัตนโชติ',
    departmentName: 'แผนกอายุรกรรม (Internal Medicine)',
    position: 'แพทย์ผู้เชี่ยวชาญอายุรศาสตร์โรคหัวใจ',
    reviewType: 'ประเมินประจำปี (Annual KPI)',
    period: 'ประจำปี 2569 (2026)',
    kpiScore: 96,
    coreCompetencyScore: 95,
    clinicalCompetencyScore: 98,
    totalScore: 96.5,
    grade: 'A+ (ดีเยี่ยม)',
    evaluator: 'ผอ. โรงพยาบาล / ประธานองค์กรแพทย์',
    status: 'COMPLETED',
  },
  {
    id: 'perf-2',
    empCode: 'EMP-67002',
    empName: 'พว. ศิริพร วงศ์สวัสดิ์',
    departmentName: 'หอผู้ป่วยวิกฤต (ICU)',
    position: 'หัวหน้าพยาบาลหอผู้ป่วยวิกฤต',
    reviewType: 'ประเมินประจำปี (Annual KPI)',
    period: 'ประจำปี 2569 (2026)',
    kpiScore: 94,
    coreCompetencyScore: 92,
    clinicalCompetencyScore: 95,
    totalScore: 93.8,
    grade: 'A+ (ดีเยี่ยม)',
    evaluator: 'หัวหน้าฝ่ายการพยาบาล',
    status: 'COMPLETED',
  },
  {
    id: 'perf-3',
    empCode: 'EMP-67003',
    empName: 'ภก. ธนากร เจริญสุข',
    departmentName: 'กลุ่มงานเภสัชกรรม (Pharmacy)',
    position: 'หัวหน้าเภสัชกรคลินิกและคลังเวชภัณฑ์',
    reviewType: 'ประเมินประจำปี (Annual KPI)',
    period: 'ประจำปี 2569 (2026)',
    kpiScore: 91,
    coreCompetencyScore: 90,
    clinicalCompetencyScore: 93,
    totalScore: 91.5,
    grade: 'A (ดีมาก)',
    evaluator: 'รองผู้อำนวยการฝ่ายการแพทย์',
    status: 'COMPLETED',
  },
  {
    id: 'perf-4',
    empCode: 'EMP-67007',
    empName: 'พว. กัญญาณัฐ สุขสวัสดิ์',
    departmentName: 'หอผู้ป่วยในสามัญ (IPD Ward 4)',
    position: 'พยาบาลวิชาชีพปฏิบัติการ',
    reviewType: 'ประเมินผ่านทดลองงาน (Probation 119 วัน)',
    period: 'รอบทดลองงาน ส.ค. - พ.ย. 2569',
    kpiScore: 86,
    coreCompetencyScore: 88,
    clinicalCompetencyScore: 85,
    totalScore: 86.2,
    grade: 'B+ (ดี)',
    evaluator: 'พว. ศิริพร วงศ์สวัสดิ์',
    status: 'PENDING_REVIEW',
  },
];

const INITIAL_AUDITS: HRAuditItem[] = [
  {
    id: 'aud-1',
    timestamp: '2026-10-28 14:20',
    module: 'PAYROLL',
    action: 'APPROVE_PAYROLL_BATCH',
    docNo: 'PAY-2026-10',
    actor: 'ปรเมศวร์ อินทร์จันทร์ (HR Manager)',
    detail: 'อนุมัติงวดการจ่ายเงินเดือนและค่าเวรประจำเดือน ตุลาคม 2569 จำนวน 8 รายการ',
  },
  {
    id: 'aud-2',
    timestamp: '2026-10-28 11:05',
    module: 'LICENSE',
    action: 'TRIGGER_RENEWAL_ALERT',
    docNo: 'LIC-ALERT-2026',
    actor: 'System Auto-Compliance',
    detail: 'ส่งแจ้งเตือนใบประกอบวิชาชีพใกล้หมดอายุ (< 30 วัน) ให้บุคลากรและหัวหน้าแผนก 3 ราย',
  },
  {
    id: 'aud-3',
    timestamp: '2026-10-27 16:40',
    module: 'ROSTER',
    action: 'CREATE_SHIFT_SWAP',
    docNo: 'SWP-2026-014',
    actor: 'พว. นภัสสร เกียรติไพบูลย์',
    detail: 'ยื่นคำขอสลับเวรบ่าย (30 ต.ค.) กับ พว. กัญญาณัฐ สุขสวัสดิ์',
  },
  {
    id: 'aud-4',
    timestamp: '2026-10-27 09:15',
    module: 'LEAVE',
    action: 'SUBMIT_LEAVE_REQUEST',
    docNo: 'LV-2026-041',
    actor: 'พว. นภัสสร เกียรติไพบูลย์',
    detail: 'ยื่นใบลาพักร้อน 3 วัน (5-7 พ.ย. 2569) พร้อมระบุผู้ปฏิบัติงานแทน',
  },
];

interface HRContextType {
  employees: HREmployee[];
  addEmployee: (emp: Omit<HREmployee, 'id'>) => void;
  recruitments: HRRecruitment[];
  addRecruitment: (rec: Omit<HRRecruitment, 'id'>) => void;
  attendance: HRAttendance[];
  addAttendance: (att: Omit<HRAttendance, 'id'>) => void;
  shifts: HRShiftAssignment[];
  swaps: HRShiftSwap[];
  addSwapRequest: (swap: Omit<HRShiftSwap, 'id'>) => void;
  updateSwapStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  otRequests: HROTRequest[];
  addOTRequest: (ot: Omit<HROTRequest, 'id'>) => void;
  updateOTStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  leaves: HRLeaveRequest[];
  addLeaveRequest: (lv: Omit<HRLeaveRequest, 'id'>) => void;
  updateLeaveStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  payrolls: HRPayrollRecord[];
  runPayrollBatch: (period: string) => void;
  licenses: HRLicenseCredential[];
  addLicense: (lic: Omit<HRLicenseCredential, 'id'>) => void;
  renewLicense: (id: string, newExpiryDate: string) => void;
  trainings: HRTrainingCourse[];
  addTraining: (tr: Omit<HRTrainingCourse, 'id'>) => void;
  performances: HRPerformanceReview[];
  audits: HRAuditItem[];
  logHRAudit: (module: string, action: string, docNo: string, detail: string) => void;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

export function HRProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useDemoState<HREmployee[]>('hr.employees', INITIAL_EMPLOYEES);
  const [recruitments, setRecruitments] = useDemoState<HRRecruitment[]>('hr.recruitments', INITIAL_RECRUITMENTS);
  const [attendance, setAttendance] = useDemoState<HRAttendance[]>('hr.attendance', INITIAL_ATTENDANCE);
  const [shifts] = useDemoState<HRShiftAssignment[]>('hr.shifts', INITIAL_SHIFTS);
  const [swaps, setSwaps] = useDemoState<HRShiftSwap[]>('hr.swaps', INITIAL_SWAPS);
  const [otRequests, setOtRequests] = useDemoState<HROTRequest[]>('hr.otRequests', INITIAL_OTS);
  const [leaves, setLeaves] = useDemoState<HRLeaveRequest[]>('hr.leaves', INITIAL_LEAVES);
  const [payrolls, setPayrolls] = useDemoState<HRPayrollRecord[]>('hr.payrolls', INITIAL_PAYROLLS);
  const [licenses, setLicenses] = useDemoState<HRLicenseCredential[]>('hr.licenses', INITIAL_LICENSES);
  const [trainings, setTrainings] = useDemoState<HRTrainingCourse[]>('hr.trainings', INITIAL_TRAININGS);
  const [performances] = useDemoState<HRPerformanceReview[]>('hr.performances', INITIAL_PERFORMANCES);
  const [audits, setAudits] = useDemoState<HRAuditItem[]>('hr.audits', INITIAL_AUDITS);

  const logHRAudit = (module: string, action: string, docNo: string, detail: string) => {
    const newItem: HRAuditItem = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('sv-SE').slice(0, 16),
      module,
      action,
      docNo,
      actor: 'วิชัย เกียรติบูรพา (HR Admin)',
      detail,
    };
    setAudits((prev) => [newItem, ...prev]);
  };

  const addEmployee = (emp: Omit<HREmployee, 'id'>) => {
    const newEmp: HREmployee = { ...emp, id: `emp-${Date.now()}` };
    setEmployees((prev) => [newEmp, ...prev]);
    logHRAudit('EMPLOYEE', 'CREATE_EMPLOYEE', emp.empCode, `ขึ้นทะเบียนบุคลากรใหม่: ${emp.fullName} (${emp.position})`);
  };

  const addRecruitment = (rec: Omit<HRRecruitment, 'id'>) => {
    const newRec: HRRecruitment = { ...rec, id: `rec-${Date.now()}` };
    setRecruitments((prev) => [newRec, ...prev]);
    logHRAudit('RECRUITMENT', 'CREATE_REQUISITION', rec.reqNo, `เปิดอัตราสรรหาบุคลากร: ${rec.positionTitle} จำนวน ${rec.headcountRequested} อัตรา`);
  };

  const addAttendance = (att: Omit<HRAttendance, 'id'>) => {
    const newAtt: HRAttendance = { ...att, id: `att-${Date.now()}` };
    setAttendance((prev) => [newAtt, ...prev]);
    logHRAudit('ATTENDANCE', 'MANUAL_CHECKIN', att.empCode, `ลงเวลาปฏิบัติงาน ${att.empName} เวลา ${att.checkIn}`);
  };

  const addSwapRequest = (swap: Omit<HRShiftSwap, 'id'>) => {
    const newSwap: HRShiftSwap = { ...swap, id: `sw-${Date.now()}` };
    setSwaps((prev) => [newSwap, ...prev]);
    logHRAudit('ROSTER', 'REQUEST_SHIFT_SWAP', swap.swapNo, `ขอสลับเวรระหว่าง ${swap.requesterName} และ ${swap.targetName}`);
  };

  const updateSwapStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setSwaps((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          logHRAudit('ROSTER', `SWAP_${status}`, s.swapNo, `${status === 'APPROVED' ? 'อนุมัติ' : 'ปฏิเสธ'}คำขอสลับเวร ${s.swapNo}`);
          return { ...s, status };
        }
        return s;
      })
    );
  };

  const addOTRequest = (ot: Omit<HROTRequest, 'id'>) => {
    const newOT: HROTRequest = { ...ot, id: `ot-${Date.now()}` };
    setOtRequests((prev) => [newOT, ...prev]);
    logHRAudit('OVERTIME', 'CREATE_OT_REQUEST', ot.otNo, `ขออนุมัติทำงานล่วงเวลา (OT) ${ot.empName} จำนวน ${ot.hours} ชม.`);
  };

  const updateOTStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setOtRequests((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          logHRAudit('OVERTIME', `OT_${status}`, o.otNo, `${status === 'APPROVED' ? 'อนุมัติ' : 'ปฏิเสธ'}รายการ OT ${o.otNo} (${o.empName})`);
          return { ...o, status };
        }
        return o;
      })
    );
  };

  const addLeaveRequest = (lv: Omit<HRLeaveRequest, 'id'>) => {
    const newLv: HRLeaveRequest = { ...lv, id: `lv-${Date.now()}` };
    setLeaves((prev) => [newLv, ...prev]);
    logHRAudit('LEAVE', 'CREATE_LEAVE_REQUEST', lv.leaveNo, `ยื่นใบลา (${lv.leaveType}) ของ ${lv.empName} จำนวน ${lv.days} วัน`);
  };

  const updateLeaveStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setLeaves((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          logHRAudit('LEAVE', `LEAVE_${status}`, l.leaveNo, `${status === 'APPROVED' ? 'อนุมัติ' : 'ปฏิเสธ'}ใบลา ${l.leaveNo} (${l.empName})`);
          return { ...l, status };
        }
        return l;
      })
    );
  };

  const runPayrollBatch = (period: string) => {
    logHRAudit('PAYROLL', 'PROCESS_PAYROLL_BATCH', `PAY-${period}`, `ประมวลผลเงินเดือน ค่าเวร และภาษี ประจำงวด ${period} สำเร็จ`);
  };

  const addLicense = (lic: Omit<HRLicenseCredential, 'id'>) => {
    const newLic: HRLicenseCredential = { ...lic, id: `lic-${Date.now()}` };
    setLicenses((prev) => [newLic, ...prev]);
    logHRAudit('LICENSE', 'REGISTER_LICENSE', lic.licenseNo, `บันทึกใบประกอบวิชาชีพ ${lic.licenseNo} ของ ${lic.empName}`);
  };

  const renewLicense = (id: string, newExpiryDate: string) => {
    setLicenses((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          logHRAudit('LICENSE', 'RENEW_LICENSE', l.licenseNo, `ต่ออายุใบประกอบวิชาชีพ ${l.licenseNo} (${l.empName}) ถึงวันที่ ${newExpiryDate}`);
          return {
            ...l,
            expiryDate: newExpiryDate,
            daysRemaining: 1825,
            status: 'ACTIVE',
          };
        }
        return l;
      })
    );
  };

  const addTraining = (tr: Omit<HRTrainingCourse, 'id'>) => {
    const newTr: HRTrainingCourse = { ...tr, id: `tr-${Date.now()}` };
    setTrainings((prev) => [newTr, ...prev]);
    logHRAudit('TRAINING', 'CREATE_COURSE', tr.courseCode, `เปิดหลักสูตรฝึกอบรมใหม่: ${tr.title}`);
  };

  return (
    <HRContext.Provider
      value={{
        employees,
        addEmployee,
        recruitments,
        addRecruitment,
        attendance,
        addAttendance,
        shifts,
        swaps,
        addSwapRequest,
        updateSwapStatus,
        otRequests,
        addOTRequest,
        updateOTStatus,
        leaves,
        addLeaveRequest,
        updateLeaveStatus,
        payrolls,
        runPayrollBatch,
        licenses,
        addLicense,
        renewLicense,
        trainings,
        addTraining,
        performances,
        audits,
        logHRAudit,
      }}
    >
      {children}
    </HRContext.Provider>
  );
}

export function useHR() {
  const ctx = useContext(HRContext);
  if (!ctx) throw new Error('useHR must be used within an HRProvider');
  return ctx;
}

