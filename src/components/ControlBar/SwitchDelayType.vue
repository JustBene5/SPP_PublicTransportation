<template>
  <v-btn-toggle v-model="selected" color="surface">
    <v-btn> <p class="good-font">Absolut</p> </v-btn>
    <v-btn> <p class="good-font">Relativ</p> </v-btn>
  </v-btn-toggle>
</template>


<script lang="ts">
  import { defineComponent } from 'vue'

  import { VehicleStateMap } from '@/types/vehicleStateMap';
  import type { PropType } from 'vue';

  export default defineComponent({
    name: 'SwitchDelayType',
    props: {
      vehicles: {
        type: Object as PropType<VehicleStateMap>,
        required: true,
      }
    },
    data() {
      return{
        toggle:true,
      }
    },
    computed:{
      selected:{ // Aktualisieren, wenn relDelay klappt
        set(n){
          this.vehicles.absDelay = n == 0;
          //this.toggle = n ==0;
        },
        get(){
          return this.vehicles.absDelay ? 0 : 1;
          //return this.toggle ? 0 : 1;
        }
      }
    }

  })
</script>

<style scoped>
.good-font {
  margin-top: 1px;
  font-family: Helvetica, sans-serif;
  letter-spacing: 0.04em;
  font-weight: normal;
  font-size: 1.1em;
}
</style>