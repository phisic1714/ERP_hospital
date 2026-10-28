export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      pendingPRs,
      pendingGRs,
      pendingIssues,
      pendingTransfers,
      pendingAdjustments,
      lowStockCount,
      nearExpiryCount,
      totalItems,
      totalStock,
      totalPOs,
      activePlans,
    ] = await Promise.all([
      prisma.purchaseRequisition.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.goodsReceipt.count({ where: { status: 'DRAFT' } }),
      prisma.stockIssue.count({ where: { status: { in: ['SUBMITTED', 'PENDING_APPROVAL'] } } }),
      prisma.stockTransfer.count({ where: { status: { in: ['PENDING_APPROVAL', 'IN_TRANSIT'] } } }),
      prisma.stockAdjustment.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.stockBalance.count({ where: { available: { lte: 100 } } }),
      prisma.lot.count({
        where: {
          status: 'ACTIVE',
          expiryDate: {
            lte: new Date(Date.now() + 90 * 24 * 3600 * 1000),
          },
        },
      }),
      prisma.item.count({ where: { active: true } }),
      prisma.stockBalance.aggregate({ _sum: { onHand: true } }),
      prisma.procurementPO.count(),
      prisma.procurementPlan.count({ where: { status: 'ACTIVE' } }),
    ]);

    const totalPending = pendingPRs + pendingGRs + pendingIssues + pendingTransfers + pendingAdjustments;

    return NextResponse.json({
      portalSummary: {
        totalTasks: 24,
        inProgressTasks: 8,
        pendingApprovals: totalPending || 6,
        completedTasks: 10,
        updateTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      },
      actionItems: [
        {
          id: 'action-pr',
          title: 'รออนุมัติใบขอซื้อ (PR)',
          subtitle: 'คำขอซื้อยาและเวชภัณฑ์เร่งด่วน',
          count: pendingPRs,
          system: 'จัดซื้อจัดจ้าง',
          href: '/procurement/requisitions',
          urgent: pendingPRs > 0,
        },
        {
          id: 'action-issue',
          title: 'รออนุมัติใบเบิกสินค้า (Stock Issue)',
          subtitle: 'คำขอเบิกจากหอผู้ป่วย OPD/ER/IPD',
          count: pendingIssues,
          system: 'คลังสินค้าและพัสดุ',
          href: '/issue',
          urgent: pendingIssues > 0,
        },
        {
          id: 'action-gr',
          title: 'เอกสารรอการตรวจรับ (Pending Inspection)',
          subtitle: 'รอตรวจรับของจริงและบันทึก Lot เข้าคลัง',
          count: pendingGRs,
          system: 'คลังสินค้าและพัสดุ',
          href: '/receiving',
          urgent: false,
        },
        {
          id: 'action-transfer',
          title: 'สินค้าระหว่างขนส่ง (In-Transit Transfers)',
          subtitle: 'รอคลังปลายทางกดยืนยันรับเข้า',
          count: pendingTransfers,
          system: 'คลังสินค้าและพัสดุ',
          href: '/transfer',
          urgent: false,
        },
        {
          id: 'action-expiry',
          title: 'สินค้าใกล้หมดอายุ (< 90 วัน)',
          subtitle: 'ต้องเร่งจ่ายตาม FEFO',
          count: nearExpiryCount,
          system: 'คลังสินค้าและพัสดุ',
          href: '/lots',
          urgent: nearExpiryCount > 0,
        },
      ],
      systemMetrics: {
        totalItems,
        totalStockQty: totalStock._sum.onHand || 0,
        totalPOs,
        activePlans,
        lowStockCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching portal summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
