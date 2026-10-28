// Shared Prisma include shape for RFQ (Request for Quotation) queries
export const rfqInclude = {
  requisition: { select: { id: true, prNumber: true, status: true, urgency: true } },
  lines: { include: { item: true } },
  suppliers: { include: { supplier: true }, orderBy: { invitedAt: 'asc' as const } },
  quotations: {
    include: {
      supplier: true,
      lines: { include: { item: true } },
    },
    orderBy: { totalAmount: 'asc' as const },
  },
};
