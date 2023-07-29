<template>
  <v-navigation-drawer v-model="drawer" width=300 permanent>
    <v-layout class="fill-height">
      <v-app-bar >
        <v-tabs
          centered
          grow
          bg-color="secondary"
          stacked
          v-model="tab"
          slider-color="white"
        >
          <v-tab size=large value="status"><v-icon  icon="mdi-transit-connection-variant"/><p class="good-font">Status</p></v-tab>
          <v-tab size=large  value="vehicle"><v-icon icon="mdi-bus-multiple"/><p class="good-font">Fahrzeuge</p></v-tab>
        </v-tabs>
      </v-app-bar>
    
      <v-main id="contentId">
        <v-window v-model="tab">
          <v-window-item value="status"><StatusContainer :vehicles="vehicles"></StatusContainer></v-window-item>
          <v-window-item value="vehicle"><VehicleListContainer :vehicles="vehicles"></VehicleListContainer></v-window-item>
        </v-window>
      </v-main>
    </v-layout>
  </v-navigation-drawer>
</template>
    
    
<script lang="ts">
  import VehicleListContainer from './VehicleListContainer.vue';
  import StatusContainer from './StatusContainer.vue';
  import { defineComponent } from 'vue'
  import { VehicleStateMap } from '@/types/vehicleStateMap';
  import type { PropType } from 'vue';

  export default defineComponent({
    name: "OverviewSideBar",
    props: {
      vehicles: {
        type: Object as PropType<VehicleStateMap>,
      }
    },
    data: () => ({
        drawer: null,  
        tab: "status" ,
    }),
    components: { VehicleListContainer, StatusContainer },
    mounted() {
      window.addEventListener("resize", this.resizeEventHandler)
    },
    unmounted() {
      window.removeEventListener("resize", this.resizeEventHandler)
    },
    methods: {
      resizeEventHandler() {
        this.contentHeight = window.innerHeight - 64;
      }
    },
  })
</script>

<style scoped>
.good-font {
  margin-top: 4px;
  font-family: Helvetica, sans-serif;
  letter-spacing: 0.04em;
  font-weight: normal;
  font-size: medium;
}
</style>