<template>
  <v-card-subtitle  >Vorgespeicherte Filter</v-card-subtitle>
         
  <v-card-actions>
    <v-toolbar density="compact" color="surface" >
      <v-tabs v-model="selectedFilter" density="compact"  optional max-width="200" >

        <v-tab hide-slider  min-width="0"><v-icon icon="mdi-cancel"></v-icon> 
          <v-tooltip activator="parent" location="top">Filter abwählen</v-tooltip>
        </v-tab>    <!-- Tab um keinen Filter auszuwaehlen-->
        <v-tab v-for="filter in savedFilter" :key="filter.name" variant="tonal" >{{ filter.name }}</v-tab>
        </v-tabs>
      <v-spacer></v-spacer>
      
      <v-btn @click="showDeleteDiaolg" :disabled="! (selectedFilter > 0)" color="secondary" variant="elevated" icon="mdi-delete-outline" size="x-small"   id="deleteBtn"/>
      <v-tooltip activator="#deleteBtn" location="top">Lösche aktuellen Filter</v-tooltip>
      
      <NewSavedFilter @add-filter="addFilter" :filterNames="savedFilter.map(({name}) => name)" :disabled="selectedFilter != 0"></NewSavedFilter>
    </v-toolbar>
  </v-card-actions>

  <!-- Dialog to delete saved filter-->
  <v-dialog v-model="showDialogDelete" width="auto">
    <v-card title="Filter löschen"> 
      <v-card-text>Willst du wirklich den Filter "{{ modelValue.name }}" löschen?</v-card-text>
      <v-card-actions><v-spacer></v-spacer>
        <v-btn @click="showDialogDelete = false">Abbrechen</v-btn>
        <v-btn @click="deleteFilter">Löschen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  /* 
  *   This component is used to display and manage saved filters.
  */
  import { defineComponent } from 'vue'
  import NewSavedFilter from './NewSavedFilter.vue'
  import {PropType} from 'vue'
  import { Filter } from '@/types/filter';

  export default defineComponent({
    name: 'SavedFilter',
 
    components: {
      NewSavedFilter,
    },

    props: {
      modelValue: {type: Object as PropType<Filter>, required: true}, // Filter der aktuell in Feldern ausgewählt ist. (Eigene Instanz, keine Seiteneffekte zu savedFilter)
      savedFilterStorage :{type: Array<Filter>, default:[]},
    },

    emits:['update','updateFilterStorage'], 

    data (){
      return{
        showDialogDelete: false, //soll Filterfenster angezeigt werden 
        savedFilter: this.savedFilterStorage as Filter[],
        
      }
    },

    computed: {
      // 0 wenn modelValue kein vorgespeicherter Filter, sonst Index von modelValue im savedFilter Array + 1  
      selectedFilter: {  
        get():number {
          for (let i = 0; i < this.savedFilter.length; i++) {
            if(this.modelValue.isEqual(this.savedFilter[i])){
              return i+1;
            }
          }
          
          return 0;
        },
        set(indexNewFilter:number) {
          if(indexNewFilter > 0){          
            this.$emit('update',this.savedFilter[indexNewFilter-1]);
          }else{
            this.$emit('update', new Filter());
          }
        }
      },
    },

    methods: {
      addFilter(filterName:string) {
        let temp:Filter = this.modelValue.createCopy();
        temp.name=filterName;
        this.savedFilter.push(temp);
        this.$emit('updateFilterStorage', this.savedFilter);
      },
      
      showDeleteDiaolg(){
        if(this.selectedFilter > 0){
          this.showDialogDelete = !this.showDialogDelete;
          return;
        }
      },
      deleteFilter() {
        let indexToDelete = this.selectedFilter-1;
        this.showDialogDelete = false;
        this.savedFilter.splice(indexToDelete,1);
        this.$emit('updateFilterStorage', this.savedFilter);
      },
    }
  })
</script>