import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';

import {
  LucideAngularModule,
  LucideIconData
} from 'lucide-angular';

export type DashboardStatVariant =
  | 'pending'
  | 'approved'
  | 'sold'
  | 'rented';

@Component({
  selector: 'app-dashboard-stat-card',
  standalone: true,
  imports: [
    LucideAngularModule
  ],
  templateUrl: './dashboard-stat-card.component.html',
  styleUrl: './dashboard-stat-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardStatCardComponent {
  @Input({ required: true })
  title = '';

  @Input({ required: true })
  value: number | string = 0;

  @Input({ required: true })
  icon!: LucideIconData;

  @Input()
  variant: DashboardStatVariant = 'sold';
}