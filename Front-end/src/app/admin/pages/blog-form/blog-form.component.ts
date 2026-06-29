import { CommonModule } from '@angular/common';

import {
  Component,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AlertCircle,
  ArrowLeft,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Languages,
  LucideAngularModule,
  Save,
  Star,
  Upload
} from 'lucide-angular';

import {
  BlogArticle,
  BlogArticleStatus,
  BlogCategory,
  CreateBlogArticle
} from '../../../core/models/blog-article.model';

import {
  BlogService
} from '../../../core/services/blog.service';

type LanguageCode = 'es' | 'en' | 'fr';

interface LanguageOption {
  code: LanguageCode;
  label: string;
}

interface CategoryOption {
  value: BlogCategory;
  label: string;
}

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule
  ],
  templateUrl: './blog-form.component.html',
  styleUrl: './blog-form.component.css'
})
export class BlogFormComponent {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly blogService =
    inject(BlogService);

  readonly BackIcon = ArrowLeft;
  readonly SaveIcon = Save;
  readonly UploadIcon = Upload;
  readonly ImageIcon = ImageIcon;
  readonly LanguageIcon = Languages;
  readonly ArticleIcon = FileText;
  readonly PublishedIcon = Eye;
  readonly DraftIcon = EyeOff;
  readonly FeaturedIcon = Star;
  readonly ClockIcon = Clock3;
  readonly WarningIcon = AlertCircle;

  readonly placeholderImage =
    'assets/images/placeholder.svg';

  readonly languages: LanguageOption[] = [
    {
      code: 'es',
      label: 'Español'
    },
    {
      code: 'en',
      label: 'English'
    },
    {
      code: 'fr',
      label: 'Français'
    }
  ];

  readonly categories: CategoryOption[] = [
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

  activeLanguage: LanguageCode = 'es';

  submitted = false;
  isSaving = false;

  imageErrorMessage = '';
  selectedFileName = '';

  readonly articleId =
    this.route.snapshot.paramMap.get('id');

  readonly isEditMode =
    Boolean(this.articleId);

  article: BlogArticle | null = null;

  readonly articleForm =
    this.formBuilder.nonNullable.group({
      category:
        this.formBuilder.nonNullable.control<BlogCategory>(
          'market',
          Validators.required
        ),

      author: this.formBuilder.nonNullable.control(
        'Blue Havana Real Estate',
        [
          Validators.required,
          Validators.maxLength(120)
        ]
      ),

      coverImage:
        this.formBuilder.nonNullable.control(''),

      status:
        this.formBuilder.nonNullable.control<BlogArticleStatus>(
          'draft',
          Validators.required
        ),

      featured:
        this.formBuilder.nonNullable.control(false),

      readingTime:
        this.formBuilder.nonNullable.control(
          5,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(120)
          ]
        ),

      title: this.formBuilder.nonNullable.group({
        es: [
          '',
          [
            Validators.required,
            Validators.maxLength(180)
          ]
        ],

        en: [
          '',
          [
            Validators.required,
            Validators.maxLength(180)
          ]
        ],

        fr: [
          '',
          [
            Validators.required,
            Validators.maxLength(180)
          ]
        ]
      }),

      excerpt: this.formBuilder.nonNullable.group({
        es: [
          '',
          [
            Validators.required,
            Validators.maxLength(350)
          ]
        ],

        en: [
          '',
          [
            Validators.required,
            Validators.maxLength(350)
          ]
        ],

        fr: [
          '',
          [
            Validators.required,
            Validators.maxLength(350)
          ]
        ]
      }),

      content: this.formBuilder.nonNullable.group({
        es: [
          '',
          [
            Validators.required,
            Validators.minLength(50)
          ]
        ],

        en: [
          '',
          [
            Validators.required,
            Validators.minLength(50)
          ]
        ],

        fr: [
          '',
          [
            Validators.required,
            Validators.minLength(50)
          ]
        ]
      })
    });

  constructor() {
    if (this.isEditMode && this.articleId) {
      this.loadArticle(this.articleId);
    }
  }

  get pageTitle(): string {
    return this.isEditMode
      ? 'Editar artículo'
      : 'Crear artículo';
  }

  get pageDescription(): string {
    return this.isEditMode
      ? 'Actualiza el contenido y la configuración del artículo.'
      : 'Prepara un nuevo artículo para el Blog.';
  }

  get currentStatus(): BlogArticleStatus {
    return this.articleForm.controls.status.value;
  }

  get isFeatured(): boolean {
    return this.articleForm.controls.featured.value;
  }

  get coverPreview(): string {
    const coverImage =
      this.articleForm.controls.coverImage.value.trim();

    return coverImage || this.placeholderImage;
  }

  selectLanguage(
    language: LanguageCode
  ): void {
    this.activeLanguage = language;
  }

  setStatus(
    status: BlogArticleStatus
  ): void {
    this.articleForm.controls.status.setValue(
      status
    );

    this.articleForm.controls.status.markAsDirty();
  }

  toggleFeatured(): void {
    this.articleForm.controls.featured.setValue(
      !this.isFeatured
    );

    this.articleForm.controls.featured.markAsDirty();
  }

  onCoverUrlChange(): void {
    this.imageErrorMessage = '';
    this.selectedFileName = '';
  }

  onCoverFileSelected(event: Event): void {
    this.imageErrorMessage = '';

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.imageErrorMessage =
        'Selecciona un archivo de imagen válido.';

      input.value = '';
      return;
    }

    const maximumFileSize =
      5 * 1024 * 1024;

    if (file.size > maximumFileSize) {
      this.imageErrorMessage =
        'La imagen no puede superar los 5 MB.';

      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result =
        typeof reader.result === 'string'
          ? reader.result
          : '';

      if (!result) {
        this.imageErrorMessage =
          'No se pudo leer la imagen.';
        return;
      }

      this.selectedFileName = file.name;

      this.articleForm.controls.coverImage.setValue(
        result
      );

      this.articleForm.controls.coverImage.markAsDirty();
    };

    reader.onerror = () => {
      this.imageErrorMessage =
        'Ocurrió un error al leer la imagen.';
    };

    reader.readAsDataURL(file);
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

    image.src = this.placeholderImage;
  }

  isFieldInvalid(path: string): boolean {
    const control =
      this.articleForm.get(path);

    if (!control) {
      return false;
    }

    return (
      control.invalid &&
      (
        control.touched ||
        control.dirty ||
        this.submitted
      )
    );
  }

  getFieldLength(path: string): number {
    const value =
      this.articleForm.get(path)?.value;

    return typeof value === 'string'
      ? value.length
      : 0;
  }

  saveArticle(): void {
    this.submitted = true;
    this.imageErrorMessage = '';

    this.articleForm.markAllAsTouched();

    if (this.articleForm.invalid) {
      this.focusFirstInvalidLanguage();
      return;
    }

    this.isSaving = true;

    const formValue =
      this.articleForm.getRawValue();

    const articleData: CreateBlogArticle = {
      title: {
        es: formValue.title.es.trim(),
        en: formValue.title.en.trim(),
        fr: formValue.title.fr.trim()
      },

      excerpt: {
        es: formValue.excerpt.es.trim(),
        en: formValue.excerpt.en.trim(),
        fr: formValue.excerpt.fr.trim()
      },

      content: {
        es: formValue.content.es.trim(),
        en: formValue.content.en.trim(),
        fr: formValue.content.fr.trim()
      },

      category: formValue.category,
      author: formValue.author.trim(),

      coverImage:
        formValue.coverImage.trim() ||
        this.placeholderImage,

      status: formValue.status,
      featured: formValue.featured,
      readingTime: Number(
        formValue.readingTime
      )
    };

    if (this.isEditMode && this.articleId) {
      this.blogService.updateArticle(
        this.articleId,
        articleData
      );
    } else {
      this.blogService.createArticle(
        articleData
      );
    }

    this.isSaving = false;

    this.router.navigate([
      '/admin/blog'
    ]);
  }

  private loadArticle(id: string): void {
    const article =
      this.blogService.getArticleById(id);

    if (!article) {
      this.router.navigate([
        '/admin/blog'
      ]);

      return;
    }

    this.article = article;

    this.articleForm.patchValue({
      category: article.category,
      author: article.author,
      coverImage: article.coverImage,
      status: article.status,
      featured: article.featured,
      readingTime: article.readingTime,

      title: {
        es: article.title.es,
        en: article.title.en,
        fr: article.title.fr
      },

      excerpt: {
        es: article.excerpt.es,
        en: article.excerpt.en,
        fr: article.excerpt.fr
      },

      content: {
        es: article.content.es,
        en: article.content.en,
        fr: article.content.fr
      }
    });
  }

  private focusFirstInvalidLanguage(): void {
    const languages: LanguageCode[] = [
      'es',
      'en',
      'fr'
    ];

    const invalidLanguage =
      languages.find(language => {
        return (
          this.articleForm.get(
            `title.${language}`
          )?.invalid ||
          this.articleForm.get(
            `excerpt.${language}`
          )?.invalid ||
          this.articleForm.get(
            `content.${language}`
          )?.invalid
        );
      });

    if (invalidLanguage) {
      this.activeLanguage =
        invalidLanguage;
    }
  }
}