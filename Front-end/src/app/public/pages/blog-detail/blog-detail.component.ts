import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Component,
  DestroyRef,
  Inject,
  PLATFORM_ID,
  inject
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  LucideAngularModule,
  Newspaper,
  UserRound
} from 'lucide-angular';

import {
  TranslateModule
} from '@ngx-translate/core';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

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

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    TranslateModule
  ],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css'
})
export class BlogDetailComponent {
  private readonly destroyRef =
    inject(DestroyRef);

  article: BlogArticle | null = null;

  relatedArticles: BlogArticle[] = [];

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

    @Inject(PLATFORM_ID)
    private readonly platformId: object
  ) {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(parameters => {
        const slug =
          parameters.get('slug') ?? '';

        this.article =
          this.blogService.getArticleBySlug(slug);

        this.relatedArticles = this.article
          ? this.blogService.getRelatedArticles(
              this.article
            )
          : [];

        this.scrollToTop();
      });
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

  getArticleContent(
    article: BlogArticle
  ): string {
    return this.languageService.translateText(
      article.content
    );
  }

  getArticleContentParagraphs(
    article: BlogArticle
  ): string[] {
    const translatedContent =
      this.getArticleContent(article);

    return translatedContent
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);
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

  private scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}