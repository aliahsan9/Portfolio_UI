import { provideHttpClient, withFetch} from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch()
    ),
    provideAnimations()
  ]
};
