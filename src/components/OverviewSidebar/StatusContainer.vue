<template>
  <v-container class="ma- pa-0">
    <v-row class="ma-2">
      <score-info-menu></score-info-menu>
      <v-spacer></v-spacer>
      <v-sheet height="40" class="pt-1">
        <div v-if="vehicles.getFilter().isDefault()" class="mt-1">
          Keine Filter aktiviert
        </div>
        <div v-else>
          <v-btn
              color="selected"
              variant="tonal"
              @click="this.resetFilter"
          >
            <p class="good-font">Filter abwählen</p>
          </v-btn>
        </div>
      </v-sheet>
      <v-spacer></v-spacer>
    </v-row>
    <v-divider></v-divider>
    <div v-if="tenantsToDisplay.length != 0" class="status-container">
      <ol class="slist-container">
        <li v-for="currTenant of tenantsToDisplay">
          <status-info-card
              class="ma-3"
              :vehicles="this.vehicles"
              :obj-to-display="currTenant"
              @clickedForFilter="args => addToFilter(args)"
              :curr-filter="this.currFilter"
          >
          </status-info-card>
        </li>
        <li>
          <v-divider></v-divider>
          <b class="ma-2">Linien mit höchstem Score:</b>
        </li>
        <li v-for="currLine of linesToDisplay">
          <status-info-card
              class="ma-3"
              :vehicles="this.vehicles"
              :obj-to-display="currLine"
              @clickedForFilter="args => addToFilter(args)"
              :curr-filter="this.currFilter"
          >
          </status-info-card>
        </li>
      </ol>
    </div>
    <div v-else>
      <v-sheet class="text-center mt-6">
        Initalisiere...
      </v-sheet>
    </div>
  </v-container>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import StatusInfoCard from "@components/OverviewSidebar/InfoCards/StatusInfoCard.vue";
import {PropType} from "vue/dist/vue";
import {getScore, sortType, statusInfo, statusOf} from "@/types/globals";
import {Filter} from "@/types/filter"
import {VehicleStateMap} from "@/types/vehicleStateMap"
import {LineIdentification} from "@/api";
import ScoreInfoMenu from "@components/OverviewSidebar/OverviewMenus/ScoreInfoMenu.vue";

export default defineComponent({
  name: "StatusContainer",
  components: {ScoreInfoMenu, StatusInfoCard},
  props: {
    vehicles: {
      type: Object as PropType<VehicleStateMap>,
    },
  },
  data: () => ({
    ivuFilter: new Filter(undefined, undefined, undefined, ['IVU']) as Filter,
    stoFilter: new Filter(undefined, undefined, undefined, ['STO']) as Filter,
    tenantsToDisplay: [] as Array<statusInfo>,
    linesToDisplay: [] as Array<statusInfo>,
    currFilter: new Filter as Filter,
    ivuScore: 0 as number,
    stoScore: 0 as number,
  }),
  beforeMount() {
    this.currFilter = this.vehicles.getFilter()
  },
  mounted() {
    window.setInterval(() => {
      // Recalculate the scores and update the displayed tenants and lines accordingly
      this.tenantsToDisplay = this.getTenantsToDisplay
      this.linesToDisplay = this.getLinesToDisplay
    }, 2000)
  },
  computed: {
    statusOf() {
      return statusOf
    },
    getTenantsToDisplay(): Array<statusInfo> {
      let ivuInfo: statusInfo = {
        name: 'IVU',
        uid: 'IVU',
        problematicScore: getScore(this.vehicles, this.ivuFilter, true)[0],
        numberOfVehicles: getScore(this.vehicles, this.ivuFilter, true)[1],
        filter: this.ivuFilter,
        isStatusOf: statusOf.Tenant
      }
      let stoInfo: statusInfo = {
        name: 'STO',
        uid: 'STO',
        problematicScore: getScore(this.vehicles, this.stoFilter, true)[0],
        numberOfVehicles: getScore(this.vehicles, this.stoFilter, true)[1],
        filter: this.stoFilter,
        isStatusOf: statusOf.Tenant
      }
      return [ivuInfo, stoInfo]
    },
    // Returns the top x lines with the highest score
    getLinesToDisplay(): Array<statusInfo> {
      let arrOfEverything: Array<statusInfo> = this.getStatusInfo(
          this.vehicles.getAllLines(), // Get statusInfo for each line
          statusOf.Line // Only lines are calculated here
      )
      arrOfEverything.sort((over, under) => {
        if(over.problematicScore > under.problematicScore) {
          return -1
        } else if(over.problematicScore < under.problematicScore){
          return 1
        } else {
          return 0
        }
      })
      return arrOfEverything //.slice(0, 10)
    },
  },
  methods: {
    // Function to get status info of given string, filled with either a list of tenants or a list of line uids, according to srcType
    getStatusInfo(srcArr: Array<LineIdentification>, isOfType: statusOf): Array<statusInfo> {
      let statusArr: Array<statusInfo> = []
      for (let line of srcArr) {
        let curr_filter: Filter = new Filter()
        curr_filter.setLines([line.uid])
        let scoreArr: Array<number> = getScore(this.vehicles, curr_filter)
        let oneStatusInfo: statusInfo = {
          name: line.displayText,
          uid: line.uid,
          problematicScore: scoreArr[0],
          numberOfVehicles: scoreArr[1],
          filter: curr_filter,
          isStatusOf: statusOf.Line,
        }
        statusArr.push(oneStatusInfo)
      }
      return statusArr
    },


    /* Logic for correct use of filters in Status */

    // Receives an element, checks if it's part of the filter and adds/removes it accordingly
    addToFilter(elementForFilter: statusInfo) {
      // First check of what kind the status element is
      if(elementForFilter.isStatusOf == statusOf.Tenant) {
        let currTenants: Array<string> = this.vehicles.getFilter().getTenants()
        let index: number = currTenants.indexOf(elementForFilter.uid)
        // Check list of tenants currently in filter, -1 if it's not in there
        if(index == -1) {
          // If not found in array, add the element to filter
          currTenants.push(elementForFilter.uid)
        } else {
          // If found, remove it
          currTenants.splice(index, 1)
        }
        // Give the filter the changed array
        this.vehicles.setFilterTenants(currTenants)
      } else if (elementForFilter.isStatusOf == statusOf.Line) {    // Same stuff for lines
        let currLines: Array<string> = this.vehicles.getFilter().getLines()
        let index: number = currLines.indexOf(elementForFilter.uid)
        // Check list of tenants currently in filter, -1 if it's not in there
        if(index == -1) {
          // If not found in array, add the element to filter
          currLines.push(elementForFilter.uid)
        } else {
          // If found, remove it
          currLines.splice(index, 1)
        }
        // Give the filter the changed array
        this.vehicles.setFilterLines(currLines)
      }
    },

    // Resets the filter entirely
    resetFilter() {
      this.currFilter = new Filter()
      this.vehicles.setFilter(new Filter())
    },
  },
})
</script>

<style scoped>
.status-container {
  height: 87dvh;
}

.slist-container {
  height: 100%;
  overflow: auto;
}

.good-font {
  font-family: Helvetica, sans-serif;
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: normal;
  font-size: medium;
}
</style>