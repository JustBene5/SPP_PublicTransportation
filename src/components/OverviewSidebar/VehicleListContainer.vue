<template>
  <v-container class="ma-0 pa-0">
    <v-container class="ma-0 pa-0">
      <v-toolbar>
        <SearchMenu :vehicles="vehicles" @searched-bus="args => {currSearch = args}"></SearchMenu>
        <SortMenu
            :curr-sort="whichSort"
            :order-asc="sortAsc"
            @sortOrder="(o) => changeSortOrder(o)"
            @sortAfter="(s) => changeSort(s)"></SortMenu
        >
      </v-toolbar>
    </v-container>
    <v-divider thickness="3" color="black"></v-divider>
    <div v-if="sortedVehicles.length != 0" class="ma-0 pa-0 vehicle-container">
      <ol class="vlist-container">
        <li v-for="currVehicle in sortedVehicles">
          <vehicle-info-card :vehicles="vehicles" :vehicle="currVehicle"></vehicle-info-card>
        </li>
      </ol>
    </div>
    <div v-if="vehicles.getFilter().isDefault()">
      <v-sheet class="text-center mt-6">
        Initialisiere...
      </v-sheet>
    </div>
    <div v-else class="text-center mt-6 ml-5 mr-5">
      In dieser Kombination von Filtern gibt es keine Busse
    </div>
  </v-container>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import VehicleInfoCard from "@components/OverviewSidebar/InfoCards/VehicleInfoCard.vue";
import SortMenu from "@components/OverviewSidebar/OverviewMenus/SortMenu.vue";
import SearchMenu from "@components/OverviewSidebar/OverviewMenus/SearchMenu.vue";
import {RelDelaySemantic, relDelayToSemantic, sortType, vehicleInfo} from "@/types/globals";
import {VehicleStateMap} from "@/types/vehicleStateMap";
import {DeviationSemantics} from "@/api";
import BseagLogo from "@components/ControlBar/bseagLogo.vue";

export default defineComponent({
  name: "VehicleListContainer",
  components: {BseagLogo, VehicleInfoCard, SortMenu, SearchMenu},
  props: {
    vehicles: {
      type: Object as PropType<VehicleStateMap>,
    },
  },
  data: () => ({
    whichSort: sortType.Semantics as sortType,
    sortAsc: true as boolean,
    sortedVehicles: [] as Array<vehicleInfo>,
    currSearch: null as string
  }),
  mounted() {
    window.setInterval(() => {
      this.sortedVehicles = this.getVehicleInfo
    }, 1100)
  },
  computed: {
    // Extract info needed for VehicleCards from VehicleStateMap
    getVehicleInfo() {
      // Go through all vehicles returned from VehicleStateMap and fill up instances of vehicleInfo and
      // Lastly push them into the Array
      let sortedVehicleInfo: Array<vehicleInfo> = []
      for(let currVehicle of this.vehicles.getFilteredVehicles()) {
        if(this.currSearch == null || currVehicle.identification.displayText == this.currSearch) {
          // The values set here are most likely defined
          let tempVehicle: vehicleInfo = {
            name: currVehicle.identification.displayText,
            uid: currVehicle.identification.uid,
            line: "n/a",
            nextStop: "n/a",
            checkedDeviationPrefix: null,
            checkedAbsDeviationSemantics: null,
            checkedRelDeviationSemantics: null,
            checkedDeviationValue: this.vehicles.getDelay(currVehicle),
            deviation: undefined,
          }

          // Some Values may be not defined, their default is set in initial creation of tempVehicle
          if(currVehicle.operational.line?.uid != undefined) {
            tempVehicle.line = currVehicle.operational.line.displayText
          }
          if(currVehicle.position?.displayText != undefined) {
            tempVehicle.nextStop = currVehicle.position.displayText
          }
          if(currVehicle.deviation?.prefix != undefined) {
            tempVehicle.checkedDeviationPrefix = currVehicle.deviation.prefix
          }

          // Set Semantics according to type of delay chosen
          if(this.vehicles.absDelay) {
            if(currVehicle.deviation?.semantics != undefined) {
              tempVehicle.checkedAbsDeviationSemantics = currVehicle.deviation.semantics
            }
          } else {
            tempVehicle.checkedRelDeviationSemantics = relDelayToSemantic(tempVehicle.checkedDeviationValue)
          }

          if(currVehicle.deviation != undefined) {
            tempVehicle.deviation = currVehicle.deviation
          }

          sortedVehicleInfo.push(tempVehicle)
        }
      }
      // Here the vehicles get sorted according to the sort set in whichSort
      switch(this.whichSort) {
        case sortType.None: return this.sortAsc ? sortedVehicleInfo.reverse() : sortedVehicleInfo
        case sortType.Deviation: {
          sortedVehicleInfo.sort((over, under) => {
            if(over.checkedDeviationValue == undefined) {
              return this.sortAsc ? 1 : -1
            } else if(under.checkedDeviationValue == undefined) {
              return this.sortAsc ? -1 : 1
            } else if(over.checkedDeviationValue > under.checkedDeviationValue) {
              return -1
            } else {
              return 1
            }
          })
          return this.sortAsc ? sortedVehicleInfo : sortedVehicleInfo.reverse()
        }
        case sortType.Semantics: {
          sortedVehicleInfo.sort((over, under) => {
            // If a value is undefined it gets pushed down automatically
            if(over.checkedDeviationValue == undefined) {
              return this.sortAsc ? -1 : 1
            } else if(under.checkedDeviationValue == undefined) {
              return this.sortAsc ? 1 : -1
            }

            let overValue: number
            let underValue: number

            if(this.vehicles.absDelay) {
              if(over.checkedAbsDeviationSemantics == DeviationSemantics.Suboptimal) {
                overValue = 6
              } else if (over.checkedAbsDeviationSemantics == DeviationSemantics.Problematic) {
                overValue = 5
              } else if (over.checkedAbsDeviationSemantics == DeviationSemantics.OnTime) {
                overValue = 4
              } else if (over.checkedAbsDeviationSemantics == DeviationSemantics.Waiting) {
                overValue = 3
              } else if (over.checkedAbsDeviationSemantics == DeviationSemantics.NotAvailable) {
                overValue = 2
              } else {
                overValue = 1
              }

              if(under.checkedAbsDeviationSemantics == DeviationSemantics.Suboptimal) {
                underValue = 6
              } else if (under.checkedAbsDeviationSemantics == DeviationSemantics.Problematic) {
                underValue = 5
              } else if (under.checkedAbsDeviationSemantics == DeviationSemantics.OnTime) {
                underValue = 4
              } else if (under.checkedAbsDeviationSemantics == DeviationSemantics.Waiting) {
                underValue = 3
              } else if (under.checkedAbsDeviationSemantics == DeviationSemantics.NotAvailable) {
                underValue = 2
              } else {
                underValue = 1
              }
            } else {
              if(over.checkedRelDeviationSemantics == RelDelaySemantic.OnTime) {
                overValue = 6
              } else if (over.checkedRelDeviationSemantics == RelDelaySemantic.NotAvailable) {
                overValue = 5
              } else if (over.checkedRelDeviationSemantics == RelDelaySemantic.Problematic) {
                overValue = 4
              } else if (over.checkedRelDeviationSemantics == RelDelaySemantic.Suboptimal) {
                overValue = 3
              } else if (over.checkedRelDeviationSemantics == RelDelaySemantic.Waiting) {
                overValue = 2
              } else {
                overValue = 1
              }

              if(under.checkedRelDeviationSemantics == RelDelaySemantic.OnTime) {
                underValue = 6
              } else if (under.checkedRelDeviationSemantics == RelDelaySemantic.NotAvailable) {
                underValue = 5
              } else if (under.checkedRelDeviationSemantics == RelDelaySemantic.Problematic) {
                underValue = 4
              } else if (under.checkedRelDeviationSemantics == RelDelaySemantic.Suboptimal) {
                underValue = 3
              } else if (under.checkedRelDeviationSemantics == RelDelaySemantic.Waiting) {
                underValue = 2
              } else {
                underValue = 1
              }
            }

            // If over and under are in the same "class", sort them after their deviationValue
            if(overValue-underValue == 0) {
              if(Math.abs(over.checkedDeviationValue) > Math.abs(under.checkedDeviationValue)) {
                return this.sortAsc ? 1 : -1
              } else {
                return this.sortAsc ? -1 : 1
              }
            }

            return overValue-underValue
          })
          return this.sortAsc ? sortedVehicleInfo.reverse() : sortedVehicleInfo
        }
        case sortType.Name: {
          sortedVehicleInfo.sort((over, under) => {
            if(over.name > under.name) {
              return 1
            } else {
              return -1
            }
          })
          return this.sortAsc ? sortedVehicleInfo : sortedVehicleInfo.reverse()
        }
      }
    },
  },
  methods: {
    // Change after what value the VehicleList is sorted. Used in emit from sort menu
    changeSort(sortFor: sortType) {
      this.whichSort = sortFor
    },
    // Change in which 'direction' the VehicleList is sorted. Used in emit from sort menu
    changeSortOrder(order: string) {
      if(order == "asc") {
        this.sortAsc = true
      } else if(order == "desc") {
        this.sortAsc = false
      }
    }
  }
})

</script>

<style>

.vehicle-container {
  height: 83dvh;
}

.vlist-container {
  height: 100%;
  overflow: scroll;
}

</style>