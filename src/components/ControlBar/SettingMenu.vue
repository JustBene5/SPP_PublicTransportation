<template>
  <v-btn icon="mdi-cog" id="settings-btn"></v-btn>

  <v-menu 
  activator="#settings-btn" 
  :close-on-content-click='false'
  offset="7"
  > 
    <v-card  width="auto">
      <v-list>
        <v-list-item >
          Dark Theme
          <template v-slot:append> 
            <v-switch 
              v-model="themeIsLight"
              @change="toggleTheme()"
              hide-details
              color="selected"
              class="ml-10">
            </v-switch>
          </template>
        </v-list-item>
        <v-list-item >
          Zeige Haltestellen an 
          <template v-slot:append > 
            <v-switch 
              v-model="showStops"
              hide-details
              color="selected"
              class="ml-10"
              @change="toggleShowStops()"
              :disabled="showStopsDisabled"
              >
            </v-switch>
          </template>
        </v-list-item>
        <v-list-item>
          <v-btn class="impressum-btn" color="secondary" @click="displayImpressum()">
            <p class="good-font">Impressum</p>
          </v-btn>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
    
</template>

<script lang="ts">
import {useTheme} from 'vuetify'
import { defineComponent } from 'vue';

// TODO: Funktion des Haltestellen switches implementieren
export default defineComponent({
  name: 'SettingMenu',
  components: {

  },
  data: () => ({
    themeIsLight: false,
    theme: useTheme(),
    showStopsDisabled:true,
    showStops: false,
  }),
  mounted() {
    this.emitter.on("stop-image-loaded",()=>{
      this.showStopsDisabled = false;
    })
  },
  methods: {
    toggleTheme() {
      if(this.themeIsLight){
        this.emitter.emit("toggle-theme", { theme: "dark" })
        this.theme.global.name = "BseagDarkTheme";
      }else{
        this.emitter.emit("toggle-theme", { theme: "light" })
        this.theme.global.name = "BseagLightTheme";
      }
    },
    displayImpressum() {
      alert("Dieses Dashboard wird Ihnen präsentiert von \nder BSEAG™\n\n" +
          "Bärbel Weitschat\nBenedict Pohl\nCharlotte Olischläger\nJan Eilbrecht\nKevin Bodor")
    },
    toggleShowStops(){
      console.log("Hi")
      this.emitter.emit("toggleShowStops", {show:this.showStops});
    }
  }
})
</script>

<style scoped>

.impressum-btn {
  margin: 3px 5px 5px;
}

.good-font {
  font-family: Helvetica, sans-serif;
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: normal;
  font-size: medium;
}
</style>
