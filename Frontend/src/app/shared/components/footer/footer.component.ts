import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import {
  LucideAngularModule,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-angular';

import { CompanyInfo } from '../../../core/models/information.model';
import { InformationService } from '../../../core/services/information.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink,
    TranslateModule,
    LucideAngularModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {

  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly MapPin = MapPin;
  readonly Facebook = Facebook;
  readonly Instagram = Instagram;
  readonly Twitter = Twitter;

  info: CompanyInfo = this.informationService.getInfo();

  constructor(private informationService: InformationService) {}

  ngOnInit() {
    this.informationService.info$.subscribe(info => {
      this.info = info;
    });

    this.informationService.loadInfo().subscribe();
  }
}
