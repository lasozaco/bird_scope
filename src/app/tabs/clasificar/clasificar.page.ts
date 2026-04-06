import { Component } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-clasificar',
  standalone: true,
  templateUrl: './clasificar.page.html',
  styleUrls: ['./clasificar.page.scss'],
  imports: [IonHeader, IonToolbar, IonContent, IonButton, IonIcon],
})
export class ClasificarPage {}

