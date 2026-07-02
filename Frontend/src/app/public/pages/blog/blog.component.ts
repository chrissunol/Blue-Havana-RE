import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  LucideAngularModule,
  Newspaper,
  Search,
  Sparkles,
  X
} from 'lucide-angular';

import {
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  BlogArticle,
  BlogCategory
} from '../../../core/models/blog-article.model';

import {
  BlogService
} from '../../../core/services/blog.service';

import {
  LanguageService
} from '../../../core/services/language.service';

type BlogCategoryFilter = 'all' | BlogCategory;

interface BlogCategoryOption {
  value: BlogCategoryFilter;
  labelKey: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    TranslateModule
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly SearchIcon = Search;
  readonly CloseIcon = X;
  readonly ArrowRightIcon = ArrowRight;
  readonly CalendarIcon = CalendarDays;
  readonly ClockIcon = Clock3;
  readonly BlogIcon = Newspaper;
  readonly FeaturedIcon = Sparkles;

  searchTerm = '';
  selectedCategory: BlogCategoryFilter = 'all';

  readonly categories: BlogCategoryOption[] = [
    {
      value: 'all',
      labelKey: 'BLOG.CATEGORIES.ALL'
    },
    {
      value: 'market',
      labelKey: 'BLOG.CATEGORIES.MARKET'
    },
    {
      value: 'renovation',
      labelKey: 'BLOG.CATEGORIES.RENOVATION'
    },
    {
      value: 'investment',
      labelKey: 'BLOG.CATEGORIES.INVESTMENT'
    },
    {
      value: 'architecture',
      labelKey: 'BLOG.CATEGORIES.ARCHITECTURE'
    },
    {
      value: 'tips',
      labelKey: 'BLOG.CATEGORIES.TIPS'
    }
  ];

  articles: BlogArticle[] = [];
  loadError = '';

  constructor(
    public readonly languageService: LanguageService,
    private readonly translateService: TranslateService,
    private readonly blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.blogService
      .getPublishedArticles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: articles => {
          this.articles = articles;
          this.loadError = '';
        },
        error: error => {
          console.error('No se pudieron cargar los artículos:', error);
          this.articles = [];
          this.loadError = 'No se pudieron cargar los artículos.';
        },
      });
  }

  get filteredArticles(): BlogArticle[] {
    const normalizedSearch = this.searchTerm
      .trim()
      .toLowerCase();

    return this.articles.filter(article => {
      const matchesCategory =
        this.selectedCategory === 'all' ||
        article.category === this.selectedCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const translatedTitle =
        this.languageService.translateText(
          article.title
        );

      const translatedExcerpt =
        this.languageService.translateText(
          article.excerpt
        );

      const translatedCategory =
        this.translateService.instant(
          this.getCategoryLabelKey(
            article.category
          )
        );

      const searchableText = [
        translatedTitle,
        translatedExcerpt,
        translatedCategory,
        article.author
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch
      );
    });
  }

  get featuredArticle(): BlogArticle | null {
    const filteredArticles =
      this.filteredArticles;

    if (filteredArticles.length === 0) {
      return null;
    }

    return (
      filteredArticles.find(
        article => article.featured
      ) ||
      filteredArticles[0]
    );
  }

  get remainingArticles(): BlogArticle[] {
    const featuredArticle =
      this.featuredArticle;

    if (!featuredArticle) {
      return [];
    }

    return this.filteredArticles.filter(
      article =>
        article.id !== featuredArticle.id
    );
  }

  get hasActiveFilters(): boolean {
    return (
      this.selectedCategory !== 'all' ||
      this.searchTerm.trim().length > 0
    );
  }

  selectCategory(
    category: BlogCategoryFilter
  ): void {
    this.selectedCategory = category;
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
    this.selectedCategory = 'all';
  }

  getCategoryLabelKey(
    category: BlogCategory
  ): string {
    const categoryKeys:
      Record<BlogCategory, string> = {
        market: 'BLOG.CATEGORIES.MARKET',
        renovation:
          'BLOG.CATEGORIES.RENOVATION',
        investment:
          'BLOG.CATEGORIES.INVESTMENT',
        architecture:
          'BLOG.CATEGORIES.ARCHITECTURE',
        tips: 'BLOG.CATEGORIES.TIPS'
      };

    return categoryKeys[category];
  }

  getArticleTitle(
    article: BlogArticle
  ): string {
    return this.languageService.translateText(
      article.title
    );
  }

  getArticleExcerpt(
    article: BlogArticle
  ): string {
    return this.languageService.translateText(
      article.excerpt
    );
  }

  handleImageError(event: Event): void {
    const image =
      event.target as HTMLImageElement;

    /*
     * Evita un ciclo infinito si también falla
     * la imagen de reemplazo.
     */
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