import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-reportes',
  standalone: true,
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  imports: [IonHeader, IonToolbar, IonContent],
})
export class ReportesPage {}

