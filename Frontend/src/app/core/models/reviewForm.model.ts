export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewFormData {
  name: string;
  email: string;
  rating: number;
  comment: string;
}

export interface Review {
  id: string;
  name: string;
  email?: string | null;
  rating: number;
  comment: string;
  status: ReviewStatus;
  reviewedBy?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}
