import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

import AOS from 'aos';

import 'prismjs';

import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-sql';

import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/plugins/toolbar/prism-toolbar.css';

import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';

import 'prismjs/themes/prism-tomorrow.css';

AOS.init({
  once: true,
  duration: 700,
  easing: 'ease-out-cubic'
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));