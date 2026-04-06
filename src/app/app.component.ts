
import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  barChartOutline,
  cameraOutline,
  cloudUploadOutline,
  homeOutline,
  leafOutline,
  locationOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    addIcons({
      barChartOutline,
      cameraOutline,
      cloudUploadOutline,
      homeOutline,
      leafOutline,
      locationOutline,
    });
  }
}
