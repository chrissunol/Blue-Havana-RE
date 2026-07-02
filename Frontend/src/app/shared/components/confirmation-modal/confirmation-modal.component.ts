import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

import {
  AlertTriangle,
  LucideAngularModule,
  Pencil,
  Trash2,
  X
} from 'lucide-angular';

export type ConfirmationAction =
  | 'edit'
  | 'delete';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [
    LucideAngularModule
  ],
  templateUrl:
    './confirmation-modal.component.html',
  styleUrl:
    './confirmation-modal.component.css'
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;

  @Input()
  action: ConfirmationAction = 'edit';

  @Input() itemName = '';

  @Input() title = '';

  @Input() message = '';

  @Input() confirmLabel = '';

  @Input()
  warningMessage =
    'Esta acción no se puede deshacer.';

  @Output()
  confirmed = new EventEmitter<void>();

  @Output()
  cancelled = new EventEmitter<void>();

  readonly CloseIcon = X;
  readonly EditIcon = Pencil;
  readonly DeleteIcon = Trash2;
  readonly WarningIcon = AlertTriangle;

  get isDeleteAction(): boolean {
    return this.action === 'delete';
  }

  get modalTitle(): string {
    if (this.title.trim()) {
      return this.title;
    }

    return this.isDeleteAction
      ? 'Eliminar elemento'
      : 'Editar elemento';
  }

  get modalMessage(): string {
    if (this.message.trim()) {
      return this.message;
    }

    return this.isDeleteAction
      ? '¿Estás seguro de que deseas eliminar este elemento?'
      : '¿Deseas continuar con la edición?';
  }

  get confirmButtonLabel(): string {
    if (this.confirmLabel.trim()) {
      return this.confirmLabel;
    }

    return this.isDeleteAction
      ? 'Sí, eliminar'
      : 'Sí, editar';
  }

  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (!this.isOpen) {
      return;
    }

    this.cancel();
  }
}