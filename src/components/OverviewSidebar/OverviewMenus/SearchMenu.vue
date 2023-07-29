<template>
  <v-autocomplete
      v-model="currSearch"
      :items="allBuses"
      item-title="identification.displayText"
      class="ma-2"
      variant="outlined"
      hide-details
      clearable
      density="comfortable"
      auto-select-first
      prepend-inner-icon="mdi-magnify"
      placeholder="Suche nach Bus"
      @update:model-value="emitBus"
  ></v-autocomplete>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {VehicleState} from "@/api";
import {VehicleStateMap} from "@/types/vehicleStateMap";
import {vehicleInfo} from "@/types/globals";

export default defineComponent({
  name: "SearchMenu",
  props: {
    vehicles: {
      type: Object as PropType<VehicleStateMap>
    }
  },
  emits: ['searched-bus'],
  data: () => ({
    allBuses: [] as Array<VehicleState>,
    currSearch: null as VehicleState
  }),
  mounted() {
    this.allBuses = this.vehicles.getAllVehicles()
  },
  computed: {
    getAllBuses(): Array<string> {
      let busArr: Array<VehicleState> = this.vehicles.getAllVehicles()
      let busDisplayArr: Array<string> = []
      for(let bus of busArr) {
        busDisplayArr.push(bus.identification.displayText)
      }
      busDisplayArr.sort((over, under) => {
        if(over >= under) {
          return 1
        } else {
          return -1
        }
      })
      return busDisplayArr
    }
  },
  methods: {
    customFilter (itemTitle, queryText, item) {
      const textOne = item.raw.name.toLowerCase()
      const textTwo = item.raw.uid.toLowerCase()
      const searchText = queryText.toLowerCase()

      return textOne.indexOf(searchText) > -1 ||
          textTwo.indexOf(searchText) > -1
    },
    emitBus() {
      this.$emit('searched-bus', this.currSearch)
    }
  }
})
</script>

<style scoped>

</style>