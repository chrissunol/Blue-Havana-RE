import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <section class="not-found">
      <h1>404</h1>
      <p>{{ 'NOT_FOUND.MESSAGE' | translate }}</p>
      <a routerLink="/">{{ 'NOT_FOUND.HOME' | translate }}</a>
    </section>
  `,
  styles: [
    `
      .not-found {
        min-height: 50vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        text-align: center;
        padding: 48px 24px;
      }
      a {
        color: #0071bc;
        font-weight: 600;
      }
    `,
  ],
})
export class NotFoundComponent {}
