import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CompanyInfo } from '../../../core/models/information.model';
import { InformationService } from '../../../core/services/information.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
  info: CompanyInfo = this.informationService.getInfo();

  constructor(private informationService: InformationService) {}

  ngOnInit() {
    this.informationService.info$.subscribe(info => {
      this.info = info;
    });

    this.informationService.loadInfo().subscribe();
  }
}
