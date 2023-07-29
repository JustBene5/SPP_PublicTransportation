<template>
  <v-navigation-drawer location="right" v-model="angezeigt" width="310">
    <v-layout class="fill-height">
      <v-window v-model="step">
        <v-window-item :value="1">

          <v-container>

            <v-row>
              <v-col>
                <v-sheet class="pa-2"> <b>Bus</b> </v-sheet>
              </v-col>
              <v-col>
                <v-sheet class="pa-2 text-right" v-if="angezeigt">
                  <b> {{ this.vehicle.identification.displayText }} </b>
                </v-sheet>
              </v-col>
            </v-row>
            <v-divider :thickness="1"></v-divider>

            <v-row>
              <v-sheet class="pa-4 text-right"> Linie </v-sheet>
              <v-sheet class="pa-4 ml-auto">
                <v-btn @click="this.step = 2" v-if="angezeigt">
                  {{ getLineDisplayText() }}
                </v-btn>
              </v-sheet>
            </v-row>
            <v-divider :thickness="1"></v-divider>

            <v-row no-gutters>
              <v-col>
                <v-sheet class="pa-1"> Verspätung </v-sheet>
              </v-col>
              <v-col>
                <v-sheet class="pa-2 text-right" v-if="angezeigt">
                  <v-chip :color="this.vehicles.deviationToColor(this.vehicle)" variant="elevated">{{ getDeviation}}
                  </v-chip>
                </v-sheet>
              </v-col>
            </v-row>
            <v-divider :thickness="1"></v-divider>

            <v-timeline direction="horizontal">
              <v-timeline-item :dot-color="getPrevColor()" size="x-small">
                <template v-slot:opposite>
                  {{ getPrevTime() }}
                </template>
                <v-btn size="small" class="px-0" width="95" @click="clickPrev()">
                  {{ getPrevButton() }}
                </v-btn>
              </v-timeline-item>
              <v-timeline-item :dot-color="this.vehicles.deviationToColor(this.vehicle)" size="x-small">
              </v-timeline-item>
              <v-timeline-item :dot-color="getSuccColor()" size="x-small">
                <template v-slot:opposite>
                  {{ getSuccTime() }}
                </template>
                <v-btn size="small" class="px-0" width="95" @click="clickSucc()">
                  {{ getSuccButton() }}
                </v-btn>
              </v-timeline-item>
            </v-timeline>
            <v-divider :thickness="1"></v-divider>

            <v-row>
              <v-col>
                <v-sheet class="pa-2"> Mandant </v-sheet>
              </v-col>
              <v-col>
                <v-sheet class="pa-2 text-right" v-if="angezeigt">
                  {{ this.vehicle.tenant }}
                </v-sheet>
              </v-col>
            </v-row>
            <v-divider :thickness="1"></v-divider>
            <v-row>
              <v-col>
                <v-sheet class="pa-2"> Nächster Halt </v-sheet>
              </v-col>
              <v-col>
                <v-sheet class="pa-2 text-right">
                  {{ getNextStop() }}
                </v-sheet>
              </v-col>
            </v-row>
            <v-divider :thickness="1"></v-divider>

            <v-row>
              <v-col>
                <v-sheet class="pa-2"> Auslastung </v-sheet>
              </v-col>
              <v-col>
                <v-sheet class="pa-2 text-right" v-if="angezeigt">
                  <v-chip variant="elevated" >{{ getOccupancy() }}</v-chip>
                </v-sheet>
              </v-col>
            </v-row>
            <v-divider :thickness="1"></v-divider>

            <v-row>
              <v-col>
                <v-sheet class="pa-2"> Fahrer </v-sheet>
              </v-col>
              <v-col>
                <v-sheet class="pa-2 text-right" v-if="angezeigt">
                  {{ getDriver() }}
                </v-sheet>
              </v-col>
              <v-col>
                <v-btn icon="mdi-phone" size="x-small" class="ma-1"></v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-sheet class="mx-auto pb-2" @click="gotoBusOnMap">
                <v-btn prepend-icon="mdi-map-marker"> Position anzeigen </v-btn>
              </v-sheet>
            </v-row>
            <v-row>
              <v-sheet class="mx-auto pb-2" @click="console.log('keine Funktion')">
                <v-btn prepend-icon="mdi-close-circle"> Ausfallen lassen </v-btn>
              </v-sheet>
            </v-row>
            <v-row>
              <v-sheet class="mx-auto pb-2" @click="setCircleAroundBus">
                <v-btn v-if="circleActivated" prepend-icon="mdi-arrow-left-bottom"> Zurück zu Filter </v-btn>
                <v-btn v-else prepend-icon="mdi-circle-outline"> Busse im Umkreis </v-btn>
              </v-sheet>
            </v-row>
            <v-row>
              <v-sheet class="mx-auto" @click="close()">
                <v-btn prepend-icon="mdi-close"> Schließen </v-btn>
              </v-sheet>
            </v-row>

          </v-container>
        </v-window-item>

        <v-window-item :value="2">
          <v-card width="300" :height="cardHeight">
            <v-container>
              <v-row>
                <v-col cols="5">
                  <v-sheet class="pa-4 pr-1 "> <b>Linie</b> </v-sheet>
                </v-col>
                <v-col cols="7">
                  <v-sheet class="pa-4 ml-auto">
                    <v-btn @click="this.step = 1">
                      {{ getLineDisplayText() }}
                    </v-btn>
                  </v-sheet>
                </v-col>
              </v-row>

              <VehicleDetailView :vehicles="vehicles" :line="this.lineUid" :vehicle="this.busUid"></VehicleDetailView>

              <v-row>
                <v-sheet class="mx-auto pt-5" @click="close()">
                  <v-btn prepend-icon="mdi-close"> Schließen </v-btn>
                </v-sheet>
              </v-row>

            </v-container>
          </v-card>
        </v-window-item>

      </v-window>
    </v-layout>
  </v-navigation-drawer>
</template>

<script lang="ts">
import VehicleDetailView from './VehicleDetailView.vue';
import { defineComponent } from 'vue'
import * as api from '@/api/api'
import { VehicleStateMap } from '@/types/vehicleStateMap'
import type { PropType } from 'vue'
import { Filter } from "@/types/filter";
import { sortType } from "@/types/globals";
import { textChangeRangeIsUnchanged } from 'typescript';

let infos: Array<string>

export default defineComponent({
  name: "DetailSidebar",
  props: {
    vehicles: {
      type: Object as PropType<VehicleStateMap>,
      required: true
    },
    vehicleUid: String,
  },

  data: () => ({
    step: 1,
    busUid: "",
    vehicle: {
      type: Object as PropType<api.VehicleState>,
    },
    angezeigt: false,
    busInfo: false,
    /* devColor: "", */
    cardHeight: window.innerHeight - 64,
    circleActivated: false as boolean,
    recentFilter: {} as Filter,
    lineUid: ""
  }),

  mounted() {
    this.emitter.on("bus-ausgewaehlt", (evt) => {
      this.busUid = evt.busUid;
      this.vehicle = this.vehicles.getVehicle(this.busUid)
      this.businfo = true
      this.angezeigt = true
      /* this.getTextColor() */
      this.step = 1
      this.lineUid = this.vehicle.operational.line.uid
    })

    this.emitter.on("linie-ausgewaehlt", (evt) => {
      this.lineUid = evt.lineUid
      this.angezeigt = true
      this.step = 2
      let tempFilter = new Filter
      tempFilter.lines = [evt.lineUid]
      this.vehicle = this.vehicles.getFilteredVehicles(false, sortType.None, tempFilter)[0]
      /*       console.log(this.vehicle.operational.line.displayText)
            console.log(this.vehicle.identification.displayText) */
    })

    window.setInterval(() => {
      if (this.vehicles.getFilter().getGpsArea().radius == -1) {
        this.circleActivated = false
      }
    }, 1099)
  },

  computed: {
    getDeviation() {
      try {
        let data = this.vehicles.getDelay(this.vehicle);
        if (data == null || data == undefined) {
          return "-";
        }
        if (this.vehicles.absDelay) {
          return data + " min";
        }
        else {
          return data + "%"
        }
      } catch (e) {
        console.log("Fehler bei berechnung" + e);
      }
    },

  },

  methods: {
    close() {
      this.angezeigt = false;
      this.emitter.emit("bus-abgewaehlt");
      this.step = 1
    },

    setCircleAroundBus() {
      if (!this.circleActivated) {
        this.recentFilter = this.vehicles.getFilter()
        let gpsArea = { position: this.vehicle.gpsPosition, radius: 1500 }
        let radiusFilter = new Filter()
        radiusFilter.setGpsArea(gpsArea)
        this.vehicles.setFilter(radiusFilter)
        this.circleActivated = true
      } else {
        this.vehicles.setFilter(this.recentFilter)
        this.circleActivated = false
      }

    },
    getDriver() {
      try {
        return this.vehicle.operational.driver.displayText
      } catch (nodriver) {
        console.log("keine Fahrerinformation")
        return null
      }
    },

    gotoBusOnMap() {
      this.emitter.emit("bus-ausgewaehlt", { "busUid": this.busUid })
    },


    getLineDisplayText() {
      try {
        return this.vehicle.operational.line.displayText
      } catch (noline) {
        return "noLine"
      }
    },

    getPrevUid() {
      try {
        let pre = this.vehicles.getPreAndSuccVehicle(this.busUid)[0]
        if (pre == undefined) {
          return "n/a"
        } else {
          return pre
        }
      } catch (e) {
        return "noprev"
      }
    },

    getSuccUid() {
      try {
        let succ = this.vehicles.getPreAndSuccVehicle(this.busUid)[1]
        if (succ == undefined) {
          return "n/a"
        } else {
          return succ
        }
      } catch (e) {
        return "nosucc"
      }
    },

    getPrevTime() {
      try {
        let timing = this.vehicles.getTiming(this.busUid)
        let prevId = this.getPrevUid()
        let currDelay = 0
        let prevDelay = 0
        if (this.vehicles.getDelay(this.vehicle) != undefined) {
          currDelay = this.vehicles.getDelay(this.vehicle)
        }
        if (prevId != "n/a" && this.vehicles.getDelay(this.vehicles.getVehicle(prevId), true) != undefined) {
          prevDelay = this.vehicles.getDelay(this.vehicles.getVehicle(prevId), true)
          return (timing - prevDelay + currDelay).toFixed(1) + "min (" + (currDelay - prevDelay).toFixed(1) + ")"
        }
        return "n/a"
      } catch (e) {

      }

    },
    getSuccTime() {
      try {
        let timing = this.vehicles.getTiming(this.busUid)
        let succId = this.getSuccUid()
        let currDelay = 0
        let succDelay = 0
        if (this.vehicles.getDelay(this.vehicle) != undefined) {
          currDelay = this.vehicles.getDelay(this.vehicle)
        }
        if (succId != "n/a" && this.vehicles.getDelay(this.vehicles.getVehicle(succId), true) != undefined) {
          succDelay = this.vehicles.getDelay(this.vehicles.getVehicle(succId), true)
          return (timing + succDelay - currDelay).toFixed(1) + "min (" + (succDelay - currDelay).toFixed(1) + ")"
        }
        return "n/a"
      } catch (e) {

      }

    },

    getPrevButton() {

      if (this.getPrevUid() == "n/a") {
        return "Vorfahrend"
      } else {
        return this.vehicles.getVehicle(this.getPrevUid()).identification?.displayText
      }
    },
    getSuccButton() {

      if (this.getSuccUid() == "n/a") {
        return "Nachfolger"
      } else {
        return this.vehicles.getVehicle(this.getSuccUid()).identification?.displayText
      }
    },

    getNextStop() {
      let detail = "unbekannt"
      try {
        // Check if bus is at end of his line
        if (this.vehicle.destination.lastStopName == this.vehicle.position.displayText) {
          detail = "Ende"
        } else {
          detail = this.vehicle.positionState.toNetPoint.netPoint.displayText
        }

      } catch (e) {
        // Default given above
      }
      return detail
    },

    getTextColor() {
      this.devColor = this.vehicles.deviationToColor(this.vehicle)
    },

    getOccupancy() {
      try {
        return this.vehicle.occupancy.range
      } catch (e) {
        return "keine Angabe"
      }
    },


    /*     getOccColor(){
          let occ = this.getOccupancy()
          console.log(typeof(occ))
          if (occ == "[0]" ||
              occ == "[ 0, 25 ]" ||
              occ == "[ 75, 100 ]"||
              occ == "[100]"
              ) {
            return "red"
          }else{
            return "grey-lighten-2"
          }
        }, */

    clickPrev() {
      if (this.getPrevUid() == "n/a" || this.getPrevUid() == "noprev") {
        console.log("not clickable cause no prev")
      } else {
        this.emitter.emit("bus-ausgewaehlt", { "busUid": this.getPrevUid() })
      }
    },

    clickSucc() {
      if (this.getSuccUid() == "n/a" || this.getSuccUid() == "nosucc") {
        console.log("not clickable cause no succ")
      } else {
        this.emitter.emit("bus-ausgewaehlt", { "busUid": this.getSuccUid() })
      }
    },

    getPrevColor() {
      if (this.getPrevUid() == "n/a" || this.getPrevUid() == "noprev") {
        return "error_black"
      } else {
        return this.vehicles.deviationToColor(this.vehicles.getVehicle(this.getPrevUid()))
      }
    },

    getSuccColor() {
      if (this.getSuccUid() == "n/a" || this.getSuccUid() == "nosucc") {
        return "error_black"
      } else {
        return this.vehicles.deviationToColor(this.vehicles.getVehicle(this.getSuccUid()))
      }
    }




  },

  components: { VehicleDetailView }



})

</script>
<style>
.v-timeline-divider__dot.v-timeline-divider__dot--size-x-small:after {
  content: '<';
  color: gray;
}
</style>