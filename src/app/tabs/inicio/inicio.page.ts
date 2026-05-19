import {
  Component,
  inject,
  Injector,
  runInInjectionContext,
  NgZone,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  leafOutline,
  locationOutline,
  barChartOutline,
} from 'ionicons/icons';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-inicio',
  standalone: true,
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class InicioPage {
  private firestore = inject(Firestore);
  private router = inject(Router);
  private injector = inject(Injector);
  private ngZone = inject(NgZone);

  totalObservaciones = 0;
  totalEspecies = 0;
  cargando = true;

  especiesDestacadas: { nombre: string; latin: string; imagen?: string }[] = [];

  constructor() {
    addIcons({ cameraOutline, leafOutline, locationOutline, barChartOutline });
  }

  ionViewWillEnter() {
    runInInjectionContext(this.injector, () => {
      this.cargarEstadisticas();
    });
  }

  async cargarEstadisticas() {
    try {
      const col = collection(this.firestore, 'avistamientos');
      const snap = await getDocs(col);
      const data = snap.docs.map((d) => d.data() as any);

      this.ngZone.run(() => {
        this.totalObservaciones = data.length;

        const mapaEspecies = new Map<
          string,
          { latin: string; imagen?: string }
        >();
        data.forEach((d) => {
          if (!d['especie']) return;
          const nombre = d['especie'] as string;
          const existing = mapaEspecies.get(nombre);
          if (!existing || (!existing.imagen && d['imagen'])) {
            mapaEspecies.set(nombre, {
              latin: d['nombreCientifico'] ?? '',
              imagen: d['imagen'] ?? undefined,
            });
          }
        });

        this.totalEspecies = mapaEspecies.size;

        this.especiesDestacadas = Array.from(mapaEspecies.entries())
          .slice(0, 6)
          .map(([nombre, val]) => ({ nombre, ...val }));

        this.cargando = false;
      });
    } catch (e) {
      console.error('Error cargando stats:', e);
      this.cargando = false;
    }
  }

  irAClasificar() {
    this.router.navigate(['/tabs/clasificar']);
  }
  // 🔄 Pull To Refresh
  recargar(event: any) {
    console.log('Refrescando inicio...');

    // vuelve a cargar estadísticas sin cerrar app
    this.cargando = true;
    this.cargarEstadisticas();

    setTimeout(() => {
      event.target.complete(); // quita animación
    }, 1000);
  }
}
