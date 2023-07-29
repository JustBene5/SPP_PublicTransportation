import * as api from '@/api/api'
import {LineIdentification, VehicleState} from "@/api/api";
import {Filter} from "@/types/filter";
import {sortType, RelDelaySemantic,relDelayToSemantic} from "@/types/globals";

export class VehicleStateMap {
    vehicleMap: Record<string, api.VehicleState> = {};
    
    tripItineraryMap: Record<string,  api.TripItinerary> = {};
    routeVehiclesMap:Record<string, string[]> = {}; // For an route uid  we give back array with vehicle uids on list ordered after depature time.
    awaitedTripIts:Record<string, {vUid:string, stage:number}> = {};
    relativeDelays: Record<string, number> = {};

    filter: Filter;
    absDelay: boolean;
    filteredVehicles: Record<string, api.VehicleState> = {};

    constructor(){
        this.vehicleMap = {};
        this.tripItineraryMap = {};
        this.routeVehiclesMap = {};
        this.awaitedTripIts = {};
        this.relativeDelays = {};
        this.filter = new Filter();
        this.absDelay = true;
    }

    // Add or update vehicle State
    set(v:api.VehicleState){
        if(this.isOperational(v)){

          let previousVehicleState = this.vehicleMap[v.identification.uid];
          this.vehicleMap[v.identification.uid]=v;

          if(previousVehicleState != undefined){
            if(previousVehicleState.operational?.trip?.uid && previousVehicleState.operational?.trip?.uid != v.operational?.trip?.uid){
              this.addToRouteMap(v.identification.uid);
            }
          }else{
            this.addToRouteMap(v.identification.uid);
          }
          this.updateRelativeDelay(v);
          this.testAndAddToFilteredVehicles(v.identification.uid);
        }else{
        }
    }

    setTripItinerary(tripuid:string, tripItinerary: api.TripItinerary){
      this.tripItineraryMap[tripItinerary.identification.uid] = tripItinerary;

      if(this.awaitedTripIts[tripuid] != undefined && this.awaitedTripIts[tripuid].vUid != undefined){
        let vehicleUid = this.awaitedTripIts[tripuid].vUid;
        delete this.awaitedTripIts[tripuid].vUid;
        this.addToRouteMap(vehicleUid);
        this.updateRelativeDelay(this.vehicleMap[vehicleUid]);
        this.testAndAddToFilteredVehicles(vehicleUid);        

        let route = this.getVehicleRoute(vehicleUid)
        for( let vUid of this.getVehiclesWithSameRoute(route)){
          this.updateRelativeDelay(this.vehicleMap[vUid]);
          this.testAndAddToFilteredVehicles(vUid);
        }
       
        
      }
    }

    testAndAddToFilteredVehicles(vehicleUid:string){
      if(vehicleUid != undefined){

        if(this.doesVehiclePassesFilter(this.vehicleMap[vehicleUid])){
          this.filteredVehicles[vehicleUid] = this.vehicleMap[vehicleUid];
        }else{
          //console.log("Remove")
          delete this.filteredVehicles[vehicleUid];
          if(this.filteredVehicles[vehicleUid] != undefined){
            console.log(this.filteredVehicles[vehicleUid])
          }
          //
        }
      }
      
    }

    // Change Filter that is applied to vehicles
    setFilter(f:Filter){
        this.filter=f.createCopy();
        this.updateFilteredVehicles();
    }

    setFilterName(name:string){
        this.filter.setName(name);
        this.updateFilteredVehicles();
    }

    setFilterVehicles(vehicles:string[]){
        this.filter.setVehicles(vehicles);
        this.updateFilteredVehicles();
    }

    setFilterLines(lines:string[]){
        this.filter.setLines(lines);
        this.updateFilteredVehicles();
    }

    setFilterTenants(tenants:string[]) {
        this.filter.setTenants(tenants);
        this.updateFilteredVehicles();
    }

    setFilterDelay(delay:number[]){
        this.filter.setAbsDelay(delay);
        this.updateFilteredVehicles();
    }

    setFilterDelaySemantics(delaySemantics:api.DeviationSemantics[]){
        this.filter.setDelaySemantics(delaySemantics);
        this.updateFilteredVehicles();
    }

    addFilterDelaySemantic(delaySemantic:api.DeviationSemantics){
        this.filter.addDelaySemantic(delaySemantic);
        this.updateFilteredVehicles();
    }
    removeFilterDelaySemantic(delaySemantic:api.DeviationSemantics){
        this.filter.removeDelaySemantic(delaySemantic);
        this.updateFilteredVehicles();
    }

    setFilterRelSemantic(relSemantics: RelDelaySemantic[]){
      this.filter.setRelSemantics(relSemantics);
      this.updateFilteredVehicles();
    }

    setFilterWorkingSet(workingSet:string[]) {
        this.filter.setWorkingSet(workingSet);
        this.updateFilteredVehicles();
    }
    setFilterGpsArea(gpsArea: { position:api.GpsPosition,radius:number}){
        this.filter.setGpsArea(gpsArea);
        this.updateFilteredVehicles();
    }

    updateFilteredVehicles(){
        this.filteredVehicles = {};
        this.getOperationalVehicles().map((v) => {
          this.updateRelativeDelay(v);
            if(this.doesVehiclePassesFilter(v)){
                this.filteredVehicles[v.identification.uid] = v;
            }
        })
    }

    // Returns copy of current filter
    getFilter(){
        return this.filter.createCopy();
    }

    // Delete Vehicle from Map
    removeVehicle(v:string | api.VehicleState){
        if(typeof(v) == "string"){
            delete this.vehicleMap.v;
            delete this.filteredVehicles.v;
        }else{
            delete this.vehicleMap[v.identification.uid];
            delete this.filteredVehicles[v.identification.uid];
        }
    }

    // Returns Record<string,VehicleState>
    getMap(){
        return this.vehicleMap;
    }

    getVehicle(uid:string){
        return this.vehicleMap[uid];
    }

    isOperational(v:VehicleState){
        return v.registrationState!=undefined && (v.registrationState=="OPERATIONAL" )
    }

    getOperationalVehicles(){
        return Object.values(this.vehicleMap);
    }

    getFilteredVehiclesMap(){
        return this.filteredVehicles;
    }

    getFilteredVehicles(
        showUnoperationalVehicles: boolean = false,
        sortAfter: sortType = sortType.None,
        filterBy:Filter=this.filter)
    {
        let vehicleStateArr: Array<VehicleState>

        // Fill Array with vehicles according to set boolean
        if(showUnoperationalVehicles){
            vehicleStateArr = this.getAllVehicles().filter((v)=> {return this.doesVehiclePassesFilter(v,filterBy)});
        }else if(filterBy != this.filter){
            vehicleStateArr = this.getOperationalVehicles().filter((v)=>{return this.doesVehiclePassesFilter(v,filterBy)});
        }else{
            vehicleStateArr = Object.values(this.filteredVehicles);
        }

        // Sort vehicles if wanted, sortType.none is default
        switch(sortAfter) {
            case sortType.None: {
                return vehicleStateArr // Move, move, move!!!
            }
            case sortType.Deviation: {
                return vehicleStateArr.sort((over, under) => {
                    try {
                        if(over.deviation.value < under.deviation.value) {
                            return -1
                        } else if (over.deviation.value > under.deviation.value) {
                            return 1
                        } else {
                            return 0
                        }
                    } catch (e) {
                        return 0
                    }

                })
            }
            case sortType.Name: {
                return vehicleStateArr.sort((over, under) => {
                    if(over.identification.uid < under.identification.uid) {
                        return -1
                    } else if (over.identification.uid > under.identification.uid) {
                        return 1
                    } else {
                        return 0
                    }
                })
            }
        }
    }

    doesVehiclePassesFilter(v:api.VehicleState, filterBy:Filter=this.filter){
        if(!this.isOperational(v)){
            return false;
        }

        try{
            if(filterBy.getVehicles().length != 0 && (v.identification?.displayText== undefined || !filterBy.getVehicles().includes(v.identification?.displayText))){
                return false;
            }
            if(filterBy.lines.length != 0 && (v.operational.line == undefined || !filterBy.lines.includes((v.operational.line?.uid)))){
                return false;
            }
            if(filterBy.tenants.length != 0 && ! filterBy.tenants.includes(v.tenant)){
                return false;
            }
            let vehicleDelay = this.getDelay(v,true);
            if(filterBy.absDelay[0] != Filter.delayInputInterval[0] && (vehicleDelay == undefined  || filterBy.absDelay[0]>= vehicleDelay)){
                return false;
            }
            if(filterBy.absDelay[1] != Filter.delayInputInterval[1] && (vehicleDelay == undefined  ||filterBy.absDelay[1]<= vehicleDelay)){
                return false;
            }

            if(filterBy.delaySemantics.length != 0 && (v.deviation?.semantics == undefined || !filterBy.delaySemantics.includes(v.deviation?.semantics))){
                return false;
            }
            if(filterBy.relSemantics.length != 0 ){
              let relD = relDelayToSemantic(this.getDelay(v,false));
              //console.log(relD)
              if(!filterBy.relSemantics.includes(relD)){
                return false;
              }
            }
            if(filterBy.workingSet.length != 0 && filterBy.workingSet.includes(v.workingSet?.displayText)){
                return false;
            }
            if(!filterBy.isInGpsArea(v.gpsPosition)){
                return false;
            }

            if(filterBy.getOccupancy().length != 0 && (v.occupancy?.range == undefined || !filterBy.getOccupancy().includes("["+v.occupancy?.range.toString() + "]"))){
              //console.log(v.occupancy?.range.toString())
              return false;
          }


            return true;

        }catch(e){
            console.log("Fehler "+ v + " | " + e);
            return filterBy.acceptUndefinedVehicles;
        }
    }

    getAllVehicles(){
        return Object.values(this.vehicleMap);
    }

    // Returns all lines which are currently driven by a vehicle, which is part of this vehicleStateMap
    getAllLines(): Array<LineIdentification> {
        let linesArr: Array<LineIdentification> = []
        for(let vehicle of Object.values(this.vehicleMap)) {
            try {
                if(vehicle.operational?.line != undefined && !linesArr.some(e => e.uid == vehicle.operational?.line?.uid)) {
                    linesArr.push(vehicle.operational.line)
                }
            } catch (e) {
                console.log("Vehicle has no line identification - " + e)
            }
        }
        return linesArr
    }

    getAllUid(){
        return Object.keys(this.vehicleMap);
    }

    // Function used to determine color of objects across the app, so that deviation values can be changed easily
    deviationToColor(vehicle: VehicleState, colorCode: boolean = false): string {
        if(vehicle == undefined){
            return "error_black"
        }
        if(this.absDelay) {
            return this.semanticsColor(vehicle.deviation?.semantics, colorCode)
        } else {
            return this.relativeColor(relDelayToSemantic(this.getDelay(vehicle)), colorCode)
        }
    }

    semanticsColor(vehicleSemantics: api.DeviationSemantics, colorCode: boolean): string {
        if(vehicleSemantics != undefined) {
            // Switch to determine the deviation's gravity
            switch (vehicleSemantics) {
                case "ON_TIME": {
                    return colorCode ? "398E2D" : "ind_green"
                }
                case "SUBOPTIMAL": {      // Too early
                    return colorCode ? "4A148C" : "ind_purple"
                }
                case "PROBLEMATIC": {     // Too late
                    return colorCode ? "C71110" : "ind_red";
                }
                case "WAITING": {
                    return colorCode ? "1976d2" : "error_blue"
                }
                case "NOT_AVAILABLE": {
                    return colorCode ? "646464" : "error_black"
                }
            }
        } else {
            return colorCode ? "646464":"error_black"
        }
    }

    relativeColor(delaySemantic: RelDelaySemantic, colorCode: boolean): string {
      switch (delaySemantic) {
        case "NO_DATA":
          return colorCode ? "646464":"error_black";
        case "EARLY":
          return colorCode ? "4A148C":"ind_purple";
        case "ON_TIME":
          return colorCode ? "398E2D":"ind_green";
        case "LATE":
          return colorCode ? "E8CA01":"ind_yellow";
        case "CRITICAL":
          return colorCode ? "C71110":"ind_red";
        default:
          return colorCode ? "646464":"error_black";
      }
    }

    updateRelativeDelay(v:api.VehicleState){
      let delay: number;
      if(v.deviation == undefined || v.deviation.semantics=="NOT_AVAILABLE"){
          return undefined;
      }else{
        delay = -1 * v.deviation.value;
        //console.log("Timing ...")
        let timing = this.getTiming(v.identification?.uid);
        //let timing = 30;
        if(timing < 0){
          console.log("Timing kleiner 0");
          //timing *= -1;
        }
        if (timing != 0){
            this.relativeDelays[v.identification.uid] = Math.trunc((delay/timing)*1000)/10
        }else{
          this.relativeDelays[v.identification.uid] = undefined;
        }
      }
    }
    

    //based on absDelay returns absolute Delay (in minutes) or relative Delay (as decimal)
    /**
     * Return delay of vehicle.
     * @param v vehicle State
     * @param absoluteDelay if true return Delay in Minutes, if false return percent of delay/timing
     * @returns delay in minutes or percent
     */
    getDelay(v:api.VehicleState, absoluteDelay = this.absDelay): number{
        let delay: number;
        if(v.deviation == undefined || v.deviation.semantics=="NOT_AVAILABLE"){
            return undefined;
        }
        else{
            delay = -1 * v.deviation.value;
            if (absoluteDelay || Math.abs(delay) == 0) {
                //console.log("Abs")
                return delay;
            } else {
                /* //console.log("Timing ...")
                let timing = this.getTiming(v.identification?.uid);
                //let timing = 30;
                if(timing < 0){
                  console.log("Timing kleiner 0");
                  //timing *= -1;
                }
                if (timing != 0){
                    return Math.trunc((delay/timing)*1000)/10
                }else{
                    return undefined;
                } */
                return this.relativeDelays[v.identification.uid];
            }
        }
    }

    /**
     * Returns array of vehicleUids that have same route.uid
     * @param routeUid
     * @returns string[]
     */
    getVehiclesWithSameRoute(routeUid:string):string[]{
      return this.getOperationalVehicles().filter(
        (v)=> v.operational?.route?.uid == routeUid
      ).map((v)=> v.identification?.uid);
    }

    /**
     * Return tripItinary for given vehicle Uid
     * @param vehicleUid
     */
    getTripItinary(vehicleUid:string){
        return this.tripItineraryMap[this.vehicleMap[vehicleUid]?.operational?.trip?.uid];
    }

    /**
     * Return Date when the vehicle should leave first stop
     * @param vehicleUid
     */
    getPlannedDepatureDate(vehicleUid:string):Date{

        return new Date(this.getTripItinary(vehicleUid)?.links[0]?.end?.timeInfo?.planned?.departure)

    }

    getVehicleRoute(vehicleUid:string){
      let trip = this.getTripItinary(vehicleUid);
      if(trip != undefined){
        return trip.route?.uid
      }else{
        return undefined;
      }
      //return  this.getTripItinary(vehicleUid).route.uid;
    }

    /**
     * Return average time distance (in minutes) of given vehicle to predecessor and successor vehicle (Based on depature time)
     * @param vehicleUid
     */
    getTiming(vehicleUid:string):number{
        let preSucc:string[] = this.getPreAndSuccVehicle(vehicleUid);
        let depatureTime = this.getPlannedDepatureDate(vehicleUid).getTime();
        let timing = 0;
        if(! isNaN(depatureTime)){
          if(preSucc[0]){
            let preDepatureTime = this.getPlannedDepatureDate(preSucc[0]).getTime();
            if(! isNaN(preDepatureTime)){
              timing = (depatureTime - preDepatureTime)/60000
            }
          }else if(preSucc[1]){
            let succDepatureTime = this.getPlannedDepatureDate(preSucc[1]).getTime();
            if(! isNaN(succDepatureTime)){
              timing = (succDepatureTime - depatureTime)/60000;
            }
          }
        }
        if(timing < 0){
          this.sortRouteMapEntry(this.getTripItinary(vehicleUid).route?.uid);
          timing *= -1;
        }
        return timing;
    }

    addToRouteMap(vehicleUid:string){
      let vehicle = this.vehicleMap[vehicleUid];

      if(this.getTripItinary(vehicleUid) == undefined ){
        this.awaitedTripIts[vehicle.operational?.trip?.uid] = {vUid: vehicleUid , stage:0};
        return;
      }
      let route = this.getTripItinary(vehicleUid).route.uid;
      if(route == undefined || isNaN(this.getPlannedDepatureDate(vehicleUid).getTime())){
        this.awaitedTripIts[vehicle.operational?.trip?.uid] = {vUid: vehicleUid , stage:1};
        return;
      }
      if(this.routeVehiclesMap[route] == undefined){ // Bisher kein vehicle für Route gespeichert
        this.routeVehiclesMap[route] = [vehicleUid];
      }else{
        if(this.routeVehiclesMap[route].includes(vehicleUid)){ // Vehicle ist schon auf Route gespeichert
          return;
        }else{ // An sortierter Stelle einfügen
          let vDepatureTime = this.getPlannedDepatureDate(vehicleUid).getTime();
          let routeVehicles = this.routeVehiclesMap[route];
          let indexOfVehicle = routeVehicles.length;

          // gehe von hinten durch, um richtige Stelle für vehicle zu finden.
          while(indexOfVehicle > 0 && this.getPlannedDepatureDate(routeVehicles[indexOfVehicle-1]).getTime() > vDepatureTime){
            indexOfVehicle--;
          }
          this.routeVehiclesMap[route].splice(indexOfVehicle, 0, vehicleUid);
        }
      }
    }

    sortRouteMapEntry(routeUid:string){
      this.routeVehiclesMap[routeUid].sort((v,w) => {
        return this.getPlannedDepatureDate(v).getTime() - this.getPlannedDepatureDate(w).getTime();
      })
    }


    /**
     * Return Array with uid of predecessing vehicle and successing vehicle
     * @param vehicleUid
     * @returns [uid of predecessing vehicle, uid of successing vehicle], [undefined,undefined] if not existing
     */
    getPreAndSuccVehicle(vehicleUid:string){
      let tripItinary = this.getTripItinary(vehicleUid);
      if(tripItinary == undefined){
        return [undefined, undefined];
      }
      let route = tripItinary.route?.uid;
      if(route == undefined || this.routeVehiclesMap[route] == undefined){
        return [undefined, undefined];
      }else{
        let indexOfVehicle = this.routeVehiclesMap[route].indexOf(vehicleUid);
        return [
          indexOfVehicle > 0                                       ? this.routeVehiclesMap[route][indexOfVehicle-1] : undefined,
          indexOfVehicle + 1 < this.routeVehiclesMap[route].length ? this.routeVehiclesMap[route][indexOfVehicle+1] : undefined
        ]
      }
    }
}