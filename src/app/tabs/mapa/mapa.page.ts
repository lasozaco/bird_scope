import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  NgZone,
  signal,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  standalone: true,
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonButton,
    IonSearchbar,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class MapaPage implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private ngZone = inject(NgZone);
  private injector = inject(Injector);

  readonly viewMode = signal<'mapa' | 'lista'>('mapa');

  totalObservaciones = 0;
  conUbicacion = 0;
  avistamientos: any[] = [];
  avistamientosPorEspecie: { especie: string; items: any[]; color: string }[] = [];

  // Buscador
  busqueda = '';
  sugerencias: string[] = [];
  recomendaciones: string[] = [];
  mostrarSugerencias = false;
  resultadoBusqueda: string | null = null;
  noEncontrada = false;

  // ✅ Especie actualmente filtrada (null = todas) — se usa para mantener el filtro activo al reiniciar mapa o cambiar vista
  especieFiltrada: string | null = null;

  private mapa: L.Map | null = null;
  private marcadores = new Map<string, L.Marker[]>();

  private readonly COLORES = [
    '#1f6f49', '#0f8b8d', '#9a6a00', '#c0392b',
    '#8e44ad', '#2980b9', '#e67e22', '#27ae60',
  ];

  async ngOnInit() {
    await this.cargarDatos();
    // Iniciar mapa con un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => this.iniciarMapa(), 600);
  }

  ngOnDestroy() {
    this.destruirMapa();
  }

  ionViewDidEnter() {
    setTimeout(() => {
      if (this.mapa) {
        this.mapa.invalidateSize();
      } else {
        this.iniciarMapa();
      }
    }, 300);
  }

  ionViewWillLeave() {
    this.destruirMapa();
  }

  destruirMapa() {
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }
    this.marcadores.clear();
  }

  async cargarDatos() {
    try {
      await runInInjectionContext(this.injector, async () => {
        const col = collection(this.firestore, 'avistamientos');
        const snapshot = await getDocs(col);
        const data = snapshot.docs.map((doc) => doc.data());

        this.ngZone.run(() => {
          this.avistamientos = data;
          this.totalObservaciones = data.length;
          this.conUbicacion = data.filter(
            (d: any) => d['latitud'] !== null && d['latitud'] !== undefined,
          ).length;
          this.agruparPorEspecie(data);
          this.generarRecomendaciones();
        });
      });
    } catch (e) {
      console.error('Error:', e);
    }
  }

  agruparPorEspecie(data: any[]) {
    const mapa = new Map<string, any[]>();
    data.forEach((a) => {
      const esp = a['especie'] || 'Desconocida';
      if (!mapa.has(esp)) mapa.set(esp, []);
      mapa.get(esp)!.push(a);
    });

    let i = 0;
    this.avistamientosPorEspecie = Array.from(mapa.entries()).map(
      ([especie, items]) => ({
        especie,
        items,
        color: this.COLORES[i++ % this.COLORES.length],
      }),
    );
  }

  generarRecomendaciones() {
    const especies = this.avistamientosPorEspecie.map((g) => g.especie);
    const mezcladas = [...especies].sort(() => Math.random() - 0.5);
    this.recomendaciones = mezcladas.slice(0, 5);
  }
  //cuando se borra el texto → limpia el filtro y vuelve a mostrar todos
  //los pins, y si se selecciona una sugerencia → filtra el mapa a esa especie y vuela a ella
  onBusquedaInput(evento: any) {
    const valor = evento.detail.value || '';
    this.busqueda = valor;
    this.resultadoBusqueda = null;
    this.noEncontrada = false;

    // ✅ Si borra el texto → limpiar filtro y mostrar todos
    if (valor.trim().length === 0) {
      this.mostrarSugerencias = false;
      this.sugerencias = [];
      this.resultadoBusqueda = null;
      this.especieFiltrada = null;
      this.refrescarPins();
      return;
    }

    const q = valor.toLowerCase();
    this.sugerencias = this.avistamientosPorEspecie
      .map((g) => g.especie)
      .filter((e) => e.toLowerCase().includes(q));
    this.mostrarSugerencias = true;
  }

  seleccionarEspecie(especie: string) {
    this.busqueda = especie;
    this.mostrarSugerencias = false;
    this.sugerencias = [];
    this.buscarEnMapa(especie);
  }

  buscarEnMapa(especie: string) {
    const grupo = this.avistamientosPorEspecie.find(
      (g) => g.especie.toLowerCase() === especie.toLowerCase(),
    );

    if (!grupo || grupo.items.filter((a) => a.latitud).length === 0) {
      this.noEncontrada = true;
      this.resultadoBusqueda = null;
      return;
    }

    this.noEncontrada = false;
    this.resultadoBusqueda = especie;
    this.especieFiltrada = especie; // ✅ activar filtro

    this.viewMode.set('mapa');

    // el filtro filtrarYVolar se encarga de limpiar los pins y mostrar
    //  solo los de esa especie, pero si el mapa no está listo aún, lo 
    // iniciamos primero y luego aplicamos el filtro con un pequeño delay 
    // para asegurar que el mapa esté renderizado antes de manipular los pins
    setTimeout(() => {
      if (!this.mapa) {
        this.iniciarMapa();
        setTimeout(() => this.filtrarYVolar(grupo), 800);
      } else {
        this.filtrarYVolar(grupo);
      }
    }, 300);
  }

  // ✅ Muestra SOLO los pins del ave seleccionada y vuela a ella
  filtrarYVolar(grupo: { especie: string; items: any[]; color: string }) {
    if (!this.mapa) return;

    // Limpiar todos los marcadores del mapa
    this.mapa.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.mapa!.removeLayer(layer);
      }
    });

    const conGps = grupo.items.filter((a) => a.latitud && a.longitud);
    if (conGps.length === 0) return;

    // Volar al primer punto
    this.mapa.flyTo([conGps[0].latitud, conGps[0].longitud], 15, {
      animate: true,
      duration: 1.2,
    });

    // Agregar solo los pins de esa especie con animación
    conGps.forEach((a) => {
      const icono = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 40px; height: 40px;
            background: ${grupo.color};
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 6px ${grupo.color}55, 0 4px 15px rgba(0,0,0,0.4);
          "></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });

      const confianza = a['confianza'] || a['confianzaModelo'] || 0;
      const fecha = new Date(a['fecha']).toLocaleDateString('es-CO');
      const imgHtml = a['imagen']
        ? `<img src="${a['imagen']}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px;"/>`
        : '';

      L.marker([a.latitud, a.longitud], { icon: icono })
        .addTo(this.mapa!)
        .bindPopup(
          `<div style="text-align:center;min-width:160px;">
            ${imgHtml}
            <strong>🐦 ${a['especie']}</strong><br/>
            <span style="color:${grupo.color};font-weight:bold;">${confianza}% confianza</span><br/>
            <small style="color:#666;">${fecha}</small>
          </div>`,
          { maxWidth: 200 },
        )
        .openPopup();
    });

    // Si hay varios puntos, ajustar bounds para verlos todos
    if (conGps.length > 1) {
      const bounds = L.latLngBounds(conGps.map((a) => [a.latitud, a.longitud]));
      setTimeout(() => this.mapa!.fitBounds(bounds, { padding: [40, 40] }), 1300);
    }
  }

  // ✅ Refresca los pins según si hay filtro activo o no
  refrescarPins() {
    if (!this.mapa) return;

    // Limpiar marcadores
    this.mapa.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.mapa!.removeLayer(layer);
      }
    });

    if (this.especieFiltrada) {
      // Mostrar solo el ave filtrada
      const grupo = this.avistamientosPorEspecie.find(
        (g) => g.especie === this.especieFiltrada,
      );
      if (grupo) this.filtrarYVolar(grupo);
    } else {
      // Mostrar todos
      this.agregarPins();
    }
  }

  iniciarMapa() {
    const el = document.getElementById('leaflet-map');
    if (!el) return;

    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }

    el.innerHTML = '';

    this.mapa = L.map('leaflet-map', {
      center: [4.4389, -75.2322],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(this.mapa);

    // ✅ Si hay filtro activo al reiniciar mapa, respetarlo
    if (this.especieFiltrada) {
      const grupo = this.avistamientosPorEspecie.find(
        (g) => g.especie === this.especieFiltrada,
      );
      if (grupo) setTimeout(() => this.filtrarYVolar(grupo!), 300);
    } else {
      this.agregarPins();
    }
  }

  agregarPins() {
    if (!this.mapa) return;
    this.marcadores.clear();

    this.avistamientosPorEspecie.forEach((grupo) => {
      const marcadoresGrupo: L.Marker[] = [];

      grupo.items
        .filter((a: any) => a['latitud'] && a['longitud'])
        .forEach((a: any) => {
          const icono = L.divIcon({
            className: '',
            html: `
              <div style="width:28px;height:36px;position:relative;">
                <div style="
                  width:28px;height:28px;
                  background:${grupo.color};
                  border:3px solid white;
                  border-radius:50% 50% 50% 0;
                  transform:rotate(-45deg);
                  box-shadow:0 3px 10px rgba(0,0,0,0.4);
                "></div>
              </div>
            `,
            iconSize: [28, 36],
            iconAnchor: [14, 36],
            popupAnchor: [0, -36],
          });

          const confianza = a['confianza'] || a['confianzaModelo'] || 0;
          const fecha = new Date(a['fecha']).toLocaleDateString('es-CO');
          const imgHtml = a['imagen']
            ? `<img src="${a['imagen']}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px;"/>`
            : '';

          const marker = L.marker([a['latitud'], a['longitud']], { icon: icono })
            .addTo(this.mapa!)
            .bindPopup(
              `<div style="min-width:160px;text-align:center;">
                ${imgHtml}
                <strong>🐦 ${a['especie']}</strong><br/>
                <span style="color:${grupo.color};font-weight:bold;">${confianza}% confianza</span><br/>
                <small style="color:#666;">${fecha}</small>
              </div>`,
              { maxWidth: 200 },
            );

          marcadoresGrupo.push(marker);
        });

      this.marcadores.set(grupo.especie, marcadoresGrupo);
    });
  }

  cambiarVista(modo: 'mapa' | 'lista') {
    this.viewMode.set(modo);
    if (modo === 'mapa') {
      const el = document.getElementById('leaflet-map');
      if (el) el.innerHTML = '';
      this.mapa = null;
      setTimeout(() => this.iniciarMapa(), 400);
    }
  }

  // ✅ Resetear todo — limpia filtro y vuelve al mapa completo
  async resetearPagina(event?: any) {
    this.busqueda = '';
    this.sugerencias = [];
    this.mostrarSugerencias = false;
    this.resultadoBusqueda = null;
    this.noEncontrada = false;
    this.especieFiltrada = null; // ✅ limpiar filtro

    this.destruirMapa();
    await this.cargarDatos();

    setTimeout(() => {
      this.iniciarMapa();
    }, 400);

    if (event) event.target.complete();
  }
}