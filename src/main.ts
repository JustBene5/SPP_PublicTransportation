import { createApp } from 'vue'
import App from '@/App.vue'


// Vuetify
import 'vuetify/styles'
//vscode könnte ein error schmeißen obwohl alles funktioniert und runed trotzdem
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import "@mdi/font/css/materialdesignicons.css";

import VueCookies from 'vue-cookies';

//mitt
import mitt from "mitt"

const BseagLightTheme = {
  dark: false,
  colors: {
    primary: "#518ec2",
    secondary: "#B71C1C",
    surface: "#eeeeee",
    card_surface: "#d9d9d9",
    ind_purple: "#4a148c",
    ind_green: "#398E2D",
    ind_yellow: "#E8CA01",
    ind_red: "#C71110",
    error_blue: "#1976d2",
    error_black: "#646464",
    error_orange: "#ff9633",
    button_default: "#f7f7f7",
    selected: "#1681de",
    not_selected: "#e5f3ff"
  },
};

const BseagDarkTheme = {
  dark: true,
  colors: {
    primary: "#1976D2",
    secondary: "#991717",
    surface: "#2b2b2b",
    card_surface: "#3d3d3d",
    bluish_surface: "#263238",
    ind_purple: "#4a148c",
    ind_green: "#398E2D",
    ind_yellow: "#E8CA01",
    ind_red: "#C71110",
    error_blue: "#1976d2",
    error_black: "#646464",
    error_orange: "#ff9633",
    button_default: "#4f4f4f",
    selected: "#728db8",
    not_selected: "#575e66"
  },
};

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "BseagLightTheme",
    themes: {
      BseagLightTheme,
      BseagDarkTheme,
    },
  },
})


const emitter = mitt()

const app = createApp(App).use(vuetify).use(VueCookies)

app.config.globalProperties.emitter = emitter
app.mount('#app')
