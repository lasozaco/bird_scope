// =======================================================
// ANGULAR CORE
// =======================================================
import {
  Component,
  OnInit,
  computed,
  signal,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';

import { Router } from '@angular/router';

// =======================================================
// IONIC COMPONENTS
// =======================================================
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';

// =======================================================
// FIREBASE
// =======================================================
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

// =======================================================
// ICONOS IONIC
// =======================================================
import { addIcons } from 'ionicons';
import {
  closeOutline,
  checkmarkCircleOutline,
  cameraOutline,
  leafOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

export interface Species {
  commonName: string;
  scientificName: string;
  family: string;
  status: string;
  description?: string;
  habitat?: string;
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
    IonRefresher,
    IonRefresherContent,
  ],
})
export class EspeciesPage implements OnInit {
  private router = inject(Router);
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  readonly search = signal('');
  readonly familyFilter = signal<string>('all');
  readonly sortBy = signal<'name' | 'scientific'>('name');
  readonly randomChips = signal<Species[]>([]);

  detectedSpecies = signal(new Set<string>());
  detectedImages = signal(new Map<string, string[]>());
  selectedImages = signal<string[]>([]);
  selectedSpecies = signal<Species | null>(null);
  speciesDetected = signal<boolean>(false);

  // ✅ Nueva señal para foto ampliada
  fotoAmpliada = signal<string | null>(null);

  readonly allSpecies: readonly Species[] = [
    {
      commonName: 'Aguililla Caminera',
      scientificName: 'Rupornis magnirostris',
      family: 'Accipitridae',
      status: 'LC',
      description: 'Rapaz pequeña y valiente, muy común en potreros y bordes de carretera.',
      habitat: 'Potreros, bordes de carretera y bosque seco',
    },
    {
      commonName: 'Amazon Kingfisher',
      scientificName: 'Chloroceryle amazona',
      family: 'Alcedinidae',
      status: 'LC',
      description: 'Martín pescador grande de plumaje verde y blanco con pecho rojizo en el macho.',
      habitat: 'Ríos y quebradas de tierras bajas',
    },
    {
      commonName: 'Aratinga Pertinaz',
      scientificName: 'Eupsittula pertinax',
      family: 'Psittacidae',
      status: 'LC',
      description: 'Periquito naranja-pardo muy ruidoso, frecuente en zonas áridas y bosque seco.',
      habitat: 'Bosque seco, zonas áridas y rastrojos',
    },
    {
      commonName: 'Bananaquit',
      scientificName: 'Coereba flaveola',
      family: 'Thraupidae',
      status: 'LC',
      description: 'Pequeño pájaro negro y amarillo que se alimenta del néctar de las flores.',
      habitat: 'Jardines, bordes de bosque y cafetales',
    },
    {
      commonName: 'Barred Antshrike',
      scientificName: 'Thamnophilus doliatus',
      family: 'Thamnophilidae',
      status: 'LC',
      description: 'Hormiguero con barras blancas y negras, macho muy llamativo, hembra rufa.',
      habitat: 'Rastrojos densos y bordes de bosque',
    },
    {
      commonName: 'Benteveo',
      scientificName: 'Pitangus sulphuratus',
      family: 'Tyrannidae',
      status: 'LC',
      description: 'Tiránido grande y ruidoso con pecho amarillo brillante, muy territorial.',
      habitat: 'Zonas abiertas, ríos y jardines',
    },
    {
      commonName: 'Buco Bobito',
      scientificName: 'Bucco capensis',
      family: 'Bucconidae',
      status: 'LC',
      description: 'Buco grande de pecho moteado, quieto y difícil de ver en el interior del bosque.',
      habitat: 'Interior de bosques húmedos tropicales',
    },
    {
      commonName: 'Caracara Cabeza Amarilla',
      scientificName: 'Daptrius chimachima',
      family: 'Falconidae',
      status: 'LC',
      description: 'Caracara de cara amarilla, oportunista y carroñero, frecuente en zonas ganaderas.',
      habitat: 'Potreros, zonas ganaderas y bordes de río',
    },
    {
      commonName: 'Carib Grackle',
      scientificName: 'Quiscalus lugubris',
      family: 'Icteridae',
      status: 'LC',
      description: 'Tordo negro iridiscente de cola en forma de quilla, muy gregario y ruidoso.',
      habitat: 'Zonas urbanas, playas y zonas costeras',
    },
    {
      commonName: 'Carpintero Coronirrojo',
      scientificName: 'Melanerpes rubricapillus',
      family: 'Picidae',
      status: 'LC',
      description: 'Carpintero de barras blancas y negras con gorra roja, muy activo en árboles secos.',
      habitat: 'Bosque seco, zonas urbanas y arboladas',
    },
    {
      commonName: 'Carpintero Pecho Punteado',
      scientificName: 'Colaptes punctigula',
      family: 'Picidae',
      status: 'LC',
      description: 'Carpintero de pecho con puntos negros, frecuenta bordes de bosque húmedo.',
      habitat: 'Bordes de bosque húmedo y tierras bajas',
    },
    {
      commonName: 'Centzontle Tropical',
      scientificName: 'Mimus gilvus',
      family: 'Mimidae',
      status: 'LC',
      description: 'Excelente imitador de cantos de otras aves, muy activo al amanecer.',
      habitat: 'Zonas urbanas, jardines y bosque seco',
    },
    {
      commonName: 'Chachalaca Colombiana',
      scientificName: 'Ortalis columbiana',
      family: 'Cracidae',
      status: 'LC',
      description: 'Ave endémica de Colombia, muy vocal en grupos al amanecer y al atardecer.',
      habitat: 'Bosques húmedos y bordes de bosque andino',
    },
    {
      commonName: 'Colibrí Capucha Azul',
      scientificName: 'Lepidopyga coeruleogularis',
      family: 'Trochilidae',
      status: 'LC',
      description: 'Colibrí con capucha de color azul metálico brillante, muy ágil en vuelo.',
      habitat: 'Zonas húmedas, jardines y bordes de bosque',
    },
    {
      commonName: 'Colibrí Cola Canela',
      scientificName: 'Amazilia tzacatl',
      family: 'Trochilidae',
      status: 'LC',
      description: 'Colibrí de cola color canela oxidado, uno de los más comunes en jardines.',
      habitat: 'Jardines, cafetales y bordes de bosque húmedo',
    },
    {
      commonName: 'Colibrí Florido de Tolima',
      scientificName: 'Anthocephala berlepschi',
      family: 'Trochilidae',
      status: 'EN',
      description: '¡Endémico del Tolima! Especie en peligro, una de las más raras de Colombia.',
      habitat: 'Bosques secos del cañón del río Magdalena, Tolima',
    },
    {
      commonName: 'Eufonia Piquigruesa',
      scientificName: 'Euphonia laniirostris',
      family: 'Fringillidae',
      status: 'LC',
      description: 'Pequeña ave azul y amarilla con pico grueso, se alimenta de frutas y muérdago.',
      habitat: 'Bordes de bosque, jardines y arbolados',
    },
    {
      commonName: 'Gorrión Chingolo',
      scientificName: 'Zonotrichia capensis',
      family: 'Passerellidae',
      status: 'LC',
      description: 'Gorrión andino con corona listada, uno de los más familiares en zonas urbanas.',
      habitat: 'Potreros, jardines y zonas urbanas andinas',
    },
    {
      commonName: 'Guacamayo Severo',
      scientificName: 'Ara severus',
      family: 'Psittacidae',
      status: 'LC',
      description: 'Guacamayo de tamaño mediano con plumaje verde y manchas rojas en las alas.',
      habitat: 'Bosques húmedos y galerías boscosas',
    },
    {
      commonName: 'Halcón Fajado',
      scientificName: 'Falco femoralis',
      family: 'Falconidae',
      status: 'LC',
      description: 'Halcón de pecho barrado, cazador veloz especializado en aves y murciélagos.',
      habitat: 'Sabanas, potreros y zonas abiertas',
    },
    {
      commonName: 'Halcón Peregrino',
      scientificName: 'Falco peregrinus',
      family: 'Falconidae',
      status: 'LC',
      description: 'El ave más rápida del mundo, alcanza 300 km/h en picada. Visitante migratorio.',
      habitat: 'Zonas abiertas, ríos y ciudades',
    },
    {
      commonName: 'Hormiguero Ventriblanco',
      scientificName: 'Myrmeciza longipes',
      family: 'Thamnophilidae',
      status: 'LC',
      description: 'Hormiguero de vientre blanco y dorso café, terrestre y muy sigiloso.',
      habitat: 'Interior de bosques húmedos de tierras bajas',
    },
    {
      commonName: 'Ibis Afeitado',
      scientificName: 'Phimosus infuscatus',
      family: 'Threskiornithidae',
      status: 'LC',
      description: 'Ibis oscuro con cara desnuda rosada, gregario en humedales y potreros húmedos.',
      habitat: 'Humedales, potreros inundables y orillas de ríos',
    },
    {
      commonName: 'Jilguero Dorado',
      scientificName: 'Sicalis flaveola',
      family: 'Thraupidae',
      status: 'LC',
      description: 'Fringílido amarillo intenso muy popular, frecuente en zonas urbanas y potreros.',
      habitat: 'Zonas urbanas, jardines y rastrojos',
    },
    {
      commonName: 'Loro Alibronceado',
      scientificName: 'Pionus chalcopterus',
      family: 'Psittacidae',
      status: 'LC',
      description: 'Loro andino de plumaje azul-violáceo con alas bronceadas, muy vocal en bandadas.',
      habitat: 'Bosques andinos húmedos y de niebla',
    },
    {
      commonName: 'Mirlo Grande',
      scientificName: 'Turdus fuscater',
      family: 'Turdidae',
      status: 'LC',
      description: 'Una de las aves más familiares de los Andes, canta al amanecer con melodías fluidas.',
      habitat: 'Zonas urbanas, jardines y bosques andinos',
    },
    {
      commonName: 'Momoto Serrano',
      scientificName: 'Momotus aequatorialis',
      family: 'Momotidae',
      status: 'LC',
      description: 'Momoto andino con cola en forma de raqueta y colores turquesa y verde.',
      habitat: 'Bosques andinos húmedos y quebradas',
    },
    {
      commonName: 'Mosquerito Cabecigrís',
      scientificName: 'Leptopogon superciliaris',
      family: 'Tyrannidae',
      status: 'LC',
      description: 'Pequeño tiránido de cabeza gris y partes inferiores amarillentas, activo en el sotobosque.',
      habitat: 'Interior de bosques húmedos andinos',
    },
    {
      commonName: 'Moustached Puffbird',
      scientificName: 'Malacoptila mystacalis',
      family: 'Bucconidae',
      status: 'LC',
      description: 'Buco con bigotes blancos prominentes, sedentario y difícil de detectar en bosques.',
      habitat: 'Interior de bosques andinos húmedos',
    },
    {
      commonName: 'Pale-breasted Thrush',
      scientificName: 'Turdus leucomelas',
      family: 'Turdidae',
      status: 'LC',
      description: 'Mirla de pecho pálido, canta al amanecer, frecuente en bordes de bosque.',
      habitat: 'Bordes de bosque, jardines y zonas arboladas',
    },
    {
      commonName: 'Pijuí Pizarroso',
      scientificName: 'Synallaxis brachyura',
      family: 'Furnariidae',
      status: 'LC',
      description: 'Furnárido oscuro de cola larga, muy activo en rastrojos densos y matorrales.',
      habitat: 'Rastrojos húmedos y bordes de bosque',
    },
    {
      commonName: 'Saltador Garganta Ocre',
      scientificName: 'Saltator maximus',
      family: 'Thraupidae',
      status: 'LC',
      description: 'Saltador grande de garganta ocre cremosa, canto fuerte y melodioso.',
      habitat: 'Bordes de bosque húmedo y jardines arbolados',
    },
    {
      commonName: 'Saltarín Barbiblanco',
      scientificName: 'Manacus manacus',
      family: 'Pipridae',
      status: 'LC',
      description: 'Saltarín que realiza leks acrobáticos, macho con barba blanca muy característica.',
      habitat: 'Interior de bosques húmedos de tierras bajas',
    },
    {
      commonName: 'Semillero Intermedio',
      scientificName: 'Sporophila intermedia',
      family: 'Thraupidae',
      status: 'LC',
      description: 'Semillero de pico cónico, macho gris y blanco, habita pastizales y bordes de río.',
      habitat: 'Pastizales, bordes de río y rastrojos',
    },
    {
      commonName: 'Southern Lapwing',
      scientificName: 'Vanellus chilensis',
      family: 'Charadriidae',
      status: 'LC',
      description: 'Ave zancuda de prados abiertos, reconocible por su llamado estridente y espolones.',
      habitat: 'Sabanas, potreros y orillas de ríos',
    },
    {
      commonName: 'Tángara Azulgrís',
      scientificName: 'Thraupis episcopus',
      family: 'Thraupidae',
      status: 'LC',
      description: 'Una de las tángaras más abundantes, con plumaje azul-grisáceo muy característico.',
      habitat: 'Zonas abiertas, jardines y bordes de bosque',
    },
    {
      commonName: 'Tángara Matorralera',
      scientificName: 'Tangara vitriolina',
      family: 'Thraupidae',
      status: 'LC',
      description: 'Tángara endémica de Colombia con partes turquesa y negras, habita matorrales densos.',
      habitat: 'Matorrales secos y bordes de bosque andino',
    },
    {
      commonName: 'Tirano Pirirí',
      scientificName: 'Tyrannus melancholicus',
      family: 'Tyrannidae',
      status: 'LC',
      description: 'Tiránido grisáceo con corona oculta amarilla, posado visible en perchas expuestas.',
      habitat: 'Bordes de bosque, potreros y zonas abiertas',
    },
    {
      commonName: 'Tortolita Canela',
      scientificName: 'Columbina talpacoti',
      family: 'Columbidae',
      status: 'LC',
      description: 'Palomita canela rojiza de pequeño tamaño, muy abundante en zonas rurales y urbanas.',
      habitat: 'Zonas urbanas, potreros y rastrojos',
    },
    {
      commonName: 'Zenaida Torcaza',
      scientificName: 'Zenaida auriculata',
      family: 'Columbidae',
      status: 'LC',
      description: 'Paloma con manchas negras en la cara, abundante en zonas urbanas y campos abiertos.',
      habitat: 'Zonas urbanas, potreros y campos abiertos',
    },
    {
      commonName: 'Zopilote Común',
      scientificName: 'Coragyps atratus',
      family: 'Cathartidae',
      status: 'LC',
      description: 'Gallinazo de cabeza negra desnuda, carroñero clave en el equilibrio del ecosistema.',
      habitat: 'Zonas abiertas, carreteras y basureros',
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
          s.family.toLowerCase().includes(q) ||
          (s.description ?? '').toLowerCase().includes(q) ||
          (s.habitat ?? '').toLowerCase().includes(q),
      );
    }
    const fam = this.familyFilter();
    if (fam !== 'all') list = list.filter((s) => s.family === fam);
    const sort = this.sortBy();
    list.sort((a, b) =>
      sort === 'name'
        ? a.commonName.localeCompare(b.commonName, 'es')
        : a.scientificName.localeCompare(b.scientificName, 'es'),
    );
    return list;
  });

  readonly resultCount = computed(() => this.filteredSpecies().length);

  constructor() {
    addIcons({
      'close-outline': closeOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'camera-outline': cameraOutline,
      'leaf-outline': leafOutline,
      'chevron-forward-outline': chevronForwardOutline,
    });
  }

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      this.loadDetectedSpecies();
    });
  }

  shuffleChips() {
    const detected = this.allSpecies.filter((s) =>
      this.detectedSpecies().has(s.commonName.toLowerCase()),
    );
    const rest = this.allSpecies.filter(
      (s) => !this.detectedSpecies().has(s.commonName.toLowerCase()),
    );
    const shuffledDetected = [...detected].sort(() => Math.random() - 0.5);
    const shuffledRest = [...rest].sort(() => Math.random() - 0.5);
    const pool = [...shuffledDetected, ...shuffledRest];
    this.randomChips.set(pool.slice(0, 5));
  }

  async loadDetectedSpecies() {
    try {
      const col = collection(this.firestore, 'avistamientos');
      const snap = await getDocs(col);

      const nuevasDetectadas = new Set<string>();
      const newMap = new Map<string, string[]>();

      snap.docs.forEach((d) => {
        const data = d.data();
        const esp = data['especie'];
        if (!esp) return;

        const espNormalizado = esp
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        const match = this.allSpecies.find((s) => {
          const nombre = s.commonName
            .toLowerCase()
            .replace(/-/g, ' ')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          const cientifico = s.scientificName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          return (
            espNormalizado.includes(nombre) ||
            nombre.includes(espNormalizado) ||
            espNormalizado.includes(cientifico)
          );
        });

        const key = match ? match.commonName.toLowerCase() : espNormalizado;
        nuevasDetectadas.add(key);

        if (data['imagen']) {
          const imgs = newMap.get(key) ?? [];
          if (imgs.length < 3) {
            imgs.push(data['imagen']);
            newMap.set(key, imgs);
          }
        }
      });

      this.detectedSpecies.set(nuevasDetectadas);
      this.detectedImages.set(newMap);
    } catch (e) {
      console.warn('No se pudo cargar Firestore', e);
    }

    this.shuffleChips();
  }

  seleccionarChip(nombre: string) {
    this.search.set(nombre);
  }

  openSpecies(s: Species) {
    const key = s.commonName.toLowerCase();
    this.selectedSpecies.set(s);
    this.speciesDetected.set(this.detectedSpecies().has(key));
    this.selectedImages.set(this.detectedImages().get(key) ?? []);
  }

  closeModal() {
    this.selectedSpecies.set(null);
    this.fotoAmpliada.set(null); // ✅ cerrar foto si estaba abierta
  }

  // ✅ Abrir foto ampliada
  abrirFoto(img: string) {
    this.fotoAmpliada.set(img);
  }

  // ✅ Cerrar foto ampliada
  cerrarFoto() {
    this.fotoAmpliada.set(null);
  }

  goToClasificar() {
    this.closeModal();
    this.router.navigate(['/tabs/clasificar']);
  }

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

  recargar(event: any) {
    runInInjectionContext(this.injector, async () => {
      await this.loadDetectedSpecies();
      setTimeout(() => {
        event.target.complete();
      }, 900);
    });
  }
}