<template>
  <v-app-bar
    density="default"
    color="secondary"
  >
    <div class="ma-2">
      <v-icon size="150"><bseag-logo></bseag-logo></v-icon>
      <span class="our-heading">Dashboard</span>
    </div>

    <v-spacer></v-spacer>
    <FastFilter :vehicles="vehicles"></FastFilter>
    <v-spacer></v-spacer>
    <BarChart :vehicles="vehicles"></BarChart>
    <v-spacer></v-spacer>
    <SwitchDelayType :vehicles="vehicles"></SwitchDelayType>
    <v-spacer></v-spacer>
    <!-- <v-btn icon="mdi-web-off" @click="$emit('closeEventSrc')"/>  -->
    <FilterPanel :vehicles="vehicles"></FilterPanel>
    <SettingMenu></SettingMenu>
  </v-app-bar>
</template>

<script lang="ts">
// This component displays the upper panel, the buttons to acces the settings and the filters.
import { defineComponent } from 'vue'
import FilterPanel from './FilterPanel/FilterPanel.vue';
import SettingMenu from './SettingMenu.vue';
import FastFilter from './FastFilter/FastFilter.vue';
import BarChart from './BarChart.vue';
import SwitchDelayType from './SwitchDelayType.vue';
import { VehicleStateMap } from '@/types/vehicleStateMap';
import type { PropType } from 'vue';
import BseagLogo from "@components/ControlBar/bseagLogo.vue";

export default defineComponent({
  name: 'ControlBar',
  components: {
    BseagLogo,
    FilterPanel,
    SettingMenu,
    FastFilter,
    BarChart,
    SwitchDelayType
},
  emits:
    ['closeEventSrc']
  ,
  props: {
    vehicles: {
      type: Object as PropType<VehicleStateMap>,
      required: true,
    }
  },
  data: () => ({
    
  }),
  
})
  

  
</script>

<style>

.our-heading {
  margin-left: 5px;
  font-family: Helvetica, sans-serif;
  font-weight: 600;
  font-size: 21px;
}

</style>