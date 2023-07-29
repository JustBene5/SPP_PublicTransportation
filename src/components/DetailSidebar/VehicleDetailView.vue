<template>
  <v-layout class="fill-height">
    <v-container>
      <v-row no-gutters>
        <v-col>
          <v-sheet class="py-2"> Anz Busse </v-sheet>
        </v-col>
        <v-col>
          <v-sheet class="pa-2 pl-auto text-center"> {{ getVehicleCount }} </v-sheet>
        </v-col>
      </v-row>
      <v-divider :thickness="1"></v-divider>
      <v-row no-gutters>
        <v-col>
          <v-sheet class="py-2"> PROBLEMATIC </v-sheet>
        </v-col>
        <v-col>
          <v-sheet class="pa-2 pl-auto text-center"> {{ getLineData()[0] }} </v-sheet>
        </v-col>
      </v-row>
      <v-divider :thickness="1"></v-divider>
      <v-row no-gutters>
        <v-col>
          <v-sheet class="py-2"> SUBOPTIMAL </v-sheet>
        </v-col>
        <v-col>
          <v-sheet class="pa-2 pl-auto text-center"> {{ getLineData()[1] }} </v-sheet>
        </v-col>
      </v-row>
      <v-divider :thickness="1"></v-divider>
      <v-row no-gutters>
        <v-col>
          <v-sheet class="py-2"> WAITING </v-sheet>
        </v-col>
        <v-col>
          <v-sheet class="pa-2 pl-auto text-center"> {{ getLineData()[2] }} </v-sheet>
        </v-col>
      </v-row>
      <v-divider :thickness="1"></v-divider>
      <v-row no-gutters>
        <v-col>
          <v-sheet class="py-2"> <v-icon size="x-small">mdi-sigma </v-icon> Abweichung </v-sheet>
        </v-col>
        <v-col>
          <v-sheet class="pa-2 pl-auto text-center">
            {{ getLineData()[3] + " min"}}
          </v-sheet>
        </v-col>
      </v-row>
      <v-divider :thickness="1"></v-divider>
      <v-row no-gutters>
        <v-col>
          <v-sheet class="py-2"> Taktung </v-sheet>
        </v-col>
        <v-col>
          <v-sheet class="pa-2 pl-auto text-center"> {{ getLineTiming }} </v-sheet>
        </v-col>
      </v-row>

      <v-divider :thickness="1"></v-divider>
      <v-row no-gutters>
        <v-col>
          <v-sheet class="py-2"> 
            <v-icon class="py-2" size="small">mdi-alert-octagram-outline</v-icon> Score </v-sheet>
        </v-col>
        <v-col>
          <v-sheet class="pa-2 pl-auto text-center"> {{ getLineScore() }} </v-sheet>
        </v-col>
      </v-row>

      <v-row>
        <v-sheet class="mx-auto">
          <v-btn prepend-icon="mdi-filter-outline" @click="setFilterGlobally()"> filtern </v-btn>
        </v-sheet>
      </v-row>


    </v-container>
  </v-layout>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import type { PropType } from 'vue'
import { VehicleStateMap } from '@/types/vehicleStateMap'
import * as api from '@/api/api'
import { Filter } from "@/types/filter"
import { sortType, getScore, statusInfo } from "@/types/globals";


export default defineComponent({
  name: "VehicleDetailView",

  props: {
    vehicles: {
      type: Object as PropType<VehicleStateMap>,
      required: true
    },
    line: String,
    vehicle: String

  },

  data: () => ({
    lineFilter: new Filter(),

  }),

  computed: {

    //gibt Anzahl der busse auf der linie und setzt den Filter -> muss am Anfang ausgeführt werden
    getVehicleCount() {
      this.lineFilter.lines = [this.line]
      return getScore(this.vehicles, this.lineFilter)[1]
    },


    getSumDelayedVehicles() {

    },

    countDelayedVehicles() {

    },

    getSumPrematureVehicles() {

    },

    

    getLineTiming() {
      try {
        return this.vehicles.getTiming(this.vehicle) + " min"
      } catch (e) {
        return "noInfo"
      }
    },

  },

  methods: {

    setFilterGlobally() {
      this.vehicles.setFilter(this.lineFilter)
    },

    getLineScore() {
      try {
        return getScore(this.vehicles, this.lineFilter)[0]
      } catch (error) {
        return "noscore"
      }
    },

    getLineData() {
      let problematicCount: number = 0
      let suboptimalCount: number = 0
      let waitingCount: number = 0
      let deviationSum: number = 0
      let avgDeviation: number = 0
      let numberOfBuses: number = 0
      let numberOfBadBuses: number = 0
      let numberOfLaterBuses: number = 0

      // Get the numbers
      for (let vehicle of this.vehicles.getFilteredVehicles(false, sortType.None, this.lineFilter)) {
        switch (vehicle.deviation?.semantics) {
          case "PROBLEMATIC": {
            problematicCount++
            numberOfBadBuses++
            break
          }
          case "SUBOPTIMAL": {
            suboptimalCount++
            numberOfBadBuses++
            break
          }
          case "WAITING": {
            waitingCount++
            numberOfBadBuses++
            break
          }
        }
        if (vehicle.deviation?.value != undefined) {
          numberOfBuses++

          let delay: number = Math.abs(this.vehicles.getDelay(vehicle))

          if (this.vehicles.absDelay) {
            if (delay <= 60) {
              deviationSum += delay
            }
            if (delay >= 6.5 && delay <= 60) {
              numberOfLaterBuses++
            }
          } else {
            if (delay <= 120) {
              deviationSum += delay
            }
            if (delay > 70 && delay <= 200) {
              numberOfLaterBuses++
            }
          }

        }
      }
      if (numberOfBadBuses == 0) {
        avgDeviation = 0
      } else {
        avgDeviation = deviationSum / numberOfBadBuses
      }
      
      return [problematicCount,
        suboptimalCount,
        waitingCount,
        deviationSum,
        avgDeviation,
        numberOfBuses]

    },

  }

})
</script>