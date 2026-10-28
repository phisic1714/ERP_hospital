const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING HOSPITAL INVENTORY MANAGEMENT SYSTEM ---');

  // Clear existing
  await prisma.auditLog.deleteMany();
  await prisma.approvalTransaction.deleteMany();
  await prisma.documentSequence.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockCountLine.deleteMany();
  await prisma.stockCount.deleteMany();
  await prisma.stockAdjustmentLine.deleteMany();
  await prisma.stockAdjustment.deleteMany();
  await prisma.stockReturnLine.deleteMany();
  await prisma.stockReturn.deleteMany();
  await prisma.stockTransferLine.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.stockIssueLine.deleteMany();
  await prisma.stockIssue.deleteMany();
  await prisma.goodsReceiptLine.deleteMany();
  await prisma.goodsReceipt.deleteMany();
  await prisma.procurementPOLine.deleteMany();
  await prisma.procurementPO.deleteMany();
  await prisma.lot.deleteMany();
  await prisma.stockBalance.deleteMany();
  await prisma.unitConversion.deleteMany();
  await prisma.warehouseLocation.deleteMany();
  await prisma.item.deleteMany();
  await prisma.itemCategory.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.supplier.deleteMany();

  // 1. Departments
  console.log('1. Seeding Departments...');
  const opdDept = await prisma.department.create({
    data: { code: 'OPD', name: 'แผนกผู้ป่วยนอก (Outpatient Department)', location: 'อาคาร 1 ชั้น 1', contactPerson: 'พว. สมศรี ใจดี', phone: '02-123-4501' }
  });
  const ipdDept = await prisma.department.create({
    data: { code: 'IPD', name: 'แผนกผู้ป่วยใน (Inpatient Department)', location: 'อาคาร 2 ชั้น 3', contactPerson: 'พว. วิไลวรรณ สุขสม', phone: '02-123-4502' }
  });
  const erDept = await prisma.department.create({
    data: { code: 'ER', name: 'แผนกอุบัติเหตุฉุกเฉิน (Emergency Room)', location: 'อาคาร 1 ชั้น 1 (ฉุกเฉิน)', contactPerson: 'นพ. วรพจน์ มั่นคง', phone: '02-123-4503' }
  });
  const orDept = await prisma.department.create({
    data: { code: 'OR', name: 'แผนกห้องผ่าตัด (Operating Room)', location: 'อาคาร 2 ชั้น 4', contactPerson: 'พว. นันทกา รักษ์ศิริ', phone: '02-123-4504' }
  });
  const labDept = await prisma.department.create({
    data: { code: 'LAB', name: 'กลุ่มงานพยาธิวิทยาและเทคนิคการแพทย์ (Laboratory)', location: 'อาคาร 3 ชั้น 2', contactPerson: 'ทนพ. เอกชัย นามมั่น', phone: '02-123-4505' }
  });
  const pharmDept = await prisma.department.create({
    data: { code: 'PHARM', name: 'กลุ่มงานเภสัชกรรม (Pharmacy Department)', location: 'อาคาร 1 ชั้น 1', contactPerson: 'ภก. ธนกร มงคล', phone: '02-123-4506' }
  });

  // 2. Users with Roles
  console.log('2. Seeding Users (RBAC)...');
  const usersData = [
    { username: 'admin', name: 'วิชัย เกียรติบูรพา (System Admin)', email: 'admin@hospital.org', passwordHash: 'admin123', role: 'ADMIN', departmentId: null },
    { username: 'inv_manager', name: 'ดร. นิภา พัฒนพาณิชย์ (Inventory Manager)', email: 'manager@hospital.org', passwordHash: 'mgr123', role: 'INVENTORY_MGR', departmentId: null },
    { username: 'wh_officer', name: 'สมบัติ คลังมั่น (Warehouse Officer)', email: 'officer@hospital.org', passwordHash: 'officer123', role: 'WAREHOUSE_OFFICER', departmentId: null },
    { username: 'stock_ctrl', name: 'สุภาพร ตรวจสต็อก (Stock Controller)', email: 'controller@hospital.org', passwordHash: 'ctrl123', role: 'STOCK_CONTROLLER', departmentId: null },
    { username: 'req_opd', name: 'พว. กัลยา วงศ์ดี (OPD Requester)', email: 'req_opd@hospital.org', passwordHash: 'req123', role: 'DEPT_REQUESTER', departmentId: opdDept.id },
    { username: 'app_opd', name: 'นพ. อนุชา เกริกเกียรติ (OPD Approver / Head)', email: 'app_opd@hospital.org', passwordHash: 'app123', role: 'DEPT_APPROVER', departmentId: opdDept.id },
    { username: 'procurement', name: 'มณีรัตน์ จัดซื้อเลิศ (Procurement Officer)', email: 'procurement@hospital.org', passwordHash: 'proc123', role: 'PROCUREMENT', departmentId: null },
    { username: 'auditor', name: 'ชาญชัย ตรวจสอบ (Internal Auditor)', email: 'auditor@hospital.org', passwordHash: 'audit123', role: 'AUDITOR', departmentId: null },
  ];
  for (const u of usersData) {
    await prisma.user.create({ data: u });
  }

  // 3. Suppliers
  console.log('3. Seeding Suppliers...');
  const supThaiMed = await prisma.supplier.create({
    data: { code: 'SUP-001', name: 'บริษัท ไทยเมดิคอล ซัพพลาย จำกัด', taxId: '0105558012341', contactPerson: 'คุณอรรถพล เจริญ', phone: '02-888-1111', email: 'sales@thaimedsupply.co.th', address: '88/1 ถ.พหลโยธิน แขวงสามเสนใน เขตพญาไท กทม.', paymentTerm: 'Credit 30 Days' }
  });
  const supPharma = await prisma.supplier.create({
    data: { code: 'SUP-002', name: 'บริษัท ฟาร์มาเทค (ประเทศไทย) จำกัด', taxId: '0105559098765', contactPerson: 'คุณเกศินี สดใส', phone: '02-777-2222', email: 'contact@pharmatech.co.th', address: '123 ถ.สุขุมวิท 71 วัฒนา กทม.', paymentTerm: 'Credit 60 Days' }
  });
  const supGeneral = await prisma.supplier.create({
    data: { code: 'SUP-003', name: 'บริษัท โรงพยาบาลภัณฑ์และเวชภัณฑ์ทั่วไป จำกัด', taxId: '0105560055443', contactPerson: 'คุณวสันต์ มีทรัพย์', phone: '02-666-3333', email: 'vasan@hospitallogistics.com', address: '45/2 ถ.วิภาวดีรังสิต จตุจักร กทม.', paymentTerm: 'Credit 30 Days' }
  });

  // 4. Warehouses
  console.log('4. Seeding Warehouses...');
  const whMain = await prisma.warehouse.create({
    data: { code: 'MAIN', name: 'คลังกลางโรงพยาบาล (Central Warehouse)', type: 'MAIN', managerName: 'สมบัติ คลังมั่น', location: 'อาคารพัสดุกลาง ชั้น 1', storageCond: 'ควบคุมอุณหภูมิห้อง 20-25°C' }
  });
  const whOpd = await prisma.warehouse.create({
    data: { code: 'OPD', name: 'คลังย่อยแผนกผู้ป่วยนอก (OPD Sub-Warehouse)', type: 'DEPARTMENT', departmentId: opdDept.id, managerName: 'พว. กัลยา วงศ์ดี', location: 'อาคาร 1 ชั้น 1 ห้องพัสดุ OPD', storageCond: 'อุณหภูมิห้อง' }
  });
  const whIpd = await prisma.warehouse.create({
    data: { code: 'IPD', name: 'คลังย่อยแผนกผู้ป่วยใน (IPD Sub-Warehouse)', type: 'DEPARTMENT', departmentId: ipdDept.id, managerName: 'พว. วิไลวรรณ สุขสม', location: 'อาคาร 2 ชั้น 3 ห้องพัสดุ IPD', storageCond: 'อุณหภูมิห้อง' }
  });
  const whEr = await prisma.warehouse.create({
    data: { code: 'ER', name: 'คลังย่อยแผนกฉุกเฉิน (Emergency Sub-Warehouse)', type: 'DEPARTMENT', departmentId: erDept.id, managerName: 'นพ. วรพจน์ มั่นคง', location: 'อาคาร 1 ชั้น 1 ER Stock', storageCond: 'อุณหภูมิห้อง 24 ชม.' }
  });
  const whOr = await prisma.warehouse.create({
    data: { code: 'OR', name: 'คลังย่อยห้องผ่าตัด (OR Sub-Warehouse)', type: 'DEPARTMENT', departmentId: orDept.id, managerName: 'พว. นันทกา รักษ์ศิริ', location: 'อาคาร 2 ชั้น 4 OR Sterile Zone', storageCond: 'ควบคุมความชื้นและอุณหภูมิปลอดเชื้อ' }
  });
  const whLab = await prisma.warehouse.create({
    data: { code: 'LAB', name: 'คลังย่อยห้องแล็บ (Laboratory Sub-Warehouse)', type: 'DEPARTMENT', departmentId: labDept.id, managerName: 'ทนพ. เอกชัย นามมั่น', location: 'อาคาร 3 ชั้น 2 ห้องเตรียมน้ำยา', storageCond: 'อุณหภูมิห้องและตู้เย็น 2-8°C' }
  });

  // 5. Warehouse Locations Hierarchy
  console.log('5. Seeding Locations Hierarchy...');
  const locMainA = await prisma.warehouseLocation.create({
    data: { warehouseId: whMain.id, code: 'WH01-ZA-R01-S01-B01', zone: 'Zone A - เวชภัณฑ์ปลอดเชื้อ', rack: 'R01', shelf: 'S01', bin: 'B01' }
  });
  const locMainB = await prisma.warehouseLocation.create({
    data: { warehouseId: whMain.id, code: 'WH01-ZB-R02-S02-B01', zone: 'Zone B - ยาและสารน้ำ', rack: 'R02', shelf: 'S02', bin: 'B01' }
  });
  const locMainC = await prisma.warehouseLocation.create({
    data: { warehouseId: whMain.id, code: 'WH01-ZC-R03-S01-B01', zone: 'Zone C - วัสดุทั่วไป', rack: 'R03', shelf: 'S01', bin: 'B01' }
  });
  const locOpdA = await prisma.warehouseLocation.create({
    data: { warehouseId: whOpd.id, code: 'OPD-Z01-R01-S01-B01', zone: 'Zone Dispense', rack: 'R01', shelf: 'S01', bin: 'B01' }
  });
  const locErA = await prisma.warehouseLocation.create({
    data: { warehouseId: whEr.id, code: 'ER-Z01-R01-S01-B01', zone: 'Emergency Fast Rack', rack: 'R01', shelf: 'S01', bin: 'B01' }
  });

  // 6. Item Categories
  console.log('6. Seeding Item Categories...');
  const catMed = await prisma.itemCategory.create({
    data: { code: 'MED', name: 'ยาและเวชภัณฑ์ยา (Medicine)', description: 'เภสัชภัณฑ์ ยาเม็ด ยาฉีด สารน้ำ และยาควบคุม' }
  });
  const catSupplies = await prisma.itemCategory.create({
    data: { code: 'SUPPLY', name: 'เวชภัณฑ์และวัสดุการแพทย์ (Medical Supplies)', description: 'ถุงมือ ผ้าก๊อซ เข็มฉีดยา ชุดให้น้ำเกลือ วัสดุปลอดเชื้อ' }
  });
  const catGeneral = await prisma.itemCategory.create({
    data: { code: 'GEN', name: 'วัสดุทั่วไปและสำนักงาน (General Supplies)', description: 'น้ำยาทำความสะอาด แอลกอฮอล์ กระดาษ อุปกรณ์สำนักงาน' }
  });

  // 7. Items
  console.log('7. Seeding Items...');
  const items = [
    {
      itemCode: 'MED-001',
      itemName: 'Normal Saline Solution 0.9% 1,000 ml',
      genericName: 'Sodium Chloride 0.9% Injection',
      categoryId: catMed.id,
      subCategory: 'สารน้ำทางหลอดเลือดดำ',
      description: 'สารละลายน้ำเกลือ 0.9% ขนาด 1000 มล. ปลอดเชื้อ',
      unit: 'Bottle',
      purchaseUnit: 'Box',
      issueUnit: 'Bottle',
      conversionRate: 12.0,
      barcode: '8850123400018',
      minStock: 200,
      maxStock: 2000,
      reorderPoint: 400,
      safetyStock: 100,
      standardCost: 35.0,
      lotControl: true,
      expiryControl: true,
      temperatureReq: 'อุณหภูมิห้อง (20-25°C)'
    },
    {
      itemCode: 'MED-002',
      itemName: 'Paracetamol 500 mg Tablet',
      genericName: 'Paracetamol 500 mg',
      categoryId: catMed.id,
      subCategory: 'ยาลดไข้บรรเทาปวด',
      description: 'ยาพาราเซตามอล 500 มก. ชนิดเม็ด',
      unit: 'Box',
      purchaseUnit: 'Carton',
      issueUnit: 'Box',
      conversionRate: 50.0,
      barcode: '8850123400025',
      minStock: 50,
      maxStock: 500,
      reorderPoint: 100,
      safetyStock: 30,
      standardCost: 120.0,
      lotControl: true,
      expiryControl: true,
      temperatureReq: 'อุณหภูมิห้อง หลีกเลี่ยงแสงแดด'
    },
    {
      itemCode: 'MED-003',
      itemName: 'Ceftriaxone 1g Powder for Injection',
      genericName: 'Ceftriaxone Sodium 1g',
      categoryId: catMed.id,
      subCategory: 'ยาปฏิชีวนะ',
      description: 'ยาปฏิชีวนะกลุ่มเซฟาโลสปอริน ชนิดผงสำหรับฉีด',
      unit: 'Vial',
      purchaseUnit: 'Box',
      issueUnit: 'Vial',
      conversionRate: 10.0,
      barcode: '8850123400032',
      minStock: 100,
      maxStock: 800,
      reorderPoint: 200,
      safetyStock: 50,
      standardCost: 75.0,
      lotControl: true,
      expiryControl: true,
      temperatureReq: 'อุณหภูมิห้องไม่เกิน 25°C'
    },
    {
      itemCode: 'SUP-001',
      itemName: 'Examination Gloves Powder-Free (Size M)',
      genericName: 'Nitrile Medical Gloves Size M',
      categoryId: catSupplies.id,
      subCategory: 'ถุงมือตรวจโรค',
      description: 'ถุงมือยางสังเคราะห์ไนไตรล์ ชนิดไม่มีแป้ง ขนาด M (กล่องละ 100 ชิ้น)',
      unit: 'Box',
      purchaseUnit: 'Carton',
      issueUnit: 'Box',
      conversionRate: 10.0,
      barcode: '8850123400049',
      minStock: 300,
      maxStock: 3000,
      reorderPoint: 600,
      safetyStock: 150,
      standardCost: 180.0,
      lotControl: true,
      expiryControl: true,
      temperatureReq: 'เก็บในที่แห้งและเย็น หลีกเลี่ยงความร้อน'
    },
    {
      itemCode: 'SUP-002',
      itemName: 'Surgical Mask 3-Ply Medical Grade',
      genericName: 'Disposable Surgical Face Mask 3-Ply',
      categoryId: catSupplies.id,
      subCategory: 'หน้ากากอนามัย',
      description: 'หน้ากากอนามัยทางการแพทย์ 3 ชั้น ป้องกันละอองน้ำและเชื้อโรค (กล่องละ 50 ชิ้น)',
      unit: 'Box',
      purchaseUnit: 'Carton',
      issueUnit: 'Box',
      conversionRate: 40.0,
      barcode: '8850123400056',
      minStock: 200,
      maxStock: 2500,
      reorderPoint: 500,
      safetyStock: 100,
      standardCost: 65.0,
      lotControl: true,
      expiryControl: true,
      temperatureReq: 'อุณหภูมิห้อง'
    },
    {
      itemCode: 'SUP-003',
      itemName: 'Syringe 5 ml with Needle (Sterile)',
      genericName: 'Disposable Syringe 5 ml 22G',
      categoryId: catSupplies.id,
      subCategory: 'กระบอกฉีดยาและเข็ม',
      description: 'กระบอกฉีดยาขนาด 5 มล. พร้อมเข็ม ปลอดเชื้อ ชนิดใช้ครั้งเดียว (กล่องละ 100 ชิ้น)',
      unit: 'Box',
      purchaseUnit: 'Carton',
      issueUnit: 'Box',
      conversionRate: 10.0,
      barcode: '8850123400063',
      minStock: 150,
      maxStock: 1500,
      reorderPoint: 350,
      safetyStock: 80,
      standardCost: 220.0,
      lotControl: true,
      expiryControl: true,
      temperatureReq: 'อุณหภูมิห้อง'
    },
    {
      itemCode: 'SUP-004',
      itemName: 'Sterile Gauze Pad 3x3 inches (Pack of 5)',
      genericName: 'Gauze Pad 3x3 Sterile',
      categoryId: catSupplies.id,
      subCategory: 'ผ้าก๊อซทำแผล',
      description: 'ผ้าก๊อซปลอดเชื้อ ขนาด 3x3 นิ้ว ซองละ 5 แผ่น (กล่องละ 20 ซอง)',
      unit: 'Box',
      purchaseUnit: 'Carton',
      issueUnit: 'Box',
      conversionRate: 20.0,
      barcode: '8850123400070',
      minStock: 100,
      maxStock: 1000,
      reorderPoint: 250,
      safetyStock: 50,
      standardCost: 85.0,
      lotControl: true,
      expiryControl: true,
      temperatureReq: 'อุณหภูมิห้อง'
    },
    {
      itemCode: 'SUP-005',
      itemName: 'IV Infusion Set with Air Vent 20 Drops/ml',
      genericName: 'IV Administration Set',
      categoryId: catSupplies.id,
      subCategory: 'ชุดให้น้ำเกลือ',
      description: 'ชุดให้น้ำเกลือทางหลอดเลือดดำ มีตัวกรองอากาศ ปลอดเชื้อ',
      unit: 'Piece',
      purchaseUnit: 'Box',
      issueUnit: 'Piece',
      conversionRate: 50.0,
      barcode: '8850123400087',
      minStock: 250,
      maxStock: 2000,
      reorderPoint: 500,
      safetyStock: 120,
      standardCost: 28.0,
      lotControl: true,
      expiryControl: true,
      temperatureReq: 'อุณหภูมิห้อง'
    },
    {
      itemCode: 'GEN-001',
      itemName: 'Ethyl Alcohol 70% v/v (450 ml)',
      genericName: 'Alcohol Antiseptic Solution 70%',
      categoryId: catGeneral.id,
      subCategory: 'น้ำยาฆ่าเชื้อ',
      description: 'แอลกอฮอล์สำหรับฆ่าเชื้อและทำความสะอาดผิวหนัง ขนาด 450 มล.',
      unit: 'Bottle',
      purchaseUnit: 'Carton',
      issueUnit: 'Bottle',
      conversionRate: 24.0,
      barcode: '8850123400094',
      minStock: 100,
      maxStock: 1200,
      reorderPoint: 250,
      safetyStock: 60,
      standardCost: 45.0,
      lotControl: true,
      expiryControl: true,
      temperatureReq: 'เก็บให้พ้นประกายไฟและแสงแดด'
    },
    {
      itemCode: 'GEN-002',
      itemName: 'Povidone Iodine Antiseptic Solution 10% (30 ml)',
      genericName: 'Povidone Iodine 10%',
      categoryId: catGeneral.id,
      subCategory: 'น้ำยาฆ่าเชื้อทำแผล',
      description: 'โพวิโดน-ไอโอดีน 10% สำหรับใส่แผลสด ฆ่าเชื้อโรค',
      unit: 'Bottle',
      purchaseUnit: 'Box',
      issueUnit: 'Bottle',
      conversionRate: 20.0,
      barcode: '8850123400100',
      minStock: 80,
      maxStock: 600,
      reorderPoint: 150,
      safetyStock: 40,
      standardCost: 32.0,
      lotControl: true,
      expiryControl: true,
      temperatureReq: 'อุณหภูมิห้อง'
    }
  ];

  const createdItems = {};
  for (const it of items) {
    const itemRec = await prisma.item.create({ data: it });
    createdItems[it.itemCode] = itemRec;

    // Unit conversion
    if (it.purchaseUnit && it.conversionRate > 1) {
      await prisma.unitConversion.create({
        data: {
          itemId: itemRec.id,
          fromUnit: it.purchaseUnit,
          toUnit: it.unit,
          conversionRate: it.conversionRate
        }
      });
    }
  }

  // 8. Lots & Stock Balances across Warehouses
  console.log('8. Seeding Lots & Stock Balances (with FEFO test scenarios)...');
  const now = new Date();
  const d30 = new Date(now.getTime() + 30 * 24 * 3600 * 1000);   // Near expiry in 30 days!
  const d75 = new Date(now.getTime() + 75 * 24 * 3600 * 1000);   // Near expiry in 75 days!
  const d365 = new Date(now.getTime() + 365 * 24 * 3600 * 1000); // Healthy 1 year
  const d700 = new Date(now.getTime() + 700 * 24 * 3600 * 1000); // Fresh 2 years
  const dExpired = new Date(now.getTime() - 15 * 24 * 3600 * 1000); // Expired 15 days ago!

  // Lot scenarios for Gloves SUP-001:
  // 1. Lot GLO-2025-01: Expired (50 boxes) -> status EXPIRED
  // 2. Lot GLO-2026-01: Near expiry in 30 days (100 boxes) -> status ACTIVE (FEFO priority 1)
  // 3. Lot GLO-2026-02: Healthy 1 year (400 boxes, 50 reserved) -> status ACTIVE (FEFO priority 2)
  const gloveItem = createdItems['SUP-001'];
  await prisma.lot.create({
    data: {
      itemId: gloveItem.id,
      warehouseId: whMain.id,
      locationId: locMainA.id,
      lotNumber: 'GLO-2025-01',
      expiryDate: dExpired,
      initialQty: 50,
      currentQty: 50,
      expiredQty: 50,
      unitCost: 175.0,
      status: 'EXPIRED'
    }
  });
  await prisma.lot.create({
    data: {
      itemId: gloveItem.id,
      warehouseId: whMain.id,
      locationId: locMainA.id,
      lotNumber: 'GLO-2026-01',
      expiryDate: d30,
      initialQty: 100,
      currentQty: 100,
      unitCost: 180.0,
      status: 'ACTIVE'
    }
  });
  await prisma.lot.create({
    data: {
      itemId: gloveItem.id,
      warehouseId: whMain.id,
      locationId: locMainA.id,
      lotNumber: 'GLO-2026-02',
      expiryDate: d365,
      initialQty: 400,
      currentQty: 400,
      reservedQty: 50,
      unitCost: 180.0,
      status: 'ACTIVE'
    }
  });
  // Total OnHand for MAIN = 50(expired) + 100 + 400 = 550. Reserved = 50, Expired = 50. Available = 550 - 50(res) - 50(exp) = 450!
  await prisma.stockBalance.create({
    data: {
      itemId: gloveItem.id,
      warehouseId: whMain.id,
      onHand: 550,
      reserved: 50,
      available: 450,
      expired: 50,
      inTransit: 50,
      lastMovementAt: now
    }
  });

  // Gloves in OPD: 80 boxes available
  await prisma.lot.create({
    data: {
      itemId: gloveItem.id,
      warehouseId: whOpd.id,
      locationId: locOpdA.id,
      lotNumber: 'GLO-2026-02',
      expiryDate: d365,
      initialQty: 80,
      currentQty: 80,
      unitCost: 180.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: gloveItem.id,
      warehouseId: whOpd.id,
      onHand: 80,
      reserved: 0,
      available: 80,
      lastMovementAt: now
    }
  });

  // Gloves in ER: 30 boxes (Low stock!)
  await prisma.lot.create({
    data: {
      itemId: gloveItem.id,
      warehouseId: whEr.id,
      locationId: locErA.id,
      lotNumber: 'GLO-2026-02',
      expiryDate: d365,
      initialQty: 30,
      currentQty: 30,
      unitCost: 180.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: gloveItem.id,
      warehouseId: whEr.id,
      onHand: 30,
      reserved: 0,
      available: 30,
      lastMovementAt: now
    }
  });

  // Normal Saline (MED-001):
  const salineItem = createdItems['MED-001'];
  await prisma.lot.create({
    data: {
      itemId: salineItem.id,
      warehouseId: whMain.id,
      locationId: locMainB.id,
      lotNumber: 'NS-26A01',
      expiryDate: d700,
      initialQty: 1200,
      currentQty: 1200,
      reservedQty: 100,
      unitCost: 35.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: salineItem.id,
      warehouseId: whMain.id,
      onHand: 1200,
      reserved: 100,
      available: 1100,
      lastMovementAt: now
    }
  });
  await prisma.lot.create({
    data: {
      itemId: salineItem.id,
      warehouseId: whEr.id,
      locationId: locErA.id,
      lotNumber: 'NS-26A01',
      expiryDate: d700,
      initialQty: 150,
      currentQty: 150,
      unitCost: 35.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: salineItem.id,
      warehouseId: whEr.id,
      onHand: 150,
      reserved: 0,
      available: 150,
      lastMovementAt: now
    }
  });

  // Paracetamol (MED-002) - Near Expiry Alert (d75)
  const paraItem = createdItems['MED-002'];
  await prisma.lot.create({
    data: {
      itemId: paraItem.id,
      warehouseId: whMain.id,
      locationId: locMainB.id,
      lotNumber: 'PARA-26B12',
      expiryDate: d75,
      initialQty: 80,
      currentQty: 80,
      unitCost: 120.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: paraItem.id,
      warehouseId: whMain.id,
      onHand: 80,
      reserved: 0,
      available: 80,
      lastMovementAt: now
    }
  });

  // Ceftriaxone (MED-003): Quarantine test lot
  const cefItem = createdItems['MED-003'];
  await prisma.lot.create({
    data: {
      itemId: cefItem.id,
      warehouseId: whMain.id,
      locationId: locMainB.id,
      lotNumber: 'CEF-26Q01',
      expiryDate: d365,
      initialQty: 50,
      currentQty: 50,
      quarantineQty: 50,
      unitCost: 75.0,
      status: 'QUARANTINE'
    }
  });
  await prisma.lot.create({
    data: {
      itemId: cefItem.id,
      warehouseId: whMain.id,
      locationId: locMainB.id,
      lotNumber: 'CEF-26C02',
      expiryDate: d700,
      initialQty: 300,
      currentQty: 300,
      unitCost: 75.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: cefItem.id,
      warehouseId: whMain.id,
      onHand: 350,
      reserved: 0,
      quarantine: 50,
      available: 300, // 350 - 50 quarantine
      lastMovementAt: now
    }
  });

  // Surgical Mask (SUP-002)
  const maskItem = createdItems['SUP-002'];
  await prisma.lot.create({
    data: {
      itemId: maskItem.id,
      warehouseId: whMain.id,
      locationId: locMainA.id,
      lotNumber: 'MSK-26M01',
      expiryDate: d700,
      initialQty: 800,
      currentQty: 800,
      unitCost: 65.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: maskItem.id,
      warehouseId: whMain.id,
      onHand: 800,
      reserved: 0,
      available: 800,
      lastMovementAt: now
    }
  });

  // Syringe 5ml (SUP-003)
  const syringeItem = createdItems['SUP-003'];
  await prisma.lot.create({
    data: {
      itemId: syringeItem.id,
      warehouseId: whMain.id,
      locationId: locMainA.id,
      lotNumber: 'SYR-26S01',
      expiryDate: d700,
      initialQty: 600,
      currentQty: 600,
      unitCost: 220.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: syringeItem.id,
      warehouseId: whMain.id,
      onHand: 600,
      reserved: 0,
      available: 600,
      lastMovementAt: now
    }
  });

  // Sterile Gauze (SUP-004)
  const gauzeItem = createdItems['SUP-004'];
  await prisma.lot.create({
    data: {
      itemId: gauzeItem.id,
      warehouseId: whMain.id,
      locationId: locMainA.id,
      lotNumber: 'GAU-26G01',
      expiryDate: d365,
      initialQty: 300,
      currentQty: 300,
      unitCost: 85.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: gauzeItem.id,
      warehouseId: whMain.id,
      onHand: 300,
      reserved: 0,
      available: 300,
      lastMovementAt: now
    }
  });

  // IV Set (SUP-005) - Low Stock!
  const ivItem = createdItems['SUP-005'];
  await prisma.lot.create({
    data: {
      itemId: ivItem.id,
      warehouseId: whMain.id,
      locationId: locMainA.id,
      lotNumber: 'IV-26I01',
      expiryDate: d365,
      initialQty: 180,
      currentQty: 180,
      unitCost: 28.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: ivItem.id,
      warehouseId: whMain.id,
      onHand: 180, // minStock is 250, so this triggers Low Stock!
      reserved: 0,
      available: 180,
      lastMovementAt: now
    }
  });

  // Alcohol 70% (GEN-001)
  const alcItem = createdItems['GEN-001'];
  await prisma.lot.create({
    data: {
      itemId: alcItem.id,
      warehouseId: whMain.id,
      locationId: locMainC.id,
      lotNumber: 'ALC-26A01',
      expiryDate: d365,
      initialQty: 450,
      currentQty: 450,
      unitCost: 45.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: alcItem.id,
      warehouseId: whMain.id,
      onHand: 450,
      reserved: 0,
      available: 450,
      lastMovementAt: now
    }
  });

  // Povidone Iodine (GEN-002)
  const povItem = createdItems['GEN-002'];
  await prisma.lot.create({
    data: {
      itemId: povItem.id,
      warehouseId: whMain.id,
      locationId: locMainC.id,
      lotNumber: 'POV-26P01',
      expiryDate: d700,
      initialQty: 250,
      currentQty: 250,
      unitCost: 32.0,
      status: 'ACTIVE'
    }
  });
  await prisma.stockBalance.create({
    data: {
      itemId: povItem.id,
      warehouseId: whMain.id,
      onHand: 250,
      reserved: 0,
      available: 250,
      lastMovementAt: now
    }
  });

  // 9. Initial Procurement POs
  console.log('9. Seeding Procurement Purchase Orders (POs)...');
  const po1 = await prisma.procurementPO.create({
    data: {
      poNumber: 'PO-202610-0001',
      supplierId: supThaiMed.id,
      orderDate: new Date(now.getTime() - 5 * 24 * 3600 * 1000),
      expectedDate: new Date(now.getTime() + 2 * 24 * 3600 * 1000),
      totalAmount: 90000.0,
      status: 'APPROVED',
      remarks: 'ใบสั่งซื้อเวชภัณฑ์ถุงมือและหน้ากากอนามัย ประจำงวดตุลาคม 2569 (พร้อมรับเข้าใน Goods Receipt)',
      createdBy: 'มณีรัตน์ จัดซื้อเลิศ',
      lines: {
        create: [
          {
            itemId: gloveItem.id,
            orderedQty: 300,
            receivedQty: 0,
            remainingQty: 300,
            unitPrice: 180.0,
            totalAmount: 54000.0,
            status: 'PENDING'
          },
          {
            itemId: maskItem.id,
            orderedQty: 500,
            receivedQty: 0,
            remainingQty: 500,
            unitPrice: 65.0,
            totalAmount: 32500.0,
            status: 'PENDING'
          },
          {
            itemId: syringeItem.id,
            orderedQty: 200,
            receivedQty: 0,
            remainingQty: 200,
            unitPrice: 220.0,
            totalAmount: 44000.0,
            status: 'PENDING'
          }
        ]
      }
    }
  });

  const po2 = await prisma.procurementPO.create({
    data: {
      poNumber: 'PO-202610-0002',
      supplierId: supPharma.id,
      orderDate: new Date(now.getTime() - 10 * 24 * 3600 * 1000),
      expectedDate: new Date(now.getTime() - 1 * 24 * 3600 * 1000),
      totalAmount: 110000.0,
      status: 'PARTIALLY_RECEIVED',
      remarks: 'ใบสั่งซื้อยาฉีด Ceftriaxone และน้ำเกลือ (รับเข้าบางส่วนแล้ว)',
      createdBy: 'มณีรัตน์ จัดซื้อเลิศ',
      lines: {
        create: [
          {
            itemId: salineItem.id,
            orderedQty: 2000,
            receivedQty: 1200,
            remainingQty: 800,
            unitPrice: 35.0,
            totalAmount: 70000.0,
            status: 'PARTIAL'
          },
          {
            itemId: cefItem.id,
            orderedQty: 500,
            receivedQty: 350,
            remainingQty: 150,
            unitPrice: 75.0,
            totalAmount: 37500.0,
            status: 'PARTIAL'
          }
        ]
      }
    }
  });

  // 10. Initial Goods Receipt (GR)
  console.log('10. Seeding Goods Receipts (GR)...');
  const gr1 = await prisma.goodsReceipt.create({
    data: {
      grNumber: 'GR-202610-0001',
      poId: po2.id,
      poNumber: 'PO-202610-0002',
      supplierId: supPharma.id,
      warehouseId: whMain.id,
      receivingDate: new Date(now.getTime() - 3 * 24 * 3600 * 1000),
      status: 'POSTED',
      inspectionNotes: 'ตรวจรับเรียบร้อย บรรจุภัณฑ์สมบูรณ์ น้ำยาใสไม่ขุ่น ผ่านการตรวจ Lot และวันหมดอายุ',
      totalAccepted: 1550,
      totalRejected: 0,
      totalQuarantine: 50,
      remark: 'ตรวจรับสินค้าตาม PO-202610-0002 งวดที่ 1',
      createdBy: 'สมบัติ คลังมั่น',
      postedBy: 'ดร. นิภา พัฒนพาณิชย์',
      postedAt: new Date(now.getTime() - 3 * 24 * 3600 * 1000),
      lines: {
        create: [
          {
            itemId: salineItem.id,
            orderedQty: 2000,
            previouslyReceived: 0,
            remainingQty: 800,
            receivedQty: 1200,
            acceptedQty: 1200,
            rejectedQty: 0,
            quarantineQty: 0,
            lotNumber: 'NS-26A01',
            expiryDate: d700,
            unitPrice: 35.0,
            locationId: locMainB.id,
            remark: 'รับเข้าคลังกลางเรียบร้อย'
          },
          {
            itemId: cefItem.id,
            orderedQty: 500,
            previouslyReceived: 0,
            remainingQty: 150,
            receivedQty: 350,
            acceptedQty: 300,
            rejectedQty: 0,
            quarantineQty: 50,
            lotNumber: 'CEF-26Q01',
            expiryDate: d365,
            unitPrice: 75.0,
            locationId: locMainB.id,
            remark: '50 Vial กักกันไว้ตรวจสอบเอกสาร COA เพิ่มเติม'
          }
        ]
      }
    }
  });

  // 11. Initial Stock Issue
  console.log('11. Seeding Stock Issues (Direct & Pending Approval)...');
  const issue1 = await prisma.stockIssue.create({
    data: {
      issueNumber: 'ISS-202610-0001',
      issueType: 'DIRECT',
      requesterName: 'พว. กัลยา วงศ์ดี',
      departmentId: opdDept.id,
      sourceWarehouseId: whMain.id,
      requestDate: new Date(now.getTime() - 1 * 24 * 3600 * 1000),
      requiredDate: new Date(now.getTime() + 1 * 24 * 3600 * 1000),
      status: 'PENDING_APPROVAL',
      remark: 'เบิกเวชภัณฑ์ถุงมือและหน้ากากอนามัยสำหรับบริการผู้ป่วยนอกประจำสัปดาห์',
      createdBy: 'พว. กัลยา วงศ์ดี',
      lines: {
        create: [
          {
            itemId: gloveItem.id,
            requestedQty: 50,
            approvedQty: 50,
            issuedQty: 0,
            lotNumber: 'GLO-2026-01',
            unit: 'Box',
            remark: 'เลือก Lot FEFO วันหมดอายุเร็วที่สุด'
          },
          {
            itemId: maskItem.id,
            requestedQty: 40,
            approvedQty: 40,
            issuedQty: 0,
            lotNumber: 'MSK-26M01',
            unit: 'Box',
            remark: 'ใช้ประจำห้องตรวจ OPD'
          }
        ]
      }
    }
  });

  const issue2 = await prisma.stockIssue.create({
    data: {
      issueNumber: 'ISS-202610-0002',
      issueType: 'DIRECT',
      requesterName: 'พว. กัลยา วงศ์ดี',
      departmentId: opdDept.id,
      sourceWarehouseId: whMain.id,
      requestDate: new Date(now.getTime() - 4 * 24 * 3600 * 1000),
      requiredDate: new Date(now.getTime() - 3 * 24 * 3600 * 1000),
      status: 'POSTED',
      approvalNotes: 'อนุมัติเรียบร้อยตามโควต้าประจำเดือน',
      remark: 'เบิกแอลกอฮอล์และสำลีทำแผล',
      createdBy: 'พว. กัลยา วงศ์ดี',
      approvedBy: 'นพ. อนุชา เกริกเกียรติ',
      approvedAt: new Date(now.getTime() - 4 * 24 * 3600 * 1000),
      postedBy: 'สมบัติ คลังมั่น',
      postedAt: new Date(now.getTime() - 3 * 24 * 3600 * 1000),
      lines: {
        create: [
          {
            itemId: alcItem.id,
            requestedQty: 20,
            approvedQty: 20,
            issuedQty: 20,
            lotNumber: 'ALC-26A01',
            unit: 'Bottle',
            remark: 'จ่ายครบถ้วน'
          }
        ]
      }
    }
  });

  // 12. Initial Stock Transfer (In Transit!)
  console.log('12. Seeding Stock Transfer (In Transit demo)...');
  const trf1 = await prisma.stockTransfer.create({
    data: {
      transferNumber: 'TRF-202610-0001',
      sourceWarehouseId: whMain.id,
      destinationWarehouseId: whEr.id,
      transferDate: new Date(now.getTime() - 1 * 24 * 3600 * 1000),
      status: 'IN_TRANSIT',
      dispatchNotes: 'จัดส่งโดยรถพัสดุโรงพยาบาล รอบเช้า 09:30 น.',
      remark: 'เติมสต็อกฉุกเฉินถุงมือและกระบอกฉีดยาสำหรับห้องฉุกเฉิน (ER)',
      createdBy: 'สมบัติ คลังมั่น',
      approvedBy: 'ดร. นิภา พัฒนพาณิชย์',
      dispatchedBy: 'สมบัติ คลังมั่น',
      dispatchedAt: new Date(now.getTime() - 4 * 3600 * 1000),
      lines: {
        create: [
          {
            itemId: gloveItem.id,
            requestedQty: 50,
            dispatchedQty: 50,
            receivedQty: 0,
            lotNumber: 'GLO-2026-02',
            remark: 'กำลังเดินทาง รอ ER กดยืนยันรับ'
          },
          {
            itemId: syringeItem.id,
            requestedQty: 30,
            dispatchedQty: 30,
            receivedQty: 0,
            lotNumber: 'SYR-26S01',
            remark: 'กำลังเดินทาง รอ ER กดยืนยันรับ'
          }
        ]
      }
    }
  });

  // 13. Initial Stock Return
  console.log('13. Seeding Stock Return...');
  const ret1 = await prisma.stockReturn.create({
    data: {
      returnNumber: 'RET-202610-0001',
      returnType: 'DEPT_RETURN',
      departmentId: opdDept.id,
      warehouseId: whMain.id,
      originalDocumentNumber: 'ISS-202610-0002',
      returnDate: now,
      status: 'PENDING_INSPECTION',
      reason: 'เบิกเกินความจำเป็นสำหรับคลินิกพิเศษนอกเวลา ส่งคืนคลังกลาง',
      createdBy: 'พว. กัลยา วงศ์ดี',
      lines: {
        create: [
          {
            itemId: alcItem.id,
            lotNumber: 'ALC-26A01',
            returnQty: 5,
            acceptedQty: 0,
            rejectedQty: 0,
            condition: 'GOOD',
            reason: 'ขวดอยู่ในสภาพสมบูรณ์ ไม่เปิดใช้งาน'
          }
        ]
      }
    }
  });

  // 14. Initial Stock Adjustment
  console.log('14. Seeding Stock Adjustment...');
  const adj1 = await prisma.stockAdjustment.create({
    data: {
      adjustmentNumber: 'ADJ-202610-0001',
      warehouseId: whMain.id,
      adjustmentType: 'DAMAGED',
      status: 'PENDING_APPROVAL',
      reason: 'กล่องถุงมือถูกละอองฝนระหว่างขนย้ายพัสดุ ชื้นเสียหาย 5 กล่อง',
      requestedBy: 'สมบัติ คลังมั่น',
      lines: {
        create: [
          {
            itemId: gloveItem.id,
            lotNumber: 'GLO-2026-01',
            currentQty: 100,
            adjustmentQty: -5,
            newQty: 95,
            unitCost: 180.0,
            reason: 'กล่องเปียกชื้น เสียสภาพสเตอร์ไรล์'
          }
        ]
      }
    }
  });

  // 15. Initial Stock Count
  console.log('15. Seeding Stock Count Plan...');
  const cnt1 = await prisma.stockCount.create({
    data: {
      countNumber: 'CNT-202610-0001',
      warehouseId: whMain.id,
      countPlanName: 'ตรวจนับพัสดุประจำไตรมาส 4 / 2569 โซน A (เวชภัณฑ์)',
      isBlindCount: false,
      countDate: now,
      status: 'COUNTED',
      counterName: 'สุภาพร ตรวจสต็อก',
      remark: 'พบจำนวนจริงตรงกับระบบเกือบทั้งหมด มีส่วนต่าง Syringe +1 กล่อง',
      createdBy: 'สุภาพร ตรวจสต็อก',
      lines: {
        create: [
          {
            itemId: gloveItem.id,
            lotNumber: 'GLO-2026-02',
            systemQty: 400,
            countedQty: 400,
            varianceQty: 0,
            variancePercentage: 0.0,
            notes: 'ตรงตามระบบ'
          },
          {
            itemId: maskItem.id,
            lotNumber: 'MSK-26M01',
            systemQty: 800,
            countedQty: 800,
            varianceQty: 0,
            variancePercentage: 0.0,
            notes: 'ตรงตามระบบ'
          },
          {
            itemId: syringeItem.id,
            lotNumber: 'SYR-26S01',
            systemQty: 600,
            countedQty: 601,
            varianceQty: 1,
            variancePercentage: 0.17,
            notes: 'พบเกิน 1 กล่องที่ชั้นล่างสุด'
          }
        ]
      }
    }
  });

  // 16. Stock Movements (Stock Card History)
  console.log('16. Seeding Stock Movement History (Stock Card)...');
  await prisma.stockMovement.create({
    data: {
      movementNumber: 'MOV-202610-0001',
      movementType: 'RECEIVE',
      documentType: 'GR',
      documentNumber: 'GR-202610-0001',
      itemId: salineItem.id,
      warehouseId: whMain.id,
      lotNumber: 'NS-26A01',
      quantity: 1200,
      balanceBefore: 0,
      balanceAfter: 1200,
      unitCost: 35.0,
      totalCost: 42000.0,
      remark: 'รับเข้าจาก PO-202610-0002',
      createdBy: 'สมบัติ คลังมั่น',
      createdAt: new Date(now.getTime() - 3 * 24 * 3600 * 1000)
    }
  });
  await prisma.stockMovement.create({
    data: {
      movementNumber: 'MOV-202610-0002',
      movementType: 'ISSUE_DIRECT',
      documentType: 'ISSUE',
      documentNumber: 'ISS-202610-0002',
      itemId: alcItem.id,
      warehouseId: whMain.id,
      lotNumber: 'ALC-26A01',
      quantity: -20,
      balanceBefore: 470,
      balanceAfter: 450,
      unitCost: 45.0,
      totalCost: 900.0,
      remark: 'จ่ายให้แผนก OPD ตามใบเบิก ISS-202610-0002',
      createdBy: 'สมบัติ คลังมั่น',
      createdAt: new Date(now.getTime() - 3 * 24 * 3600 * 1000)
    }
  });

  // 17. Document Sequences
  console.log('17. Initializing Document Sequences...');
  const ym = '202610';
  await prisma.documentSequence.create({ data: { prefix: 'PO', yearMonth: ym, currentSequence: 2 } });
  await prisma.documentSequence.create({ data: { prefix: 'GR', yearMonth: ym, currentSequence: 1 } });
  await prisma.documentSequence.create({ data: { prefix: 'ISS', yearMonth: ym, currentSequence: 2 } });
  await prisma.documentSequence.create({ data: { prefix: 'TRF', yearMonth: ym, currentSequence: 1 } });
  await prisma.documentSequence.create({ data: { prefix: 'RET', yearMonth: ym, currentSequence: 1 } });
  await prisma.documentSequence.create({ data: { prefix: 'ADJ', yearMonth: ym, currentSequence: 1 } });
  await prisma.documentSequence.create({ data: { prefix: 'CNT', yearMonth: ym, currentSequence: 1 } });

  // 18. Audit Logs
  console.log('18. Seeding Initial Audit Logs...');
  await prisma.auditLog.create({
    data: {
      userName: 'สมบัติ คลังมั่น',
      action: 'POST',
      module: 'GR',
      recordId: gr1.id,
      details: 'ตรวจรับและบันทึกรับเข้าคลังสินค้าเลขที่ GR-202610-0001 (ยอดรวม 1,550 รายการ)',
      timestamp: new Date(now.getTime() - 3 * 24 * 3600 * 1000)
    }
  });
  await prisma.auditLog.create({
    data: {
      userName: 'นพ. อนุชา เกริกเกียรติ',
      action: 'APPROVE',
      module: 'ISSUE',
      recordId: issue2.id,
      details: 'อนุมัติใบเบิกพัสดุเลขที่ ISS-202610-0002 สำหรับแผนก OPD',
      timestamp: new Date(now.getTime() - 4 * 24 * 3600 * 1000)
    }
  });
  await prisma.auditLog.create({
    data: {
      userName: 'สมบัติ คลังมั่น',
      action: 'DISPATCH',
      module: 'TRANSFER',
      recordId: trf1.id,
      details: 'ตัดจ่ายสินค้าออกจากคลังกลางและปรับสถานะเป็น In Transit สำหรับ TRF-202610-0001',
      timestamp: new Date(now.getTime() - 4 * 3600 * 1000)
    }
  });

  console.log('--- SEEDING COMPLETED SUCCESSFULLY! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
