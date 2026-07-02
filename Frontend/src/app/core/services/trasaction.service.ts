import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  PropertyTransaction
} from '../models/propertytransaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTransactions(): Observable<PropertyTransaction[]> {
    return this.http.get<PropertyTransaction[]>(
      `${this.apiUrl}/admin/transactions`
    );
  }

  createTransaction(
    transaction: Omit<PropertyTransaction, 'id' | 'createdAt'>
  ): Observable<PropertyTransaction> {
    return this.http.post<PropertyTransaction>(
      `${this.apiUrl}/admin/transactions`,
      transaction
    );
  }
}