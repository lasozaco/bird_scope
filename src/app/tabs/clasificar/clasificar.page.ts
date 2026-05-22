import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import * as tf from '@tensorflow/tfjs';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import { Geolocation } from '@capacitor/geolocation';
import {
  cameraOutline,
  cloudUploadOutline,
  searchOutline,
  checkmarkOutline,
  checkmarkCircle,
  openOutline,
  closeOutline,
} from 'ionicons/icons';

const CLASES = [
  'Aguililla_Caminera_Rupornis_magnirostris',
  'Amazon_Kingfisher',
  'Aratinga_Pertinaz_Eupsittula_pertinax',
  'Bananaquit',
  'Barred_Antshrike',
  'Buco_Bobito',
  'Caracara_Cabeza_Amarilla_Daptrius_chimachima',
  'Carib_Grackle',
  'Carpintero_Coronirrojo_Melanerpes_rubricapillus',
  'Carpintero_Pecho_Punteado',
  'Centzontle_Tropical_Mimus_gilvus',
  'Chachalaca_Colombiana_Ortalis_columbiana',
  'Colibri_Capucha_Azul',
  'Colibri_Cola_Canela_Amazilia_tzacatl',
  'Colibri_Florido_de_Tolima_Anthocephala_berlepschi',
  'Eufonia_Piquigruesa_Euphonia_laniirostris',
  'Gorrion_Chingolo_Zonotrichia_capensis',
  'Guacamayo_Severo',
  'Halcon_Fajado_Falco_femoralis',
  'Halcon_Peregrino_Falco_peregrinus',
  'Hormiguero_Ventriblanco',
  'Ibis_afeitado_Phimosus_infuscatus',
  'Loro_Alibronceado',
  'Mirlo_Grande_Turdus_fuscater',
  'Momoto_Serrano_Momotus_aequatorialis',
  'Mosquerito_Cabecigris',
  'Moustached_Puffbird',
  'Pale_breasted_Thrush',
  'Pijuiu_Pizarroso',
  'Saltador_Garganta_Ocre',
  'Saltarin_Barbiblanco',
  'Semillero_Intermedio',
  'Southern_Lapwing',
  'Tangara_Azulgris_Thraupis_episcopus',
  'Tangara_Matorralera',
  'Tirano_Piriri_Tyrannus_melancholicus',
  'Zenaida_Torcaza',
  'Zopilote_Comun_Coragyps_atratus',
  'benteveo_pitangus_sulphuratus',
  'jilguero_dorado_Sicalis_flaveola',
  'tortolita_canela_Columbina_talpacoti',
];

const UMBRAL_AUTO = 70;

@Component({
  selector: 'app-clasificar',
  standalone: true,
  templateUrl: './clasificar.page.html',
  styleUrls: ['./clasificar.page.scss'],
  imports: [
    CommonModule,
    FormsModule, // ✅ necesario para [(ngModel)]
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonBadge,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class ClasificarPage implements OnInit {
  private firestore = inject(Firestore);
  private ngZone = inject(NgZone);

  modelo: tf.GraphModel | tf.LayersModel | null = null;
  imagenPreview: string | null = null;
  resultado: string | null = null;
  confianza: number = 0;
  topResultados: { especie: string; confianza: number }[] = [];
  cargando: boolean = false;
  modeloCargado: boolean = false;
  guardado: boolean = false;

  // Confirmación
  aveSeleccionada: string | null = null;
  confirmada: boolean = false;
  aveConfirmada: string | null = null;
  autoConfirmada: boolean = false;

  // Ninguna
  mostrarNinguna: boolean = false;
  nombreManual: string = '';

  constructor() {
    addIcons({
      'camera-outline': cameraOutline,
      'cloud-upload-outline': cloudUploadOutline,
      'search-outline': searchOutline,
      'checkmark-outline': checkmarkOutline,
      'checkmark-circle': checkmarkCircle,
      'open-outline': openOutline,
      'close-outline': closeOutline,
    });
  }

  async ngOnInit() {
    await this.cargarModelo();
  }

  async cargarModelo() {
    try {
      this.modelo = await tf.loadGraphModel('assets/model/model.json');
      this.modeloCargado = true;
      console.log('✅ Modelo cargado como GraphModel');
    } catch (e) {
      console.error('❌ GraphModel falló:', e);
      try {
        this.modelo = await tf.loadLayersModel('assets/model/model.json');
        this.modeloCargado = true;
        console.log('✅ Modelo cargado como LayersModel');
      } catch (e2) {
        console.error('❌ LayersModel también falló:', e2);
      }
    }
  }

  async tomarFoto() {
    await this.capturarFoto('camera');
  }

  async cargarDeGaleria() {
    await this.capturarFoto('photos');
  }

  async capturarFoto(fuente: 'camera' | 'photos') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (fuente === 'camera') {
      input.capture = 'environment';
    }

    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const dataUrl = e.target.result;
        this.imagenPreview = dataUrl;
        this.resultado = null;
        this.topResultados = [];
        this.guardado = false;
        this.aveSeleccionada = null;
        this.confirmada = false;
        this.aveConfirmada = null;
        this.autoConfirmada = false;
        this.mostrarNinguna = false; // ✅ reset
        this.nombreManual = ''; // ✅ reset
        await this.pedirPermisoUbicacion();
        await this.clasificar(dataUrl);
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }

  async clasificar(dataUrl: string) {
    if (!this.modelo) return;

    this.cargando = true;

    try {
      // ================================
      // 1️⃣ Cargar imagen correctamente
      // ================================
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataUrl;
      });

      // pequeño delay necesario en Android
      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      // ================================
      // 2️⃣ Canvas FINAL (224x224)
      // ================================
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;

      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // ================================
      // 3️⃣ Canvas INTERMEDIO (SOLUCIÓN ANDROID)
      // ================================
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.naturalWidth || img.width;
      tempCanvas.height = img.naturalHeight || img.height;

      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(img, 0, 0);

      // Redimensionar correctamente
      ctx.drawImage(
        tempCanvas,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
        0,
        0,
        224,
        224,
      );

      // ================================
      // 4️⃣ Verificación anti-canvas negro
      // ================================
      const pixelCheck = ctx.getImageData(0, 0, 1, 1).data;
      console.log('Pixel check:', pixelCheck);

      if (pixelCheck[0] === 0 && pixelCheck[1] === 0 && pixelCheck[2] === 0) {
        console.warn('⚠️ Canvas posiblemente vacío');
      }

      // ================================
      // 5️⃣ Convertir a Tensor
      // ================================
      const tensor = tf.tidy(() => {
        const pixels = tf.browser.fromPixels(canvas, 3);

        return pixels.toFloat().div(127.5).sub(1.0).expandDims(0);
      });

      // ================================
      // 6️⃣ Predicción
      // ================================
      const prediccion = this.modelo.predict(tensor) as tf.Tensor;

      const valores = await prediccion.data();
      const arr = Array.from(valores) as number[];

      prediccion.dispose();
      tensor.dispose();

      // ================================
      // 7️⃣ Ordenar resultados
      // ================================
      const indexados = arr.map((v, i) => ({ i, v }));
      indexados.sort((a, b) => b.v - a.v);

      // ================================
      // 8️⃣ Mostrar resultados UI
      // ================================
      this.ngZone.run(() => {
        this.topResultados = indexados.slice(0, 3).map((item) => ({
          especie: CLASES[item.i].replace(/_/g, ' '),
          confianza: Math.round(item.v * 100),
        }));

        this.resultado = this.topResultados[0].especie;
        this.confianza = this.topResultados[0].confianza;
      });

      // ================================
      // 9️⃣ Auto guardado si confianza alta
      // ================================
      if (this.confianza >= UMBRAL_AUTO) {
        this.autoConfirmada = true;
        this.confirmada = true;
        this.aveConfirmada = this.resultado;

        await this.guardarEnFirebase(dataUrl, true);
      }
    } catch (e) {
      console.error('❌ Error clasificando:', e);
    } finally {
      this.ngZone.run(() => {
        this.cargando = false;
      });
    }
  }

  comprimirImagen(
    dataUrl: string,
    maxWidth = 400,
    quality = 0.6,
  ): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    });
  }

  async guardarEnFirebase(dataUrl: string, confirmado: boolean) {
    try {
      const coords = await this.obtenerUbicacion();
      const imagenComprimida = await this.comprimirImagen(dataUrl);
      const col = collection(this.firestore, 'avistamientos');

      await this.ngZone.run(() =>
        addDoc(col, {
          especie: this.resultado,
          confianza: this.confianza,
          imagen: imagenComprimida,
          latitud: coords?.lat ?? null,
          longitud: coords?.lng ?? null,
          confirmadaPorUsuario: confirmado,
          autoConfirmada: confirmado && this.autoConfirmada,
          fecha: new Date().toISOString(),
        }),
      );

      this.guardado = true;
      console.log(`✅ Guardado en Firebase (confirmado: ${confirmado})`);
    } catch (e) {
      console.error('Error guardando:', e);
    }
  }

  seleccionarAve(especie: string) {
    this.aveSeleccionada = especie;
    this.mostrarNinguna = false; // cierra el panel ninguna si estaba abierto
  }

  buscarEnGoogle() {
    if (!this.aveSeleccionada) return;
    this.buscarEnGoogleAve(this.aveSeleccionada);
  }

  buscarEnGoogleAve(especie: string | null) {
    if (!especie) return;
    const query = encodeURIComponent(especie + ' ave Colombia');
    window.open(`https://www.google.com/search?q=${query}&tbm=isch`, '_blank');
  }

  async confirmarAve() {
    if (!this.aveSeleccionada) return;
    this.aveConfirmada = this.aveSeleccionada;
    this.confirmada = true;
    await this.guardarEnFirebase(this.imagenPreview!, true);

    try {
      const coords = await this.obtenerUbicacion();
      const col = collection(this.firestore, 'avistamientos');

      await this.ngZone.run(() =>
        addDoc(col, {
          especie: this.aveConfirmada,
          especiePredicha: this.resultado,
          confianzaModelo: this.confianza,
          confirmadaPorUsuario: true,
          autoConfirmada: false,
          latitud: coords?.lat ?? null,
          longitud: coords?.lng ?? null,
          fecha: new Date().toISOString(),
        }),
      );
      console.log('✅ Confirmación manual guardada');
    } catch (e) {
      console.error('Error guardando confirmación:', e);
    }
  }

// ✅ Toggle panel ninguna
  toggleNinguna() {
    this.mostrarNinguna = !this.mostrarNinguna;
    this.aveSeleccionada = null;
  }

  // ✅ Reportar ave no identificada
  async reportarNoIdentificada() {
    this.confirmada = true;
    this.aveConfirmada = this.nombreManual.trim() || 'No identificada';

    try {
      const coords = await this.obtenerUbicacion();
      const col = collection(this.firestore, 'avistamientos');

      await this.ngZone.run(() =>
        addDoc(col, {
          especie: this.aveConfirmada,
          especiePredicha: this.resultado,
          prediccionesModelo: this.topResultados.map((r) => r.especie),
          confianzaModelo: this.confianza,
          confirmadaPorUsuario: !!this.nombreManual.trim(),
          noIdentificada: true,
          latitud: coords?.lat ?? null,
          longitud: coords?.lng ?? null,
          fecha: new Date().toISOString(),
        }),
      );
      console.log('✅ Reporte no identificada guardado');
    } catch (e) {
      console.error('Error guardando reporte:', e);
    }
  }

  // ✅ Ahora usa Geolocation nativo de Capacitor
  obtenerUbicacion(): Promise<{ lat: number; lng: number } | null> {
    return new Promise(async (resolve) => {
      try {
        const pos = await Geolocation.getCurrentPosition({
          timeout: 10000,
          enableHighAccuracy: true,
        });
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      } catch (e) {
        console.error('Error GPS:', e);
        resolve(null);
      }
    });
  }

  // ✅ Ahora pide permiso nativo de Android
  async pedirPermisoUbicacion() {
    try {
      const permiso = await Geolocation.requestPermissions();
      return permiso.location === 'granted';
    } catch (e) {
      console.error('Error pidiendo permiso:', e);
      return false;
    }
  }

  resetear() {
    this.imagenPreview = null;
    this.resultado = null;
    this.confianza = 0;
    this.topResultados = [];
    this.cargando = false;
    this.guardado = false;
    this.aveSeleccionada = null;
    this.confirmada = false;
    this.aveConfirmada = null;
    this.autoConfirmada = false;
    this.mostrarNinguna = false;
    this.nombreManual = '';
  }
}