<template>
  <v-app id="inspire">
    <OverviewSideBar :vehicles="this.vehicles"></OverviewSideBar>
    <ControlBar :vehicles="this.vehicles" @close-event-src="closeEventSource()"></ControlBar>
    <DetailSidebar :vehicles="this.vehicles" :vehicleUid="vehicles.getAllUid()[0]"></DetailSidebar>

    <v-main>
      <MapContainer :vehicles="this.vehicles"></MapContainer>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MapContainer from "./components/Map/MapContainer.vue";
import OverviewSideBar from "./components/OverviewSidebar/OverviewSidebar.vue";
import DetailSidebar from "./components/DetailSidebar/DetailSidebar.vue";
import ControlBar from "./components/ControlBar/ControlBar.vue";
import axios from "axios";
import * as api from "./api/index";
import { VehicleStateMap } from "./types/vehicleStateMap"
import IVU_Snapshot from "./assets/json/IVU_Snapshot.json"
import STO_Snapshot from "./assets/json/STO_Snapshot.json"

export default defineComponent({
  name: 'App',
  components: {
    MapContainer,
    OverviewSideBar,
    DetailSidebar,
    ControlBar
  },

  data() {
    return {
      eventSource: undefined as EventSource,
      subscriptionId: "" as string,
      vehicles: new VehicleStateMap() as VehicleStateMap,
      //startInits : 2, // 0 if no trip itineraries init, 2 if STO and IVU init.
      bufferGetTripItineraries: [] as string[], // buffers up to 10 tripIts and sends them on the way
    };
  },
  mounted(){
    this.initVehicleStates();
    //this.initVehicleStatesFromSnapshot()
    this.initEventSource();
    window.addEventListener('beforeunload', this.closeEventSource);
  },

  methods: {
    initVehicleStatesFromSnapshot() {
      if(this.vehicles.getAllVehicles().length == 0) {
        // Get VehicleStates from IVU Snapshot
        let tripUidIVU = [];
        try{
          for(let i :number = 0; i < IVU_Snapshot.data.length; i++){
            this.vehicles.set( IVU_Snapshot.data[i]);


            if(IVU_Snapshot.data[i].operational?.trip?.uid != undefined){ //maybe instead another .then?
              tripUidIVU.push(IVU_Snapshot.data[i].operational?.trip?.uid);

            }
          }
        }catch(error){
          console.log("Fehler bei Initialisieren der VehicleStates von IVU Snapshot" + error)
        }
        //this.getTripItineraries([], tripUidIVU, undefined);


        // Get VehicleStates from STO Snapshot
        let tripUidSTO = [];
        try{
          for(let i :number = 0; i < STO_Snapshot.data.length; i++){
            this.vehicles.set( STO_Snapshot.data[i]);


            if(STO_Snapshot.data[i].operational?.trip?.uid != undefined){ //maybe instead another .then?
              tripUidSTO.push(STO_Snapshot.data[i].operational?.trip?.uid);

            }
          }
        }catch(error){
          console.log("Fehler bei Initialisieren der VehicleStates von STO Snapshot" + error)
        }
        //this.getTripItineraries([], tripUidSTO, undefined);
        console.log("Filled VehicleStateMap from Snapshot")
      }
    },
    initVehicleStates() {

      api.VehiclesApiFactory().retrieveVehicleStates('en',['IVU',])
      .then((responseVehicles)=>{

          let tripUid = [];

          try{
            for(let i :number = 0; i < responseVehicles.data.data.length; i++){
              this.vehicles.set( responseVehicles.data.data[i]);  
              

              if(responseVehicles.data.data[i].operational?.trip?.uid != undefined){ //maybe instead another .then?
                //tripUid.push(responseVehicles.data.data[i].operational?.trip?.uid);
                this.bufferedGetTripItineraries(responseVehicles.data.data[i].operational?.trip?.uid);
              }
            }
          }catch(error){
            console.log("Fehler bei Initialisieren der VehicleStates" + error)
          }
          //this.getTripItineraries([], tripUid, undefined);
          
      })
      .catch((e)=> {console.log("Fehler bei Axios Request: " + e)})
      api.VehiclesApiFactory().retrieveVehicleStates('en',['STO',])
      .then((responseVehicles)=>{
          let tripUid = [];
          try{
            for(let i :number = 0; i < responseVehicles.data.data.length; i++){
              this.vehicles.set( responseVehicles.data.data[i]);
              
              if(responseVehicles.data.data[i].operational?.trip?.uid != undefined){ //maybe instead another .then?
                //tripUid.push(responseVehicles.data.data[i].operational?.trip?.uid);
                this.bufferedGetTripItineraries(responseVehicles.data.data[i].operational?.trip?.uid);
              }
            }
          }catch(error){
            console.log("Fehler bei Initialisieren der VehicleStates" + error)
          }
          //this.getTripItineraries([], tripUid, undefined);
      })
      .catch((e)=> {console.log("Fehler bei Axios Request: " + e)})  
    },

    initEventSource() {
      try {
        const fK = {"filterKeys": [
          {"tenant": ["IVU","STO"]},
          {"vehicleUid": []}
        ]};
        
        axios.post('/api/fl/vehicleStates/updates/subscriptions',fK, {headers:{'Accept-Language':['en'] }})
        .then( (response)=>{
          this.subscriptionId = response.data.subscriptionId;
          this.eventSource = new EventSource('/api/fl/vehicleStates/updates?subscriptionId=' + this.subscriptionId);   
          this.eventSource.onmessage = (e:MessageEvent) => { this.updateEventhandler(JSON.parse(e.data))};
          console.log("EventSource initialisiert");
        })
        .catch((e)=> {console.log("Fehler bei Axios Request: " + e)})
      } catch (error) {
        console.log("Fehler beim Initialisieren der EventSource" + error);
      }
    },

    closeEventSource(e=new Event("")) {
      if(this.eventSource.readyState == 1) {
        this.eventSource.close();
        console.log("EventSource geschlossen");
      }
    },


    updateEventhandler(updateMessage: api.VehicleStateChange) {
        if (updateMessage.modifier == api.ChangeType.Delete) {
          this.vehicles.remove(updateMessage[1]);
        }else {
          let trip = updateMessage.value?.operational?.trip?.uid;
          if(trip != undefined){
            if( (! Object.keys(this.vehicles.tripItineraryMap).includes(trip)) || this.vehicles.awaitedTripIts[trip].stage == 1){      
              this.bufferedGetTripItineraries(updateMessage.value?.operational?.trip?.uid);
            }
          }
            
           this.vehicles.set( updateMessage["value"]);         
        }
    },

    bufferedGetTripItineraries(tripUid : string){
      this.bufferGetTripItineraries.push(tripUid);
      if(this.bufferGetTripItineraries.length >= 10){
        this.getTripItineraries([], this.bufferGetTripItineraries, undefined);
        this.bufferGetTripItineraries = [];
      }
    },

    //returns an array of the trip iterinaries; API call
    getTripItineraries(vehicleUids:string[] = [], tripUids:string[] = [], blockUid:string = undefined){
      let smallTripSetUids = []
      let sizeOfSmallTripSet = 50;
      for(let j:number= 0; j < tripUids.length/sizeOfSmallTripSet; j++ ){
        smallTripSetUids = tripUids.slice(j*sizeOfSmallTripSet, (j+1)*sizeOfSmallTripSet);
      
        try{
        api.TripsApiFactory().retrieveTripItineraries("en", vehicleUids, smallTripSetUids, blockUid, [])
        .then((responseTrips) => {
          try{
            for(let i :number = 0; i < responseTrips.data.data.length; i++){
                this.vehicles.setTripItinerary(smallTripSetUids[i], responseTrips.data.data[i]);
              }
            }
            catch(error){
            console.log("Fehler bei trips" + error)
          }
        })
        .catch((e)=> {console.log("Fehler bei Axios Request: " + e)})
      }
    catch(e){
      console.log("Fehler bei getTripItinaries; " + e)
    }}
    },

  },
})

</script>

<style>

html, body {
    height: 100%;
    margin: 0;
} 

</style>
