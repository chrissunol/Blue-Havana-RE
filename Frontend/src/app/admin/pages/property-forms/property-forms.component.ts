import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Property, TranslatedText } from '../../../core/models/property.model';
import { LanguageService } from '../../../core/services/language.service';
import { HAVANA_MUNICIPALITIES, PROPERTY_TYPES } from '../../../core/constants/property-options';

@Component({
  selector: 'app-property-forms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './property-forms.component.html',
  styleUrl: './property-forms.component.css',
})
export class PropertyFormsComponent implements OnChanges, OnInit {
  @Input() property: Property | null = null;

  @Output() save = new EventEmitter<Property>();
  @Output() cancel = new EventEmitter<void>();

  previews: string[] = [];
  propertyTypes = PROPERTY_TYPES;
  municipalities = HAVANA_MUNICIPALITIES;
  formError = '';

  form = this.fb.group({
    id: [''],
    title: ['', Validators.required],
    category: ['', Validators.required],
    listingType: ['property', Validators.required],
    operation: ['sale', Validators.required],
    location: ['', Validators.required],

    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    annualPrice: this.fb.control<number | null>(null),
    pricePerM2: this.fb.control<number | null>(null),
    bedrooms: this.fb.control<number | null>(null, [Validators.min(0)]),
    bathrooms: this.fb.control<number | null>(null, [Validators.min(0)]),
    floors: this.fb.control<number | null>(null, [Validators.min(1)]),
    area: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),

    description: [''],
    visible: [true],
    featured: [false],
    images: this.fb.control<string[]>([]),

    features: this.fb.group({
      garage: [false],
      terrace: [false],
      pool: [false],
      garden: [false],
      ranchon: [false],
      balcony: [false],
      jacuzzi: [false],
      furnished: [false],
      other: [false],
      otherText: [''],
    }),
  });

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.form.get('features.other')?.valueChanges.subscribe((checked) => {
      if (!checked) {
        this.form.get('features.otherText')?.setValue('');
      }
    });

    this.form.get('operation')?.valueChanges.subscribe((operation) => {
      if (operation === 'sale') {
        this.form.get('annualPrice')?.setValue(null);
      }
    });
  }

  ngOnChanges() {
    if (!this.property) {
      this.form.reset({
        id: '',
        title: '',
        category: '',
        listingType: 'property',
        operation: 'sale',
        location: '',
        price: null,
        annualPrice: null,
        pricePerM2: null,
        bedrooms: null,
        bathrooms: null,
        floors: null,
        area: null,
        description: '',
        visible: true,
        featured: false,
        images: [],
        features: {
          garage: false,
          terrace: false,
          pool: false,
          garden: false,
          ranchon: false,
          balcony: false,
          jacuzzi: false,
          furnished: false,
          other: false,
          otherText: '',
        },
      });

      this.previews = [];
      return;
    }

    this.form.patchValue({
      id: this.property.id,
      title: this.fromTranslatedText(this.property.title),
      category: this.fromTranslatedText(this.property.category),
      listingType: this.property.listingType ?? 'property',
      operation: this.property.operation,
      location: this.fromTranslatedText(this.property.location),
      price: this.property.price,
      annualPrice: this.property.annualPrice ?? null,
      pricePerM2: this.property.pricePerM2 ?? null,
      bedrooms: this.property.bedrooms,
      bathrooms: this.property.bathrooms,
      floors: this.property.floors ?? null,
      area: this.property.area,
      description: this.fromTranslatedText(this.property.description),
      visible: this.property.visible,
      featured: this.property.featured,
      images: this.property.images,
      features: {
        garage: false,
        terrace: false,
        pool: false,
        garden: false,
        ranchon: false,
        balcony: false,
        jacuzzi: false,
        furnished: false,
        other: false,
        otherText: '',
        ...this.property.features,
      },
    });

    this.previews = [...this.property.images];
  }

  get operation() {
    return this.form.get('operation')?.value;
  }

  get otherSelected() {
    return this.form.get('features.other')?.value === true;
  }

  submit() {
    this.formError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError = 'Completa los campos obligatorios: nombre, tipo de propiedad, zona, tamaño y costo.';
      return;
    }

    const raw = this.form.getRawValue();

    const value: Property = {
      id: raw.id || crypto.randomUUID(),
      title: this.toTranslatedText(raw.title),
      category: this.toTranslatedText(raw.category),
      listingType: raw.listingType as 'property' | 'business',
      operation: raw.operation as 'sale' | 'rent',
      location: this.toTranslatedText(raw.location),
      price: raw.price || 0,
      annualPrice: raw.operation === 'rent' ? raw.annualPrice || 0 : undefined,
      pricePerM2: raw.pricePerM2 || 0,
      bedrooms: raw.bedrooms || 0,
      bathrooms: raw.bathrooms || 0,
      floors: raw.floors && raw.floors >= 1 ? raw.floors : undefined,
      area: raw.area || 0,
      description: this.toTranslatedText(raw.description),
      images: raw.images || [],
      visible: raw.visible ?? true,
      featured: raw.featured ?? false,
      features: {
        garage: raw.features?.garage ?? false,
        terrace: raw.features?.terrace ?? false,
        pool: raw.features?.pool ?? false,
        garden: raw.features?.garden ?? false,
        ranchon: raw.features?.ranchon ?? false,
        balcony: raw.features?.balcony ?? false,
        jacuzzi: raw.features?.jacuzzi ?? false,
        furnished: raw.features?.furnished ?? false,
        other: raw.features?.other ?? false,
        otherText: raw.features?.otherText ?? '',
      },
    };

    this.save.emit(value);
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        const imageUrl = reader.result as string;

        this.previews.push(imageUrl);

        const currentImages = this.form.get('images')?.value ?? [];

        this.form.patchValue({
          images: [...currentImages, imageUrl],
        });
      };

      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removePreview(index: number) {
    this.previews.splice(index, 1);

    const currentImages = this.form.get('images')?.value ?? [];
    currentImages.splice(index, 1);

    this.form.patchValue({
      images: currentImages,
    });
  }

  private toTranslatedText(value: string | null | undefined): TranslatedText {
    const text = value || '';

    return {
      es: text,
      en: text,
      fr: text,
    };
  }

  private fromTranslatedText(value?: TranslatedText): string {
    return value?.[this.languageService.getCurrentLang()] || value?.es || '';
  }
}
