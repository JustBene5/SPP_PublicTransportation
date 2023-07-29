<template>
  <v-card
      class="ma-1 elevation-2"
      variant="flat"
      :color = "objToDisplay.isStatusOf == statusOf.Tenant ? scoreToColor(objToDisplay.problematicScore, true) : scoreToColor(objToDisplay.problematicScore)"
  >
    <v-sheet class="ma-0 pa-0" color="transparent" height="45">
      <v-row class="status-card-title">
        <div class="card-header-text">
          <h3 v-if="objToDisplay.isStatusOf == statusOf.Tenant">Mandant: {{ objToDisplay.name }}</h3>
          <h3 v-if="objToDisplay.isStatusOf == statusOf.Line">Linie: {{ objToDisplay.name }}</h3>
        </div>
        <v-spacer></v-spacer>
        <v-btn
            v-if="objToDisplay.isStatusOf == statusOf.Line"
            class="card-header-info"
            variant="text"
            rounded size="40"
            @click="emitLine"
        >
          <v-icon size="24">mdi-information-outline</v-icon>
        </v-btn>
      </v-row>
    </v-sheet>
    <v-sheet class="ma-1 pa-3 rounded" color="card_surface">
      <v-row class="ma-1">
        <v-sheet class="pa-0" color="card_surface">
          <v-col>
            <v-row class="mb-1">
              <v-icon class="avgSy">mdi-bus-multiple</v-icon>
              {{objToDisplay.numberOfVehicles}}
            </v-row>
            <v-row>
              <v-icon class="avgSy">mdi-alert-octagram-outline</v-icon>
              {{objToDisplay.problematicScore}}
            </v-row>
          </v-col>
        </v-sheet>
        <v-spacer></v-spacer>
        <v-btn @click="$emit('clickedForFilter', objToDisplay)" class="pa-1 elevation-0 mt-3" :color="partOfFilter ? 'selected' : 'not_selected'">
          <p class="good-font">Im Filter: {{partOfFilter ? 'Ja' : 'Nein'}}</p>
        </v-btn>
      </v-row>
      <v-spacer></v-spacer>
    </v-sheet>
  </v-card>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import {scoreToColor, statusInfo, statusOf} from "@/types/globals";
import {Filter} from "@/types/filter"
import {VehicleStateMap} from "@/types/vehicleStateMap"

export default defineComponent ({
  name: "VehicleInfoCard",
  props: {
    vehicles: {
      type: Object as PropType<VehicleStateMap>,  // For vehicle list, so component has access
    },
    objToDisplay: {
      type: Object as PropType<statusInfo>  // The tenant, line, etc. of what this card displays the average
    },
    currFilter: {
      type: Object as PropType<Filter>  // The current Filter set by clicks on this card.
      // Has to be a prop so button color changes when other cards are clicked, e.g. the clear all filter button
    },
  },
  emits: ['clickedForFilter'], // Emits when button is clicked, so line/tenant/... of this card is added to filter
  mounted() {

  },
  computed: {
    statusOf() {
      return statusOf
    },
    // Checks if the tenant/line/... is part of the current filter set
    partOfFilter() {
      return this.vehicles.getFilter().tenants.includes(this.objToDisplay.uid) || this.vehicles.getFilter().lines.includes(this.objToDisplay.uid);
    },
  },
  methods: {
    scoreToColor,
    emitLine() {
      this.emitter.emit("linie-ausgewaehlt", { "lineUid": this.objToDisplay.uid })
    },
  },
})

</script>

<style scoped>
.avgSy {
  margin-right: 0.2em;
}

.status-card-title {
  margin: 3px 3px 3px 3px;
  padding: 0;
}

.card-header-text {
  margin: 11px 5px 0 8px;
  padding: 0;
}

.card-header-info {
  margin: 6px 5px 0 7px;
  padding: 0;
}

.good-font {
  margin: 0 3px;
  font-family: Helvetica, sans-serif;
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: normal;
  font-size: medium;
}
</style>