import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Property } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import { HeroSearchComponent } from '../../component/hero-search/hero-search.component';
import { PropertyListComponent } from '../../../shared/components/property-list/property-list.component';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroSearchComponent, PropertyListComponent, SectionTitleComponent, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  properties: Property[] = [];

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {
    this.propertyService.getFeatured().subscribe(properties => {
      this.properties = properties;
    });
  }

  goToDetail(property: Property) {
    this.router.navigate(['/propiedades', property.id]);
  }
}
