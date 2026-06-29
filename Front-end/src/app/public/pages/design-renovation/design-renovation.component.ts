import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Columns3,
  DraftingCompass,
  Hammer,
  House,
  Leaf,
  LucideAngularModule,
  Paintbrush,
  Ruler,
  ShieldCheck,
  Sofa,
  Sparkles,
  SunMedium,
  ArrowRight
} from 'lucide-angular';
import {
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';

import {
  InformationService
} from '../../../core/services/information.service';

interface DesignCard {
  icon: any;
  titleKey: string;
  descriptionKey: string;
}

interface ArchitecturalStyle extends DesignCard {
  featureKeys: string[];
}

interface ProcessStep {
  number: string;
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-design-renovation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    TranslateModule
  ],
  templateUrl: './design-renovation.component.html',
  styleUrl: './design-renovation.component.css'
})
export class DesignRenovationComponent {
  readonly ArrowRightIcon = ArrowRight;
  readonly BuildingIcon = Building2;
  readonly CheckIcon = CheckCircle2;
  readonly DraftingIcon = DraftingCompass;

  readonly services: DesignCard[] = [
    {
      icon: DraftingCompass,
      titleKey:
        'DESIGN_RENOVATION.SERVICES.ITEMS.ARCHITECTURAL.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.SERVICES.ITEMS.ARCHITECTURAL.DESCRIPTION'
    },
    {
      icon: Hammer,
      titleKey:
        'DESIGN_RENOVATION.SERVICES.ITEMS.RENOVATION.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.SERVICES.ITEMS.RENOVATION.DESCRIPTION'
    },
    {
      icon: Paintbrush,
      titleKey:
        'DESIGN_RENOVATION.SERVICES.ITEMS.INTERIOR.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.SERVICES.ITEMS.INTERIOR.DESCRIPTION'
    },
    {
      icon: Ruler,
      titleKey:
        'DESIGN_RENOVATION.SERVICES.ITEMS.CONSULTING.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.SERVICES.ITEMS.CONSULTING.DESCRIPTION'
    }
  ];

  readonly architecturalStyles: ArchitecturalStyle[] = [
    {
      icon: Columns3,
      titleKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.COLONIAL.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.COLONIAL.DESCRIPTION',
      featureKeys: [
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.COLONIAL.FEATURES.ONE',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.COLONIAL.FEATURES.TWO',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.COLONIAL.FEATURES.THREE'
      ]
    },
    {
      icon: Building2,
      titleKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.ART_DECO.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.ART_DECO.DESCRIPTION',
      featureKeys: [
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.ART_DECO.FEATURES.ONE',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.ART_DECO.FEATURES.TWO',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.ART_DECO.FEATURES.THREE'
      ]
    },
    {
      icon: House,
      titleKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.MODERN.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.MODERN.DESCRIPTION',
      featureKeys: [
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.MODERN.FEATURES.ONE',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.MODERN.FEATURES.TWO',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.MODERN.FEATURES.THREE'
      ]
    },
    {
      icon: Sparkles,
      titleKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.MINIMALIST.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.MINIMALIST.DESCRIPTION',
      featureKeys: [
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.MINIMALIST.FEATURES.ONE',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.MINIMALIST.FEATURES.TWO',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.MINIMALIST.FEATURES.THREE'
      ]
    },
    {
      icon: Leaf,
      titleKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.TROPICAL.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.TROPICAL.DESCRIPTION',
      featureKeys: [
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.TROPICAL.FEATURES.ONE',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.TROPICAL.FEATURES.TWO',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.TROPICAL.FEATURES.THREE'
      ]
    },
    {
      icon: SunMedium,
      titleKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.CONTEMPORARY.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.CONTEMPORARY.DESCRIPTION',
      featureKeys: [
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.CONTEMPORARY.FEATURES.ONE',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.CONTEMPORARY.FEATURES.TWO',
        'DESIGN_RENOVATION.ARCHITECTURE.ITEMS.CONTEMPORARY.FEATURES.THREE'
      ]
    }
  ];

  readonly specifications: DesignCard[] = [
    {
      icon: ShieldCheck,
      titleKey:
        'DESIGN_RENOVATION.SPECIFICATIONS.ITEMS.QUALITY.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.SPECIFICATIONS.ITEMS.QUALITY.DESCRIPTION'
    },
    {
      icon: Sofa,
      titleKey:
        'DESIGN_RENOVATION.SPECIFICATIONS.ITEMS.COMFORT.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.SPECIFICATIONS.ITEMS.COMFORT.DESCRIPTION'
    },
    {
      icon: SunMedium,
      titleKey:
        'DESIGN_RENOVATION.SPECIFICATIONS.ITEMS.LIGHTING.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.SPECIFICATIONS.ITEMS.LIGHTING.DESCRIPTION'
    },
    {
      icon: ClipboardCheck,
      titleKey:
        'DESIGN_RENOVATION.SPECIFICATIONS.ITEMS.PLANNING.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.SPECIFICATIONS.ITEMS.PLANNING.DESCRIPTION'
    }
  ];

  readonly processSteps: ProcessStep[] = [
    {
      number: '01',
      titleKey:
        'DESIGN_RENOVATION.PROCESS.STEPS.EVALUATION.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.PROCESS.STEPS.EVALUATION.DESCRIPTION'
    },
    {
      number: '02',
      titleKey:
        'DESIGN_RENOVATION.PROCESS.STEPS.PROPOSAL.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.PROCESS.STEPS.PROPOSAL.DESCRIPTION'
    },
    {
      number: '03',
      titleKey:
        'DESIGN_RENOVATION.PROCESS.STEPS.PLANNING.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.PROCESS.STEPS.PLANNING.DESCRIPTION'
    },
    {
      number: '04',
      titleKey:
        'DESIGN_RENOVATION.PROCESS.STEPS.EXECUTION.TITLE',
      descriptionKey:
        'DESIGN_RENOVATION.PROCESS.STEPS.EXECUTION.DESCRIPTION'
    }
  ];

  constructor(
    private readonly informationService: InformationService,
    private readonly translateService: TranslateService
  ) {}

  get whatsappLink(): string {
    const information = this.informationService.getInfo();

    const phone = (
      information.whatsapp ||
      information.phone ||
      ''
    ).replace(/\D/g, '');

    const message = encodeURIComponent(
      this.translateService.instant(
        'DESIGN_RENOVATION.CTA.WHATSAPP_MESSAGE'
      )
    );

    return `https://wa.me/${phone}?text=${message}`;
  }
}