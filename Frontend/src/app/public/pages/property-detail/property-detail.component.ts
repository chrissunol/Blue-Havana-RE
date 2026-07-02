import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Property } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyListComponent } from '../../../shared/components/property-list/property-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { LucideAngularModule, MapPin, Check, CalendarDays } from 'lucide-angular';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PropertyListComponent,
    TranslateModule,
    LucideAngularModule,
    SectionTitleComponent
  ],
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.css'],
})
export class PropertyDetailComponent implements OnInit {
  property!: Property;
  similarProperties: Property[] = [];

  readonly MapPin = MapPin;
  readonly Check = Check;
  readonly CalendarDays = CalendarDays;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    public languageService: LanguageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        this.router.navigate(['/propiedades']);
        return;
      }

      this.loadProperty(id);
    });
  }

  private loadProperty(id: string): void {
    this.propertyService.getById(id).subscribe({
      next: (property: Property) => {
        this.property = property;

        this.scrollToTop();

        this.loadSimilarProperties(id);
      },
      error: () => {
        this.router.navigate(['/propiedades']);
      }
    });
  }

  private loadSimilarProperties(currentPropertyId: string): void {
    this.propertyService.getVisible().subscribe({
      next: (properties: Property[]) => {
        this.similarProperties = properties
          .filter((property: Property) => {
            return String(property.id) !== String(currentPropertyId);
          })
          .slice(0, 4);
      },
      error: () => {
        this.similarProperties = [];
      }
    });
  }

  private scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  get hasFeatures(): boolean {
    const features = this.property?.features;

    if (!features) return false;

    return Boolean(
      features.garage ||
      features.terrace ||
      features.pool ||
      features.garden ||
      features.ranchon ||
      features.balcony ||
      features.jacuzzi ||
      features.furnished ||
      features.other
    );
  }

  goToDetail(property: Property): void {
    if (!property?.id) return;

    this.router.navigate(['/propiedades', property.id]);
  }
}