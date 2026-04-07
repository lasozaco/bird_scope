import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonIcon,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-reportes',
  standalone: true,
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  imports: [RouterLink, IonHeader, IonToolbar, IonContent, IonButton, IonIcon],
})
export class ReportesPage {}

