import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  BlogArticle,
  BlogArticleStatus,
  BlogCategory,
  CreateBlogArticle,
  UpdateBlogArticle,
} from '../models/blog-article.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/blog`;

  getPublishedArticles(category?: BlogCategory): Observable<BlogArticle[]> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<BlogArticle[]>(`${this.apiUrl}/articles`, { params });
  }

  getArticleBySlug(slug: string): Observable<BlogArticle> {
    return this.http.get<BlogArticle>(
      `${this.apiUrl}/articles/${encodeURIComponent(slug)}`
    );
  }

  getAdminArticles(
    status?: BlogArticleStatus,
    category?: BlogCategory
  ): Observable<BlogArticle[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<BlogArticle[]>(`${this.apiUrl}/admin/articles`, {
      params,
    });
  }

  getAdminArticle(id: string): Observable<BlogArticle> {
    return this.http.get<BlogArticle>(
      `${this.apiUrl}/admin/articles/${id}`
    );
  }

  createArticle(data: CreateBlogArticle): Observable<BlogArticle> {
    return this.http.post<BlogArticle>(`${this.apiUrl}/admin/articles`, data);
  }

  updateArticle(
    id: string,
    changes: UpdateBlogArticle
  ): Observable<BlogArticle> {
    return this.http.patch<BlogArticle>(
      `${this.apiUrl}/admin/articles/${id}`,
      changes
    );
  }

  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/articles/${id}`);
  }

  changeArticleStatus(
    id: string,
    status: BlogArticleStatus
  ): Observable<BlogArticle> {
    return this.http.patch<BlogArticle>(
      `${this.apiUrl}/admin/articles/${id}/status`,
      { status }
    );
  }

  setFeatured(id: string, featured: boolean): Observable<BlogArticle> {
    return this.http.patch<BlogArticle>(
      `${this.apiUrl}/admin/articles/${id}/featured`,
      { featured }
    );
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url: string }>(
      `${this.apiUrl}/admin/images`,
      formData
    );
  }

  getRelatedArticles(
    selectedArticle: BlogArticle,
    limit = 3
  ): Observable<BlogArticle[]> {
    return this.getPublishedArticles().pipe(
      map(articles => {
        const candidates = articles.filter(
          article => article.id !== selectedArticle.id
        );
        const sameCategory = candidates.filter(
          article => article.category === selectedArticle.category
        );
        const otherCategories = candidates.filter(
          article => article.category !== selectedArticle.category
        );

        return [...sameCategory, ...otherCategories].slice(0, limit);
      })
    );
  }
}
