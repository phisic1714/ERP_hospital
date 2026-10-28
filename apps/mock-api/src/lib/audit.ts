import { prisma } from './prisma';

export async function logAudit(params: {
  userName?: string;
  user?: string;
  action: string;
  module: string;
  recordId?: string;
  entityId?: string;
  entityNumber?: string;
  details?: string;
  remarks?: string;
  newValues?: any;
  userId?: string;
}) {
  try {
    const detailsStr =
      params.details ||
      params.remarks ||
      (params.newValues ? JSON.stringify(params.newValues) : '') ||
      (params.entityNumber ? `Entity #${params.entityNumber}` : '');

    return await prisma.auditLog.create({
      data: {
        userName: params.userName || params.user || 'System',
        action: params.action,
        module: params.module,
        recordId: params.recordId || params.entityId,
        details: detailsStr,
        userId: params.userId,
      },
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
