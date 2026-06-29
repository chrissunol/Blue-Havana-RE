import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Review } from '../models/reviewForm.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAdminReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(
      `${this.apiUrl}/admin/reviews`
    );
  }

  approveReview(reviewId: string): Observable<Review> {
    return this.http.patch<Review>(
      `${this.apiUrl}/admin/reviews/${reviewId}/approve`,
      {}
    );
  }

  rejectReview(reviewId: string): Observable<Review> {
    return this.http.patch<Review>(
      `${this.apiUrl}/admin/reviews/${reviewId}/reject`,
      {}
    );
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/admin/reviews/${reviewId}`
    );
  }
}