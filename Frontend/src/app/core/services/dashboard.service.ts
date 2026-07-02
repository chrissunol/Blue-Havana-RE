import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Review } from '../models/reviewForm.model';
import { PropertyTransaction } from '../models/propertytransaction.model';

export interface DashboardStats {
  pendingReviews: number;
  approvedReviews: number;
  soldProperties: number;
  rentedProperties: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  reviews: Review[];
  transactions: PropertyTransaction[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(
      `${environment.apiUrl}/dashboard`
    );
  }
}
