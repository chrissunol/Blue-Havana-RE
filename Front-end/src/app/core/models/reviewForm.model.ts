export type ReviewStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export interface ReviewFormData {
  name: string;
  email: string;
  rating: number;
  comment: string;
}

export interface Review {
  id: string;
  name: string;
  email?: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}