import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  X
} from 'lucide-angular';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  BlogArticle,
  BlogArticleStatus,
  BlogCategory
} from '../../../core/models/blog-article.model';

import {
  BlogService
} from '../../../core/services/blog.service';

type BlogStatusFilter =
  | 'all'
  | BlogArticleStatus;

type BlogCategoryFilter =
  | 'all'
  | BlogCategory;

interface CategoryOption {
  value: BlogCategoryFilter;
  label: string;
}

@Component({
  selector: 'app-blog-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    FormsModule
  ],
  templateUrl:
    './blog-management.component.html',
  styleUrl:
    './blog-management.component.css'
})
export class BlogManagementComponent {
  private readonly destroyRef =
    inject(DestroyRef);

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

  readonly categoryOptions: CategoryOption[] = [
    {
      value: 'all',
      label: 'Todas las categorías'
    },
    {
      value: 'market',
      label: 'Mercado inmobiliario'
    },
    {
      value: 'renovation',
      label: 'Diseño y renovación'
    },
    {
      value: 'investment',
      label: 'Inversión'
    },
    {
      value: 'architecture',
      label: 'Arquitectura'
    },
    {
      value: 'tips',
      label: 'Consejos'
    }
  ];

  constructor(
    private readonly blogService: BlogService
  ) {
    this.blogService
      .getArticlesObservable()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(articles => {
        this.articles = [...articles];
      });
  }

  get filteredArticles(): BlogArticle[] {
    const normalizedSearch =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.articles.filter(article => {
      const matchesStatus =
        this.selectedStatus === 'all' ||
        article.status === this.selectedStatus;

      const matchesCategory =
        this.selectedCategory === 'all' ||
        article.category === this.selectedCategory;

      if (!matchesStatus || !matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        article.title.es,
        article.excerpt.es,
        article.author,
        article.slug,
        this.getCategoryLabel(article.category)
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch
      );
    });
  }

  get totalArticles(): number {
    return this.articles.length;
  }

  get publishedArticlesCount(): number {
    return this.articles.filter(
      article => article.status === 'published'
    ).length;
  }

  get draftArticlesCount(): number {
    return this.articles.filter(
      article => article.status === 'draft'
    ).length;
  }

  get featuredArticleCount(): number {
    return this.articles.filter(
      article => article.featured
    ).length;
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.selectedStatus !== 'all' ||
      this.selectedCategory !== 'all'
    );
  }

  onSearch(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.searchTerm = input.value;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedCategory = 'all';
  }

  toggleArticleStatus(
    article: BlogArticle
  ): void {
    const newStatus: BlogArticleStatus =
      article.status === 'published'
        ? 'draft'
        : 'published';

    this.blogService.changeArticleStatus(
      article.id,
      newStatus
    );
  }

  toggleFeatured(
    article: BlogArticle
  ): void {
    this.blogService.toggleFeatured(
      article.id
    );
  }

  requestDelete(
    article: BlogArticle
  ): void {
    this.deleteCandidate = article;
  }

  cancelDelete(): void {
    this.deleteCandidate = null;
  }

  confirmDelete(): void {
    if (!this.deleteCandidate) {
      return;
    }

    this.blogService.deleteArticle(
      this.deleteCandidate.id
    );

    this.deleteCandidate = null;
  }

  getCategoryLabel(
    category: BlogCategory
  ): string {
    const categoryLabels:
      Record<BlogCategory, string> = {
        market: 'Mercado inmobiliario',
        renovation: 'Diseño y renovación',
        investment: 'Inversión',
        architecture: 'Arquitectura',
        tips: 'Consejos'
      };

    return categoryLabels[category];
  }

  getStatusLabel(
    status: BlogArticleStatus
  ): string {
    return status === 'published'
      ? 'Publicado'
      : 'Borrador';
  }

  handleImageError(event: Event): void {
    const image =
      event.target as HTMLImageElement;

    if (
      image.src.includes(
        'assets/images/placeholder.svg'
      )
    ) {
      return;
    }

    image.src =
      'assets/images/placeholder.svg';
  }
}