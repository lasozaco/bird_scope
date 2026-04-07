import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-mapa',
  standalone: true,
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  imports: [RouterLink, IonHeader, IonToolbar, IonContent, IonIcon, IonButton],
})
export class MapaPage {
  readonly viewMode = signal<'mapa' | 'lista'>('mapa');
}

