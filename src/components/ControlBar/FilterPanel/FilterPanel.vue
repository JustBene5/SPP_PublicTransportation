<template>
  <v-btn @click="openFilterPanel()"> <p class="good-font">Filter</p> </v-btn>

  <v-dialog
      v-model="showfilterPanel"
      width="900" min-width="600"
      @update:model-value="applyFilter"
    >
      <v-card class="pa-2">
        <v-card-item class="pa-0">
          <v-card-title class="pa-2">Filtere Busse</v-card-title>
          <template v-slot:append > 
          <v-btn @click="showfilterPanel = false; applyFilter()" icon="mdi-close" size="small" variant="text"/>
          </template>
        </v-card-item>
        <v-card-text class="px-5">
          <v-list >
            <v-list-item >
              <v-container class="pa-1">
                <v-row class="mb-1">
                  <v-col align-self="center"> Busse </v-col>
                  <v-col cols="9">
                    <v-autocomplete
                        v-model="current.vehicles"
                        :items="filterVehicles"
                        multiple
                        variant="outlined"
                        hide-details
                        clearable
                        density="compact"
                        chips
                        closable-chips
                        auto-select-first
                        placeholder="Alle"
                    >
                    </v-autocomplete>
                  </v-col>
                </v-row></v-container>
            </v-list-item>
            <v-list-item >
              <v-container class="pa-1">
              <v-row   class="mb-1">
                <v-col align-self="center"> Linien </v-col>
                <v-col cols="9"> 
                  <v-autocomplete
                    v-model="current.lines"
                    :items="lines"
                    multiple
                    variant="outlined"
                    hide-details
                    clearable
                    density="compact"
                    chips
                    closable-chips
                    auto-select-first
                    placeholder="Alle"
                  >
                  </v-autocomplete>
                </v-col>
              </v-row></v-container>
            </v-list-item>
            <v-list-item >
              <v-container class="pa-1">
                <v-row justify="space-between"  compact class=" mb-1" >
                  <v-col align-self="center"> Mandanten </v-col>
                  <v-col cols="9">
                    <v-autocomplete
                      v-model="current.tenants"
                      :items="tenants"
                      multiple
                      variant="outlined"
                      hide-details
                      clearable
                      density="compact"
                      chips
                      closable-chips
                      auto-select-first
                      placeholder="Alle"
                    ></v-autocomplete>
                  </v-col>
                </v-row>
              </v-container>
            </v-list-item>
            <v-list-item >
            <v-container class="pa-1">
              <v-row justify="space-between"  compact class=" mb-1" >
                <v-col align-self="center"> WorkingSet </v-col>
                <v-col cols="9">
                  <v-autocomplete
                    v-model="current.workingSet"
                    :items="workingSets"
                    multiple
                    variant="outlined"
                    hide-details
                    clearable
                    density="compact"
                    chips
                    closable-chips
                    auto-select-first
                    placeholder="Alle"
                  ></v-autocomplete>
                </v-col>
              </v-row></v-container>
            </v-list-item>
            <v-list-item >
            <v-container class="pa-1">
              <v-row justify="space-between"  compact class=" mb-1" >
                <v-col align-self="center"> Auslastung </v-col>
                <v-col cols="9">
                  <v-autocomplete
                    v-model="current.occupancy"
                    :items="occupancies"
                    multiple
                    variant="outlined"
                    hide-details
                    clearable
                    density="compact"
                    chips
                    closable-chips
                    auto-select-first
                    placeholder="Alle"
                  ></v-autocomplete>
                </v-col>
              </v-row></v-container>
            </v-list-item>
            <v-list-item >
              <v-container class="pa-1">
              <v-row  >
                <v-col cols="3" align-self="center" > Verspätung in Minuten</v-col>
                <v-col cols="2" >
                  <v-text-field v-model="delayTextFieldMinValue" placeholder="-&infin;" variant="outlined" reverse hint="Mindestens" persistent-hint clearable @click:clear="()=>{delayTextFieldMinValue = ''}"/>
                </v-col>
                <v-col cols="5" > 
                  <v-range-slider
                    strict
                    :min="delaySliderMinMax[0]"
                    :max="delaySliderMinMax[1]"
                    v-model="current.absDelay"
                    :step="1"
                    :color="delaySliderColor"
                  />
                </v-col>
                <v-col cols="2"> 
                  <v-text-field v-model="delayTextFieldMaxValue" placeholder="&infin;" variant="outlined"  reverse hint="Maximal" persistent-hint clearable @click:clear="()=>{delayTextFieldMaxValue = ''}"/>
                </v-col>
              </v-row></v-container>
            </v-list-item>
            
          </v-list>         
        </v-card-text>
        <v-card-actions class="px-5">
          <v-row><v-col>
          <v-btn variant="tonal" block @click="resetFilter"><p class="good-font-btn">Kein Filter</p></v-btn>
          </v-col><v-col>
          <v-btn color="selected" variant="elevated" block @click="applyFilter"><p class="good-font-btn">Filter anwenden</p></v-btn>
        </v-col></v-row>
        </v-card-actions>

        <v-divider class="my-2"></v-divider>
        
        <SavedFilter :model-value="current" :savedFilterStorage="savedFilterStorage" @update="setFilterSavedFilter" @update-filter-storage="updateFilterStorage"></SavedFilter>

      </v-card>
    </v-dialog>
    
</template>


<script lang="ts">
  // This component is used to show the filter panel and select filters.
  import { defineComponent } from 'vue'
  import SavedFilter from './SavedFilter.vue'
  import { VehicleStateMap } from '@/types/vehicleStateMap';
  import { Filter } from '@/types/filter';

  import type { PropType } from 'vue';
  import * as api from '@/api'
  import {sortAndUnique} from "@/types/globals";

  export default defineComponent({
    name: 'FilterPanel',
    components: {
      SavedFilter,
    },
    props: {
      vehicles: {
        type: Object as PropType<VehicleStateMap>,
        required: true,
      }
    },
    data() {
      return{
        showfilterPanel: false,
        current: new Filter(),
        filterVehicles: [],
        lines: [],
        tenants: [],
        delaySliderMinMax: Filter.delayInputInterval,  
        workingSets:[],
        occupancies:["[0]","[0,25]","[25,50]", "[50,75]", "[75,100]", "[100]"],
        savedFilterStorage:[] as Filter[],
      }
    },

    mounted(){
      // Lese gespeicherte Filter aus Cookies aus.
      // Muss angepasst werden, wenn Filterklasse erweitert wird.
      try{
        if(this.$cookies.isKey("SavedFilter")){
          let cookieFilters:Filter[] = this.$cookies.get("SavedFilter");
          for(let i = 0; i < cookieFilters.length; i++){
            this.savedFilterStorage.push(
              new Filter( cookieFilters[i].name, cookieFilters[i].vehicles, cookieFilters[i].lines, cookieFilters[i].tenants,
                  cookieFilters[i].absDelay, cookieFilters[i].delaySemantics, cookieFilters[i].relSemantics ,cookieFilters[i].workingSet, cookieFilters[i].gpsArea, cookieFilters[i].occupancy)
            );
          }
        }
      }catch(e){
        console.log("Fehler bei Lesen der gespeicherten Filter aus Cookies" + e);
      }
    },


    computed:{
      // Model-Value of Delay Minimum Textfield
      delayTextFieldMinValue: {  
        get():(number|""){
            if(this.current.absDelay[0] == this.delaySliderMinMax[0]){
              return "";
            }else{
              return this.current.absDelay[0];
            }
        },
        set(absDelay:(number|string)) {
          if(absDelay == "" || absDelay <= this.delaySliderMinMax[0]){
            this.current.absDelay[0] = this.delaySliderMinMax[0]
          }else if(absDelay > this.current.absDelay[1]){
            this.current.absDelay[0] = this.current.absDelay[1];
          }else {

            this.current.absDelay[0] = absDelay;
          }
        }
      },
      // Model-Value of Delay Maximum Textfield
      delayTextFieldMaxValue: {  
        get():(number|""){ 
            if(this.current.absDelay[1] == this.delaySliderMinMax[1]){
              return "";
            }else{
              return this.current.absDelay[1];
            }
        },
        set(absDelay:(number|string)) {

          if(absDelay == "" || absDelay > this.delaySliderMinMax[1]){
            this.current.absDelay[1] = this.delaySliderMinMax[1]
          }else if(absDelay < this.current.absDelay[0]){
            this.current.absDelay[1] = this.current.absDelay[0];
          }else {

            this.current.absDelay[1] = absDelay;
          }
        }
      },
      // Compute Color of slider to give visual feedback if filter is active
      delaySliderColor():string{
          if(this.current.absDelay[0]== this.delaySliderMinMax[0] && this.current.absDelay[1]== this.delaySliderMinMax[1]){
            return "grey";
          }
          if(this.current.absDelay[0] > this.current.absDelay[1]){
            return "red";
          }   
          if(this.current.absDelay[0] == this.current.absDelay[1]){
            return "orange";
          }   

          return "selected";
      }
    },
    
    methods: {
      // Sorgt dafür, dass Filter gespeichert bleiben, wenn Filterpanel geschlossen / setzt Cookies mit gespeicherten Filtern
      updateFilterStorage(fs:Filter[]){
        this.savedFilterStorage = fs;
        this.$cookies.set("SavedFilter",fs,);
      },
      openFilterPanel(){
        this.initFilterPossibilities();
        this.current = this.vehicles.getFilter();
        this.showfilterPanel = true;
      },
      applyFilter(){
        this.current.setDelaySemantics(this.vehicles.getFilter().getDelaySemantics());
        this.current.setRelSemantics(this.vehicles.getFilter().getRelSemantics());
        this.vehicles.setFilter(this.current);
        this.showfilterPanel = false;
      },

      setFilterSavedFilter(filter:Filter){
        this.current = filter.createCopy();
      },

      resetFilter(){
        this.current = new Filter();
        this.applyFilter();
      },

      initFilterPossibilities(){
        if(this.vehicles != undefined){
          this.filterVehicles = sortAndUnique(this.vehicles.getAllVehicles().map((v) => v.identification.displayText)).slice();
          this.lines = sortAndUnique(this.vehicles.getOperationalVehicles().map((v) => v.operational?.line?.uid)).slice();
          this.tenants = sortAndUnique(this.vehicles.getAllVehicles().map((v:api.VehicleState) => v.tenant));
          this.workingSets = sortAndUnique(this.vehicles.getAllVehicles().map((v:api.VehicleState) => v.workingSet?.displayText)).slice();
        }
      }
    }
  })
</script>

<style scoped>
.good-font {
  margin-top: 4px;
  font-family: Helvetica, sans-serif;
  letter-spacing: 0.04em;
  font-weight: normal;
  font-size: medium;
}

.good-font-btn {
  font-family: Helvetica, sans-serif;
  letter-spacing: 0.02em;
  font-weight: normal;
  font-size: medium;
}
</style>
