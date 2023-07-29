<template>
   <v-btn  :value="semantic" prepend-icon="mdi-circle-outline" stacked height="50"  >
    <template v-slot:prepend>
      <v-icon :color="circleColor" size="x-large"></v-icon>
    </template>
    <v-tooltip :text="semantic" activator="parent" location="bottom center" origin="auto" open-delay="200"> </v-tooltip>
    {{ number[semantic] }}
  </v-btn>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import { DeviationSemantics } from '@/api';
import { PropType } from 'vue';
import { VehicleStateMap } from '@/types/vehicleStateMap'

export default defineComponent({
  name: "FastFilterItem",
  props: {
    semantic: {
        type: String,
        required: true,
    },
    vehicles: {
      type: Object as PropType<VehicleStateMap>,
        required: true,
    },
    circleColor: {type: String, default: "black"},
    number: {type: Object as PropType<Record<DeviationSemantics,number>> , default: 0}
  },
  
  methods: {
    /* number(){
      return 0
      let anz = 1;
      this.vehicles.getOperationalVehicles().map((v:VehicleState)=> {
        if(v.deviation?.semantics == this.semantic){
          anz ++;
        }
      })
      return anz; */

      //return 0
      //return this.vehicles.getFilteredVehicles(false, sortType.None,new Filter(undefined, undefined, undefined, undefined, [this.semantic], [],undefined)).length;
      //return this.vehicles.getFilteredVehicles(false, sortType.None, new Filter()).length;
      
    
    
  }
})
</script>