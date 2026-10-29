'use client';

import React, { useState } from 'react';
import { useBudget, BudgetPlanItem } from '@erp/app-context';
import {
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  Clock,
  Paperclip,
  Send,
  Search,
  Filter,
  History,
  FileText,
  X,
} from 'lucide-react';

export default function BudgetPlanningPage() {
  const { plans, addBudgetPlan, updatePlanStatus, audits } = useBudget();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'HISTORY'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BudgetPlanItem | null>(null);

  // Form states matching MOD-002 specification
  const [budgetYear, setBudgetYear] = useState('2569');
  const [budgetCode, setBudgetCode] = useState('BG-69-ER-02');
  const [departmentName, setDepartmentName] = useState('กลุ่มงานเวชศาสตร์ฉุกเฉิน (Emergency Room)');
  const [budgetCategory, setBudgetCategory] = useState<BudgetPlanItem['budgetCategory']>(
    'งบลงทุน - ครุภัณฑ์การแพทย์ (Capital Medical Equipment)'
  );
  const [fundSource, setFundSource] = useState<BudgetPlanItem['fundSource']>(
    'เงินบำรุงโรงพยาบาล (รายรับค่ารักษา)'
  );
  const [projectName, setProjectName] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attachmentName, setAttachmentName] = useState('TOR_และใบเสนอราคาอ้างอิง_2569.pdf');
  const [status, setStatus] = useState<BudgetPlanItem['status']>('PENDING_APPROVAL');

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const reqVal = Number(requestedAmount) || 0;
    const appVal = Number(approvedAmount) || reqVal;

    addBudgetPlan({
      budgetYear,
      budgetCode,
      departmentCode: budgetCode.split('-')[2] || 'DEPT',
      departmentName,
      budgetCategory,
      fundSource,
      projectName: projectName || 'โครงการพัฒนาศักยภาพบริการทางการแพทย์ประจำปี',
      requestedAmount: reqVal,
      approvedAmount: status === 'APPROVED' || status === 'ALLOCATED' ? appVal : 0,
      allocatedAmount: 0,
      reservedAmount: 0,
      commitmentAmount: 0,
      actualAmount: 0,
      purpose: purpose || 'รองรับปริมาณผู้ป่วยและมาตรฐาน HA ของโรงพยาบาล',
      attachmentName,
      status,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    setShowCreateModal(false);
    setProjectName('');
    setRequestedAmount('');
    setApprovedAmount('');
    setPurpose('');
  };

  const filteredPlans = plans.filter((p) => {
    const matchSearch =
      p.budgetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'PENDING') {
      return matchSearch && (p.status === 'PENDING_APPROVAL' || p.status === 'DRAFT');
    }
    return matchSearch;
  });

  const planningAudits = audits.filter((a) => a.module === 'BUDGET_PLANNING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            MOD-002 • BUDGET PLANNING
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            02. จัดทำงบประมาณประจำปี (Budget Planning)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            สร้างแผนคำของบประมาณรายหน่วยงาน แยกตามหมวดหมู่ แหล่งเงิน โครงการ แนบเอกสารประกอบ และส่งขออนุมัติ
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          สร้างคำของบประมาณประจำปี
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">แผนคำของบทั้งหมด (ปี 2569)</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{plans.length} โครงการ</div>
          <p className="text-[11px] text-slate-400 mt-0.5">ครอบคลุมทุกกลุ่มงานหลัก</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">วงเงินที่เสนอขอรวม (Requested)</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            ฿{plans.reduce((s, p) => s + p.requestedAmount, 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">ประมาณการรายจ่ายรวมทุกแผนก</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-xs text-emerald-700 font-bold">วงเงินที่อนุมัติแล้ว (Approved)</span>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">
            ฿{plans.reduce((s, p) => s + p.approvedAmount, 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 mt-0.5">กรอบวงเงิน 50.00 ลบ.</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-xs text-amber-700 font-bold">รอพิจารณาอนุมัติ (Pending)</span>
          <div className="text-xl font-extrabold text-amber-600 mt-1">
            {plans.filter((p) => p.status === 'PENDING_APPROVAL' || p.status === 'DRAFT').length} รายการ
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">สามารถกดอนุมัติได้ในตารางด้านล่าง</p>
        </div>
      </div>

      {/* Sub-navigation Tabs matching Sitemap 02 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              แผนงบประมาณประจำปี ({plans.length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'PENDING'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ส่งแผนงบประมาณอนุมัติ
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'HISTORY'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              ประวัติแผนงบประมาณ ({planningAudits.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหารหัสงบ, แผนก, โครงการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {activeTab !== 'HISTORY' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <th className="py-3.5 px-4">ปี / รหัสงบประมาณ</th>
                  <th className="py-3.5 px-4">หน่วยงานที่ขอ (Department)</th>
                  <th className="py-3.5 px-4">หมวดงบประมาณ & แหล่งเงิน</th>
                  <th className="py-3.5 px-4">โครงการ / วัตถุประสงค์</th>
                  <th className="py-3.5 px-4 text-right">วงเงินที่ขอ</th>
                  <th className="py-3.5 px-4 text-right">วงเงินที่อนุมัติ</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                  <th className="py-3.5 px-4 text-right">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPlans.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        ปี {p.budgetYear}
                      </span>
                      <div className="font-bold text-slate-900 mt-1">{p.budgetCode}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{p.departmentName}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{p.budgetCategory}</div>
                      <div className="text-[11px] text-emerald-700 font-medium">{p.fundSource}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{p.projectName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{p.purpose}</div>
                      {p.attachmentName && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-blue-600 mt-1 font-medium">
                          <Paperclip className="w-3 h-3" /> {p.attachmentName}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                      ฿{p.requestedAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700">
                      ฿{p.approvedAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.status === 'ALLOCATED' || p.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedPlan(p)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px]"
                      >
                        รายละเอียด
                      </button>
                      {p.status === 'DRAFT' && (
                        <button
                          onClick={() => updatePlanStatus(p.id, 'PENDING_APPROVAL')}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px]"
                        >
                          ส่งขออนุมัติ
                        </button>
                      )}
                      {p.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => updatePlanStatus(p.id, 'APPROVED')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                        >
                          อนุมัติแผน
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {planningAudits.map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-emerald-700 mr-2">[{a.action}]</span>
                  <span className="font-semibold text-slate-900">{a.docNo}</span> —{' '}
                  <span className="text-slate-600">{a.detail}</span>
                </div>
                <div className="text-slate-400 text-[11px] shrink-0">
                  {a.timestamp} • {a.actor}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: รายละเอียดคำของบประมาณ & ประมาณการรายจ่าย */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase">
                  รายละเอียดคำของบประมาณ (MOD-002)
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedPlan.budgetCode} • ปีงบประมาณ {selectedPlan.budgetYear}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4 text-xs">
              <div>
                <span className="text-slate-400">หน่วยงานที่ขอ (Department):</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPlan.departmentName}</p>
              </div>
              <div>
                <span className="text-slate-400">หมวดงบประมาณ (Budget Category):</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPlan.budgetCategory}</p>
              </div>
              <div>
                <span className="text-slate-400">แหล่งเงิน (Fund Source):</span>
                <p className="font-bold text-emerald-700 mt-0.5">{selectedPlan.fundSource}</p>
              </div>
              <div>
                <span className="text-slate-400">สถานะแผน (Status):</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPlan.status}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">ชื่อโครงการ / กิจกรรม (Project):</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedPlan.projectName}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">เหตุผลและความจำเป็น (Purpose):</span>
                <p className="text-slate-700 mt-0.5">{selectedPlan.purpose}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">วงเงินที่ขอ (Requested Amount)</span>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  ฿{selectedPlan.requestedAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700">วงเงินที่อนุมัติ (Approved Amount)</span>
                <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                  ฿{selectedPlan.approvedAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: สร้างแผนงบประมาณประจำปี (ครบ 10 ฟิลด์ตามสเปค MOD-002) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-600">MOD-002 • CREATE BUDGET PLAN</span>
                <h3 className="text-lg font-bold text-slate-900">
                  สร้างคำของบประมาณประจำปีใหม่
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    1. ปีงบประมาณ (Budget Year)
                  </label>
                  <select
                    value={budgetYear}
                    onChange={(e) => setBudgetYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="2569">2569</option>
                    <option value="2570">2570</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    2. รหัสงบประมาณ (Budget Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={budgetCode}
                    onChange={(e) => setBudgetCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    10. สถานะคำขอ (Status)
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BudgetPlanItem['status'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="DRAFT">DRAFT (ร่างแผนงบ)</option>
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL (ส่งขออนุมัติ)</option>
                    <option value="APPROVED">APPROVED (อนุมัติวงเงินทันที)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    3. หน่วยงานที่ขอ (Department)
                  </label>
                  <input
                    type="text"
                    required
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    4. หมวดงบประมาณ (Budget Category)
                  </label>
                  <select
                    value={budgetCategory}
                    onChange={(e) =>
                      setBudgetCategory(e.target.value as BudgetPlanItem['budgetCategory'])
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="งบดำเนินงาน - ยาและเวชภัณฑ์ (Medical Supplies)">
                      งบดำเนินงาน - ยาและเวชภัณฑ์ (Medical Supplies)
                    </option>
                    <option value="งบลงทุน - ครุภัณฑ์การแพทย์ (Capital Medical Equipment)">
                      งบลงทุน - ครุภัณฑ์การแพทย์ (Capital Medical Equipment)
                    </option>
                    <option value="งบบุคลากร (Personnel)">งบบุคลากร (Personnel)</option>
                    <option value="งบสาธารณูปโภคและซ่อมบำรุง (Facility & Maintenance)">
                      งบสาธารณูปโภคและซ่อมบำรุง (Facility & Maintenance)
                    </option>
                    <option value="งบพัฒนาวิชาชีพและวิจัย (Training & R&D)">
                      งบพัฒนาวิชาชีพและวิจัย (Training & R&D)
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    5. แหล่งเงิน (Fund Source)
                  </label>
                  <select
                    value={fundSource}
                    onChange={(e) => setFundSource(e.target.value as BudgetPlanItem['fundSource'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="เงินบำรุงโรงพยาบาล (รายรับค่ารักษา)">
                      เงินบำรุงโรงพยาบาล (รายรับค่ารักษา)
                    </option>
                    <option value="เงินงบประมาณแผ่นดิน">เงินงบประมาณแผ่นดิน</option>
                    <option value="เงินกองทุน สปสช. / ประกันสังคม">
                      เงินกองทุน สปสช. / ประกันสังคม
                    </option>
                    <option value="เงินบริจาคเพื่อการกุศล">เงินบริจาคเพื่อการกุศล</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    6. โครงการ / กิจกรรม (Project)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ระบุชื่อโครงการหรือกิจกรรม..."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    7. วงเงินที่ขอ (Requested Amount - บาท)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="เช่น 2500000"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    8. วงเงินที่อนุมัติ (Approved Amount - บาท)
                  </label>
                  <input
                    type="number"
                    placeholder="เว้นว่างไว้หากรออนุมัติ"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  9. เหตุผลและความจำเป็น (Purpose)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="ระบุเหตุผลความจำเป็นในการตั้งคำของบประมาณ..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  แนบเอกสารประกอบคำขอ (TOR / ใบเสนอราคา / แผนปฏิบัติการ)
                </label>
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  บันทึกคำของบประมาณ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

