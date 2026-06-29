import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Phone, Facebook, Youtube, Send, Instagram, ChevronLeft, ChevronRight, Quote } from 'lucide-angular';
import { Property } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import { HeroSearchComponent } from '../../component/hero-search/hero-search.component';
import { PropertyListComponent } from '../../../shared/components/property-list/property-list.component';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { TranslateModule } from '@ngx-translate/core';
import { InformationService } from '../../../core/services/information.service';
import { CompanyInfo } from '../../../core/models/information.model';
import { ReviewModalComponent } from '../../../shared/components/review-modal/review-modal.component';
import { ReviewFormData } from '../../../core/models/reviewForm.model';

interface CityCard {
  labelKey: string;
  value: string;
  count: number;
  image: string;
  fallbackImage: string;
}

interface HomeReview {
  id: number;
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
    ReviewModalComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  properties: Property[] = [];
  cityCards: CityCard[] = [];
  readonly Phone = Phone;
  info!: CompanyInfo;
  readonly FacebookIcon = Facebook;
  readonly YoutubeIcon = Youtube;
  readonly TelegramIcon = Send;
  readonly InstagramIcon = Instagram;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly QuoteIcon = Quote;

  readonly reviewStars = [1, 2, 3, 4, 5];

currentReviewIndex = 0;

reviews: HomeReview[] = [
  {
    id: 1,
    name: 'Carlos Martínez',
    rating: 5,
    comment:
      'Excelente atención durante todo el proceso. Encontramos la propiedad que buscábamos y recibimos orientación en cada paso.'
  },
  {
    id: 2,
    name: 'Laura Rodríguez',
    rating: 5,
    comment:
      'El equipo fue muy profesional y respondió rápidamente todas nuestras preguntas. Recomiendo completamente sus servicios.'
  },
  {
    id: 3,
    name: 'Miguel Hernández',
    rating: 4,
    comment:
      'Muy buena experiencia. La información de las propiedades fue clara y el acompañamiento fue excelente.'
  }
];

get currentReview(): HomeReview | undefined {
  return this.reviews[this.currentReviewIndex];
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

  reviewModalOpen = false;

  openReviewModal(): void {
    this.reviewModalOpen = true;
  }

  closeReviewModal(): void {
    this.reviewModalOpen = false;
  }

   handleReviewSubmitted(review: ReviewFormData): void {
    console.log('Reseña recibida:', review);

    // Aquí conectaremos ReviewService con el backend.
    this.closeReviewModal();
  }

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
    private propertyService: PropertyService,
    private router: Router,
    private informationService: InformationService
  ) {}

  ngOnInit(): void {
  this.info = this.informationService.getInfo();

  this.loadFeaturedProperties();
  this.loadCityCards();

  this.informationService.info$.subscribe(info => {
    this.info = info;
  });

  this.informationService.loadInfo().subscribe();
}
  get whatsappLink(): string {
    const phone = this.info.whatsapp.replace(/\D/g, '');
    return `https://wa.me/${phone}?text=Hola,%20quiero%20información%20sobre%20una%20propiedad`;
  }

  private loadFeaturedProperties(): void {
    this.propertyService.getFeatured().subscribe({
      next: (properties: Property[]) => {
        this.properties = properties;
      },
      error: () => {
        this.properties = [];
      }
    });
  }

  private loadCityCards(): void {
    this.propertyService.getVisible().subscribe({
      next: (properties: Property[]) => {
        this.cityCards = this.baseCities.map(city => {
          const propertiesByCity = properties.filter(property =>
            this.matchLocation(property.location, city.value)
          );

          const firstPropertyWithImage = propertiesByCity.find(property =>
            property.images && property.images.length > 0
          );

          return {
            ...city,
            count: propertiesByCity.length,
            image: firstPropertyWithImage?.images?.[0] || city.fallbackImage,
          };
        });
      },
      error: () => {
        this.cityCards = this.baseCities.map(city => ({
          ...city,
          image: city.fallbackImage,
        }));
      }
    });
  }

  private matchLocation(propertyLocation: unknown, city: string): boolean {
    const locationText = this.getTranslatedText(propertyLocation);

    if (!locationText) return false;

    const locationValue = this.normalize(locationText);
    const cityValue = this.normalize(city);

    return (
      locationValue === cityValue ||
      locationValue.includes(cityValue) ||
      cityValue.includes(locationValue)
    );
  }

  private getTranslatedText(value: unknown): string {
    if (!value) return '';

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const translated = value as {
        es?: string;
        en?: string;
        value?: string;
        name?: string;
      };

      return (
        translated.es ||
        translated.en ||
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

  goToDetail(property: Property): void {
    if (!property?.id) return;

    this.router.navigate(['/propiedades', property.id]);
  }
}