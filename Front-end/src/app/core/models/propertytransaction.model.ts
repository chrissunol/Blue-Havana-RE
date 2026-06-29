export type TransactionType =
  | 'sale'
  | 'rent';

export type TransactionStatus =
  | 'active'
  | 'cancelled';

export interface PropertyTransaction {
  id: string;

  propertyId: string;
  propertyTitle: string;

  transactionType: TransactionType;
  status: TransactionStatus;

  finalAmount: number;
  clientName?: string;

  closedAt: string;
  notes?: string;

  createdBy: string;
  createdAt: string;

  cancelledAt?: string;
  cancelledBy?: string;
}

export interface CreatePropertyTransaction {
  propertyId: string;
  transactionType: TransactionType;
  finalAmount: number;
  clientName?: string;
  closedAt: string;
  notes?: string;
}