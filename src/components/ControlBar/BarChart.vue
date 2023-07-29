<template>
  <v-btn id="chart-btn" size="45" @click="loadChart">
    <v-icon size="24">mdi-chart-bar</v-icon>
  </v-btn>
  <v-card>
    <v-menu activator="#chart-btn" :close-on-content-click='false' location="bottom center" origin="auto" offset="14" width="800" height="400">
      <v-sheet>
        <div>
          <!-- Inhalt des Dropdown-Bereichs -->
          <Bar :data="chartdata" :options="chartoptions" />
        </div>
      </v-sheet>
    </v-menu>
  </v-card>
</template>

<script lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { Deviation, VehiclesApi } from '@/api';
import { VehicleStateMap } from "@/types/vehicleStateMap";
import type { PropType } from 'vue';





ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default {
  name: 'App',
  components: {
    Bar
  },
  props: {
    vehicles: {
      type: Object as PropType<VehicleStateMap>,
    },
  },
  methods: {
    //gnb: getNumberBusses
    gnb(a, b) {
      //return 10;
      let busses = 0;
      this.vehicles.getFilteredVehicles().forEach((v) => {
        //console.log(v);
        //console.log(this.vehicles.getDelay(v));
        try {
          if (this.vehicles.getDelay(v) > a && this.vehicles.getDelay(v) < b) {
            //console.log("delay gelesen");
            busses += 1;
          }
        }
        catch {
          console.log("delay nicht lesebar");
        }

      })
      //console.log(busses);
      return busses;
    },

    loadChart() {
      let array = [];
      array.length = 13;

      // if relative Flag flase do this

      // Edge Cases die auf dem intervall liegen m<ssen in einem Intervall miteinbezogen werden, weil die sonst vergessen wewrden
      if (this.vehicles.absDelay) {
        array[0] = this.gnb(-999, -20);
        array[1] = this.gnb(-20.01, -15);
        array[2] = this.gnb(-15.01, -10);
        array[3] = this.gnb(-10.01, -5);
        array[4] = this.gnb(-5.01, -1);
        array[5] = this.gnb(-1.01, 1.01);
        array[6] = this.gnb(1, 5.01);
        array[7] = this.gnb(5, 10.01);
        array[8] = this.gnb(10, 15.01);
        array[9] = this.gnb(15, 20.01);
        array[10] = this.gnb(20, 25.01);
        array[11] = this.gnb(25, 30.01);
        array[12] = this.gnb(30, 999);
        this.chartdata.labels = [
          '<-20',
          '-20 bis -15',
          '-15 bis -10',
          '-10 bis -5',
          '-5 bis -1',
          '-1 bis 1',
          '1 bis 5',
          '5 bis 10',
          '10 bis 15',
          '15 bis 20',
          '20 bis 25',
          '25 bis 30',
          '>30'
        ];
        this.chartoptions.scales.x.title.text = "Absolute Verspätung in Minuten";
      }
      // if relative Flag true do this
      if (!this.vehicles.absDelay) {
        array[0] = this.gnb(-999, -60);
        array[1] = this.gnb(-60.1, -50);
        array[2] = this.gnb(-50.1, -40);
        array[3] = this.gnb(-40.1, -30);
        array[4] = this.gnb(-30.1, -20);
        array[5] = this.gnb(-20.1, -9.9);
        array[6] = this.gnb(-10, 10);
        array[7] = this.gnb(9.9, 20.1);
        array[8] = this.gnb(20, 30.1);
        array[9] = this.gnb(30, 40.1);
        array[10] = this.gnb(40, 50.1);
        array[11] = this.gnb(50, 60.1);
        array[12] = this.gnb(60, 999);
        this.chartdata.labels = [
          '<-60%',
          '-60% bis -50%',
          '-50% bis -40%',
          '-40% bis -30%',
          '-30% bis -20%',
          '-20% bis -10%',
          '-10% bis 10%',
          '10% bis 20%',
          '20% bis 30%',
          '30% bis 40%',
          '40% bis 50%',
          '50% bis 60%',
          '>60%'
        ];
        this.chartoptions.scales.x.title.text = "Relative Verspätung in Prozent";
      }


      this.chartdata.datasets[0].data = array;
      //console.log(this.chartdata.datasets[0].data);
      //console.log(array);
      //console.log(this.gnb(-999, 999));
    }

  },
  data() {
    // default init
    return {
      chartdata: {
        labels: [
          '<-20',
          '-20 bis -15',
          '-15 bis -10',
          '-10 bis -5',
          '-5 bis -1',
          '-1 bis 1',
          '1 bis 5',
          '5 bis 10',
          '10 bis 15',
          '15 bis 20',
          '20 bis 25',
          '25 bis 30',
          '>30'
        ],
        datasets: [
          {
            label: 'Anzahl Verspätete Busse',
            backgroundColor: '#C71110',
            data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          }
        ]
      },
      chartoptions: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 0.75,
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Verspätung in Minuten'
            }
          },      
        }
      }
    }
  }
}
</script>