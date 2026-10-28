const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSourcing() {
  console.log('Seeding RFQs, Quotations, and Comparison data...');

  const suppliers = await prisma.supplier.findMany();
  const items = await prisma.item.findMany();
  if (suppliers.length < 3 || items.length < 2) {
    console.log('Missing suppliers or items to seed sourcing');
    return;
  }

  const s1 = suppliers[0]; // ไทยเมดิคอล ซัพพลาย
  const s2 = suppliers[1]; // ฟาร์มาเทค
  const s3 = suppliers[2]; // โรงพยาบาลภัณฑ์

  const item1 = items[0];
  const item2 = items[1];

  // 1. Seed RFQ-202610-0001 (Awarded state, ready for PO creation demo)
  const existing1 = await prisma.rFQ.findUnique({ where: { rfqNumber: 'RFQ-202610-0001' } });
  if (!existing1) {
    const rfq1 = await prisma.rFQ.create({
      data: {
        rfqNumber: 'RFQ-202610-0001',
        title: 'ขอใบเสนอราคาเวชภัณฑ์และถุงมือตรวจโรค ประจำไตรมาส 1/2570',
        issueDate: new Date('2026-10-15'),
        dueDate: new Date('2026-10-25'),
        status: 'AWARDED',
        remarks: 'จัดซื้อตามกรอบงบประมาณเวชภัณฑ์สิ้นเปลืองประจำไตรมาส ยืนราคา 60 วัน',
        createdBy: 'วิชัย เกียรติบูรพา (System Admin)',
        selectionCriteria: 'LOWEST_PRICE',
        selectionReason: 'เสนอราคาต่ำสุดที่ ฿32,500 ประหยัดกว่าราคากลาง 15.6% คุณสมบัติตรงตามข้อกำหนดและส่งมอบได้ภายใน 5 วัน',
        comparedBy: 'คณะกรรมการจัดซื้อ (เภสัชกรรมและคลัง)',
        comparedAt: new Date('2026-10-22'),
        lines: {
          create: [
            {
              itemId: item1.id,
              quantity: 200,
              estimatedUnitPrice: item1.standardCost || 100,
              specification: 'เกรดทางการแพทย์ มาตรฐาน มอก. / อย.',
            },
            {
              itemId: item2.id,
              quantity: 150,
              estimatedUnitPrice: item2.standardCost || 120,
              specification: 'บรรจุกล่องละ 50 ชิ้น ได้รับรอง ISO 13485',
            },
          ],
        },
        suppliers: {
          create: [
            { supplierId: s1.id, status: 'RESPONDED' },
            { supplierId: s2.id, status: 'RESPONDED' },
            { supplierId: s3.id, status: 'RESPONDED' },
          ],
        },
      },
      include: { lines: true },
    });

    // Quotation 1 (Winner - Lowest price)
    const q1 = await prisma.quotation.create({
      data: {
        quotationNumber: 'QT-202610-0001',
        supplierQuoteRef: 'QO-TM-69/108',
        rfqId: rfq1.id,
        supplierId: s1.id,
        quoteDate: new Date('2026-10-18'),
        validUntil: new Date('2026-11-30'),
        deliveryDays: 5,
        paymentTerm: 'Credit 30 วัน',
        warranty: 'รับประกันคุณภาพ 1 ปี นับจากวันส่งมอบ',
        qualityScore: 4.8,
        totalAmount: 32500,
        status: 'SELECTED',
        createdBy: 'เจ้าหน้าที่จัดซื้อ',
        lines: {
          create: [
            {
              rfqLineId: rfq1.lines[0].id,
              itemId: item1.id,
              quantity: 200,
              unitPrice: 85,
              totalAmount: 17000,
              brand: 'MediGlove Pro',
            },
            {
              rfqLineId: rfq1.lines[1].id,
              itemId: item2.id,
              quantity: 150,
              unitPrice: 103.33,
              totalAmount: 15500,
              brand: 'Surgical Guard Plus',
            },
          ],
        },
      },
    });

    // Quotation 2 (Higher price, good brand)
    await prisma.quotation.create({
      data: {
        quotationNumber: 'QT-202610-0002',
        supplierQuoteRef: 'PHARM-2026-992',
        rfqId: rfq1.id,
        supplierId: s2.id,
        quoteDate: new Date('2026-10-19'),
        validUntil: new Date('2026-11-20'),
        deliveryDays: 7,
        paymentTerm: 'Credit 60 วัน',
        warranty: 'รับประกันอายุยา/เวชภัณฑ์ ≥ 2 ปี',
        qualityScore: 4.5,
        totalAmount: 36000,
        status: 'NOT_SELECTED',
        createdBy: 'เจ้าหน้าที่จัดซื้อ',
        lines: {
          create: [
            {
              rfqLineId: rfq1.lines[0].id,
              itemId: item1.id,
              quantity: 200,
              unitPrice: 95,
              totalAmount: 19000,
              brand: 'PharmaFlex',
            },
            {
              rfqLineId: rfq1.lines[1].id,
              itemId: item2.id,
              quantity: 150,
              unitPrice: 113.33,
              totalAmount: 17000,
              brand: 'HealthShield',
            },
          ],
        },
      },
    });

    // Quotation 3 (Fast delivery)
    await prisma.quotation.create({
      data: {
        quotationNumber: 'QT-202610-0003',
        supplierQuoteRef: 'HOSP-QT-4410',
        rfqId: rfq1.id,
        supplierId: s3.id,
        quoteDate: new Date('2026-10-20'),
        validUntil: new Date('2026-11-15'),
        deliveryDays: 3,
        paymentTerm: 'Credit 30 วัน',
        warranty: 'รับประกันสินค้าชำรุดเปลี่ยนภายใน 7 วัน',
        qualityScore: 4.2,
        totalAmount: 38500,
        status: 'NOT_SELECTED',
        createdBy: 'เจ้าหน้าที่จัดซื้อ',
        lines: {
          create: [
            {
              rfqLineId: rfq1.lines[0].id,
              itemId: item1.id,
              quantity: 200,
              unitPrice: 100,
              totalAmount: 20000,
              brand: 'HospiCare Standard',
            },
            {
              rfqLineId: rfq1.lines[1].id,
              itemId: item2.id,
              quantity: 150,
              unitPrice: 123.33,
              totalAmount: 18500,
              brand: 'HospiGuard',
            },
          ],
        },
      },
    });

    // Link winner back to RFQ
    await prisma.rFQ.update({
      where: { id: rfq1.id },
      data: { selectedQuotationId: q1.id },
    });
    console.log('Seeded RFQ-202610-0001 (AWARDED with 3 Quotations)');
  }

  // 2. Seed RFQ-202610-0002 linked to PR-202610-0008 (Status: QUOTING, 1 quote in)
  const pr8 = await prisma.purchaseRequisition.findUnique({
    where: { prNumber: 'PR-202610-0008' },
    include: { lines: true },
  });

  const existing2 = await prisma.rFQ.findUnique({ where: { rfqNumber: 'RFQ-202610-0002' } });
  if (!existing2 && pr8) {
    const rfq2 = await prisma.rFQ.create({
      data: {
        rfqNumber: 'RFQ-202610-0002',
        prId: pr8.id,
        prNumber: pr8.prNumber,
        title: `ขอใบเสนอราคาตามใบขอซื้อ ${pr8.prNumber} (เวชภัณฑ์และน้ำยาฆ่าเชื้อ)`,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 86400000),
        status: 'QUOTING',
        remarks: 'ขอราคาเปรียบเทียบ 3 ราย ส่งมอบภายใน 7 วันหลังออก PO',
        createdBy: 'วิชัย เกียรติบูรพา (System Admin)',
        lines: {
          create: pr8.lines.map((l) => ({
            itemId: l.itemId,
            quantity: l.approvedQty || l.requestedQty,
            estimatedUnitPrice: l.estimatedUnitPrice,
            specification: 'มาตรฐานเภสัชกรรมโรงพยาบาล',
          })),
        },
        suppliers: {
          create: [
            { supplierId: s1.id, status: 'RESPONDED' },
            { supplierId: s2.id, status: 'INVITED' },
            { supplierId: s3.id, status: 'INVITED' },
          ],
        },
      },
      include: { lines: true },
    });

    // 1 quote received so far from Supplier 1
    const quoteLines = rfq2.lines.map((l) => ({
      rfqLineId: l.id,
      itemId: l.itemId,
      quantity: l.quantity,
      unitPrice: Math.round(l.estimatedUnitPrice * 0.95),
      totalAmount: Math.round(l.estimatedUnitPrice * 0.95) * l.quantity,
      brand: 'Alcohol Pure Solution',
    }));
    const total = quoteLines.reduce((s, l) => s + l.totalAmount, 0);

    await prisma.quotation.create({
      data: {
        quotationNumber: 'QT-202610-0004',
        supplierQuoteRef: 'TH-2610-044',
        rfqId: rfq2.id,
        supplierId: s1.id,
        quoteDate: new Date(),
        validUntil: new Date(Date.now() + 30 * 86400000),
        deliveryDays: 5,
        paymentTerm: 'Credit 30 วัน',
        warranty: 'รับประกัน 1 ปี',
        qualityScore: 4.6,
        totalAmount: total,
        status: 'RECEIVED',
        createdBy: 'เจ้าหน้าที่จัดซื้อ',
        lines: { create: quoteLines },
      },
    });
    console.log('Seeded RFQ-202610-0002 (QUOTING with 1 Quote, linked to PR-202610-0008)');
  }

  // Update sequences for RFQ and QT
  await prisma.documentSequence.upsert({
    where: { prefix_yearMonth: { prefix: 'RFQ', yearMonth: '202610' } },
    update: { currentSequence: { increment: 2 } },
    create: { prefix: 'RFQ', yearMonth: '202610', currentSequence: 2 },
  });
  await prisma.documentSequence.upsert({
    where: { prefix_yearMonth: { prefix: 'QT', yearMonth: '202610' } },
    update: { currentSequence: { increment: 4 } },
    create: { prefix: 'QT', yearMonth: '202610', currentSequence: 4 },
  });

  console.log('Sourcing seed complete!');
}

seedSourcing()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
