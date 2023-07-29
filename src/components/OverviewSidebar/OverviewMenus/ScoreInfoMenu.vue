<template>
  <v-btn class="" variant="text" rounded id="score-btn" size="40">
    <v-icon size="26">mdi-information-outline</v-icon>
    <v-tooltip activator="#score-btn" location="bottom">Wie funktioniert der Score?</v-tooltip>
  </v-btn>

  <v-menu
      activator="#score-btn"
      offset="7"
      location="right"
      max-width="400"
  >
    <v-sheet>
      <v-container class="mb-0 pb-1">
        <b>So wird der Score berechnet:</b>
      </v-container>
      <v-container class="mt-0 pt-0">
        <p><b>P</b> = Anzahl Fahrzeuge mit PROB.</p>
        <p><b>S</b> = Anzahl Fahrzeuge mit SUBOP.</p>
        <p><b>W</b> = Anzahl Fahrzeuge mit WAIT.</p>
        <p><b>B</b> = Anzahl Fahrzeuge mit absoluter Verspätung größer 6,5 Min./70% und kleiner als 60 Min./200%</p>
      </v-container>
      <v-container>
        Score = 2&times<b>P</b> + 3&times<b>S</b> + 1&times<b>W</b> + 2&times<b>B</b>
      </v-container>
    </v-sheet>
  </v-menu>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "ScoreInfoMenu"
})
</script>

<style scoped>

</style>