import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Handshake, HandHeart, Timer } from 'lucide-angular';
import { CompanyInfo } from '../../../core/models/information.model';
import { InformationService } from '../../../core/services/information.service';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, TranslateModule, LucideAngularModule, SectionTitleComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
  info: CompanyInfo = this.informationService.getInfo();
  readonly HandShake = Handshake;
  readonly HandHart = HandHeart;
  readonly Timer = Timer;

  constructor(private informationService: InformationService) {}

  ngOnInit() {
    this.informationService.info$.subscribe(info => {
      this.info = info;
    });

    this.informationService.loadInfo().subscribe();
  }
}
