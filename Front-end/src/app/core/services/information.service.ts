import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyInfo } from '../models/information.model';

@Injectable({ providedIn: 'root' })
export class InformationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private defaultInfo: CompanyInfo = {
    phone: '+53 00000000',
    whatsapp: '+5352627046',
    email: 'bluehavanars@gmail.com',
    address: 'La Habana, Cuba',
    facebook: '@bluehavanars',
    instagram: '@bluehavanars',
    x: '@bluehavanars',
    originText: 'Blue Havana Real Estate transforma el mercado inmobiliario cubano con estándares internacionales de transparencia, eficiencia y excelencia.',
    todayText: 'Brindar soluciones inmobiliarias integrales y de alto nivel.',
    futureText: 'Ser la empresa inmobiliaria líder y referente en Cuba.',
    whereText: 'Operamos principalmente en La Habana y sus zonas más exclusivas.',
  };

  private infoSubject = new BehaviorSubject<CompanyInfo>(this.defaultInfo);
  info$ = this.infoSubject.asObservable();

  getInfo(): CompanyInfo {
    return this.infoSubject.value;
  }

  loadInfo(): Observable<CompanyInfo> {
    return this.http.get<CompanyInfo>(`${this.apiUrl}/company-info`).pipe(
      tap(info => this.infoSubject.next(info)),
      catchError(() => of(this.infoSubject.value))
    );
  }

  updateInfo(info: CompanyInfo): Observable<CompanyInfo> {
    return this.http.patch<CompanyInfo>(`${this.apiUrl}/company-info`, info).pipe(
      tap(updated => this.infoSubject.next(updated))
    );
  }

  resetInfo(): Observable<CompanyInfo> {
    return this.http.post<CompanyInfo>(`${this.apiUrl}/company-info/reset`, {}).pipe(
      tap(info => this.infoSubject.next(info))
    );
  }
}
