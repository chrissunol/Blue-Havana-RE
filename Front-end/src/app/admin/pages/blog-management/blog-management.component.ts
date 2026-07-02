import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Clock3,
  Eye,
  EyeOff,
  FileText,
  LucideAngularModule,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-angular';

import {
  BlogArticle,
  BlogArticleStatus,
  BlogCategory,
} from '../../../core/models/blog-article.model';
import { BlogService } from '../../../core/services/blog.service';

type BlogStatusFilter = 'all' | BlogArticleStatus;
type BlogCategoryFilter = 'all' | BlogCategory;

interface CategoryOption {
  value: BlogCategoryFilter;
  label: string;
}

@Component({
  selector: 'app-blog-management',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, FormsModule],
  templateUrl: './blog-management.component.html',
  styleUrl: './blog-management.component.css',
})
export class BlogManagementComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly SearchIcon = Search;
  readonly AddIcon = Plus;
  readonly EditIcon = Pencil;
  readonly DeleteIcon = Trash2;
  readonly PublishedIcon = Eye;
  readonly DraftIcon = EyeOff;
  readonly FeaturedIcon = Star;
  readonly ArticleIcon = FileText;
  readonly ClockIcon = Clock3;
  readonly CloseIcon = X;

  articles: BlogArticle[] = [];
  searchTerm = '';
  selectedStatus: BlogStatusFilter = 'all';
  selectedCategory: BlogCategoryFilter = 'all';
  deleteCandidate: BlogArticle | null = null;
  isLoading = false;
  actionError = '';

  readonly categoryOptions: CategoryOption[] = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'market', label: 'Mercado inmobiliario' },
    { value: 'renovation', label: 'Diseño y renovación' },
    { value: 'investment', label: 'Inversión' },
    { value: 'architecture', label: 'Arquitectura' },
    { value: 'tips', label: 'Consejos' },
  ];

  constructor(private readonly blogService: BlogService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  get filteredArticles(): BlogArticle[] {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    return this.articles.filter(article => {
      const matchesStatus =
        this.selectedStatus === 'all' || article.status === this.selectedStatus;
      const matchesCategory =
        this.selectedCategory === 'all' ||
        article.category === this.selectedCategory;

      if (!matchesStatus || !matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        article.title.es,
        article.excerpt.es,
        article.author,
        article.slug,
        this.getCategoryLabel(article.category),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }

  get totalArticles(): number {
    return this.articles.length;
  }

  get publishedArticlesCount(): number {
    return this.articles.filter(article => article.status === 'published').length;
  }

  get draftArticlesCount(): number {
    return this.articles.filter(article => article.status === 'draft').length;
  }

  get featuredArticleCount(): number {
    return this.articles.filter(article => article.featured).length;
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.selectedStatus !== 'all' ||
      this.selectedCategory !== 'all'
    );
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedCategory = 'all';
  }

  toggleArticleStatus(article: BlogArticle): void {
    const newStatus: BlogArticleStatus =
      article.status === 'published' ? 'draft' : 'published';

    this.blogService
      .changeArticleStatus(article.id, newStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => this.replaceArticle(updated),
        error: error => this.setActionError('No se pudo cambiar el estado.', error),
      });
  }

  toggleFeatured(article: BlogArticle): void {
    this.blogService
      .setFeatured(article.id, !article.featured)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.articles = this.articles.map(current => ({
            ...current,
            featured: current.id === updated.id ? updated.featured : false,
          }));
        },
        error: error => this.setActionError('No se pudo destacar el artículo.', error),
      });
  }

  requestDelete(article: BlogArticle): void {
    this.deleteCandidate = article;
  }

  cancelDelete(): void {
    this.deleteCandidate = null;
  }

  confirmDelete(): void {
    const article = this.deleteCandidate;
    if (!article) {
      return;
    }

    this.blogService
      .deleteArticle(article.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.articles = this.articles.filter(item => item.id !== article.id);
          this.deleteCandidate = null;
        },
        error: error => this.setActionError('No se pudo eliminar el artículo.', error),
      });
  }

  getCategoryLabel(category: BlogCategory): string {
    const labels: Record<BlogCategory, string> = {
      market: 'Mercado inmobiliario',
      renovation: 'Diseño y renovación',
      investment: 'Inversión',
      architecture: 'Arquitectura',
      tips: 'Consejos',
    };
    return labels[category];
  }

  getStatusLabel(status: BlogArticleStatus): string {
    return status === 'published' ? 'Publicado' : 'Borrador';
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.includes('assets/images/placeholder.svg')) {
      image.src = 'assets/images/placeholder.svg';
    }
  }

  private loadArticles(): void {
    this.isLoading = true;
    this.actionError = '';

    this.blogService
      .getAdminArticles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: articles => {
          this.articles = articles;
          this.isLoading = false;
        },
        error: error => {
          this.articles = [];
          this.isLoading = false;
          this.setActionError('No se pudieron cargar los artículos.', error);
        },
      });
  }

  private replaceArticle(updated: BlogArticle): void {
    this.articles = this.articles.map(article =>
      article.id === updated.id ? updated : article
    );
  }

  private setActionError(message: string, error: unknown): void {
    console.error(message, error);
    this.actionError = message;
  }
}
