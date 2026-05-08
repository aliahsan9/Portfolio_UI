import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'prismjs';

import 'prismjs/components/prism-csharp';

import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/plugins/toolbar/prism-toolbar.css';

import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';

import AOS from 'aos';
import 'aos/dist/aos.css';

AOS.init(); 

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
