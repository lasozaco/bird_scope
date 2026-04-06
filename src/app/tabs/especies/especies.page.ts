import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-especies',
  standalone: true,
  templateUrl: './especies.page.html',
  styleUrls: ['./especies.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class EspeciesPage {}

