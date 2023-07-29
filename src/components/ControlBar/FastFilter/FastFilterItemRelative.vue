<template>
  <v-btn :value="relSemantic" prepend-icon="mdi-circle-slice-8" stacked height="50">
   <template v-slot:prepend>
     <v-icon :color="circleColor" size="x-large"></v-icon>
   </template>
   <v-tooltip :text="relSemantic" activator="parent" location="bottom center" origin="auto" open-delay="200"> </v-tooltip>
   {{ number}}
 </v-btn>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import { DeviationSemantics } from '@/api';
import { RelDelaySemantic,relDelayToSemantic } from "@/types/globals"
import { PropType } from 'vue';
import { VehicleStateMap } from '@/types/vehicleStateMap'

export default defineComponent({
 name: "FastFilterItemRelative",
 props: {
   relSemantic: {
       type: String,
       required: true,
   },
   vehicles: {
     type: Object as PropType<VehicleStateMap>,
       required: true,
   },
   //circleColor: {type: String, default: "black"},
   number: {type: Number , default: 0}
 },
 data(){
   return{
     circleColor:"black",
     tooltipText: this.relSemantic,
   }
 },
 mounted(){
   this.circleColor = this.vehicles.relativeColor(this.relSemantic, false);
 },
 methods: {

 }
})
</script>