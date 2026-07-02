import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  LucideAngularModule,
  Phone,
  Quote,
  Send,
  Youtube,
} from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { CompanyInfo } from '../../../core/models/information.model';
import { Property } from '../../../core/models/property.model';
import { ReviewFormData } from '../../../core/models/reviewForm.model';
import { InformationService } from '../../../core/services/information.service';
import { PropertyService } from '../../../core/services/property.service';
import { ReviewService } from '../../../core/services/review.service';
import { PropertyListComponent } from '../../../shared/components/property-list/property-list.component';
import { ReviewModalComponent } from '../../../shared/components/review-modal/review-modal.component';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { HeroSearchComponent } from '../../component/hero-search/hero-search.component';

interface CityCard {
  labelKey: string;
  value: string;
  count: number;
  image: string;
  fallbackImage: string;
}

interface HomeReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSearchComponent,
    PropertyListComponent,
    SectionTitleComponent,
    TranslateModule,
    RouterLink,
    LucideAngularModule,
    ReviewModalComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  properties: Property[] = [];
  cityCards: CityCard[] = [];
  reviews: HomeReview[] = [];

  info!: CompanyInfo;

  reviewModalOpen = false;
  isSubmittingReview = false;
  currentReviewIndex = 0;

  readonly Phone = Phone;
  readonly FacebookIcon = Facebook;
  readonly YoutubeIcon = Youtube;
  readonly TelegramIcon = Send;
  readonly InstagramIcon = Instagram;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly QuoteIcon = Quote;
  readonly reviewStars = [1, 2, 3, 4, 5];

  private readonly baseCities: CityCard[] = [
    {
      labelKey: 'HOME.CITIES.PLAYA',
      value: 'Playa',
      count: 0,
      image: '',
      fallbackImage: 'assets/images/cities/playa.jpg',
    },
    {
      labelKey: 'HOME.CITIES.VEDADO',
      value: 'Vedado',
      count: 0,
      image: '',
      fallbackImage: 'assets/images/cities/vedado.jpg',
    },
    {
      labelKey: 'HOME.CITIES.CERRO',
      value: 'Cerro',
      count: 0,
      image: '',
      fallbackImage: 'assets/images/cities/cerro.jpg',
    },
    {
      labelKey: 'HOME.CITIES.CENTRO_HABANA',
      value: 'Centro Habana',
      count: 0,
      image: '',
      fallbackImage: 'assets/images/cities/centro-habana.jpg',
    },
  ];

  constructor(
    private readonly propertyService: PropertyService,
    private readonly router: Router,
    private readonly informationService: InformationService,
    private readonly reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.info = this.informationService.getInfo();

    this.informationService.info$
      .pipe(takeUntil(this.destroy$))
      .subscribe(info => {
        this.info = info;
      });

    this.informationService
      .loadInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: error => {
          console.error(
            'No se pudo cargar la información de la empresa:',
            error
          );
        },
      });

    this.loadFeaturedProperties();
    this.loadCityCards();
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentReview(): HomeReview | undefined {
    return this.reviews[this.currentReviewIndex];
  }

  get whatsappLink(): string {
    const phone = (this.info?.whatsapp ?? '').replace(/\D/g, '');

    if (!phone) {
      return '#';
    }

    const message = encodeURIComponent(
      'Hola, quiero información sobre una propiedad'
    );

    return `https://wa.me/${phone}?text=${message}`;
  }

  previousReview(): void {
    if (this.reviews.length === 0) {
      return;
    }

    this.currentReviewIndex =
      (this.currentReviewIndex - 1 + this.reviews.length) %
      this.reviews.length;
  }

  nextReview(): void {
    if (this.reviews.length === 0) {
      return;
    }

    this.currentReviewIndex =
      (this.currentReviewIndex + 1) % this.reviews.length;
  }

  selectReview(index: number): void {
    if (index < 0 || index >= this.reviews.length) {
      return;
    }

    this.currentReviewIndex = index;
  }

  getReviewInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  openReviewModal(): void {
    this.reviewModalOpen = true;
  }

  closeReviewModal(): void {
    if (this.isSubmittingReview) {
      return;
    }

    this.reviewModalOpen = false;
  }

  handleReviewSubmitted(review: ReviewFormData): void {
    if (this.isSubmittingReview) {
      return;
    }

    const payload = {
      name: review.name.trim(),
      email: review.email.trim() || null,
      rating: review.rating,
      comment: review.comment.trim(),
    };

    this.isSubmittingReview = true;

    this.reviewService
      .submitReview(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmittingReview = false;
          this.reviewModalOpen = false;

          alert(
            'Tu reseña fue enviada correctamente y está pendiente de aprobación.'
          );
        },
        error: error => {
          this.isSubmittingReview = false;

          console.error('No se pudo enviar la reseña:', error);

          const detail =
            typeof error?.error?.detail === 'string'
              ? error.error.detail
              : 'No se pudo enviar la reseña. Inténtalo nuevamente.';

          alert(detail);
        },
      });
  }

  goToDetail(property: Property): void {
    if (!property?.id) {
      return;
    }

    this.router.navigate(['/propiedades', property.id]);
  }

  private loadReviews(): void {
    this.reviewService
      .getPublicReviews(20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: reviews => {
          this.reviews = reviews.map(review => ({
            id: review.id,
            name: review.name,
            rating: review.rating,
            comment: review.comment,
          }));

          this.currentReviewIndex = 0;
        },
        error: error => {
          console.error('No se pudieron cargar las reseñas:', error);
          this.reviews = [];
          this.currentReviewIndex = 0;
        },
      });
  }

  private loadFeaturedProperties(): void {
    this.propertyService
      .getFeatured()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: properties => {
          this.properties = properties;
        },
        error: error => {
          console.error(
            'No se pudieron cargar las propiedades destacadas:',
            error
          );
          this.properties = [];
        },
      });
  }

  private loadCityCards(): void {
    this.propertyService
      .getVisible()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: properties => {
          this.cityCards = this.baseCities.map(city => {
            const propertiesByCity = properties.filter(property =>
              this.matchLocation(property.location, city.value)
            );

            const firstPropertyWithImage = propertiesByCity.find(
              property =>
                Array.isArray(property.images) &&
                property.images.length > 0
            );

            return {
              ...city,
              count: propertiesByCity.length,
              image:
                firstPropertyWithImage?.images?.[0] ||
                city.fallbackImage,
            };
          });
        },
        error: error => {
          console.error(
            'No se pudieron cargar las propiedades por ciudad:',
            error
          );

          this.cityCards = this.baseCities.map(city => ({
            ...city,
            count: 0,
            image: city.fallbackImage,
          }));
        },
      });
  }

  private matchLocation(
    propertyLocation: unknown,
    city: string
  ): boolean {
    const locationText = this.getTranslatedText(propertyLocation);

    if (!locationText) {
      return false;
    }

    const locationValue = this.normalize(locationText);
    const cityValue = this.normalize(city);

    return (
      locationValue === cityValue ||
      locationValue.includes(cityValue) ||
      cityValue.includes(locationValue)
    );
  }

  private getTranslatedText(value: unknown): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const translated = value as {
        es?: string;
        en?: string;
        fr?: string;
        value?: string;
        name?: string;
      };

      return (
        translated.es ||
        translated.en ||
        translated.fr ||
        translated.value ||
        translated.name ||
        ''
      );
    }

    return '';
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
