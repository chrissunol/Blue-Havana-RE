import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { CompanyInfo } from '../../../core/models/information.model';
import { InformationService } from '../../../core/services/information.service';
import { LucideAngularModule, Instagram, Twitter, Facebook, Send } from 'lucide-angular';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './information.component.html',
  styleUrl: './information.component.css',
})
export class InformationComponent implements OnInit {
  savedMessage = '';
  sectionSearch = this.fb.control('');
  readonly InstagramIcon = Instagram;
  readonly TelegramIcon = Send;
  readonly TwitterIcon = Twitter;
  readonly FacebookIcon = Facebook;

  form = this.fb.group({
    phone: [''],
    whatsapp: [''],
    email: [''],
    address: [''],
    facebook: [''],
    instagram: [''],
    x: [''],
    telegram: [''],
    youtube: [''],
    originText: [''],
    todayText: [''],
    futureText: [''],
    whereText: [''],
  });

  sections = [
    { label: 'Contacto', id: 'contact-info' },
    { label: 'Redes sociales', id: 'social-info' },
    { label: 'De donde venimos', id: 'origin-info' },
    { label: 'Qué hacemos hoy', id: 'today-info' },
    { label: 'A donde vamos', id: 'future-info' },
    { label: 'Dónde estamos', id: 'where-info' },
  ];

  constructor(
    private fb: FormBuilder,
    private informationService: InformationService
  ) {}

  ngOnInit() {
    this.form.patchValue(this.informationService.getInfo());
    this.informationService.loadInfo().subscribe({
      next: info => this.form.patchValue(info),
    });
  }

  save() {
    const value = this.form.getRawValue() as CompanyInfo;

    this.informationService.updateInfo(value).subscribe({
      next: () => this.showMessage('Información guardada correctamente'),
      error: () => this.showMessage('No se pudo guardar la información'),
    });
  }

  reset() {
    this.informationService.resetInfo().subscribe({
      next: info => {
        this.form.patchValue(info);
        this.showMessage('Información restaurada');
      },
      error: () => this.showMessage('No se pudo restaurar la información'),
    });
  }

  searchSection() {
    const query = this.sectionSearch.value?.trim().toLowerCase();
    if (!query) return;

    const section = this.sections.find(item => item.label.toLowerCase().includes(query));
    if (!section) return;

    document.getElementById(section.id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  private showMessage(message: string) {
    this.savedMessage = message;
    setTimeout(() => {
      this.savedMessage = '';
    }, 2500);
  }
}
