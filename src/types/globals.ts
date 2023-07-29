import {
    Deviation,
    DeviationPrefix, DeviationSemantics,
} from "@/api";
import {Filter} from "@/types/filter";
import {VehicleStateMap} from "@/types/vehicleStateMap";

// Type filled with info from "stops.json", so that Markers that display stops can be displayed easily
export type stop_point = {
    uid: string,        // uid of stop pont
    short_name: string, // Name in short
    long_name?: string,  // Name in long
    longitude: number,  // part of coordinate
    latitude: number,   // part of coordinate
}

export enum sortType {
    None,
    Deviation,
    Semantics,
    Name,
}

export enum delayType {
  Semantics,
  Relative,
}

export const RelDelaySemantic = {
  OnTime: 'EARLY',
  Suboptimal: 'ON_TIME',
  Problematic: 'LATE',
  NotAvailable: 'CRITICAL',
  Waiting: 'NO_DATA'
} as const;

export type RelDelaySemantic = typeof RelDelaySemantic[keyof typeof RelDelaySemantic];

const relDelayIntevals:Record<RelDelaySemantic, {min:number, max:number}> = {
  ["EARLY"]:{min:NaN,max:0},
  ["ON_TIME"]:{min:0,max:10},
  ["LATE"]:{min:10,max:50},
  ["CRITICAL"]:{min:50,max:NaN},
  ["NO_DATA"]:{min:NaN,max:NaN},
}

export function relDelayToSemantic(relDelay:number):RelDelaySemantic {
  if(relDelay == undefined) {
    return "NO_DATA";
  } else if(relDelay < 0) {
      return "EARLY";
  } else if(relDelay >= 0 && relDelay < 10) {
      return "ON_TIME";
  } else if(relDelay >= 10 && relDelay < 25) {
      return "LATE";
  } else if(relDelay >= 25) {
      return "CRITICAL";
  }
}

// Type so the status list knows of which type a filter is
export enum statusOf {
    Tenant,
    Line,
}

// Info given to each status card, after StatusContainer ran all calculations and sortings
export type statusInfo = {
    name: string,
    uid: string,
    problematicScore: number,
    numberOfVehicles: number,
    filter: Filter,
    isStatusOf: statusOf,
}

// Info given to each vehicle card, after VehicleListContainer ran all calculations and sortings
export type vehicleInfo = {
    name: string,
    uid: string,
    line: string,
    nextStop: string,
    checkedDeviationPrefix: DeviationPrefix,
    checkedAbsDeviationSemantics: DeviationSemantics,
    checkedRelDeviationSemantics: RelDelaySemantic,
    checkedDeviationValue: number,
    deviation: Deviation,
}

export function sortAndUnique<T>(a:Array<T>){
  return [... new Set(a)].sort();
}

export function getScore(vehicles: VehicleStateMap, considered: Filter, tenant: boolean = false): Array<number> {
    let problematicCount: number = 0
    let suboptimalCount: number = 0
    let waitingCount: number = 0
    let deviationSum: number = 0
    let avgDeviation: number = 0
    let numberOfBuses: number = 0
    let numberOfBadBuses: number = 0
    let numberOfLaterBuses: number = 0

    // Get the numbers
    for (let vehicle of vehicles.getFilteredVehicles(false, sortType.None, considered)) {
        switch (vehicle.deviation?.semantics) {
            case "PROBLEMATIC": {
                problematicCount++
                numberOfBadBuses++
                break
            }
            case "SUBOPTIMAL": {
                suboptimalCount++
                numberOfBadBuses++
                break
            }
            case "WAITING": {
                waitingCount++
                numberOfBadBuses++
                break
            }
        }
        if (vehicle.deviation?.value != undefined) {
            numberOfBuses++

            let delay: number = Math.abs(vehicles.getDelay(vehicle))

            if(vehicles.absDelay) {
                if (delay <= 60) {
                    deviationSum += delay
                }
                if(delay >= 6.5 && delay <= 60) {
                    numberOfLaterBuses++
                }
            } else {
                if(delay <= 120) {
                    deviationSum += delay
                }
                if(delay > 70 && delay <= 200) {
                    numberOfLaterBuses++
                }
            }

        }
    }
    avgDeviation = deviationSum / numberOfBadBuses
    /*console.log("Score Values:"+"\n probc: "+problematicCount+"\n subc: "+suboptimalCount+
        "\n waitc: "+waitingCount+"\n dsum: "+deviationSum+"\n avgd: "+avgDeviation+"\n buses: "+numberOfBuses+
        "\n badbuses: "+numberOfBadBuses)

     */

    //let score: number = ((((2 * problematicCount) + (3 * suboptimalCount) + (1 * waitingCount)) / numberOfBuses) * avgDeviation) * 10
    let score: number = ((2*problematicCount)+(3*suboptimalCount)+(waitingCount)+(2*numberOfLaterBuses))
    return [Number((score).toFixed(2)), numberOfBuses]
}

export function scoreToColor(problematicScore: number, tenant: boolean = false): string {
    if(tenant) {
        if(problematicScore != undefined) {
            if(problematicScore >= 80) {
                return "ind_red"
            } else if(problematicScore <= 30) {
                return "ind_green"
            } else {
                return "ind_yellow"
            }
        } else {
            return "error_blue"
        }
    } else {
        if(problematicScore != undefined) {
            if(problematicScore >= 6) {
                return "ind_red"
            } else if(problematicScore <= 2) {
                return "ind_green"
            } else {
                return "ind_yellow"
            }
        } else {
            return "error_blue"
        }
    }
}