import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Property } from '../../../core/models/property.model';
import {
  PropertyCardComponent,
  PropertyCardMode,
} from '../property-card/property-card.component';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent],
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.css',
})
export class PropertyListComponent {
  @Input() properties: Property[] = [];
  @Input() mode: PropertyCardMode = 'public';

 @Output() view = new EventEmitter<Property>();
  @Output() edit = new EventEmitter<Property>();
  @Output() remove = new EventEmitter<Property>();
  @Output() toggleVisibility = new EventEmitter<Property>();
  @Output() toggleFeatured = new EventEmitter<Property>();
}