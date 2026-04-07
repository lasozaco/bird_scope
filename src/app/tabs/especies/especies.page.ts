import { Component, computed, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonToolbar,
} from '@ionic/angular/standalone';

export interface Species {
  commonName: string;
  scientificName: string;
  family: string;
  status: string;
}

@Component({
  selector: 'app-especies',
  standalone: true,
  templateUrl: './especies.page.html',
  styleUrls: ['./especies.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
  ],
})
export class EspeciesPage {
  readonly search = signal('');

  readonly familyFilter = signal<string>('all');

  readonly sortBy = signal<'name' | 'scientific'>('name');

  readonly allSpecies: readonly Species[] = [
    {
      commonName: 'Alcaraván',
      scientificName: 'Vanellus chilensis',
      family: 'Charadriidae',
      status: 'LC',
    },
    {
      commonName: 'Loro Coroniamarillo',
      scientificName: 'Amazona ochrocephala',
      family: 'Psittacidae',
      status: 'LC',
    },
    {
      commonName: 'Barranquero Coronado',
      scientificName: 'Momotus momota',
      family: 'Momotidae',
      status: 'LC',
    },
    {
      commonName: 'Tángara Rabadilla Roja',
      scientificName: 'Ramphocelus dimidiatus',
      family: 'Thraupidae',
      status: 'LC',
    },
    {
      commonName: 'Colibrí Garganta Azul',
      scientificName: 'Lepidopyga coeruleogularis',
      family: 'Trochilidae',
      status: 'LC',
    },
    {
      commonName: 'Gavilán Caminero',
      scientificName: 'Rupornis magnirostris',
      family: 'Accipitridae',
      status: 'LC',
    },
    {
      commonName: 'Tortolita Orejuda',
      scientificName: 'Zenaida auriculata',
      family: 'Columbidae',
      status: 'LC',
    },
    {
      commonName: 'Carpintero Listado',
      scientificName: 'Melanerpes rubricapillus',
      family: 'Picidae',
      status: 'LC',
    },
    {
      commonName: 'Mirla Común',
      scientificName: 'Turdus fuscater',
      family: 'Turdidae',
      status: 'LC',
    },
    {
      commonName: 'Azulejo Palmero',
      scientificName: 'Thraupis palmarum',
      family: 'Thraupidae',
      status: 'LC',
    },
    {
      commonName: 'Chirlobirlo',
      scientificName: 'Pitangus sulphuratus',
      family: 'Tyrannidae',
      status: 'LC',
    },
    {
      commonName: 'Tordo Llanero',
      scientificName: 'Molothrus bonariensis',
      family: 'Icteridae',
      status: 'LC',
    },
    {
      commonName: 'Gallito de Roca',
      scientificName: 'Rupicola peruvianus',
      family: 'Cotingidae',
      status: 'LC',
    },
    {
      commonName: 'Tucán Andino',
      scientificName: 'Andigena hypoglauca',
      family: 'Ramphastidae',
      status: 'LC',
    },
    {
      commonName: 'Periquito Bronceado',
      scientificName: 'Brotogeris jugularis',
      family: 'Psittacidae',
      status: 'LC',
    },
    {
      commonName: 'Reinita Cejiblanca',
      scientificName: 'Myioborus ornatus',
      family: 'Parulidae',
      status: 'LC',
    },
    {
      commonName: 'Currucutú',
      scientificName: 'Megascops choliba',
      family: 'Strigidae',
      status: 'LC',
    },
    {
      commonName: 'Garza Cuello Blanco',
      scientificName: 'Ardea cocoi',
      family: 'Ardeidae',
      status: 'LC',
    },
  ];

  readonly families = computed(() => {
    const set = new Set(this.allSpecies.map((s) => s.family));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  readonly filteredSpecies = computed(() => {
    let list = [...this.allSpecies];
    const q = this.search().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.commonName.toLowerCase().includes(q) ||
          s.scientificName.toLowerCase().includes(q) ||
          s.family.toLowerCase().includes(q),
      );
    }
    const fam = this.familyFilter();
    if (fam !== 'all') {
      list = list.filter((s) => s.family === fam);
    }
    const sort = this.sortBy();
    if (sort === 'name') {
      list.sort((a, b) => a.commonName.localeCompare(b.commonName, 'es'));
    } else {
      list.sort((a, b) =>
        a.scientificName.localeCompare(b.scientificName, 'es'),
      );
    }
    return list;
  });

  readonly resultCount = computed(() => this.filteredSpecies().length);

  onSearchInput(ev: CustomEvent<{ value?: string | null }>): void {
    this.search.set(ev.detail.value ?? '');
  }

  onFamilyChange(ev: CustomEvent<{ value: string }>): void {
    this.familyFilter.set(String(ev.detail.value));
  }

  onSortChange(ev: CustomEvent<{ value: string }>): void {
    const v = ev.detail.value;
    this.sortBy.set(v === 'scientific' ? 'scientific' : 'name');
  }
}
