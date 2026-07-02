export type TransactionType = 'sale' | 'rent';
export type TransactionStatus = 'active' | 'cancelled';

export interface PropertyTransaction {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertySnapshot?: Record<string, unknown>;
  transactionType: TransactionType;
  status: TransactionStatus;
  finalAmount: number | null;
  clientName?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
  closedAt: string;
  notes?: string | null;
  createdBy?: string | null;
  createdById?: string | null;
  createdAt: string;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancelledById?: string | null;
  cancellationReason?: string | null;
}

export interface CreatePropertyTransaction {
  propertyId: string;
  transactionType: TransactionType;
  finalAmount: number;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  closedAt: string;
  notes?: string;
}
