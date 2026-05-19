import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonIcon,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonRefresher, // 🔥
  IonRefresherContent, // 🔥
} from '@ionic/angular/standalone';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-reportes',
  standalone: true,
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonIcon,
    IonRefresher, // 🔥
    IonRefresherContent, // 🔥
  ],
})
export class ReportesPage implements OnInit {
  private firestore = inject(Firestore);
  private ngZone = inject(NgZone);

  totalObservaciones = 0;
  especiesUnicas = 0;
  confianzaPromedio = 0;
  conUbicacion = 0;
  progreso = 0;
  faltantes = 41;
  avistamientos: any[] = [];
  hayDatos = false;

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      const col = collection(this.firestore, 'avistamientos');
      const snapshot = await getDocs(col);
      const data = snapshot.docs.map((doc) => doc.data());

      this.ngZone.run(() => {
        this.avistamientos = data.sort(
          (a: any, b: any) =>
            new Date(b['fecha']).getTime() - new Date(a['fecha']).getTime(),
        );
        this.totalObservaciones = data.length;
        const especies = new Set(data.map((d: any) => d['especie']));
        this.especiesUnicas = especies.size;
        this.conUbicacion = data.filter(
          (d: any) => d['latitud'] !== null && d['latitud'] !== undefined,
        ).length;
        const confianzas = data
          .filter((d: any) => d['confianza'])
          .map((d: any) => d['confianza']);
        this.confianzaPromedio = confianzas.length
          ? Math.round(
              confianzas.reduce((a: number, b: number) => a + b, 0) /
                confianzas.length,
            )
          : 0;
        this.progreso = Math.round((this.especiesUnicas / 41) * 100);
        this.faltantes = 41 - this.especiesUnicas;
        this.hayDatos = data.length > 0;
      });
    } catch (e) {
      console.error('Error cargando datos:', e);
    }
  }
  async recargar(event: any) {
    await this.cargarDatos();
    event.target.complete();
  }
}
