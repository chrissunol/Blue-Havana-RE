import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  LucideAngularModule,
  Newspaper,
  UserRound,
} from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { switchMap } from 'rxjs';

import {
  BlogArticle,
  BlogCategory,
} from '../../../core/models/blog-article.model';
import { BlogService } from '../../../core/services/blog.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, TranslateModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css',
})
export class BlogDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  article: BlogArticle | null = null;
  relatedArticles: BlogArticle[] = [];
  loadError = '';

  readonly BackIcon = ArrowLeft;
  readonly ArrowIcon = ArrowRight;
  readonly CalendarIcon = CalendarDays;
  readonly ClockIcon = Clock3;
  readonly AuthorIcon = UserRound;
  readonly BlogIcon = Newspaper;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly blogService: BlogService,
    public readonly languageService: LanguageService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(parameters => {
          const slug = parameters.get('slug') ?? '';
          this.article = null;
          this.relatedArticles = [];
          this.loadError = '';
          return this.blogService.getArticleBySlug(slug);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: article => {
          this.article = article;
          this.scrollToTop();
          this.loadRelatedArticles(article);
        },
        error: error => {
          console.error('No se pudo cargar el artículo:', error);
          this.article = null;
          this.relatedArticles = [];
          this.loadError = 'El artículo no existe o no está publicado.';
          this.scrollToTop();
        },
      });
  }

  getArticleTitle(article: BlogArticle): string {
    return this.languageService.translateText(article.title);
  }

  getArticleExcerpt(article: BlogArticle): string {
    return this.languageService.translateText(article.excerpt);
  }

  getArticleContent(article: BlogArticle): string {
    return this.languageService.translateText(article.content);
  }

  getArticleContentParagraphs(article: BlogArticle): string[] {
    return this.getArticleContent(article)
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);
  }

  getCategoryLabelKey(category: BlogCategory): string {
    const categoryKeys: Record<BlogCategory, string> = {
      market: 'BLOG.CATEGORIES.MARKET',
      renovation: 'BLOG.CATEGORIES.RENOVATION',
      investment: 'BLOG.CATEGORIES.INVESTMENT',
      architecture: 'BLOG.CATEGORIES.ARCHITECTURE',
      tips: 'BLOG.CATEGORIES.TIPS',
    };

    return categoryKeys[category];
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image.src.includes('assets/images/placeholder.svg')) {
      return;
    }
    image.src = 'assets/images/placeholder.svg';
  }

  private loadRelatedArticles(article: BlogArticle): void {
    this.blogService
      .getRelatedArticles(article)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: relatedArticles => {
          this.relatedArticles = relatedArticles;
        },
        error: error => {
          console.error('No se pudieron cargar artículos relacionados:', error);
          this.relatedArticles = [];
        },
      });
  }

  private scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
