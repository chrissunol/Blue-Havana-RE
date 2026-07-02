import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Review, ReviewStatus } from '../models/reviewForm.model';

export interface ReviewCreate {
  name: string;
  email?: string | null;
  rating: number;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  submitReview(payload: ReviewCreate): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, payload);
  }

  getPublicReviews(limit = 20): Observable<Review[]> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<Review[]>(`${this.apiUrl}/public`, { params });
  }

  getAdminReviews(status?: ReviewStatus): Observable<Review[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Review[]>(`${this.apiUrl}/admin`, { params });
  }

  approveReview(reviewId: string): Observable<Review> {
    return this.http.patch<Review>(`${this.apiUrl}/${reviewId}/approve`, {});
  }

  rejectReview(reviewId: string): Observable<Review> {
    return this.http.patch<Review>(`${this.apiUrl}/${reviewId}/reject`, {});
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}`);
  }
}
