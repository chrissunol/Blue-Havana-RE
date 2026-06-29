import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Language, LanguageService } from '../../../core/services/language.service';
import { CompanyInfo } from '../../../core/models/information.model';
import { InformationService } from '../../../core/services/information.service';
import { LucideAngularModule, Phone, Menu, ChevronDown } from 'lucide-angular';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports:  [RouterLink, RouterLinkActive, TranslateModule, LucideAngularModule],
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
  isPropertiesOpen = false;
 selectedPropertyLabelKey = 'NAV.PROPERTIES';

  constructor(
    private languageService: LanguageService,
    private informationService: InformationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.selectedLanguage = this.languageService.getCurrentLang();
    this.updatePropertyLabelFromUrl();
    this.router.events
    .pipe(
      filter(
        event => event instanceof NavigationEnd
      )
    )
    .subscribe(() => {
      this.updatePropertyLabelFromUrl();
    });
  }

  ngOnInit() {
    this.informationService.info$.subscribe(info => {
      this.info = info;
    });

    this.informationService.loadInfo().subscribe();
  }
  selectPropertyOption(labelKey: string): void {
  this.selectedPropertyLabelKey = labelKey;
  this.isPropertiesOpen = false;
  this.closeMobileMenu();
}

private updatePropertyLabelFromUrl(): void {
  const urlTree = this.router.parseUrl(
    this.router.url
  );

  const queryParams = urlTree.queryParams;

  const operation = queryParams['operation'];
  const listingType = queryParams['listingType'];

  if (listingType === 'business') {
    this.selectedPropertyLabelKey =
      'NAV.BUSINESSES';

    return;
  }

  if (operation === 'venta') {
    this.selectedPropertyLabelKey =
      'NAV.SALE';

    return;
  }

  if (operation === 'renta') {
    this.selectedPropertyLabelKey =
      'NAV.RENT';

    return;
  }

  this.selectedPropertyLabelKey =
    'NAV.PROPERTIES';
}

  get showHomeButton(): boolean {
  return this.router.url.split('?')[0].split('#')[0] !== '/';
}

  get whatsappLink(): string {
    const phone = this.info.whatsapp.replace(/\D/g, '');
    return `https://wa.me/${phone}?text=Hola,%20quiero%20información%20sobre%20una%20propiedad`;
  }

  togglePropertiesMenu() {
  this.isPropertiesOpen = !this.isPropertiesOpen;
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
  this.isPropertiesOpen = false;
}
}
