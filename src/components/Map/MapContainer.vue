<template>
  <div class="map-wrap">
    <div class="map" ref="mapContainer"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Map as Karte, NavigationControl } from 'maplibre-gl';
import { shallowRef, markRaw, ShallowRef } from 'vue';
import { VehicleStateMap } from "@/types/vehicleStateMap";
import { VehicleState } from "@/api";
import type { PropType } from 'vue';
import * as api from '@/api/api';

import ivuStopPointFile from './../../assets/json/netPointsIVU.json'
import stoStopPointFile from './../../assets/json/netPointsSTO.json'

import busIcon from '@/assets/sdf/bus_icon_circle_space.png'
//import haltestelleIcon from '@/assets/svg/haltestelle.png'
import haltestelleIcon from '@/assets/svg/haltestelle_icon_filled.png'
import { Marker } from "maplibre-gl";

export default defineComponent({
  name: "MapContainer",
  props: {
    vehicles: {
      type: Object as PropType<VehicleStateMap>,
    },
  },
  data() {
    return {
      mapContainer: shallowRef(null) as ShallowRef,
      map: shallowRef(null) as ShallowRef,
      apiKey: 'EFL8VQIXbp5rTIyeRLOy' as string,  // API Key from MapTiler
      lightMap: 'https://api.maptiler.com/maps/d2920101-bc48-4e66-bd63-4f2decfe016c/style.json?key=EFL8VQIXbp5rTIyeRLOy' as string,
      darkMap: 'https://api.maptiler.com/maps/910140d6-7302-4003-a31c-d3331bc42c86/style.json?key=EFL8VQIXbp5rTIyeRLOy' as string,
      fancyMap: 'https://api.maptiler.com/maps/topo-v2/style.json?key=EFL8VQIXbp5rTIyeRLOy' as string,
      satelliteMap: 'https://api.maptiler.com/maps/satellite/style.json?key=EFL8VQIXbp5rTIyeRLOy' as string,
      osMap: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=EFL8VQIXbp5rTIyeRLOy' as string,
      currMap: "" as string,
      vehicleFeatureData: { 'type': 'FeatureCollection', 'features': [] } as GeoJSON.FeatureCollection,
      stopPointFeatureData: { 'type': 'FeatureCollection', 'features': [] } as GeoJSON.FeatureCollection,
      animateId: 0 as number,
      hoveredVehicleId: null, // null wenn kein Vehicle gehovert, sonst id des gehoverten Fahrzeugs. ! Andere Id als Vehicle-uid von IVU !
      focusedVehicleId: null as string,
      showStopPoints: "none",
      vehicleIdHash: {} as Record<string,number>,
      vehicleIdCounter: 0,
    }
  },

  // Setup map and mapContainer 
  setup() {
    const mapContainer: ShallowRef = shallowRef(null);
    const map: ShallowRef = shallowRef(null);
    return {
      map, mapContainer
    };
  },

  mounted() {
    this.currMap = this.lightMap
    this.initMap(this.currMap);
    this.emitter.on("bus-ausgewaehlt", (eventData) => {
      this.focusVehicle(eventData.busUid);
      this.centerVehicle(eventData.busUid)
    })
    this.emitter.on("bus-abgewaehlt", () => {
      this.focusVehicle(undefined);
      //console.log("Schließen")
    })
    this.emitter.on("toggleShowStops", (data) => {
      this.setShowStopPoints(data.show);
    })

    // Switch map theme on toggle from SettingMenu
    this.emitter.on("toggle-theme", (prop) => {
      let currState = { lng: this.map.getCenter().lng, lat: this.map.getCenter().lat, zoom: this.map.getZoom() }
      let currPitch = this.map.getPitch()
      if (this.map) {
        this.map.remove();
      }
      if (prop.theme == "light") {
        this.currMap = this.lightMap
      } else if (prop.theme == "dark") {
        this.currMap = this.darkMap
      } else {
        console.log("This is not a correct theme:" + prop)
      }
      this.initMap(this.currMap, currState)
      this.map.setPitch(currPitch)
    })
  },

  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },

  methods: {
    initMap(style: string = this.lightMap, initialState = { lng: 6.083756783688955, lat: 50.776104464549064, zoom: 12 }) {
      try {
        // Initial state is the center of Aachen
        //const initialState = { lng: 6.083756783688955, lat: 50.776104464549064, zoom: 12 };

        // Create the map and set minZoom and maxZoom
        // Es wird nur "new Karte" benutzt, weil "new Map" nicht benutzt werden kann,
        // da "Map" für den Typ von vehicles gebraucht wird
        this.map = markRaw(new Karte({
          container: this.mapContainer,
          style: style,
          center: [initialState.lng, initialState.lat],
          zoom: initialState.zoom,
          minZoom: 9.5,
          maxZoom: 18,
        }));
        this.map.addControl(new NavigationControl({
          visualizePitch: true,
        }), 'bottom-right')

        this.map.on('load', () => {
          this.initVehicleLayer();
          this.animateVehicles();
          this.initStopPointLayer();
        })
      } catch (error) {
        console.log("Fehler: " + error)
      }

    },

    fillStopPointData(dataFile: api.NetPointsResponseData){
       for(let i = 0; i < dataFile.stopPoints.length; i++){
        this.stopPointFeatureData.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [dataFile.stopPoints[i].gpsPosition.longitude, dataFile.stopPoints[i].gpsPosition.latitude],
          },
          properties: {netPointId: dataFile.stopPoints[i].identification.uid, passesFilter:true}
        });
      } 
    },


    initStopPointLayer() { // Nicht fertig !!!
      if(this.map.getLayer("stopPointLayer") == undefined){
        if(this.stopPointFeatureData.length != 0){
          this.fillStopPointData(ivuStopPointFile);
          this.fillStopPointData(stoStopPointFile);
        }
        
        this.map.addSource('stopPointSource', {
          type: 'geojson',
          data: this.stopPointFeatureData,
        })
        this.map.loadImage(haltestelleIcon, (error, stop_icon) => {
          this.emitter.emit("stop-image-loaded");
          if(error) {
            console.log("Fehler bei Image Load: stop_icon"); return;
          }
            
          this.map.addImage("stop_icon", stop_icon);
          this.map.addLayer({
            id: "stopPointLayer",
            source: "stopPointSource",
            type: "symbol",
            visibility: false,
            layout: {
              "icon-image": "stop_icon",
              "icon-size": 0.08,
              //"icon-ignore-placement":true,
              //"icon-pitch-alignment": "viewport",
            },
            
          })
          this.map.moveLayer( "stopPointLayer", "vehicleLayer");
          this.map.setLayoutProperty("stopPointLayer", "visibility", this.showStopPoints);
        })
      }
    },

    filterStopPoints(){

    },

    setShowStopPoints(show:boolean){
      if(show){
        this.showStopPoints = "visible";
      }else{
        this.showStopPoints = "none";
        
      }
      if(this.map.getLayer("stopPointLayer") != undefined){
        this.map.setLayoutProperty("stopPointLayer", "visibility", this.showStopPoints);
      }
    },

    initVehicleLayer() {
      if(this.map.loaded() && this.map.getLayer("vehicleLayer") == undefined){
        try {
          // Add Source with vehicles as features
          // Check if source is already there (can happen on theme change)
          if (this.map.getSource('vehicleSource') == undefined) {
            this.map.addSource('vehicleSource', {
              type: 'geojson',
              data: this.vehicleFeatureData,
              //generateId: true,
            });
          }

          // Add Layer that displays data from 'vehicleSource'
          // Check if layer is already there (can happen on theme change)
          if (this.map.getLayer('vehicleLayer') == undefined) {
            this.map.addLayer({
              id: "vehicleLayer",
              source: "vehicleSource",
              type: "circle",
              paint: {
                "circle-radius": ['case',
                  ['boolean', ['feature-state', 'hover'], false], 10,  // case hover = true
                  ['boolean', ['feature-state', 'focused'], false], 10,  // case hover = true
                  7    // otherwise
                ],
                "circle-opacity": ['case',
                  ['boolean', ['feature-state', 'hover'], false], 1, // case hover = true
                  0.8   // otherwise
                ],
                "circle-color": ["get", "propColor"],
                "circle-stroke-color": "black",
                "circle-stroke-width": ['case',
                  ['boolean', ['feature-state', 'focused'], false], 2.5, // case hover = true
                  1.5   // otherwise
                ]
              },
            })

            // Ändere Cursor, wenn über einem Fahrzeug
            this.map.on('mouseenter', 'vehicleLayer', () => { this.map.getCanvas().style.cursor = 'pointer' });

            // Ändere feature-state zu hover=true, wenn Cursor über einem Fahrzeug ist.
            this.map.on('mousemove', 'vehicleLayer', (e) => {
              try {
                if (e.features.length > 0) {
                  // Setze für anderes Fahrzeug hover auf false
                  if (this.hoveredVehicleId) {
                    this.map.setFeatureState(
                      { source: 'vehicleSource', id: this.hoveredVehicleId },
                      { hover: false }
                    );
                  }
                  // Speichere, welches Fahrzeug gehovert ist und passe feature-state des Fahrzeugs an
                  this.hoveredVehicleId = e.features[0].id;

                  this.map.setFeatureState(
                    { source: 'vehicleSource', id: this.hoveredVehicleId },
                    { hover: true }
                  );
                }
              } catch (e) {
                console.log("Fehler beim Hovern über vehicleLayer: " + e);
              }
            });

            // Setze feature-state auf false, wenn nicht mehr über Layer gehovert ist.
            this.map.on('mouseleave', 'vehicleLayer', () => {
              this.map.getCanvas().style.cursor = '';
              if (this.hoveredVehicleId) {
                this.map.setFeatureState({ source: 'vehicleSource', id: this.hoveredVehicleId }, { hover: false });
                this.hoveredVehicleId = null;
              }
            });

            this.map.on('click', 'vehicleLayer', (e) => {
              this.emitter.emit("bus-ausgewaehlt", { "busUid": e.features[0].properties.vehicleUid })
            })
          }
          
        } catch (e) {
          console.log("Fehler beim load " + e);
        }
      }
    },

    centerVehicle(vehicleUid: string) {
      let vehicle = this.vehicles.getVehicle(vehicleUid);
      this.map.flyTo({
        center: [vehicle.gpsPosition.longitude, vehicle.gpsPosition.latitude],
        speed: 0.5,
      })
    },

    focusVehicle(vehicleUid: string = undefined) {
      try {

        if (vehicleUid == undefined || vehicleUid != this.focusedVehicle) {
          //let oldFocusedVehicleId = this.vehicleFeatureData.features.findIndex((f) => { return f != undefined && f.properties.vehicleUid == this.focusedVehicle });
          let oldFocusedVehicleId = this.vehicleIdHash[this.focusedVehicle];
          if (oldFocusedVehicleId != undefined) {
            this.map.setFeatureState(
              { source: 'vehicleSource', id: oldFocusedVehicleId },
              { focused: false }
            );
          }
          this.focusedVehicle = vehicleUid
        }
        if(this.focusedVehicle != undefined){
          //let focusedVehicleId = this.vehicleFeatureData.features.findIndex((f) => { return f != undefined && f.properties.vehicleUid == this.focusedVehicle });
          let focusedVehicleId = this.vehicleIdHash[this.focusedVehicle];
          if (focusedVehicleId != -1) {
            this.map.setFeatureState(
              { source: 'vehicleSource', id: focusedVehicleId },
              { focused: true }
            );
            let vehicle = this.vehicles.getVehicle(vehicleUid);
          }
        }

      } catch (e) {
        console.log("Fehler bei focusVehicle" + e)
      }
    },

    // Animate the features on the map, by updating data and repeating for each rendered frame. 
    animateVehicles() {
      if(this.animateId == 0){
        this.animateId = window.setInterval(() => {
        this.animateVehiclesStep()
      }, 1000); // setInterval sorgt dafür, dass innere Funktion alle 1000 Millisekunden = 1s aufgerufen wird.
      }
      
    },

    animateVehiclesStep() {
      this.updateVehicleFeatureData();
      if (this.map == undefined || this.map.style == undefined ) {
        this.stopAnimation();
        this.initMap(this.currMap);
        console.log("Realoading map.")
      }else if(this.map.getSource("vehicleSource") == undefined){
        this.stopAnimation();
        console.log("Realoading map (vehicleLayer).");
        this.initVehicleLayer();
        this.animateVehicles();
      }else{
        this.map.getSource("vehicleSource").setData(this.vehicleFeatureData);
      }
        /* try {
        } catch (e) {
          //console.log(this.map.getSource("vehicleSource"))
          console.log("Fehler bei animateVehicles - " + e);
        } */
      
      //if (this.focusedVehicle) {
        //this.focusVehicle(this.focusedVehicle);
      //}
    },

    // Stopt das Neuladen der Fahrzeuge.
    stopAnimation() {
      window.clearInterval(this.animateId);
      this.animateId = 0;
      console.log("Stopped Animation.")
    },

    // Gehe alle filtered (!) vehicles durch und füge zu vehicleFeatureData hinzu.

    updateVehicleFeatureData() {
      try {
        this.vehicleFeatureData.features = [];
        this.vehicles.getFilteredVehicles().forEach((v: VehicleState) => {
          let i = this.vehicleFeatureData.features.findIndex((f) => { return f != undefined && f.properties.vehicleUid == v.identification.uid });
          try { // This try-catch is for vehicles without gpsPosition or uid
            if (i == -1) {
              this.vehicleFeatureData.features.push(this.createFeature(v));
            } else {
              this.vehicleFeatureData.features[i] = (this.createFeature(v));
            }
          } catch { }
        })
      } catch (e) {
        console.log("Fehler bei updateVehicleFeatureData " + e);
      }
    },


    // Erstelle GeoJSONFeature aus VehicleState. Setzt property propColor
    createFeature(vehicle: api.VehicleState) {
      if(this.vehicleIdHash[vehicle.identification.uid] == undefined){
        this.vehicleIdHash[vehicle.identification.uid] = this.vehicleIdCounter;
        this.vehicleIdCounter++;
      }

      let f: GeoJSON.Feature = {
        type: 'Feature',
        id: this.vehicleIdHash[vehicle.identification.uid],
        geometry: {
          type: 'Point',
          coordinates: [vehicle.gpsPosition.longitude, vehicle.gpsPosition.latitude]
        },
        properties: {
          "propColor": "#" + this.vehicles.deviationToColor(vehicle, true),
          "vehicleUid": vehicle.identification.uid,
        }
      };
      return f;
    },

    // Erstellt icon für Bus. Funktioniert aktuell nicht vollständig.
    createBusImage(color: string = "000000"): HTMLImageElement {
      try {
        let icon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 540 540">'
          + '<g> <circle cx="270" cy="270" r="270" style="fill:%23' + color + ';"/>'
          + '</g></svg>'
        let elem = document.createElement("img");
        //elem.src = icon;
        elem.src = busIcon
        elem.alt = `bus image green`
        //elem.width=20;
        //elem.height=20;
        return elem;
      } catch {
        console.log("Fehler bei createBusmage")
        return document.createElement("img");
      }
    },

  }

});
</script>

<style>
@import 'maplibre-gl/dist/maplibre-gl.css';

.map-wrap {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.map {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>