<template>
  <v-card
      class="elevation-2"
      variant="flat"
      :color="this.vehicles.deviationToColor(vehicles.getVehicle(vehicle.uid), false)"
      @click="showBusDetails()"
  >
    <v-container class="ma-0 vehicle-card-title text-center">
      <h3>Bus: {{ vehicle.name }}</h3>
    </v-container>
    <v-sheet class="ma-1 pa-0 rounded" color="card_surface">
      <v-container class="next-stop-text">
        <div>
          <p>Nächster Halt: <b>{{ vehicle.nextStop }}</b></p>
        </div>
      </v-container>
      <v-container class="line-text">
        Linie: <b>{{ vehicle.line }}</b>
      </v-container>


      <v-container>
        <v-row>
          <div class="ml-3">
            <div v-if="vehicles.absDelay">
              <div v-if="vehicle.checkedAbsDeviationSemantics == DeviationSemantics.OnTime">
                {{DeviationSemantics.OnTime}}
              </div>
              <div v-else-if="vehicle.checkedAbsDeviationSemantics == DeviationSemantics.Problematic">
                {{DeviationSemantics.Problematic}}
              </div>
              <div v-else-if="vehicle.checkedAbsDeviationSemantics == DeviationSemantics.Suboptimal">
                {{DeviationSemantics.Suboptimal}}
              </div>
              <div v-else-if="vehicle.checkedAbsDeviationSemantics == DeviationSemantics.Waiting">
                {{DeviationSemantics.Waiting}}
              </div>
              <div v-else>
                {{DeviationSemantics.NotAvailable}}
              </div>
            </div>
            <div v-if="!vehicles.absDelay">
              <div v-if="vehicle.checkedRelDeviationSemantics == RelDelaySemantic.OnTime">
                {{RelDelaySemantic.OnTime}}
              </div>
              <div v-else-if="vehicle.checkedRelDeviationSemantics == RelDelaySemantic.Problematic">
                {{RelDelaySemantic.Problematic}}
              </div>
              <div v-else-if="vehicle.checkedRelDeviationSemantics == RelDelaySemantic.Suboptimal">
                {{RelDelaySemantic.Suboptimal}}
              </div>
              <div v-else-if="vehicle.checkedRelDeviationSemantics == RelDelaySemantic.Waiting">
                {{RelDelaySemantic.Waiting}}
              </div>
              <div v-else>
                {{RelDelaySemantic.NotAvailable}}
              </div>
            </div>

          </div>
          <v-spacer></v-spacer>
          <div class="mr-3">
            <div v-if="vehicles.absDelay">
              <div v-if="vehicle.checkedDeviationValue == 0">
                <b>{{vehicle.checkedDeviationPrefix}}0</b>
              </div>
              <div v-else-if="vehicle.checkedDeviationValue > 0">
                <b>{{vehicle.checkedDeviationPrefix}}{{vehicle.checkedDeviationValue}}</b>
              </div>
              <div v-else>
                <b>{{vehicle.checkedDeviationValue}}</b>
              </div>
            </div>
            <div v-if="!vehicles.absDelay">
              <div v-if="vehicle.checkedDeviationValue == 0">
                <b>{{vehicle.checkedDeviationPrefix}}0%</b>
              </div>
              <div v-else-if="vehicle.checkedDeviationValue > 0">
                <b>{{vehicle.checkedDeviationPrefix}}{{vehicle.checkedDeviationValue}}%</b>
              </div>
              <div v-else>
                <b>{{vehicle.checkedDeviationValue}}%</b>
              </div>
            </div>
          </div>

        </v-row>
      </v-container>
    </v-sheet>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import {RelDelaySemantic, relDelayToSemantic, vehicleInfo} from "@/types/globals";
import {VehicleStateMap} from "@/types/vehicleStateMap";
import {DeviationPrefix, DeviationSemantics} from "@/api";


export default defineComponent({
  name: "VehicleInfoCard",
  computed: {
    RelDelaySemantic() {
      return RelDelaySemantic
    },
    DeviationSemantics() {
      return DeviationSemantics
    },
    DeviationPrefix() {
      return DeviationPrefix
    }
  },
  props: {
    vehicles: {
      type: Object as PropType<VehicleStateMap>
    },
    vehicle: {
      type: Object as PropType<vehicleInfo>, // Vehicle the card should display
    },
  },
  methods: {
    relDelayToSemantic,
    showBusDetails() {
      this.emitter.emit("bus-ausgewaehlt", { "busUid": this.vehicle.uid })
    }
  }
})

</script>

<style scoped>
.elevation-2 {
  margin: 0.7em 0.6em;
}

.vehicle-card-title {
  padding: 8px 3px 5px 3px;
}

.next-stop-text {
  padding: 10px 17px 0 17px;
}

.line-text {
  padding: 0 17px 4px 17px;
}

</style>