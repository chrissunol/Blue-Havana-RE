import { CommonModule } from '@angular/common';

import {
  Component,
  DestroyRef,
  inject
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  private readonly destroyRef =
    inject(DestroyRef);

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
        es: [''],
        en: [''],
        fr: ['']
      }),

      excerpt: this.formBuilder.nonNullable.group({
        es: [''],
        en: [''],
        fr: ['']
      }),

      content: this.formBuilder.nonNullable.group({
        es: [''],
        en: [''],
        fr: ['']
      })
    });

  constructor() {
    this.applyLanguageValidators();

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

  get selectedLanguageLabel(): string {
    return (
      this.languages.find(
        language => language.code === this.activeLanguage
      )?.label || 'Español'
    );
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

  get validationSummary(): string {
    const invalidGeneralFields: string[] = [];

    if (this.articleForm.controls.author.invalid) {
      invalidGeneralFields.push('autor');
    }

    if (this.articleForm.controls.category.invalid) {
      invalidGeneralFields.push('categoría');
    }

    if (this.articleForm.controls.readingTime.invalid) {
      invalidGeneralFields.push('tiempo de lectura');
    }

    const selectedLanguageIsInvalid =
      this.articleForm.controls.title.controls[
        this.activeLanguage
      ].invalid ||
      this.articleForm.controls.excerpt.controls[
        this.activeLanguage
      ].invalid ||
      this.articleForm.controls.content.controls[
        this.activeLanguage
      ].invalid;

    const messages: string[] = [];

    if (selectedLanguageIsInvalid) {
      messages.push(
        `Completa el artículo en ${this.selectedLanguageLabel}.`
      );
    }

    if (invalidGeneralFields.length > 0) {
      messages.push(
        `Revisa: ${invalidGeneralFields.join(', ')}.`
      );
    }

    return messages.join(' ') || 'Revisa los campos obligatorios.';
  }

  selectLanguage(
    language: LanguageCode
  ): void {
    if (language === this.activeLanguage) {
      return;
    }

    this.activeLanguage = language;
    this.submitted = false;
    this.applyLanguageValidators();
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

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.imageErrorMessage =
        'Selecciona un archivo de imagen válido.';
      input.value = '';
      return;
    }

    const maximumFileSize = 10 * 1024 * 1024;
    if (file.size > maximumFileSize) {
      this.imageErrorMessage =
        'La imagen no puede superar los 10 MB.';
      input.value = '';
      return;
    }

    this.isSaving = true;
    this.selectedFileName = file.name;

    this.blogService
      .uploadImage(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.articleForm.controls.coverImage.setValue(
            response.url
          );
          this.articleForm.controls.coverImage.markAsDirty();
          this.isSaving = false;
          input.value = '';
        },
        error: error => {
          console.error('No se pudo subir la imagen:', error);
          this.imageErrorMessage =
            error?.error?.detail ||
            'No se pudo subir la imagen.';
          this.isSaving = false;
          this.selectedFileName = '';
          input.value = '';
        }
      });
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
      return;
    }

    this.isSaving = true;

    const formValue = this.articleForm.getRawValue();

    const title = {
      es: '',
      en: '',
      fr: ''
    };

    const excerpt = {
      es: '',
      en: '',
      fr: ''
    };

    const content = {
      es: '',
      en: '',
      fr: ''
    };

    title[this.activeLanguage] =
      formValue.title[this.activeLanguage].trim();

    excerpt[this.activeLanguage] =
      formValue.excerpt[this.activeLanguage].trim();

    content[this.activeLanguage] =
      formValue.content[this.activeLanguage].trim();

    const articleData: CreateBlogArticle = {
      title,
      excerpt,
      content,
      category: formValue.category,
      author: formValue.author.trim(),
      coverImage:
        formValue.coverImage.trim() ||
        this.placeholderImage,
      status: formValue.status,
      featured: formValue.featured,
      readingTime: Number(formValue.readingTime)
    };

    const request$ =
      this.isEditMode && this.articleId
        ? this.blogService.updateArticle(
            this.articleId,
            articleData
          )
        : this.blogService.createArticle(articleData);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.router.navigate(['/admin/blog']);
        },
        error: error => {
          console.error('No se pudo guardar el artículo:', error);
          this.isSaving = false;
          this.imageErrorMessage =
            error?.error?.detail ||
            'No se pudo guardar el artículo.';
        }
      });
  }

  private loadArticle(id: string): void {
    this.isSaving = true;

    this.blogService
      .getAdminArticle(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: article => {
          this.article = article;
          this.activeLanguage =
            this.detectArticleLanguage(article);
          this.applyLanguageValidators();

          this.articleForm.patchValue({
            category: article.category,
            author: article.author,
            coverImage: article.coverImage,
            status: article.status,
            featured: article.featured,
            readingTime: article.readingTime,
            title: { ...article.title },
            excerpt: { ...article.excerpt },
            content: { ...article.content }
          });

          this.isSaving = false;
        },
        error: error => {
          console.error('No se pudo cargar el artículo:', error);
          this.isSaving = false;
          this.router.navigate(['/admin/blog']);
        }
      });
  }

  private applyLanguageValidators(): void {
    for (const language of this.languages) {
      const code = language.code;

      const titleControl =
        this.articleForm.controls.title.controls[code];

      const excerptControl =
        this.articleForm.controls.excerpt.controls[code];

      const contentControl =
        this.articleForm.controls.content.controls[code];

      titleControl.clearValidators();
      excerptControl.clearValidators();
      contentControl.clearValidators();

      if (code === this.activeLanguage) {
        titleControl.setValidators([
          Validators.required,
          Validators.maxLength(180)
        ]);

        excerptControl.setValidators([
          Validators.required,
          Validators.maxLength(350)
        ]);

        contentControl.setValidators([
          Validators.required,
          Validators.minLength(50)
        ]);
      }

      titleControl.updateValueAndValidity({
        emitEvent: false
      });

      excerptControl.updateValueAndValidity({
        emitEvent: false
      });

      contentControl.updateValueAndValidity({
        emitEvent: false
      });
    }
  }

  private detectArticleLanguage(
    article: BlogArticle
  ): LanguageCode {
    return (
      this.languages.find(language => {
        const code = language.code;

        return Boolean(
          article.title[code]?.trim() ||
          article.excerpt[code]?.trim() ||
          article.content[code]?.trim()
        );
      })?.code || 'es'
    );
  }

}