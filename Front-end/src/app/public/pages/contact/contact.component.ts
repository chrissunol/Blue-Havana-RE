import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CompanyInfo } from '../../../core/models/information.model';
import { InformationService } from '../../../core/services/information.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit {
  info: CompanyInfo = this.informationService.getInfo();

  constructor(private informationService: InformationService) {}

  ngOnInit() {
    this.informationService.info$.subscribe(info => {
      this.info = info;
    });
    this.informationService.loadInfo().subscribe();
  }

  get whatsappLink(): string {
    const phone = (this.info.whatsapp || '').replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent('Hola, quiero información sobre una propiedad')}`;
  }

  get telLink(): string {
    const phone = (this.info.phone || this.info.whatsapp || '').replace(/\s/g, '');
    return `tel:${phone}`;
  }

  get mailtoLink(): string {
    const subject = encodeURIComponent('Consulta Blue Havana Real Estate');
    return `mailto:${this.info.email}?subject=${subject}`;
  }
}
