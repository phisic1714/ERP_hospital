const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedProcurement() {
  console.log('Seeding PP (Procurement Plans) and PR (Purchase Requisitions)...');

  // Check if items exist
  const items = await prisma.item.findMany();
  if (items.length === 0) {
    console.log('No items found. Please run main seed first.');
    return;
  }

  const gloveItem = items.find((i) => i.itemCode === 'SUP-001') || items[0];
  const maskItem = items.find((i) => i.itemCode === 'SUP-002') || items[1];
  const paraItem = items.find((i) => i.itemCode === 'MED-002') || items[2];
  const salineItem = items.find((i) => i.itemCode === 'MED-001') || items[3];
  const alcItem = items.find((i) => i.itemCode === 'GEN-001') || items[4];

  // 1. Create Procurement Plans (PP)
  const pp1 = await prisma.procurementPlan.upsert({
    where: { planNumber: 'PP-2026-0001' },
    update: {},
    create: {
      planNumber: 'PP-2026-0001',
      fiscalYear: 2569,
      name: 'แผนจัดซื้อยาและเวชภัณฑ์ทางการแพทย์ ประจำปีงบประมาณ 2569',
      categoryCode: 'ALL',
      allocatedBudget: 2500000.0,
      committedBudget: 585000.0,
      remainingBudget: 1915000.0,
      status: 'ACTIVE',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2027-09-30'),
      remarks: 'แผนจัดซื้อยาหลักและเวชภัณฑ์สิ้นเปลืองประจำปีงบประมาณ 2569 (ฝ่ายเภสัชกรรมและคลังกลาง)',
      createdBy: 'ภก.สมชาย วิจิตรศิลป์ (หัวหน้าฝ่ายเภสัชกรรม)',
      approvedBy: 'นพ.เกรียงไกร ชัยเจริญ (ผู้อำนวยการโรงพยาบาล)',
      approvedAt: new Date('2026-09-25'),
      lines: {
        create: [
          {
            itemId: salineItem.id,
            targetQuantity: 10000,
            estimatedUnitPrice: 35.0,
            estimatedTotal: 350000.0,
            usedQuantity: 2000,
            usedBudget: 70000.0,
          },
          {
            itemId: paraItem.id,
            targetQuantity: 3000,
            estimatedUnitPrice: 120.0,
            estimatedTotal: 360000.0,
            usedQuantity: 500,
            usedBudget: 60000.0,
          },
          {
            itemId: gloveItem.id,
            targetQuantity: 2500,
            estimatedUnitPrice: 180.0,
            estimatedTotal: 450000.0,
            usedQuantity: 400,
            usedBudget: 72000.0,
          },
          {
            itemId: maskItem.id,
            targetQuantity: 5000,
            estimatedUnitPrice: 65.0,
            estimatedTotal: 325000.0,
            usedQuantity: 1000,
            usedBudget: 65000.0,
          },
        ],
      },
    },
  });

  const pp2 = await prisma.procurementPlan.upsert({
    where: { planNumber: 'PP-2026-0002' },
    update: {},
    create: {
      planNumber: 'PP-2026-0002',
      fiscalYear: 2569,
      name: 'แผนจัดซื้อวัสดุทำความสะอาดและน้ำยาฆ่าเชื้อ ประจำไตรมาส 1/2569',
      categoryCode: 'GEN',
      allocatedBudget: 650000.0,
      committedBudget: 90000.0,
      remainingBudget: 560000.0,
      status: 'ACTIVE',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-31'),
      remarks: 'จัดซื้อน้ำยาฆ่าเชื้อ แอลกอฮอล์ และวัสดุสิ้นเปลืองสำหรับทุกหอผู้ป่วย',
      createdBy: 'สมศักดิ์ ขยันงาน (เจ้าหน้าที่จัดซื้อ)',
      approvedBy: 'นพ.เกรียงไกร ชัยเจริญ (ผู้อำนวยการโรงพยาบาล)',
      approvedAt: new Date('2026-09-28'),
      lines: {
        create: [
          {
            itemId: alcItem.id,
            targetQuantity: 2000,
            estimatedUnitPrice: 45.0,
            estimatedTotal: 90000.0,
            usedQuantity: 400,
            usedBudget: 18000.0,
          },
        ],
      },
    },
  });

  // 2. Create Purchase Requisitions (PR)
  // PR-1: Approved, ready to convert to PO
  const pr1 = await prisma.purchaseRequisition.upsert({
    where: { prNumber: 'PR-202610-0001' },
    update: {},
    create: {
      prNumber: 'PR-202610-0001',
      planId: pp1.id,
      requestDate: new Date('2026-10-16'),
      requiredDate: new Date('2026-10-25'),
      urgency: 'NORMAL',
      totalAmount: 48500.0,
      status: 'APPROVED',
      justification: 'ขอสั่งซื้อเวชภัณฑ์สำหรับสต็อกสำรองประจำห้องผ่าตัด (OR) และห้องฉุกเฉิน (ER)',
      requesterName: 'วิภาดา รักษาดี (พยาบาลหัวหน้าห้องผ่าตัด)',
      approvedBy: 'ภก.สมชาย วิจิตรศิลป์ (ผู้จัดการคลังสินค้า)',
      approvedAt: new Date('2026-10-17'),
      lines: {
        create: [
          {
            itemId: gloveItem.id,
            currentStock: 120,
            reorderPoint: 300,
            requestedQty: 150,
            approvedQty: 150,
            estimatedUnitPrice: 180.0,
            estimatedTotal: 27000.0,
            status: 'APPROVED',
          },
          {
            itemId: maskItem.id,
            currentStock: 450,
            reorderPoint: 800,
            requestedQty: 300,
            approvedQty: 300,
            estimatedUnitPrice: 65.0,
            estimatedTotal: 19500.0,
            status: 'APPROVED',
          },
          {
            itemId: alcItem.id,
            currentStock: 450,
            reorderPoint: 250,
            requestedQty: 40,
            approvedQty: 40,
            estimatedUnitPrice: 45.0,
            estimatedTotal: 1800.0,
            status: 'APPROVED',
          },
        ],
      },
    },
  });

  // PR-2: Pending Approval (Urgent: Paracetamol stock alert)
  const pr2 = await prisma.purchaseRequisition.upsert({
    where: { prNumber: 'PR-202610-0002' },
    update: {},
    create: {
      prNumber: 'PR-202610-0002',
      planId: pp1.id,
      requestDate: new Date('2026-10-19'),
      requiredDate: new Date('2026-10-23'),
      urgency: 'URGENT',
      totalAmount: 36000.0,
      status: 'PENDING_APPROVAL',
      justification: 'ด่วนมาก: Paracetamol 500mg สต็อกเหลือต่ำกว่าจุดสั่งซื้อฉุกเฉิน (ROP 500, มีอยู่ 80 กระปุก)',
      requesterName: 'มนัสวี สุขเกษม (เจ้าหน้าที่คลังสินค้า)',
      lines: {
        create: [
          {
            itemId: paraItem.id,
            currentStock: 80,
            reorderPoint: 500,
            requestedQty: 300,
            approvedQty: 0,
            estimatedUnitPrice: 120.0,
            estimatedTotal: 36000.0,
            status: 'PENDING',
          },
        ],
      },
    },
  });

  // PR-3: Already converted to PO-202610-0001
  const existingPO = await prisma.procurementPO.findFirst({
    where: { poNumber: 'PO-202610-0001' },
  });

  const pr3 = await prisma.purchaseRequisition.upsert({
    where: { prNumber: 'PR-202610-0003' },
    update: {},
    create: {
      prNumber: 'PR-202610-0003',
      planId: pp1.id,
      requestDate: new Date('2026-10-12'),
      requiredDate: new Date('2026-10-20'),
      urgency: 'NORMAL',
      totalAmount: 90000.0,
      status: 'PO_CREATED',
      justification: 'จัดซื้อยาและเวชภัณฑ์ประจำรอบส่งมอบสัปดาห์ที่ 3',
      requesterName: 'สมศักดิ์ ขยันงาน (เจ้าหน้าที่จัดซื้อ)',
      approvedBy: 'ภก.สมชาย วิจิตรศิลป์ (ผู้จัดการคลังสินค้า)',
      approvedAt: new Date('2026-10-13'),
      lines: {
        create: [
          {
            itemId: gloveItem.id,
            currentStock: 120,
            reorderPoint: 300,
            requestedQty: 300,
            approvedQty: 300,
            estimatedUnitPrice: 180.0,
            estimatedTotal: 54000.0,
            status: 'APPROVED',
          },
          {
            itemId: maskItem.id,
            currentStock: 450,
            reorderPoint: 800,
            requestedQty: 500,
            approvedQty: 500,
            estimatedUnitPrice: 65.0,
            estimatedTotal: 32500.0,
            status: 'APPROVED',
          },
        ],
      },
    },
  });

  if (existingPO) {
    await prisma.procurementPO.update({
      where: { id: existingPO.id },
      data: {
        prId: pr3.id,
        prNumber: pr3.prNumber,
      },
    });
  }

  // Update sequences
  await prisma.documentSequence.upsert({
    where: { prefix_yearMonth: { prefix: 'PP', yearMonth: '2026' } },
    update: { currentSequence: 2 },
    create: { prefix: 'PP', yearMonth: '2026', currentSequence: 2 },
  });

  await prisma.documentSequence.upsert({
    where: { prefix_yearMonth: { prefix: 'PR', yearMonth: '202610' } },
    update: { currentSequence: 3 },
    create: { prefix: 'PR', yearMonth: '202610', currentSequence: 3 },
  });

  console.log('PP & PR Seed complete!');
}

seedProcurement()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
