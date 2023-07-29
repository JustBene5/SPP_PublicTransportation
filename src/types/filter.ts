import * as api from '@/api/api'
import { RelDelaySemantic } from './globals';


// Class used to store filters. Name is optional.
export class Filter {
  //FilterValues:
  name?: string;
  vehicles:string[];
  lines:string[]; // uid and displayText of lines
  tenants:string[];
  absDelay: number[];  // Stelle 0 MindestVerspätung für gefilterte Busse, Stelle 1 MaximalVerspätung für gefilterte Busse
  delaySemantics: api.DeviationSemantics[];
  relSemantics: RelDelaySemantic[];
  workingSet: string[];
  gpsArea: { position: api.GpsPosition, radius: number }; // {radius = -1} wenn deaktiviert
  occupancy: string[];

  // Settings:
  acceptUndefinedVehicles: boolean = false;
  static delayInputInterval: number[] = [-16,61];


  constructor(name?: string, vehicles:string[] = [], lines: string[] = [], tenants: string[] = [], delay: number[] = Filter.delayInputInterval,
        delaySemantics = [], relSemantics: RelDelaySemantic[] = [], workingSet: string[] = [],
        gpsArea: { position: api.GpsPosition, radius: number } = { position: { longitude: 6.090333, latitude: 50.777259 }, radius: -1 },
        occupancy:string[] = []) {

    if (name !== undefined) {
      this.name = name;
    }
    this.vehicles = vehicles.slice();
    this.lines = lines.slice();
    this.tenants = tenants.slice();
    if (delay.length == 0) {
      delay = Filter.delayInputInterval;
    }
    this.absDelay = delay.slice();
    this.delaySemantics = delaySemantics.slice();
    this.relSemantics = relSemantics;
    this.workingSet = workingSet.slice();
    this.gpsArea = { position: { ...gpsArea.position }, radius: gpsArea.radius };
    this.occupancy = occupancy.slice();
  }

  /* Getter */
  getName(){
      return this.name;
  }

  getVehicles(){
      return this.vehicles;
  }

  getLines(){
      return this.lines;
  }

  getTenants() {
      return this.tenants;
  }

  getAbsDelay() {
    return this.absDelay;
  }

  getDelaySemantics() {
    return this.delaySemantics;
  }

  getRelSemantics(){
    return this.relSemantics;
  }

  getWorkingSet() {
    return this.workingSet;
  }
  getGpsArea() {
    return this.gpsArea;
  }

  getOccupancy(){
    return this.occupancy;
  }

  /* Setter */
  setName(name:string){
      this.name = name;
  }

  setVehicles(vehicles:string[]){
      this.vehicles = vehicles;
  }

  setLines(lines:string[]){
      this.lines = lines;
  }

  setTenants(tenants:string[]) {
      this.tenants = tenants;
  }

  setAbsDelay(absDelay: number[]) {
    this.absDelay = absDelay;
  }

  setDelaySemantics(delaySemantics: api.DeviationSemantics[]) {
    this.delaySemantics = delaySemantics;
  }

  addDelaySemantic(delaySemantic: api.DeviationSemantics) {
    this.delaySemantics.push(delaySemantic);
  }
  removeDelaySemantic(delaySemantic: api.DeviationSemantics) {
    this.delaySemantics = this.delaySemantics.filter((ds) => { return ds != delaySemantic });
  }

  setRelSemantics(relSemantics:RelDelaySemantic[]){
    this.relSemantics = relSemantics;
  }

  setWorkingSet(workingSet: string[]) {
    this.workingSet = workingSet;
  }
  setGpsArea(gpsArea: { position: api.GpsPosition, radius: number }) {
    this.gpsArea = gpsArea;
  }

  setOccupancy(occupancy:string[]){
    this.occupancy = occupancy.slice();
    /* for(let o of occupancy){
      this.occupancy.push(occupancy.slice())
    } */
  }

  /* Abfragen */
  isEqual(filter:Filter, ignFF=false):boolean {
      return this.arrayEqual(this.lines, filter.lines)
          && this.arrayEqual(this.tenants,filter.tenants)
          && this.arrayEqual(this.vehicles, filter.vehicles)
          && this.absDelay[0] == filter.absDelay[0]
          && this.absDelay[1] == filter.absDelay[1]
          //&& this.stringArrayEqual(this.delaySemantics, filter.delaySemantics)
          //&& this.stringArrayEqual(this.relSemantics, filter.relSemantics)
          && this.arrayEqual(this.workingSet, filter.workingSet)
          && this.gpsArea.position.longitude == filter.gpsArea.position.longitude
          && this.gpsArea.position.latitude == filter.gpsArea.position.latitude
          && this.gpsArea.radius == filter.gpsArea.radius
          && this.arrayEqual(this.occupancy, filter.occupancy);
  }

  isDefault(): boolean {
      let defaultFilter = new Filter()
      return this.isEqual(defaultFilter)
  }

  arrayEqual<T>(a:T[], b:T[]):boolean {
      if(a.length!= b.length) return false;
      for (let i = 0; i < a.length; i++) {
          if(! a.includes(b[i])){
              return false;
          }
      }
      return true;
  }

  isInGpsArea(pos: api.GpsPosition): boolean {
    if(this.gpsArea.radius == -1){
      return true;
    }
    const phi1 = this.gpsArea.position.latitude * Math.PI / 180, phi2 = pos.latitude * Math.PI / 180, delta_lamda = (pos.longitude - this.gpsArea.position.longitude) * Math.PI / 180, R = 6371e3;
    const distance = Math.acos(Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(delta_lamda)) * R;
    return distance < this.gpsArea.radius;
  }

  createCopy(){
    return new Filter(this.name, this.vehicles, this.lines, this.tenants, this.absDelay, this.delaySemantics, this.relSemantics, this.workingSet, this.gpsArea, this.occupancy);
  }
}