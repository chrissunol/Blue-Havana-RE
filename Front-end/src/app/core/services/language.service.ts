import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { TranslatedText } from '../models/property.model';


export type Language = 'es' | 'en' | 'fr';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private isBrowser = false;

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    const lang = this.isBrowser
      ? ((localStorage.getItem('lang') as Language) || 'es')
      : 'es';

    this.translate.setDefaultLang('es');
    this.translate.use(lang);
  }

  changeLang(lang: Language) {
    this.translate.use(lang);

    if (this.isBrowser) {
      localStorage.setItem('lang', lang);
    }
  }

  getCurrentLang(): Language {
    return (this.translate.currentLang as Language) || 'es';
  }

  translateText(text?: TranslatedText): string {
  if (!text) return '';

  const lang = this.getCurrentLang();

  return text[lang] || text.es;
}
}
