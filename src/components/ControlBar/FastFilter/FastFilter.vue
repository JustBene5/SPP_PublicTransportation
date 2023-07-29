<template>
  <v-sheet rounded  :height="50" >
    <v-window v-model="variant" @update:modelValue="console.log('hi')">
      <v-window-item value="delayType.Semantics">
        <v-btn-toggle v-model="absSelectedFastFilter" divided multiple variant="text" color="grey" >
          <FastFilterItemSemantic semantic="ON_TIME" :vehicles="vehicles" :number="numberOfBussesAbs"></FastFilterItemSemantic>
          <FastFilterItemSemantic semantic="SUBOPTIMAL" :vehicles="vehicles" :number="numberOfBussesAbs"></FastFilterItemSemantic>
          <FastFilterItemSemantic semantic="PROBLEMATIC" :vehicles="vehicles" :number="numberOfBussesAbs"></FastFilterItemSemantic>
          <FastFilterItemSemantic semantic="NOT_AVAILABLE" :vehicles="vehicles" :number="numberOfBussesAbs"></FastFilterItemSemantic>
          <FastFilterItemSemantic semantic="WAITING" :vehicles="vehicles" :number="numberOfBussesAbs"></FastFilterItemSemantic>
        </v-btn-toggle>
      </v-window-item>

      <v-window-item value="delayType.Relative">
        <v-btn-toggle v-model="relSelectedFastFilter" divided multiple variant="text" color="grey" >

          <FastFilterItemRelative relSemantic="EARLY" :vehicles="vehicles" :number="numberOfBussesRel['EARLY']"></FastFilterItemRelative>
          <FastFilterItemRelative relSemantic="ON_TIME" :vehicles="vehicles" :number="numberOfBussesRel['ON_TIME']"></FastFilterItemRelative>
          <FastFilterItemRelative relSemantic="LATE" :vehicles="vehicles" :number="numberOfBussesRel['LATE']"></FastFilterItemRelative>
          <FastFilterItemRelative relSemantic="CRITICAL" :vehicles="vehicles" :number="numberOfBussesRel['CRITICAL']"></FastFilterItemRelative>
          <FastFilterItemRelative relSemantic="NO_DATA" :vehicles="vehicles" :number="numberOfBussesRel['NO_DATA']"></FastFilterItemRelative>

          
        </v-btn-toggle>
        <!-- <v-btn-toggle v-model="selectedFastFilter" divided multiple variant="text" color="grey" >

          <FastFilterItemRelative :relDelayInterval="relDelayIntervalsArray[0]" :vehicles="vehicles" :number="numberOfBussesSemantics['ON_TIME']"></FastFilterItemRelative>

        </v-btn-toggle> -->
      </v-window-item>
    </v-window>
  </v-sheet>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { VehicleStateMap } from "@/types/vehicleStateMap";
import { delayType,RelDelaySemantic,relDelayToSemantic } from "@/types/globals"
import type { PropType } from 'vue';
import { DeviationSemantics } from '@/api';
import FastFilterItemSemantic from './FastFilterItemSemantic.vue'
import FastFilterItemRelative from './FastFilterItemRelative.vue';


export default defineComponent({
    name: 'FastFilter',
    components: {
      FastFilterItemSemantic,
      FastFilterItemRelative,
    },
    data() {
      return {
        numberOfBussesAbs:{"ON_TIME":0, "SUBOPTIMAL":0, "PROBLEMATIC":0, "NOT_AVAILABLE":0, "WAITING":0} as Record<DeviationSemantics, number>,
        numberOfBussesRel:{"EARLY":0, "ON_TIME":0, "LATE":0, "CRITICAL":0, "NO_DATA":0} as Record<RelDelaySemantic, number>,
        absSemanticsArray:["ON_TIME", "SUBOPTIMAL", "PROBLEMATIC", "NOT_AVAILABLE", "WAITING"] as DeviationSemantics[],
        relSemanticsArray:["EARLY", "ON_TIME", "LATE", "CRITICAL", "NO_DATA"] as RelDelaySemantic[],
        numberOfBussesRelative: Array.from({length:5}, (v)=> 0) as number[],
        storeFilter: [],
      }
    },

    props: {
        vehicles: {
            type: Object as PropType<VehicleStateMap>,
        },
    },

    mounted(){
      window.setInterval(this.updateNumberOfBusses, 5000);
    },
    watch: {
      variant(newValue){
        try{
        if(newValue == delayType.Semantics){
          //this.absSelectedFastFilter.set(this.storeFilter);
          //this.storeFilter = this.relSelectedFastFilter.get();
          //this.relSelectedFastFilter.set([]);
          this.vehicles.setFilterDelaySemantics(this.storeFilter);
          this.storeFilter = this.vehicles.getFilter().getRelSemantics();
          this.vehicles.setFilterRelSemantic([]);
        }else{
          this.vehicles.setFilterRelSemantic(this.storeFilter);
          this.storeFilter = this.vehicles.getFilter().getDelaySemantics();
          this.vehicles.setFilterDelaySemantics([]);
        }
      }catch(e) {
        console.log(e)
      }
    }
    },
    computed: {
      variant(){
        if(this.vehicles.absDelay){
          return delayType.Semantics
        }
        else{
          return delayType.Relative
        }
      },
      absSelectedFastFilter:{
        set(selectedSemantics:DeviationSemantics[]){
          //this.vehicles.setFilterDelaySemantics(selectedSemantics);
          if(selectedSemantics.length == 0){
            this.vehicles.setFilterDelaySemantics([]);
          }else{
            this.vehicles.setFilterDelaySemantics(this.absSemanticsArray.filter((ds:DeviationSemantics)=>{return !selectedSemantics.includes(ds)}));
          }
          
        },
        get(){
          let filter= this.vehicles.getFilter().getDelaySemantics();
          if(filter.length == 0){
            return []
          }
          return this.absSemanticsArray.filter((ds:DeviationSemantics)=>{return !filter.includes(ds)})
        }
      },
      relSelectedFastFilter:{
        set(selectedSemantics:RelDelaySemantic[]){
          //this.vehicles.setFilterDelaySemantics(selectedSemantics);
          if(selectedSemantics.length == 0){
            this.vehicles.setFilterRelSemantic([]);
          }else{
            this.vehicles.setFilterRelSemantic(this.relSemanticsArray.filter((ds:RelDelaySemantic)=>{return !selectedSemantics.includes(ds)}));
          }
          
        },
        get(){
          let filter= this.vehicles.getFilter().getRelSemantics();
          if(filter.length == 0){
            return []
          }
          return this.relSemanticsArray.filter((ds:RelDelaySemantic)=>{return !filter.includes(ds)})
        }
      }
    },

    methods: {
      updateNumberOfBusses(){
        if(this.variant == delayType.Semantics){
          this.numberOfBussesAbs= {"ON_TIME":0, "SUBOPTIMAL":0, "PROBLEMATIC":0, "NOT_AVAILABLE":0, "WAITING":0}
          this.vehicles.getOperationalVehicles().forEach((v) => {
            this.numberOfBussesAbs[v.deviation?.semantics]++;
          })
        }else{
          //this.numberOfBussesRelative= Array.from({length:this.relDelayIntervalsArray.length}, (v)=> 0)
          this.numberOfBussesRel= {"EARLY":0, "ON_TIME":0, "LATE":0, "CRITICAL":0, "NO_DATA":0}
          this.vehicles.getOperationalVehicles().forEach((v) => {
            this.numberOfBussesRel[relDelayToSemantic(this.vehicles.getDelay(v))]++;

          })
        }
        
      },
      changeVariant(){
        console.log("Changing ...")
        
      },
    },
})



</script>
