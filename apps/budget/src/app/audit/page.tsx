'use client';

import React, { useState } from 'react';
import { useBudget } from '@erp/app-context';
import { History, Search, ShieldCheck } from 'lucide-react';

export default function BudgetAuditLogPage() {
  const { audits } = useBudget();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const filtered = audits.filter((a) => {
    const matchModule = moduleFilter === 'ALL' || a.module === moduleFilter;
    const matchText =
      a.docNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.actor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchModule && matchText;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <History className="w-3.5 h-3.5" />
            MOD-007 • BUDGET AUDIT TRAIL
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            ประวัติธุรกรรมงบประมาณ (Budget Audit Log)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกทุกการเปลี่ยนแปลงของแผนงบประมาณ การจัดสรร การโอนงบ การกันงบ และการตัดยอดภาระผูกพันเป็นค่าใช้จ่ายจริง
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 'BUDGET_PLANNING', label: 'จัดทำงบ (Planning)' },
              { id: 'BUDGET_ALLOCATION', label: 'จัดสรรงบ (Allocation)' },
              { id: 'BUDGET_ADJUSTMENT', label: 'โอน/ปรับปรุง (Adjustment)' },
              { id: 'BUDGET_CONTROL', label: 'ควบคุมวงเงิน (Control)' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setModuleFilter(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  moduleFilter === m.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่เอกสาร, ผู้ทำรายการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-4">วัน-เวลา (Timestamp)</th>
                <th className="py-3.5 px-4">โมดูล (Module)</th>
                <th className="py-3.5 px-4">การกระทำ (Action)</th>
                <th className="py-3.5 px-4">รหัสอ้างอิง</th>
                <th className="py-3.5 px-4">รายละเอียดธุรกรรม</th>
                <th className="py-3.5 px-4">ผู้ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{a.timestamp}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      {a.module}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{a.action}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{a.docNo}</td>
                  <td className="py-3.5 px-4 text-slate-700">{a.detail}</td>
                  <td className="py-3.5 px-4 text-slate-500">{a.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

