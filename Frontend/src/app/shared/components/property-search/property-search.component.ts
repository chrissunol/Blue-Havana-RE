import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PropertyFilters } from '../../../core/models/property-filter.model';
import { TranslateModule } from '@ngx-translate/core';
import { HAVANA_MUNICIPALITIES, PROPERTY_TYPES } from '../../../core/constants/property-options';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';


type Dropdown = 'category' | 'location' | 'bedrooms' | 'bathrooms' | 'features' | null;

@Component({
  selector: 'app-property-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, LucideAngularModule],
  templateUrl: './property-search.component.html',
  styleUrl: './property-search.component.css',
})
export class PropertySearchComponent {
  @Output() search = new EventEmitter<PropertyFilters>();

  openDropdown: Dropdown = null;
  readonly ChevronDown = ChevronDown;

  categories = PROPERTY_TYPES;
  locations = HAVANA_MUNICIPALITIES;

  form = this.fb.group({
    operation: ['all'],
    category: [''],
    location: [''],
    bedrooms: [null as number | null],
    bathrooms: [null as number | null],
    features: this.fb.group({
      garage: [false],
      terrace: [false],
      pool: [false],
      garden: [false],
      ranchon: [false],
      balcony: [false],
      jacuzzi: [false],
      furnished: [false],
    }),
  });

  constructor(private fb: FormBuilder) {}

  setOperation(operation: 'all' | 'rent' | 'sale') {
    this.form.patchValue({ operation });
  }

  toggleDropdown(dropdown: Dropdown) {
    this.openDropdown = this.openDropdown === dropdown ? null : dropdown;
  }

  selectCategory(category: string) {
    this.form.patchValue({ category });
    this.openDropdown = null;
  }

  selectLocation(location: string) {
    this.form.patchValue({ location });
    this.openDropdown = null;
  }

  clearFilters() {
    this.form.reset({
      operation: 'all',
      category: '',
      location: '',
      bedrooms: null,
      bathrooms: null,
      features: {
        garage: false,
        terrace: false,
        pool: false,
        garden: false,
        ranchon: false,
        balcony: false,
        jacuzzi: false,
        furnished: false,
      },
    });

    this.search.emit(this.form.getRawValue() as PropertyFilters);
  }

  onSearch() {
    const filters = this.form.getRawValue() as PropertyFilters;
    this.search.emit(filters);
    this.openDropdown = null;
  }
}
