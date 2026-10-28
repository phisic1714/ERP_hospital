import { prisma } from './prisma';

export async function generateDocumentNumber(
  prefix: 'GR' | 'ISS' | 'TRF' | 'RET' | 'ADJ' | 'CNT' | 'PO' | 'PR' | 'PP' | 'RFQ' | 'QT'
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const yearMonth = prefix === 'PP' ? `${year}` : `${year}${month}`;

  // Atomic upsert with increment
  const seq = await prisma.documentSequence.upsert({
    where: {
      prefix_yearMonth: {
        prefix,
        yearMonth,
      },
    },
    update: {
      currentSequence: {
        increment: 1,
      },
    },
    create: {
      prefix,
      yearMonth,
      currentSequence: 1,
    },
  });

  const seqNum = String(seq.currentSequence).padStart(4, '0');
  if (prefix === 'PP') {
    return `PP-${year}-${seqNum}`;
  }
  return `${prefix}-${yearMonth}-${seqNum}`;
}
