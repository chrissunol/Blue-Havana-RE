import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  PropertyTransaction,
  TransactionStatus,
  TransactionType,
} from '../models/propertytransaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/transactions`;

  getTransactions(
    transactionType?: TransactionType,
    status?: TransactionStatus
  ): Observable<PropertyTransaction[]> {
    let params = new HttpParams();

    if (transactionType) {
      params = params.set('transactionType', transactionType);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PropertyTransaction[]>(this.apiUrl, { params });
  }

  getTransaction(transactionId: string): Observable<PropertyTransaction> {
    return this.http.get<PropertyTransaction>(
      `${this.apiUrl}/${transactionId}`
    );
  }

  cancelTransaction(
    transactionId: string,
    reason?: string
  ): Observable<PropertyTransaction> {
    return this.http.patch<PropertyTransaction>(
      `${this.apiUrl}/${transactionId}/cancel`,
      { reason: reason?.trim() || null }
    );
  }
}
