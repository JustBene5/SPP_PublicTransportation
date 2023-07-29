<template>
  <v-btn color="button_default" variant="elevated" rounded id="sort-btn" size="40">
    <v-icon>mdi-sort</v-icon>
    <v-tooltip activator="#sort-btn" location="bottom">Liste sortieren</v-tooltip>
  </v-btn>

  <v-menu
    activator="#sort-btn"
    offset="3"
  >
    <v-card>
      <v-list class="ma-3">
        <v-row class="ma-1">
          <v-btn class="ma-1"
                 :color="this.orderAsc == true ? 'selected' : 'not_selected'"
                 @click="$emit('sortOrder', 'asc')">
            <v-icon>mdi-sort-ascending</v-icon>
          </v-btn>
          <v-btn class="ma-1"
                 :color="this.orderAsc == false ? 'selected' : 'not_selected'"
                 @click="$emit('sortOrder', 'desc')">
            <v-icon>mdi-sort-descending</v-icon>
          </v-btn>
        </v-row>

        <b>Sortiere nach:</b>
        <v-list-item class="pa-0">
          <v-btn class="ma-1"
                 :color="sortType.Name == this.currSort ? 'selected' : 'not_selected'"
                 @click="$emit('sortAfter', sortType.Name)">Name</v-btn>
        </v-list-item>
        <v-list-item class="pa-0">
          <v-btn class="ma-1"
                 :color="sortType.Deviation == this.currSort ? 'selected' : 'not_selected'"
                 @click="$emit('sortAfter', sortType.Deviation)">Verspätung</v-btn>
        </v-list-item>
        <v-list-item class="pa-0">
          <v-btn class="ma-1"
                 :color="sortType.Semantics == this.currSort ? 'selected' : 'not_selected'"
                 @click="$emit('sortAfter', sortType.Semantics)">Semantisch</v-btn>
        </v-list-item>
        <v-list-item class="pa-0">
          <v-btn class="ma-1"
                 :color="sortType.None == this.currSort ? 'selected' : 'not_selected'"
                 @click="$emit('sortAfter', sortType.None)">Nichts</v-btn>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts" >
import { defineComponent } from 'vue';
import { sortType } from "@/types/globals";

export default defineComponent({
  name: 'SortMenu',
  computed: {
    sortType() {
      return sortType
    }
  },
  props: {
    currSort: Number,
    orderAsc: Boolean,
  },
  emits: ['sortAfter', 'sortOrder']
})
</script>

<style>

</style>
