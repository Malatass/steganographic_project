import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme: {
        dark: false,
        colors: {
          primary: '#79be15',
          secondary: '#424242',
          accent: '#8bc34a',
          success: '#43A047',
          error: '#d32f2f',
          warning: '#ff9800',
          info: '#0288d1',
          background: '#f9f9f9',
          surface: '#ffffff',
          'primary-darken-1': '#5c9110',
          'grey-lighten-4': '#f5f5f5'
        }
      }
    }
  }
});

const app = createApp(App);
app.use(router);
app.use(vuetify);
app.mount('#app');
