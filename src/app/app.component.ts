
import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  barChartOutline,
  cameraOutline,
  chevronDownOutline,
  chevronForwardOutline,
  cloudUploadOutline,
  homeOutline,
  leafOutline,
  listOutline,
  mapOutline,
  locationOutline,
  searchOutline,
  ribbonOutline,
  locateOutline,
  trendingUpOutline,
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
      chevronDownOutline,
      chevronForwardOutline,
      cloudUploadOutline,
      homeOutline,
      leafOutline,
      listOutline,
      mapOutline,
      locationOutline,
      searchOutline,
      ribbonOutline,
      locateOutline,
      trendingUpOutline,
    });
  }
}
