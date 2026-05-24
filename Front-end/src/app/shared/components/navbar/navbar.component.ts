import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Language, LanguageService } from '../../../core/services/language.service';
import { CompanyInfo } from '../../../core/models/information.model';
import { InformationService } from '../../../core/services/information.service';
import { LucideAngularModule, Phone, Menu, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule, LucideAngularModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  selectedLanguage: Language = 'es';
  isLanguageOpen = false;
  isMobileMenuOpen = false;
  info: CompanyInfo = this.informationService.getInfo();
  readonly Phone = Phone;
  readonly Menu = Menu;
  readonly ChevronDown = ChevronDown;

  constructor(
    private languageService: LanguageService,
    private informationService: InformationService
  ) {
    this.selectedLanguage = this.languageService.getCurrentLang();
  }

  ngOnInit() {
    this.informationService.info$.subscribe(info => {
      this.info = info;
    });

    this.informationService.loadInfo().subscribe();
  }

  get whatsappLink(): string {
    const phone = this.info.whatsapp.replace(/\D/g, '');
    return `https://wa.me/${phone}?text=Hola,%20quiero%20información%20sobre%20una%20propiedad`;
  }

  toggleLanguageMenu() {
    this.isLanguageOpen = !this.isLanguageOpen;
  }

  changeLang(lang: Language) {
    this.selectedLanguage = lang;
    this.isLanguageOpen = false;
    this.languageService.changeLang(lang);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
